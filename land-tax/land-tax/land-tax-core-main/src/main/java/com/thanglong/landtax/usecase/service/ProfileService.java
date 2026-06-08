package com.thanglong.landtax.usecase.service;

import com.thanglong.landtax.infrastructure.adapter.client.VneidServiceClient;
import com.thanglong.landtax.infrastructure.adapter.persistence.entity.CitizenLocalEntity;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.CitizenLocalJpaRepository;
import com.thanglong.landtax.usecase.dto.ApiResponse;
import com.thanglong.landtax.usecase.dto.CitizenIdentityDTO;
import com.thanglong.landtax.usecase.dto.ProfileResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings("null")
public class ProfileService {

    private final VneidServiceClient vneidServiceClient;
    private final CitizenLocalJpaRepository citizenLocalJpaRepository;
    private final com.thanglong.landtax.infrastructure.adapter.persistence.jpa.AccountJpaRepository accountJpaRepository;

    @Value("${internal.api.secret:VNeIDInternalSecretKey2025}")
    private String internalSecret;

    @Transactional
    public CitizenLocalEntity syncProfileFromVneid(String cccdNumber) {
        log.info("Bat dau dong bo profile tu VNeID cho CCCD: {}", cccdNumber);

        CitizenIdentityDTO vneidData = fetchVneidIdentity(cccdNumber)
                .orElseThrow(() -> new RuntimeException("Khong the lay thong tin cong dan tu VNeID"));

        CitizenLocalEntity citizen = citizenLocalJpaRepository.findByCccdNumber(cccdNumber)
                .orElse(new CitizenLocalEntity());

        citizen.setCccdNumber(cccdNumber);

        if (StringUtils.hasText(vneidData.getFullName())) {
            citizen.setFullName(vneidData.getFullName());
        } else if (citizen.getFullName() == null) {
            citizen.setFullName("Unknown");
        }

        if (StringUtils.hasText(vneidData.getEmail())) {
            citizen.setEmail(vneidData.getEmail());
        }

        if (StringUtils.hasText(vneidData.getPhoneNumber())) {
            citizen.setPhoneNumber(vneidData.getPhoneNumber());
        }

        return citizenLocalJpaRepository.save(citizen);
    }

    public ProfileResponse getProfile(String cccdNumber) {
        return getProfileMe(cccdNumber);
    }

    public ProfileResponse getProfileMe(String cccdNumber) {
        CitizenLocalEntity citizen = citizenLocalJpaRepository.findByCccdNumber(cccdNumber)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND,
                        "Khong tim thay nguoi dung trong he thong thue dat"));

        List<String> rawRoles = accountJpaRepository.findRoleCodesByCccdNumber(cccdNumber);
        Set<String> uniqueRoles = new LinkedHashSet<>();
        if (rawRoles != null) {
            uniqueRoles.addAll(rawRoles);
        }
        uniqueRoles.add("ROLE_CITIZEN");
        List<String> roles = new ArrayList<>(uniqueRoles);

        String activeRole = getMostPrivilegedRole(roles);

        Optional<CitizenIdentityDTO> vneidOpt = fetchVneidIdentity(cccdNumber);

        return ProfileResponse.builder()
                .citizenId(citizen.getCitizenId())
                .cccdNumber(citizen.getCccdNumber())
                .fullName(citizen.getFullName())
                .email(citizen.getEmail())
                .phoneNumber(citizen.getPhoneNumber())
                .dateOfBirth(vneidOpt.map(CitizenIdentityDTO::getDob).orElse(null))
                .roles(roles)
                .activeRole(activeRole)
                .build();
    }

    /** Lay dob tu VNeID — khong ghi vao DB land-tax. */
    private Optional<CitizenIdentityDTO> fetchVneidIdentity(String cccdNumber) {
        try {
            ApiResponse<CitizenIdentityDTO> response =
                    vneidServiceClient.getCitizenByCccd(cccdNumber, internalSecret);
            if (response != null && response.isSuccess() && response.getData() != null) {
                return Optional.of(response.getData());
            }
            log.warn("VNeID tra ve loi khi lay profile CCCD={}: {}",
                    cccdNumber, response != null ? response.getMessage() : "null response");
        } catch (Exception e) {
            log.warn("Khong goi duoc VNeID cho CCCD={}: {}", cccdNumber, e.getMessage());
        }
        return Optional.empty();
    }

    private String getMostPrivilegedRole(List<String> roles) {
        if (roles == null || roles.isEmpty()) {
            return "ROLE_CITIZEN";
        }
        String bestRole = roles.get(0);
        int maxWeight = getRoleWeight(bestRole);
        for (int i = 1; i < roles.size(); i++) {
            String role = roles.get(i);
            int weight = getRoleWeight(role);
            if (weight > maxWeight) {
                maxWeight = weight;
                bestRole = role;
            }
        }
        return bestRole;
    }

    private int getRoleWeight(String role) {
        if (role == null) return 0;
        switch (role) {
            case "ROLE_ADMIN": return 4;
            case "ROLE_TAX_OFFICER": return 3;
            case "ROLE_LAND_OFFICER": return 2;
            case "ROLE_CITIZEN": return 1;
            default: return 0;
        }
    }
}
