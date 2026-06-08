package com.thanglong.landtax.infrastructure.adapter.controller;


import com.thanglong.landtax.infrastructure.adapter.external.PayOSAdapter;
import com.thanglong.landtax.usecase.service.HandlePaymentWebhookUseCase;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

/**
 * Controller xu ly webhook thanh toan tu PayOS.
 *
 * <p><b>Endpoint nay la PUBLIC</b> (permitAll trong SecurityConfig)
 * vi PayOS server goi truc tiep, khong co JWT token.</p>
 *
 * <p><b>Bao mat:</b> Xac thuc tinh hop le cua webhook bang chu ky HMAC-SHA256
 * duoc PayOS gui kem trong request body, su dung PayOS SDK webhooks().verify().</p>
 *
 * <p><b>PayOS Webhook Payload:</b></p>
 * <pre>
 * {
 *   "code": "00",           // 00 = thanh cong
 *   "desc": "success",
 *   "data": {
 *     "orderCode": 123456,
 *     "amount": 5000000,
 *     "description": "Nop thue dat...",
 *     "accountNumber": "...",
 *     "transactionDateTime": "2025-01-15 14:30:00",
 *     "paymentLinkId": "..."
 *   },
 *   "signature": "abc123..."
 * }
 * </pre>
 */
@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentWebhookController {

    private final HandlePaymentWebhookUseCase handlePaymentWebhookUseCase;
    private final PayOSAdapter payOSAdapter;

    /**
     * Nhan webhook tu PayOS khi thanh toan hoan tat.
     *
     * <p><b>URL:</b> POST /api/payments/webhook</p>
     * <p><b>Access:</b> PUBLIC (khong can JWT)</p>
     */
    @PostMapping("/webhook")
    public ResponseEntity<Map<String, Object>> handleWebhook(@RequestBody Map<String, Object> payload) {
        log.info("Received PayOS webhook: {}", payload);

        try {
            // ===== 1. Xac thuc chu ky Webhook (HMAC-SHA256) =====
            PayOSAdapter.VerifiedWebhookData verifiedData;
            try {
                verifiedData = payOSAdapter.verifyWebhookData(payload);
            } catch (RuntimeException e) {
                log.warn("Webhook signature validation FAILED: {}", e.getMessage());
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Invalid webhook signature"
                ));
            }

            // ===== 2. Kiem tra ma trang thai =====
            if (!"00".equals(verifiedData.getCode())) {
                log.info("Webhook received non-success code: code={}, desc={}, orderCode={}",
                        verifiedData.getCode(), verifiedData.getDesc(), verifiedData.getOrderCode());
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "Received non-success webhook, no action taken"
                ));
            }

            // ===== 3. Xu ly thanh toan thanh cong =====
            String orderCode = String.valueOf(verifiedData.getOrderCode());
            BigDecimal amountReceived = BigDecimal.valueOf(verifiedData.getAmount());

            // Chuyen doi payload sang JSON string de luu vao reconciliation_logs
            String webhookPayloadJson;
            try {
                webhookPayloadJson = new com.fasterxml.jackson.databind.ObjectMapper()
                        .writeValueAsString(payload);
            } catch (Exception e) {
                webhookPayloadJson = payload.toString();
            }

            log.info("PayOS payment SUCCESS: orderCode={}, amount={}", orderCode, amountReceived);
            handlePaymentWebhookUseCase.handlePaymentSuccess(orderCode, amountReceived, webhookPayloadJson);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Webhook processed successfully"
            ));

        } catch (Exception e) {
            log.error("Error processing PayOS webhook: {}", e.getMessage(), e);
            // Tra ve 200 de PayOS khong retry (tranh loop)
            return ResponseEntity.ok(Map.of(
                    "success", false,
                    "message", "Webhook processing failed: " + e.getMessage()
            ));
        }
    }

    /**
     * Endpoint test webhook (chi dung trong development).
     * Gia lap PayOS gui tin hieu thanh toan thanh cong.
     */
    @PostMapping("/webhook/test/{orderCode}")
    public ResponseEntity<Map<String, Object>> testWebhook(@PathVariable String orderCode) {
        log.info("[TEST] Simulating PayOS success webhook for orderCode: {}", orderCode);

        handlePaymentWebhookUseCase.handlePaymentSuccess(
                orderCode,
                BigDecimal.ZERO,     // Test mode: amount khong duoc xac thuc
                "{\"test\": true}"   // Mock payload
        );

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Test webhook processed for orderCode: " + orderCode
        ));
    }
}
