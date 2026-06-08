package com.thanglong.landtax.infrastructure.adapter.external;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import vn.payos.PayOS;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkRequest;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkResponse;
import vn.payos.model.v2.paymentRequests.PaymentLink;
import vn.payos.model.v2.paymentRequests.PaymentLinkStatus;
import vn.payos.model.webhooks.WebhookData;

import java.util.Map;

@Component
@Slf4j
public class PayOSAdapter {

    private final PayOS payOS;

    public PayOSAdapter(
            @Value("${payos.client-id:}") String clientId,
            @Value("${payos.api-key:}") String apiKey,
            @Value("${payos.checksum-key:}") String checksumKey) {
        
        // Trim de chong loi khoang trang an
        this.payOS = new PayOS(
            clientId != null ? clientId.trim() : "", 
            apiKey != null ? apiKey.trim() : "", 
            checksumKey != null ? checksumKey.trim() : ""
        );
    }

    public PaymentLinkResult createPaymentLink(long orderCode, long amount, String description, String returnUrl, String cancelUrl) {
        try {
            // Su dung doi tuong CreatePaymentLinkRequest cua ban 2.0.1 (Thay cho PaymentData)
            CreatePaymentLinkRequest paymentData = CreatePaymentLinkRequest.builder()
                    .orderCode((long) orderCode)
                    .amount((long) amount)
                    .description(description)
                    .returnUrl(returnUrl)
                    .cancelUrl(cancelUrl)
                    .build();

            // Goi qua paymentRequests() service cua ban 2.x
            CreatePaymentLinkResponse data = payOS.paymentRequests().create(paymentData);

            return new PaymentLinkResult(
                    String.valueOf(data.getOrderCode()),
                    data.getAmount() != null ? data.getAmount() : 0L,
                    data.getCheckoutUrl(),
                    data.getQrCode(),
                    data.getDescription()
            );

        } catch (Exception e) {
            log.error("Loi tao link thanh toan PayOS ban 2.0.1", e);
            String detail = e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName();
            throw new RuntimeException(
                    "Khong the ket noi voi cong thanh toan: " + detail + ". Vui long thu lai sau.", e);
        }
    }

    // ==================== WEBHOOK VERIFICATION ====================

    /**
     * Xac thuc webhook tu PayOS bang HMAC-SHA256 (su dung SDK webhooks().verify()).
     *
     * <p>SDK se tu dong kiem tra signature dua tren checksum_key da cau hinh,
     * tra ve WebhookData da duoc xac thuc.</p>
     *
     * @param webhookBody Raw JSON body tu PayOS gui den endpoint (Map<String, Object>)
     * @return VerifiedWebhookData chua orderCode, amount, description da duoc xac thuc
     * @throws RuntimeException neu signature khong hop le
     */
    public VerifiedWebhookData verifyWebhookData(Map<String, Object> webhookBody) {
        try {
            // SDK v2.0.1: webhooks().verify() nhan Object (tu dong parse sang Webhook)
            // va kiem tra chu ky HMAC-SHA256 bang checksum_key
            WebhookData verifiedData = payOS.webhooks().verify(webhookBody);

            String code = String.valueOf(webhookBody.getOrDefault("code", ""));
            String desc = String.valueOf(webhookBody.getOrDefault("desc", ""));

            return new VerifiedWebhookData(
                    code,
                    desc,
                    verifiedData.getOrderCode() != null ? verifiedData.getOrderCode() : 0L,
                    verifiedData.getAmount() != null ? verifiedData.getAmount() : 0L,
                    verifiedData.getDescription()
            );

        } catch (Exception e) {
            log.error("PayOS webhook signature verification FAILED: {}", e.getMessage());
            throw new RuntimeException("Invalid PayOS webhook signature", e);
        }
    }

    // ==================== PAYMENT STATUS QUERY ====================

    /**
     * Truy van trang thai thanh toan tu PayOS API (dung cho scheduled sync).
     *
     * <p>Goi payOS.paymentRequests().get(orderCode) de kiem tra
     * trang thai thanh toan tu phia PayOS.</p>
     *
     * @param orderCode Ma don hang (= transaction_code trong DB)
     * @return PaymentStatusResult chua status, amount tu PayOS
     */
    public PaymentStatusResult getPaymentStatus(long orderCode) {
        try {
            PaymentLink paymentInfo = payOS.paymentRequests().get(orderCode);

            String statusStr = paymentInfo.getStatus() != null
                    ? paymentInfo.getStatus().getValue()
                    : "UNKNOWN";

            return new PaymentStatusResult(
                    statusStr,
                    paymentInfo.getAmount() != null ? paymentInfo.getAmount() : 0L,
                    paymentInfo.getOrderCode() != null ? paymentInfo.getOrderCode() : orderCode
            );

        } catch (Exception e) {
            log.error("Failed to query PayOS payment status for orderCode={}: {}",
                    orderCode, e.getMessage());
            throw new RuntimeException(
                    "Cannot query PayOS payment status for orderCode: " + orderCode, e);
        }
    }

    // ==================== DTOs ====================

    @lombok.Getter
    @lombok.AllArgsConstructor
    public static class PaymentLinkResult {
        private final String orderCode;
        private final long amount;
        private final String checkoutUrl;
        private final String qrCode;
        private final String description;
    }

    @lombok.Getter
    @lombok.AllArgsConstructor
    public static class VerifiedWebhookData {
        private final String code;
        private final String desc;
        private final long orderCode;
        private final long amount;
        private final String description;
    }

    @lombok.Getter
    @lombok.AllArgsConstructor
    public static class PaymentStatusResult {
        private final String status;
        private final long amount;
        private final long orderCode;
    }
}
