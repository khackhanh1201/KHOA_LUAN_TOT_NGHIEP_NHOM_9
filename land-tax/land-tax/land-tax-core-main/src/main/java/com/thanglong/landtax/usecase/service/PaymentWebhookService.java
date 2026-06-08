package com.thanglong.landtax.usecase.service;

import com.thanglong.landtax.infrastructure.adapter.persistence.entity.TaxPaymentEntity;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.TaxPaymentJpaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentWebhookService {

    private final TaxPaymentJpaRepository taxPaymentJpaRepository;
    private final RecordStateService recordStateService;
    private final AuditLogService auditLogService;

    /**
     * Xử lý tín hiệu thanh toán thành công (Webhook) từ PayOS hoặc cổng thanh toán.
     * Cập nhật trạng thái thanh toán của hóa đơn thành PAID và tự động chuyển trạng thái của hồ sơ sang COMPLETED.
     *
     * @param transactionCode Mã giao dịch (orderCode của PayOS)
     */
    @Transactional
    public void processPaymentSuccess(String transactionCode) {
        log.info("Processing webhook payment success for transactionCode: {}", transactionCode);

        // 1. Tìm bản ghi thanh toán theo mã giao dịch duy nhất
        TaxPaymentEntity payment = taxPaymentJpaRepository.findByTransactionCode(transactionCode)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bản ghi thanh toán với mã giao dịch: " + transactionCode));

        // Tránh xử lý trùng lặp (Idempotent)
        if ("PAID".equals(payment.getPaymentStatus())) {
            log.warn("Payment already marked as PAID for transactionCode: {}", transactionCode);
            return;
        }

        // 2. Cập nhật trạng thái thanh toán của hóa đơn
        payment.setPaymentStatus("PAID");
        payment.setPaidAt(LocalDateTime.now());
        taxPaymentJpaRepository.save(payment);
        log.info("Payment status updated to PAID for transactionCode: {}", transactionCode);

        // 3. Tự động lật trạng thái của hồ sơ gốc liên quan sang COMPLETED
        if (payment.getRecordId() != null) {
            log.info("Transitioning record ID {} associated with payment transaction {} to COMPLETED",
                    payment.getRecordId(), transactionCode);
            recordStateService.transitionTo(payment.getRecordId(), "COMPLETED");
        }

        // 4. Ghi Audit Log của hệ thống
        auditLogService.log(
                "PAYMENT_WEBHOOK_PAID",
                "TAX_PAYMENT",
                transactionCode,
                "Confirmed payment PAID via webhook. Transitioned record #" + payment.getRecordId() + " to COMPLETED"
        );
    }
}
