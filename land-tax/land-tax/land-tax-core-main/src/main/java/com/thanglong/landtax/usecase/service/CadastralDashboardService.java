package com.thanglong.landtax.usecase.service;

import com.thanglong.landtax.infrastructure.adapter.persistence.entity.ComplaintEntity;
import com.thanglong.landtax.infrastructure.adapter.persistence.entity.RecordEntity;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.CitizenLocalJpaRepository;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.ComplaintJpaRepository;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.RecordJpaRepository;
import com.thanglong.landtax.usecase.dto.CadastralDashboardStatsDTO;
import com.thanglong.landtax.usecase.dto.OfficerNotificationDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CadastralDashboardService {

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
    private final CadastralOfficerNotificationService cadastralOfficerNotificationService;

    public CadastralDashboardStatsDTO getDashboardStats() {
        List<RecordEntity> allRecords = recordJpaRepository.findAll();
        List<ComplaintEntity> landComplaints = complaintJpaRepository.findByComplaintType("LAND");

        long verified = allRecords.stream()
                .filter(r -> List.of("VERIFIED", "APPROVED", "COMPLETED").contains(r.getCurrentStatus()))
                .count();
        long processing = allRecords.stream()
                .filter(r -> List.of("PENDING", "PROCESSING").contains(r.getCurrentStatus()))
                .count();
        long needMoreDocs = allRecords.stream()
                .filter(r -> "NEED_MORE_DOCS".equals(r.getCurrentStatus()))
                .count();
        long fraud = allRecords.stream()
                .filter(r -> List.of("FRAUD_SUSPECTED", "WARNING_FRAUD").contains(r.getCurrentStatus()))
                .count();

        long newSubmitted = allRecords.stream()
                .filter(r -> "SUBMITTED".equals(r.getCurrentStatus()))
                .count();
        long newComplaints = landComplaints.stream()
                .filter(c -> "PENDING".equals(c.getStatus()))
                .count();

        long total = allRecords.size();
        int rate = total > 0 ? (int) Math.round((verified * 100.0) / total) : 0;

        List<OfficerNotificationDTO> newWorkItems = cadastralOfficerNotificationService.getLandOfficerNotifications();

        List<OfficerNotificationDTO> recentVerified = allRecords.stream()
                .filter(r -> List.of("VERIFIED", "APPROVED", "COMPLETED").contains(r.getCurrentStatus()))
                .sorted(Comparator.comparing(RecordEntity::getSubmittedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(15)
                .map(this::toVerifiedActivity)
                .toList();

        List<OfficerNotificationDTO> recentComplaints = landComplaints.stream()
                .sorted(Comparator.comparing(ComplaintEntity::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(15)
                .map(this::toComplaintActivity)
                .toList();

        return CadastralDashboardStatsDTO.builder()
                .totalRecords(total)
                .verifiedRecords(verified)
                .processingRecords(processing)
                .needMoreDocsRecords(needMoreDocs)
                .fraudRecords(fraud)
                .verifiedRatePercent(rate)
                .newSubmittedRecords(newSubmitted)
                .newPendingComplaints(newComplaints)
                .fraudAlerts(fraud)
                .newWorkTotal(newSubmitted + newComplaints + fraud)
                .newWorkItems(newWorkItems)
                .recentVerifiedRecords(recentVerified)
                .recentComplaints(recentComplaints)
                .build();
    }

    private OfficerNotificationDTO toVerifiedActivity(RecordEntity r) {
        String citizenName = resolveCitizenName(r.getCitizenId());
        String category = RECORD_CATEGORY_LABELS.getOrDefault(
                r.getRecordCategory(), r.getRecordCategory() != null ? r.getRecordCategory() : "Hồ sơ địa chính");
        return OfficerNotificationDTO.builder()
                .id("record-verified:" + r.getRecordId())
                .title("Hồ sơ đã xác thực")
                .content(String.format("HS-%06d · %s · %s", r.getRecordId(), citizenName, category))
                .notiType("RECORD_VERIFIED")
                .createdAt(r.getSubmittedAt())
                .linkPath("/cadastral-records")
                .build();
    }

    private OfficerNotificationDTO toComplaintActivity(ComplaintEntity c) {
        String citizenName = resolveCitizenName(c.getCitizen() != null ? c.getCitizen().getCitizenId() : null);
        String statusLabel = switch (c.getStatus() != null ? c.getStatus() : "") {
            case "PENDING" -> "Chờ xử lý";
            case "IN_PROGRESS" -> "Đang xử lý";
            case "RESOLVED" -> "Đã giải quyết";
            case "REJECTED" -> "Từ chối";
            default -> c.getStatus();
        };
        return OfficerNotificationDTO.builder()
                .id("complaint-activity:" + c.getId())
                .title("Khiếu nại")
                .content(String.format("KN-%06d · %s — %s", c.getId(), citizenName, statusLabel))
                .notiType("COMPLAINT_ACTIVITY")
                .createdAt(c.getCreatedAt())
                .linkPath("/cadastral-complaints")
                .build();
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
