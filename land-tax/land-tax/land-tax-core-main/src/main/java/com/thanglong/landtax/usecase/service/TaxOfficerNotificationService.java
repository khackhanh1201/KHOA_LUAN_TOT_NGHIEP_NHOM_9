package com.thanglong.landtax.usecase.service;

import com.thanglong.landtax.domain.RecordCategories;
import com.thanglong.landtax.infrastructure.adapter.persistence.entity.RecordEntity;
import com.thanglong.landtax.infrastructure.adapter.persistence.entity.TaxPaymentEntity;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.CitizenLocalJpaRepository;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.ComplaintJpaRepository;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.RecordJpaRepository;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.TaxPaymentJpaRepository;
import com.thanglong.landtax.usecase.dto.OfficerNotificationDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Set;

/**
 * Thông báo việc mới cho cán bộ thuế (tờ khai chờ duyệt, khiếu nại, thanh toán quá hạn).
 */
@Service
@RequiredArgsConstructor
public class TaxOfficerNotificationService {

    private static final Set<String> TAX_CATEGORIES = Set.of("TAX_DECLARATION", "TAX");
    private static final Set<String> UNPAID_STATUSES = Set.of("UNPAID", "AWAITING_PAYMENT", "OVERDUE");

    private final RecordJpaRepository recordJpaRepository;
    private final ComplaintJpaRepository complaintJpaRepository;
    private final TaxPaymentJpaRepository taxPaymentJpaRepository;
    private final CitizenLocalJpaRepository citizenLocalJpaRepository;

