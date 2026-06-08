package com.thanglong.landtax.infrastructure.adapter.controller;

import com.thanglong.landtax.infrastructure.adapter.external.PayOSAdapter;
import com.thanglong.landtax.usecase.service.CreatePaymentLinkUseCase;
import com.thanglong.landtax.usecase.service.HandlePaymentWebhookUseCase;
import com.thanglong.landtax.usecase.service.ReconciliationLogService;
import com.thanglong.landtax.usecase.service.TaxPaymentQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import com.thanglong.landtax.infrastructure.adapter.persistence.entity.TaxPaymentEntity;
/**
 * REST Controller cho thanh toan thue dat.
 */
@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final CreatePaymentLinkUseCase createPaymentLinkUseCase;
    private final com.thanglong.landtax.usecase.service.PdfReceiptService pdfReceiptService;
    private final com.thanglong.landtax.infrastructure.adapter.persistence.jpa.TaxPaymentJpaRepository taxPaymentJpaRepository;
    private final PayOSAdapter payOSAdapter;
    private final HandlePaymentWebhookUseCase handlePaymentWebhookUseCase;
    private final TaxPaymentQueryService taxPaymentQueryService;

    @PostMapping("/{payId}/create-link")
    @PreAuthorize("hasAnyRole('CITIZEN', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> createPaymentLink(@PathVariable Integer payId) {
        try {
            Map<String, Object> result = createPaymentLinkUseCase.createPaymentLink(payId);
            return ResponseEntity.ok(result);
        } catch (IllegalStateException | org.springframework.security.access.AccessDeniedException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage() != null ? e.getMessage() : "Không thể tạo link thanh toán"));
        } catch (RuntimeException e) {
            String msg = e.getMessage() != null ? e.getMessage() : "Không thể tạo link thanh toán từ cổng thanh toán";
            return ResponseEntity.status(502).body(Map.of(
                    "success", false,
                    "message", msg));
        }
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('TAX_OFFICER', 'ADMIN')")
    public ResponseEntity<?> getAllPayments() {
        return ResponseEntity.ok(taxPaymentQueryService.toResponseList(taxPaymentJpaRepository.findAll()));
    }

    /**
     * Lay danh sach hoa don chua thanh toan (Đã FIX lỗi bảo mật hiển thị chéo dữ liệu)
     */
    /**
     * Danh sach hoa don da thanh toan (PAID) cua cong dan hien tai.
     */
    @GetMapping("/paid")
    @PreAuthorize("hasAnyRole('CITIZEN', 'ADMIN', 'TAX_OFFICER')")
    public ResponseEntity<?> getPaidPayments() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentCccd = auth.getName();
        boolean isOfficerOrAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_TAX_OFFICER") || a.getAuthority().equals("ROLE_ADMIN"));

        if (isOfficerOrAdmin) {
            return ResponseEntity.ok(
                    taxPaymentQueryService.toResponseList(taxPaymentJpaRepository.findByPaymentStatus("PAID")));
        }
        return ResponseEntity.ok(
                taxPaymentQueryService.toResponseList(taxPaymentJpaRepository.findPaidByCitizenCccd(currentCccd)));
    }

    @GetMapping("/unpaid")
    @PreAuthorize("hasAnyRole('CITIZEN', 'ADMIN', 'TAX_OFFICER')")
    public ResponseEntity<?> getUnpaidPayments() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentCccd = auth.getName();

        // Kiểm tra xem User đang đăng nhập có phải là Cán bộ hoặc Admin không
        boolean isOfficerOrAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_TAX_OFFICER") || a.getAuthority().equals("ROLE_ADMIN"));

        if (isOfficerOrAdmin) {
            List<TaxPaymentEntity> unpaid = taxPaymentJpaRepository.findAll().stream()
                    .filter(p -> p.getPaymentStatus() != null
                            && List.of("UNPAID", "AWAITING_PAYMENT", "OVERDUE").contains(p.getPaymentStatus()))
                    .toList();
            return ResponseEntity.ok(taxPaymentQueryService.toResponseList(unpaid));
        }
        return ResponseEntity.ok(taxPaymentQueryService.toResponseList(
                taxPaymentJpaRepository.findUnpaidByCitizenCccdAndStatuses(
                        currentCccd,
                        List.of("UNPAID", "AWAITING_PAYMENT", "OVERDUE"))));
    }

    /**
     * Đồng bộ trạng thái thanh toán từ PayOS theo transaction_code (orderCode).
     *
     * <p>Dùng cho môi trường dev/local khi webhook không gọi về localhost.</p>
     */
    @PostMapping("/{payId}/sync-status")
    @PreAuthorize("hasAnyRole('CITIZEN', 'ADMIN')")
    public ResponseEntity<?> syncPaymentStatus(@PathVariable Integer payId) {
        TaxPaymentEntity payment = taxPaymentJpaRepository.findById(payId)
                .orElseThrow(() -> new RuntimeException("Payment record not found: " + payId));

        String orderCodeStr = payment.getTransactionCode();
        if (orderCodeStr == null || orderCodeStr.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Chưa có transaction_code. Vui lòng tạo link thanh toán trước."
            ));
        }

        long orderCode;
        try {
            orderCode = Long.parseLong(orderCodeStr.trim());
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "transaction_code không hợp lệ: " + orderCodeStr
            ));
        }

        try {
            PayOSAdapter.PaymentStatusResult status = payOSAdapter.getPaymentStatus(orderCode);
            String st = status.getStatus() != null ? status.getStatus().toUpperCase() : "UNKNOWN";

            // Nếu PayOS đã PAID nhưng DB chưa cập nhật → gọi chung luồng xử lý PAID
            if ("PAID".equals(st) && !"PAID".equalsIgnoreCase(payment.getPaymentStatus())) {
                handlePaymentWebhookUseCase.handlePaymentSuccess(
                        String.valueOf(orderCode),
                        BigDecimal.valueOf(status.getAmount()),
                        ReconciliationLogService.manualSyncPayload(payId, orderCodeStr)
                );
            }

            TaxPaymentEntity latest = taxPaymentJpaRepository.findById(payId).orElse(payment);
            return ResponseEntity.ok(buildSyncStatusBody(true, payId, orderCodeStr, st, latest, "Synced payment status"));
        } catch (Exception e) {
            // Không để FE polling bị 500 → trả OK kèm message để user chờ thêm
            TaxPaymentEntity latest = taxPaymentJpaRepository.findById(payId).orElse(payment);
            String msg = e.getMessage() != null ? e.getMessage() : "PayOS query failed";
            return ResponseEntity.ok(buildSyncStatusBody(false, payId, orderCodeStr, "ERROR", latest, msg));
        }
    }

    /** Map.of không cho phép null — paidAt thường null khi chưa PAID. */
    private static Map<String, Object> buildSyncStatusBody(
            boolean success,
            Integer payId,
            String orderCode,
            String payosStatus,
            TaxPaymentEntity payment,
            String message) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("success", success);
        body.put("payId", payId);
        body.put("orderCode", orderCode);
        body.put("payosStatus", payosStatus);
        body.put("paymentStatus", payment.getPaymentStatus() != null ? payment.getPaymentStatus() : "UNKNOWN");
        if (payment.getPaidAt() != null) {
            body.put("paidAt", payment.getPaidAt());
        }
        body.put("message", message);
        return body;
    }

    @GetMapping("/{payId}/receipt")
    @PreAuthorize("hasAnyRole('CITIZEN', 'ADMIN')")
    public ResponseEntity<byte[]> downloadReceipt(@PathVariable Integer payId) {
        byte[] pdfBytes = pdfReceiptService.generatePaymentReceipt(payId);

        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setContentType(org.springframework.http.MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "BienLai_ThueDat_" + payId + ".pdf");

        return new ResponseEntity<>(pdfBytes, headers, org.springframework.http.HttpStatus.OK);
    }
    /**
 * Lấy hóa đơn thuế theo record_id (cho cán bộ địa chính / thuế xem hồ sơ).
 */
@GetMapping("/by-record/{recordId}")
@PreAuthorize("hasAnyAuthority('ROLE_LAND_OFFICER', 'ROLE_TAX_OFFICER', 'ROLE_ADMIN', 'ROLE_CITIZEN')")
public ResponseEntity<?> getPaymentsByRecordId(@PathVariable Integer recordId) {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    boolean isCitizen = auth.getAuthorities().stream()
            .anyMatch(a -> "ROLE_CITIZEN".equals(a.getAuthority()));

  List<TaxPaymentEntity> payments = taxPaymentJpaRepository.findByRecordId(recordId);
    if (payments.isEmpty()) {
        return ResponseEntity.ok(List.of());
    }

    if (isCitizen) {
        // TODO: kiểm tra record thuộc citizen hiện tại (recordJpaRepository + cccd)
        // Nếu không phải chủ hồ sơ → 403
    }

    return ResponseEntity.ok(taxPaymentQueryService.toResponseList(payments));
}
}