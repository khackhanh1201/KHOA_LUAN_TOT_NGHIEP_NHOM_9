package com.thanglong.vneid.infrastructure.adapter.controller;

import com.thanglong.vneid.infrastructure.adapter.persistence.entity.CitizenEntity;
import com.thanglong.vneid.infrastructure.adapter.persistence.jpa.CitizenJpaRepository;
import com.thanglong.vneid.usecase.dto.ApiResponse;
import com.thanglong.vneid.usecase.dto.CitizenIdentityDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Internal API — chỉ gọi nội bộ giữa các service.
 */
@RestController
@RequestMapping("/api/vneid/internal")
public class InternalCitizenController {
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(InternalCitizenController.class);

    private final CitizenJpaRepository citizenJpaRepository;

    @Value("${internal.api.secret}")
    private String internalSecret;

    public InternalCitizenController(CitizenJpaRepository citizenJpaRepository) {
        this.citizenJpaRepository = citizenJpaRepository;
    }

    @GetMapping("/citizens/{cccd}")
    public ResponseEntity<ApiResponse<CitizenIdentityDTO>> getCitizenByCccd(
            @PathVariable String cccd,
            @RequestHeader(value = "X-Internal-Secret", required = false) String secret) {

        if (!validateSecret(secret)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Unauthorized internal access", "FORBIDDEN"));
        }

        log.info("[Internal API] Lookup citizen by CCCD: {}", cccd);

        CitizenEntity entity = citizenJpaRepository.findByCccdNumber(cccd)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy công dân với CCCD: " + cccd));

        CitizenIdentityDTO dto = CitizenIdentityDTO.builder()
                .cccdNumber(entity.getCccdNumber())
                .fullName(entity.getFullName())
                .dob(entity.getDob())
                .gender(entity.getGender())
                .email(entity.getEmail())
                .phoneNumber(entity.getPhoneNumber())
                .firebaseUid(entity.getFirebaseUid())
                .firebaseEmail(entity.getFirebaseEmail())
                .build();

        return ResponseEntity.ok(ApiResponse.success(dto, "Lấy dữ liệu công dân thành công"));
    }

    @PutMapping("/citizens/{cccd}/status")
    public ResponseEntity<ApiResponse<Void>> updateCitizenStatus(
            @PathVariable String cccd,
            @RequestParam boolean active,
            @RequestHeader(value = "X-Internal-Secret", required = false) String secret) {

        if (!validateSecret(secret)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Unauthorized internal access", "FORBIDDEN"));
        }

        CitizenEntity entity = citizenJpaRepository.findByCccdNumber(cccd)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy công dân với CCCD: " + cccd));

        entity.setAccountStatus(active ? "ACTIVE" : "LOCKED");
        citizenJpaRepository.save(entity);
        return ResponseEntity.ok(ApiResponse.success(null, "Cập nhật trạng thái thành công"));
    }

    private boolean validateSecret(String secret) {
        return internalSecret != null && internalSecret.equals(secret);
    }
}
