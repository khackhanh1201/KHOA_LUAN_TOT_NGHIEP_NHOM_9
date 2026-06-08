package com.thanglong.landtax.usecase.service;

import com.thanglong.landtax.domain.service.LandQuotaResolver;
import com.thanglong.landtax.domain.service.TaxCalculationService;
import com.thanglong.landtax.infrastructure.adapter.persistence.entity.LandParcelEntity;
import com.thanglong.landtax.infrastructure.adapter.persistence.entity.LandPriceEntity;
import com.thanglong.landtax.infrastructure.adapter.persistence.entity.RecordEntity;
import com.thanglong.landtax.infrastructure.adapter.persistence.entity.TaxPaymentEntity;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.LandParcelJpaRepository;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.LandPriceJpaRepository;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.RecordJpaRepository;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.TaxPaymentJpaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecordStateService {

    private final RecordJpaRepository recordJpaRepository;
    private final TaxPaymentJpaRepository taxPaymentJpaRepository;
    private final TaxCalculationService taxCalculationService;
    private final PaymentService paymentService;
    private final LandParcelJpaRepository landParcelJpaRepository;
    private final LandPriceJpaRepository landPriceJpaRepository;
    private final LandQuotaResolver landQuotaResolver;

    /**
     * Chuyển đổi trạng thái của hồ sơ (Record).
     *
     * @param recordId     ID của hồ sơ cần chuyển đổi
     * @param targetStatus Trạng thái đích muốn chuyển sang
     * @return RecordEntity sau khi đã lưu trạng thái mới
     */
    @Transactional
    public RecordEntity transitionTo(Integer recordId, String targetStatus) {
        RecordEntity record = recordJpaRepository.findById(recordId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hồ sơ với ID: " + recordId));

        String currentStatus = record.getCurrentStatus();
        log.info("Transitioning record {} from {} to {}", recordId, currentStatus, targetStatus);

        // Kiểm tra tính hợp lệ của chuyển đổi
        validateTransition(currentStatus, targetStatus);

        record.setCurrentStatus(targetStatus);
        RecordEntity savedRecord = recordJpaRepository.save(record);

        // Ngay khi chuyển sang APPROVED, hệ thống tự động tính thuế và tạo hóa đơn UNPAID
        if ("APPROVED".equals(targetStatus)) {
            createUnpaidPayment(savedRecord);
        }

        return savedRecord;
    }

    private void validateTransition(String current, String target) {
        if (current == null) {
            current = "SUBMITTED";
        }

        boolean isValid = false;
        switch (current) {
            case "SUBMITTED":
                if ("PROCESSING".equals(target) || "CANCELLED".equals(target)) {
                    isValid = true;
                }
                break;
            case "PROCESSING":
                if ("APPROVED".equals(target) || "CANCELLED".equals(target)) {
                    isValid = true;
                }
                break;
            case "APPROVED":
                if ("COMPLETED".equals(target)) {
                    isValid = true;
                }
                break;
            case "COMPLETED":
            case "CANCELLED":
                isValid = false; // Trạng thái kết thúc không thể chuyển tiếp
                break;
            default:
                // Đối với các trạng thái cũ ngoài 5 trạng thái tối giản (PENDING, VERIFIED...)
                // Cho phép cán bộ chuyển tiếp sang luồng mới
                isValid = true;
                break;
        }

        if (!isValid) {
            throw new IllegalStateException(String.format("Chuyển đổi trạng thái không hợp lệ: từ %s sang %s", current, target));
        }
    }

    private void createUnpaidPayment(RecordEntity record) {
        int currentYear = LocalDate.now().getYear();

        // 1. Lấy thông tin thửa đất và đơn giá đất
        LandParcelEntity parcel = landParcelJpaRepository.findById(record.getLandParcelId())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thửa đất với ID: " + record.getLandParcelId()));

        LandPriceEntity landPrice = landPriceJpaRepository.findLatestPrice(parcel.getLandTypeId(), parcel.getAreaId())
                .orElseThrow(() -> new IllegalArgumentException(
                        String.format("Không tìm thấy đơn giá đất cho landTypeId=%d, areaId=%d",
                                parcel.getLandTypeId(), parcel.getAreaId())));

        double limitArea = landQuotaResolver.resolveLimitArea(parcel.getAreaId());
        double taxAmountDouble = taxCalculationService.calculateTax(
                parcel.getAreaSize().doubleValue(),
                landPrice.getUnitPrice().doubleValue(),
                limitArea);
        java.math.BigDecimal taxAmount = java.math.BigDecimal.valueOf(taxAmountDouble).setScale(2, java.math.RoundingMode.HALF_UP);

        // 2. Tạo đối tượng TaxPaymentEntity mới
        TaxPaymentEntity taxPayment = TaxPaymentEntity.builder()
                .recordId(record.getRecordId())
                .landParcelId(record.getLandParcelId())
                .taxYear(currentYear)
                .totalAmountDue(taxAmount)
                .dueDate(LocalDate.now().plusDays(30)) // Hạn nộp là 30 ngày kể từ ngày phê duyệt
                .paymentStatus("UNPAID")
                .build();

        TaxPaymentEntity savedPayment = taxPaymentJpaRepository.save(taxPayment);
        
        // 3. Tạo transaction code bằng PaymentService
        paymentService.generateTransactionCode(savedPayment);
        
        log.info("Auto-generated UNPAID payment bill for record {}: payId={}, amount={}",
                record.getRecordId(), savedPayment.getPayId(), savedPayment.getTotalAmountDue());
    }
}
