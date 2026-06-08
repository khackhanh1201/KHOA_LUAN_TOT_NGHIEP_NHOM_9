package com.thanglong.landtax.domain.service;

import com.thanglong.landtax.infrastructure.adapter.persistence.entity.AccountEntity;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.AccountJpaRepository;
import com.thanglong.landtax.infrastructure.security.JwtFilter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Tra cứu account an toàn khi một {@code citizen_id} có nhiều dòng (multi-role).
 */
@Service
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings("null")
public class AccountLookupService {

    public static final String ROLE_CITIZEN = "ROLE_CITIZEN";

    private static final List<String> PROCESSOR_ROLE_PRIORITY = List.of(
            "ROLE_TAX_OFFICER",
            "ROLE_ADMIN",
            "ROLE_LAND_OFFICER");

    private final AccountJpaRepository accountJpaRepository;

    /**
     * Tài khoản công dân — dùng cho thông báo, thanh toán phía người dân.
     */
    public AccountEntity requireCitizenAccount(Integer citizenId) {
        return findAccountForRole(citizenId, ROLE_CITIZEN)
                .orElseThrow(() -> new RuntimeException(
                        "Khong tim thay tai khoan ROLE_CITIZEN cho citizenId: " + citizenId));
    }

    /**
     * Tài khoản cán bộ đang thao tác — ưu tiên role trong JWT, khớp bảng accounts.
     */
    public AccountEntity requireProcessorAccount(Integer citizenId) {
        String preferredRole = resolveProcessorRoleFromContext();
        Optional<AccountEntity> account = findAccountForRole(citizenId, preferredRole);
        if (account.isPresent()) {
            return account.get();
        }
        for (String roleCode : PROCESSOR_ROLE_PRIORITY) {
            if (roleCode.equals(preferredRole)) {
                continue;
            }
            account = findAccountForRole(citizenId, roleCode);
            if (account.isPresent()) {
                log.warn("Processor account: citizenId={}, preferredRole={} not found, using {}",
                        citizenId, preferredRole, roleCode);
                return account.get();
            }
        }
        throw new RuntimeException(
                "Khong tim thay tai khoan can bo (TAX_OFFICER/ADMIN/LAND_OFFICER) cho citizenId: "
                        + citizenId);
    }

    public Optional<AccountEntity> findAccountForRole(Integer citizenId, String roleCode) {
        if (citizenId == null || roleCode == null || roleCode.isBlank()) {
            return Optional.empty();
        }
        return accountJpaRepository.findFirstByCitizenIdAndRoleCodeOrderByAccountIdDesc(
                citizenId, normalizeRoleCode(roleCode));
    }

    private String resolveProcessorRoleFromContext() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            return "ROLE_TAX_OFFICER";
        }

        if (auth.getDetails() instanceof JwtFilter.JwtUserDetails details
                && details.activeRole() != null
                && !details.activeRole().isBlank()) {
            String fromJwt = normalizeRoleCode(details.activeRole());
            if (PROCESSOR_ROLE_PRIORITY.contains(fromJwt)) {
                return fromJwt;
            }
        }

        List<String> authorityRoles = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .map(this::normalizeRoleCode)
                .toList();

        for (String priority : PROCESSOR_ROLE_PRIORITY) {
            if (authorityRoles.contains(priority)) {
                return priority;
            }
        }
        return "ROLE_TAX_OFFICER";
    }

    private String normalizeRoleCode(String role) {
        if (role == null || role.isBlank()) {
            return ROLE_CITIZEN;
        }
        String trimmed = role.trim().toUpperCase();
        return trimmed.startsWith("ROLE_") ? trimmed : "ROLE_" + trimmed;
    }
}
