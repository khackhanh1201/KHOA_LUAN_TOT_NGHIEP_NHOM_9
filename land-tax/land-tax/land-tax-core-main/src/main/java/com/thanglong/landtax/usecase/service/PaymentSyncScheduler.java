package com.thanglong.landtax.usecase.service;

import com.thanglong.landtax.infrastructure.adapter.external.PayOSAdapter;
import com.thanglong.landtax.infrastructure.adapter.persistence.entity.TaxPaymentEntity;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.TaxPaymentJpaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

/**
 * Scheduled task dong bo trang thai thanh toan voi PayOS.
 *
 * <p><b>Muc dich:</b> Phong truong hop webhook bi mat do loi mang,
 * scheduler nay se quet cac khoan UNPAID/AWAITING_PAYMENT/OVERDUE co transaction_code
 * va goi PayOS API de kiem tra trang thai thuc te.</p>
 *
 * <p><b>Tan suat:</b> Moi 15 phut mot lan.</p>
 *
 * <p><b>Luong xu ly cho moi ban ghi:</b></p>
 * <ol>
 *   <li>Goi PayOS API: paymentRequests().getPaymentLinkInfo(orderCode)</li>
 *   <li>Neu PayOS tra ve status = "PAID" → goi HandlePaymentWebhookUseCase.handlePaymentSuccess()</li>
 *   <li>Neu loi API cho 1 ban ghi, log va bo qua (khong anh huong cac ban ghi khac)</li>
 * </ol>
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentSyncScheduler {

    private final TaxPaymentJpaRepository taxPaymentJpaRepository;
    private final PayOSAdapter payOSAdapter;
    private final HandlePaymentWebhookUseCase handlePaymentWebhookUseCase;

    /**
     * Quet va dong bo cac khoan cho thanh toan voi PayOS moi 15 phut.
     */
    @Scheduled(cron = "0 */15 * * * *")
    public void syncPendingPaymentsWithPayOS() {
        log.info("[SYNC] Starting periodic PayOS payment status sync...");

        List<TaxPaymentEntity> pendingWithCode = taxPaymentJpaRepository.findPendingWithTransactionCode(
                List.of("UNPAID", "AWAITING_PAYMENT", "OVERDUE"));

        if (pendingWithCode.isEmpty()) {
            log.info("[SYNC] No pending payments with transaction_code found. Skipping.");
            return;
        }

        log.info("[SYNC] Found {} pending payments (UNPAID/AWAITING_PAYMENT/OVERDUE) with transaction_code to check",
                pendingWithCode.size());

        int syncedCount = 0;

        for (TaxPaymentEntity payment : pendingWithCode) {
            try {
                long orderCode = Long.parseLong(payment.getTransactionCode());

                // Goi PayOS API de kiem tra trang thai
                PayOSAdapter.PaymentStatusResult result = payOSAdapter.getPaymentStatus(orderCode);

                log.debug("[SYNC] PayOS status for orderCode={}: status={}, amount={}",
                        orderCode, result.getStatus(), result.getAmount());

                // PayOS tra ve "PAID" khi thanh toan thanh cong
                if ("PAID".equalsIgnoreCase(result.getStatus())) {
                    log.info("[SYNC] Payment confirmed PAID by PayOS: orderCode={}, payId={}",
                            orderCode, payment.getPayId());

                    BigDecimal amountReceived = BigDecimal.valueOf(result.getAmount());

                    handlePaymentWebhookUseCase.handlePaymentSuccess(
                            payment.getTransactionCode(),
                            amountReceived,
                            "{\"source\": \"scheduled_sync\", \"orderCode\": " + orderCode + "}"
                    );

                    syncedCount++;
                }

            } catch (NumberFormatException e) {
                log.warn("[SYNC] Invalid transaction_code format for payId={}: '{}'",
                        payment.getPayId(), payment.getTransactionCode());
            } catch (Exception e) {
                // Log loi nhung khong dung vong lap — tiep tuc xu ly cac ban ghi khac
                log.error("[SYNC] Error checking PayOS status for payId={}, orderCode={}: {}",
                        payment.getPayId(), payment.getTransactionCode(), e.getMessage());
            }
        }

        log.info("[SYNC] Sync completed. {}/{} payments updated to PAID.",
                syncedCount, pendingWithCode.size());
    }
}