    public List<OfficerNotificationDTO> getTaxOfficerNotifications() {
        List<OfficerNotificationDTO> items = new ArrayList<>();

        for (RecordEntity r : recordJpaRepository.findByCurrentStatusInOrderBySubmittedAtDesc(
                List.of("VERIFIED"))) {
            if (!isTaxRecord(r)) {
                continue;
            }
            String citizenName = resolveCitizenName(r.getCitizenId());
            items.add(OfficerNotificationDTO.builder()
                    .id("tax-record-await:" + r.getRecordId())
                    .title("Hồ sơ chờ tiếp nhận")
                    .content(String.format("HS-%06d · %s — chờ cán bộ thuế tiếp nhận",
                            r.getRecordId(), citizenName))
                    .notiType("TAX_RECORD_AWAIT_RECEIVE")
                    .createdAt(r.getSubmittedAt())
                    .linkPath("/tax-officer/tax-processing")
                    .build());
        }

        for (RecordEntity r : recordJpaRepository.findByCurrentStatusInOrderBySubmittedAtDesc(
                List.of("PROCESSING"))) {
            if (!isTaxRecord(r)) {
                continue;
            }
            String citizenName = resolveCitizenName(r.getCitizenId());
            items.add(OfficerNotificationDTO.builder()
                    .id("tax-record-processing:" + r.getRecordId())
                    .title("Hồ sơ đang xử lý")
                    .content(String.format("HS-%06d · %s — đang xử lý thuế",
                            r.getRecordId(), citizenName))
                    .notiType("TAX_RECORD_PROCESSING")
                    .createdAt(r.getSubmittedAt())
                    .linkPath("/tax-officer/tax-processing")
                    .build());
        }

        for (RecordEntity r : recordJpaRepository.findByCurrentStatusInOrderBySubmittedAtDesc(
                List.of("FRAUD_SUSPECTED"))) {
            if (!isTaxRecord(r)) {
                continue;
            }
            String citizenName = resolveCitizenName(r.getCitizenId());
            items.add(OfficerNotificationDTO.builder()
                    .id("tax-fraud:" + r.getRecordId())
                    .title("Cảnh báo nghi gian lận")
                    .content(String.format("HS-%06d · %s — cần rà soát", r.getRecordId(), citizenName))
                    .notiType("TAX_RECORD_FRAUD")
                    .createdAt(r.getSubmittedAt())
                    .linkPath("/tax-officer/tax-records")
                    .build());
        }

        complaintJpaRepository.findByComplaintType("TAX").stream()
                .filter(c -> "PENDING".equals(c.getStatus()))
                .forEach(c -> {
                    String citizenName = resolveCitizenName(
                            c.getCitizen() != null ? c.getCitizen().getCitizenId() : null);
                    boolean isSupplement = c.getContent() != null && c.getContent().contains("[Bổ sung ");
                    items.add(OfficerNotificationDTO.builder()
                            .id("tax-complaint:" + c.getId())
                            .title(isSupplement ? "Công dân đã bổ sung khiếu nại" : "Khiếu nại thuế mới")
                            .content(String.format("KN-%06d · %s — chờ tiếp nhận",
                                    c.getId(), citizenName))
                            .notiType(isSupplement ? "TAX_COMPLAINT_SUPPLEMENT" : "TAX_COMPLAINT_NEW")
                            .createdAt(c.getUpdatedAt() != null ? c.getUpdatedAt() : c.getCreatedAt())
                            .linkPath("/tax-officer/complaint-management")
                            .build());
                });

        LocalDate today = LocalDate.now();
        for (TaxPaymentEntity p : taxPaymentJpaRepository.findAll()) {
            if (p.getPaymentStatus() == null || !UNPAID_STATUSES.contains(p.getPaymentStatus())) {
                continue;
            }
            if (p.getDueDate() == null || !p.getDueDate().isBefore(today)) {
                continue;
            }
            items.add(OfficerNotificationDTO.builder()
                    .id("tax-payment:" + p.getPayId())
                    .title("Thanh toán quá hạn")
                    .content(String.format("PM-%06d · Năm %d — hạn %s",
                            p.getPayId(),
                            p.getTaxYear() != null ? p.getTaxYear() : 0,
                            p.getDueDate()))
                    .notiType("TAX_PAYMENT_OVERDUE")
                    .createdAt(p.getDueDate().atStartOfDay())
                    .linkPath("/tax-officer/payment-management")
                    .build());
        }

        for (RecordEntity r : recordJpaRepository.findByRecordCategory(RecordCategories.ANNUAL_TAX_RENEWAL)) {
            if (!"APPROVED".equals(r.getCurrentStatus())) {
                continue;
            }
            boolean hasUnpaid = taxPaymentJpaRepository.findByRecordId(r.getRecordId()).stream()
                    .anyMatch(p -> p.getPaymentStatus() != null && UNPAID_STATUSES.contains(p.getPaymentStatus()));
            if (!hasUnpaid) {
                continue;
            }
            String citizenName = resolveCitizenName(r.getCitizenId());
            items.add(OfficerNotificationDTO.builder()
                    .id("annual-tax:" + r.getRecordId())
                    .title("Thuế đất hằng năm đã phát hành")
                    .content(String.format("HS-%06d · %s — thuế tự động năm (2 kỳ)",
                            r.getRecordId(), citizenName))
                    .notiType("ANNUAL_TAX_BATCH")
                    .createdAt(r.getSubmittedAt())
                    .linkPath("/tax-officer/payment-management")
                    .build());
        }

        items.sort(Comparator.comparing(
                OfficerNotificationDTO::getCreatedAt,
                Comparator.nullsLast(Comparator.reverseOrder())));

        return items.size() > 30 ? items.subList(0, 30) : items;
    }

    public long countPendingTaxRecords() {
        return recordJpaRepository.findByCurrentStatusInOrderBySubmittedAtDesc(
                        List.of("VERIFIED", "PROCESSING"))
                .stream()
                .filter(this::isTaxRecord)
                .count();
    }

    public long countPendingTaxComplaints() {
        return complaintJpaRepository.findByComplaintType("TAX").stream()
                .filter(c -> "PENDING".equals(c.getStatus()))
                .count();
    }

    private boolean isTaxRecord(RecordEntity r) {
        return r.getRecordCategory() != null && TAX_CATEGORIES.contains(r.getRecordCategory());
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
