package com.thanglong.landtax.usecase.service;

import com.thanglong.landtax.infrastructure.adapter.persistence.entity.RecordEntity;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.CitizenLocalJpaRepository;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.ComplaintJpaRepository;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.RecordJpaRepository;
import com.thanglong.landtax.usecase.dto.OfficerNotificationDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

/**
 * Thông báo việc mới cho cán bộ địa chính (hồ sơ SUBMITTED, khiếu nại PENDING, cảnh báo gian lận).
 */
@Service
@RequiredArgsConstructor
public class CadastralOfficerNotificationService {

    private static final Map<String, String> RECORD_CATEGORY_LABELS = Map.of(
            "TAX_DECLARATION", "Tờ khai thuế",
            "TAX", "Hồ sơ thuế",
            "TRANSFER", "Chuyển nhượng",
            "CHANGE_PURPOSE", "Đổi mục đích sử dụng",
            "MUTATION", "Tách/Hợp thửa đất",
            "GCN_RENEWAL", "Cấp đổi GCN",
            "LAND_MUTATION", "Biến động đất đai"
    );

    private final RecordJpaRepository recordJpaRepository;
    private final ComplaintJpaRepository complaintJpaRepository;
    private final CitizenLocalJpaRepository citizenLocalJpaRepository;

    public List<OfficerNotificationDTO> getLandOfficerNotifications() {
        List<OfficerNotificationDTO> items = new ArrayList<>();

        for (RecordEntity r : recordJpaRepository.findByCurrentStatusInOrderBySubmittedAtDesc(List.of("SUBMITTED"))) {
            String citizenName = resolveCitizenName(r.getCitizenId());
            String category = RECORD_CATEGORY_LABELS.getOrDefault(
                    r.getRecordCategory(), r.getRecordCategory() != null ? r.getRecordCategory() : "Hồ sơ địa chính");
            items.add(OfficerNotificationDTO.builder()
                    .id("record:" + r.getRecordId())
                    .title("Hồ sơ mới tiếp nhận")
                    .content(String.format("HS-%06d · %s · %s — chờ xác minh",
                            r.getRecordId(), citizenName, category))
                    .notiType("RECORD_NEW")
                    .createdAt(r.getSubmittedAt())
                    .linkPath("/cadastral-records")
                    .build());
        }

        for (RecordEntity r : recordJpaRepository.findByCurrentStatusInOrderBySubmittedAtDesc(
                List.of("FRAUD_SUSPECTED", "WARNING_FRAUD"))) {
            String citizenName = resolveCitizenName(r.getCitizenId());
            items.add(OfficerNotificationDTO.builder()
                    .id("fraud:" + r.getRecordId())
                    .title("Cảnh báo nghi gian lận")
                    .content(String.format("HS-%06d · %s — cần rà soát", r.getRecordId(), citizenName))
                    .notiType("RECORD_FRAUD")
                    .createdAt(r.getSubmittedAt())
                    .linkPath("/cadastral-records")
                    .build());
        }

        complaintJpaRepository.findByComplaintType("LAND").stream()
                .filter(c -> "PENDING".equals(c.getStatus()))
                .forEach(c -> {
                    String citizenName = resolveCitizenName(c.getCitizen() != null ? c.getCitizen().getCitizenId() : null);
                    items.add(OfficerNotificationDTO.builder()
                            .id("complaint:" + c.getId())
                            .title("Khiếu nại mới")
                            .content(String.format("KN-%06d · %s — chờ tiếp nhận",
                                    c.getId(), citizenName))
                            .notiType("COMPLAINT_NEW")
                            .createdAt(c.getCreatedAt())
                            .linkPath("/cadastral-complaints")
                            .build());
                });

        items.sort(Comparator.comparing(
                OfficerNotificationDTO::getCreatedAt,
                Comparator.nullsLast(Comparator.reverseOrder())));

        return items.size() > 30 ? items.subList(0, 30) : items;
    }

    private String resolveCitizenName(Integer citizenId) {
        if (citizenId == null) {
            return "Công dân";
        }
        return citizenLocalJpaRepository.findById(citizenId)
                .map(c -> c.getFullName() != null ? c.getFullName() : "Công dân #" + citizenId)
                .orElse("Công dân #" + citizenId);
    }
}
