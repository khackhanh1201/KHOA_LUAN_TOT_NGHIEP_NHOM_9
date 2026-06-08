package com.thanglong.landtax.usecase.service;

import com.thanglong.landtax.domain.RecordCategories;
import com.thanglong.landtax.domain.service.NotificationService;
import com.thanglong.landtax.domain.service.TaxPenaltyService;
import com.thanglong.landtax.domain.service.TaxPenaltyService.PenaltyResult;
import com.thanglong.landtax.infrastructure.adapter.persistence.entity.RecordEntity;
import com.thanglong.landtax.infrastructure.adapter.persistence.entity.TaxPaymentEntity;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.RecordJpaRepository;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.TaxPaymentJpaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Use case xu ly webhook thanh toan thanh cong tu PayOS.
 *
 * <p><b>Luong @Transactional:</b></p>
 * <ol>
 *   <li>Tim ban ghi tax_payments bang transaction_code (= orderCode PayOS gui)</li>
 *   <li>Cap nhat payment_status -> PAID, paid_at -> now()</li>
 *   <li>Cap nhat records.current_status -> COMPLETED</li>
 *   <li>Luu reconciliation log voi trang thai MATCHED</li>
 *   <li>Gui thong bao "Cam on ban da nop thue..." cho nguoi dan</li>
 * </ol>
 *
 * <p>Toan bo nam trong @Transactional neu bat ky buoc nao loi, rollback tat ca.</p>
 */
@Service
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings("null")
public class HandlePaymentWebhookUseCase {

    private final TaxPaymentJpaRepository taxPaymentJpaRepository;
    private final RecordJpaRepository recordJpaRepository;
    private final ReconciliationLogService reconciliationLogService;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;
    private final TaxPenaltyService taxPenaltyService;

    /**
     * Xu ly thanh toan thanh cong.
     *
     * @param orderCode      Ma don hang PayOS gui qua webhook (= transaction_code trong DB)
     * @param amountReceived So tien thuc nhan tu PayOS (de luu vao reconciliation_logs)
     * @param webhookPayload Noi dung JSON goc cua webhook (de luu vet doi soat)
     */
    @Transactional
    public void handlePaymentSuccess(String orderCode, BigDecimal amountReceived, String webhookPayload) {
        log.info("Processing PayOS webhook SUCCESS for orderCode: {}", orderCode);

        // ===== BUOC 1: Tim ban ghi thanh toan bang transaction_code =====
        TaxPaymentEntity payment = taxPaymentJpaRepository.findByTransactionCode(orderCode)
                .orElseThrow(() -> {
                    log.error("Payment not found for orderCode: {}", orderCode);
                    return new RuntimeException(
                            "Payment record not found for orderCode: " + orderCode);
                });

        // Kiem tra trang thai de tranh xu ly trung (idempotent)
        if ("PAID".equals(payment.getPaymentStatus())) {
            log.warn("Payment already marked as PAID: payId={}, orderCode={}", payment.getPayId(), orderCode);
            return;
        }

        // ===== BUOC 2: Cap nhat tax_payments -> PAID (phạt không lưu DB, tính động qua TaxPenaltyService) =====
        LocalDateTime paidAt = LocalDateTime.now();
        PenaltyResult penalty = taxPenaltyService.calculate(
                payment.getTotalAmountDue(), payment.getDueDate(), paidAt.toLocalDate());
        payment.setPaymentStatus("PAID");
        payment.setPaidAt(paidAt);
        taxPaymentJpaRepository.save(payment);

        BigDecimal totalPaid = penalty.totalPayable(payment.getTotalAmountDue());
        log.info("Payment updated to PAID: payId={}, base={}, penalty={}, total={} VND",
                payment.getPayId(), payment.getTotalAmountDue(), penalty.penaltyAmount(), totalPaid);

        // ===== BUOC 3: Cap nhat records (annual: chi COMPLETED khi ca 2 ky PAID) =====
        if (payment.getRecordId() != null) {
            RecordEntity record = recordJpaRepository.findById(payment.getRecordId())
                    .orElse(null);

            if (record != null) {
                if (RecordCategories.isAnnualTaxRenewal(record.getRecordCategory())) {
                    handleAnnualPaymentSuccess(record, payment, totalPaid);
                } else {
                    String oldStatus = record.getCurrentStatus();
                    record.setCurrentStatus("COMPLETED");
                    recordJpaRepository.save(record);
                    log.info("Record {} status updated: {} -> COMPLETED", record.getRecordId(), oldStatus);
                    notifyCitizenPaymentSuccess(record.getCitizenId(), payment, totalPaid);
                }
            }
        }

        // ===== BUOC 5: Luu reconciliation log (transaction rieng, JSON hop le) =====
        try {
            reconciliationLogService.saveMatchedLog(orderCode, amountReceived, webhookPayload);
        } catch (Exception e) {
            log.error("Failed to save reconciliation log for orderCode={}: {}", orderCode, e.getMessage());
        }

        // Ghi AuditLog
        auditLogService.log("WEBHOOK_PAYOS_SUCCESS", "TAX_PAYMENT", orderCode, "System confirmed payment success from PayOS for order " + orderCode);

        log.info("Webhook processing completed for orderCode: {}", orderCode);
    }

    private void handleAnnualPaymentSuccess(RecordEntity record, TaxPaymentEntity paidPayment, BigDecimal totalPaid) {
        List<TaxPaymentEntity> payments = taxPaymentJpaRepository.findByRecordId(record.getRecordId());

        TaxPaymentEntity installment1 = TaxInstallmentHelper.findInstallment(payments, 1);
        TaxPaymentEntity installment2 = TaxInstallmentHelper.findInstallment(payments, 2);

        if (installment1 != null && paidPayment.getPayId().equals(installment1.getPayId())
                && installment2 != null && "UNPAID".equals(installment2.getPaymentStatus())) {
            installment2.setPaymentStatus("AWAITING_PAYMENT");
            taxPaymentJpaRepository.save(installment2);
            log.info("Annual billing: activated installment 2 payId={}", installment2.getPayId());
        }

        List<TaxPaymentEntity> latest = taxPaymentJpaRepository.findByRecordId(record.getRecordId());
        if (TaxInstallmentHelper.isAnnualFullyPaid(latest)) {
            record.setCurrentStatus("COMPLETED");
            recordJpaRepository.save(record);
            log.info("Annual record {} COMPLETED — all installments PAID", record.getRecordId());
        }

        notifyCitizenPaymentSuccess(record.getCitizenId(), paidPayment, totalPaid);
    }

    private void notifyCitizenPaymentSuccess(Integer citizenId, TaxPaymentEntity payment, BigDecimal totalPaid) {
        try {
            notificationService.notifyPaymentSuccess(
                    citizenId,
                    payment.getPayId(),
                    totalPaid,
                    payment.getTaxYear());
        } catch (Exception e) {
            log.error("Failed to send payment notification: {}", e.getMessage());
        }
    }
}
