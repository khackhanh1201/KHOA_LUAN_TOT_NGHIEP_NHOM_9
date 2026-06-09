package com.thanglong.landtax.usecase.service;

import com.thanglong.landtax.infrastructure.adapter.controller.exception.ResourceNotFoundException;
import com.thanglong.landtax.infrastructure.adapter.persistence.entity.AccountEntity;
import com.thanglong.landtax.infrastructure.adapter.persistence.entity.CitizenLocalEntity;
import com.thanglong.landtax.infrastructure.adapter.persistence.entity.RoleEntity;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.AccountJpaRepository;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.CitizenLocalJpaRepository;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.RoleJpaRepository;
import com.thanglong.landtax.usecase.dto.CreateUserRequest;
import com.thanglong.landtax.usecase.dto.RoleDTO;
import com.thanglong.landtax.usecase.dto.UpdateRoleRequest;
import com.thanglong.landtax.usecase.dto.UserAdminDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings("null")
public class AdminService {

    private final AccountJpaRepository accountJpaRepository;
    private final CitizenLocalJpaRepository citizenLocalJpaRepository;
    private final RoleJpaRepository roleJpaRepository;

    public List<UserAdminDTO> getAllUsers(String search) {
        return accountJpaRepository.findAllWithCitizenInfo(search);
    }

    /**
     * Tạo mới một user (Citizen + Account).
     */
    @Transactional
    public CitizenLocalEntity createUser(CreateUserRequest request) {
        log.info("Admin creating user: CCCD={}, Name={}, RoleId={}", 
                request.getCccdNumber(), request.getFullName(), request.getRoleId());

        if (citizenLocalJpaRepository.existsByCccdNumber(request.getCccdNumber())) {
            throw new IllegalArgumentException("Công dân với số CCCD này đã tồn tại");
        }

        RoleEntity role = roleJpaRepository.findById(request.getRoleId())
                .orElseThrow(() -> new ResourceNotFoundException("Role không tồn tại"));

        // Tạo mới CitizenLocalEntity
        CitizenLocalEntity citizen = CitizenLocalEntity.builder()
                .cccdNumber(request.getCccdNumber())
                .fullName(request.getFullName())
                .phoneNumber(request.getPhoneNumber())
                .build();
        citizen = citizenLocalJpaRepository.save(citizen);

        // Tạo mới AccountEntity
        AccountEntity account = AccountEntity.builder()
                .citizenId(citizen.getCitizenId())
                .roleId(role.getRoleId())
                .accountStatus("ACTIVE")
                .build();
        accountJpaRepository.save(account);

        log.info("User created successfully: citizenId={}, accountId={}", citizen.getCitizenId(), account.getAccountId());
        return citizen;
    }

    /**
     * Lấy toàn bộ danh sách Role.
     */
    public List<RoleDTO> getAllRoles() {
        log.info("Fetching all roles");
        return roleJpaRepository.findAll().stream()
                .map(role -> RoleDTO.builder()
                        .id(role.getRoleId())
                        .roleCode(role.getRoleCode())
                        .roleName(role.getRoleName())
                        .build())
                .collect(Collectors.toList());
    }

    /**
     * Cập nhật thông tin một Role.
     */
    @Transactional
    public RoleDTO updateRole(Integer roleId, UpdateRoleRequest request) {
        log.info("Updating role: roleId={}, newName={}, newCode={}", roleId, request.getRoleName(), request.getRoleCode());

        RoleEntity role = roleJpaRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role không tồn tại"));

        if (request.getRoleName() != null) {
            role.setRoleName(request.getRoleName());
        }
        if (request.getRoleCode() != null) {
            role.setRoleCode(request.getRoleCode());
        }

        role = roleJpaRepository.save(role);

        return RoleDTO.builder()
                .id(role.getRoleId())
                .roleCode(role.getRoleCode())
                .roleName(role.getRoleName())
                .build();
    }

    private static final int ROLE_ADMIN_ID = 1;
    private static final int ROLE_CITIZEN_ID = 2;

    /**
     * Ủy quyền Quản trị viên: hạ role admin hiện tại và nâng role người nhận trong một transaction.
     */
    @Transactional
    public void delegateAdmin(
            String currentAdminCccd,
            Integer currentAdminAccountId,
            String delegateeCccd,
            Integer delegateeAccountId) {

        if (currentAdminCccd == null || currentAdminCccd.isBlank()
                || delegateeCccd == null || delegateeCccd.isBlank()
                || currentAdminAccountId == null || delegateeAccountId == null) {
            throw new IllegalArgumentException("Thiếu thông tin ủy quyền (CCCD hoặc accountId)");
        }

        if (currentAdminCccd.equals(delegateeCccd)) {
            throw new IllegalArgumentException("Không thể ủy quyền cho chính mình");
        }

        CitizenLocalEntity adminCitizen = citizenLocalJpaRepository.findByCccdNumber(currentAdminCccd)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Admin hiện tại"));

        CitizenLocalEntity delegateeCitizen = citizenLocalJpaRepository.findByCccdNumber(delegateeCccd)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người nhận ủy quyền"));

        AccountEntity adminAccount = accountJpaRepository.findById(currentAdminAccountId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản Admin"));

        if (!adminCitizen.getCitizenId().equals(adminAccount.getCitizenId())) {
            throw new IllegalArgumentException("Tài khoản Admin không khớp với CCCD");
        }

        RoleEntity currentAdminRole = roleJpaRepository.findById(adminAccount.getRoleId())
                .orElseThrow(() -> new ResourceNotFoundException("Role Admin không hợp lệ"));
        if (!"ROLE_ADMIN".equals(currentAdminRole.getRoleCode())) {
            throw new IllegalArgumentException("Tài khoản hiện tại không phải Quản trị viên");
        }

        AccountEntity delegateeAccount = accountJpaRepository.findById(delegateeAccountId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản người nhận"));

        if (!delegateeCitizen.getCitizenId().equals(delegateeAccount.getCitizenId())) {
            throw new IllegalArgumentException("Tài khoản người nhận không khớp với CCCD");
        }

        RoleEntity delegateeRole = roleJpaRepository.findById(delegateeAccount.getRoleId())
                .orElseThrow(() -> new ResourceNotFoundException("Role người nhận không hợp lệ"));
        if ("ROLE_ADMIN".equals(delegateeRole.getRoleCode())) {
            throw new IllegalArgumentException("Người nhận đã là Quản trị viên");
        }

        String delegateeStatus = delegateeAccount.getAccountStatus();
        if (delegateeStatus != null && !"ACTIVE".equalsIgnoreCase(delegateeStatus)) {
            throw new IllegalArgumentException("Tài khoản người nhận không ở trạng thái hoạt động");
        }

        adminAccount.setRoleId(ROLE_CITIZEN_ID);
        delegateeAccount.setRoleId(ROLE_ADMIN_ID);
        accountJpaRepository.save(adminAccount);
        accountJpaRepository.save(delegateeAccount);

        log.info(
                "Delegated admin from CCCD {} (accountId={}) to CCCD {} (accountId={})",
                currentAdminCccd,
                currentAdminAccountId,
                delegateeCccd,
                delegateeAccountId);
    }
}
