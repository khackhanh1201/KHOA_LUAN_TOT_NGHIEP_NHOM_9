package com.thanglong.landtax.infrastructure.adapter.controller;

import com.thanglong.landtax.infrastructure.adapter.persistence.entity.ReconciliationLogEntity;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.ReconciliationLogJpaRepository;
import com.thanglong.landtax.infrastructure.config.aop.AuditLog;
import com.thanglong.landtax.usecase.dto.ReconciliationRowResponse;
import com.thanglong.landtax.usecase.service.PaymentReconciliationService;
import com.thanglong.landtax.usecase.service.TaxReportExportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Controller cho Module Doi soat thanh toan va Xuat bao cao.
 */
@RestController
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings("all")
public class PaymentReconciliationController {

    private final TaxReportExportService taxReportExportService;
    private final ReconciliationLogJpaRepository reconciliationLogJpaRepository;
    private final PaymentReconciliationService paymentReconciliationService;

    /**
     * POST /api/payments/reconcile/run — Chay doi soat PayOS webhook vs DB.
     */
    @PostMapping("/api/payments/reconcile/run")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'TAX_OFFICER')")
    public ResponseEntity<List<ReconciliationRowResponse>> runReconciliation() {
        log.info("POST /api/payments/reconcile/run");
        return ResponseEntity.ok(paymentReconciliationService.runReconciliation());
    }

    /**
     * POST /api/payments/reconcile/upload — Đối soát từ file sao kê ngân hàng (CSV/Excel).
     */
    @PostMapping(value = "/api/payments/reconcile/upload", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'TAX_OFFICER')")
    @AuditLog(action = "Doi soat tu file sao ke")
    public ResponseEntity<?> uploadReconciliation(@RequestParam("file") MultipartFile file) {
        log.info("POST /api/payments/reconcile/upload - file={}", file.getOriginalFilename());
        try {
            return ResponseEntity.ok(paymentReconciliationService.reconcileFromUpload(file));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Upload reconcile failed: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "Khong the doi soat tu file: " + e.getMessage()));
        }
    }

    /**
     * GET  /api/payments/reconcile/discrepancies  Xem danh sach sai lech (legacy).
     */
    @GetMapping("/api/payments/reconcile/discrepancies")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'TAX_OFFICER')")
    public ResponseEntity<List<ReconciliationLogEntity>> getDiscrepancies() {
        log.info("GET /api/payments/reconcile/discrepancies - Lay danh sach giao dich sai lech");
        return ResponseEntity.ok(reconciliationLogJpaRepository.findByStatusOrderByCreatedAtDesc("DISCREPANCY"));
    }

    /**
     * PUT /api/payments/bills/{id}/adjust  Can bo dieu chinh trang thai hoa don sau doi soat.
     * Body: { "status": "PAID" | "DISPUTED" | "FAILED" | ..., "note": "Ly do" }
     */
    @PutMapping("/api/payments/bills/{id}/adjust")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'TAX_OFFICER')")
    @AuditLog(action = "Dieu chinh trang thai hoa don")
    public ResponseEntity<?> adjustBillStatus(@PathVariable Integer id, @RequestBody Map<String, String> body) {

        String newStatus = body.get("status");
        String note = body.getOrDefault("note", "");

        if (newStatus == null || newStatus.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Thieu truong 'status'"));
        }
        if (note.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Ly do xu ly la bat buoc"));
        }
        if (!List.of("PAID", "UNPAID", "AWAITING_PAYMENT", "WAIVED", "DISCREPANCY", "DISPUTED", "FAILED").contains(newStatus)) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Gia tri status khong hop le. Chap nhan: PAID, UNPAID, AWAITING_PAYMENT, WAIVED, DISCREPANCY, DISPUTED, FAILED"));
        }

        try {
            Map<String, Object> result = paymentReconciliationService.adjustBillStatus(id, newStatus, note);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET /api/admin/reports/export  Xuat bao cao tinh hinh thu thue khu vuc ra file .xlsx.
     */
    @GetMapping("/api/admin/reports/export")
    @AuditLog(action = "Xuat bao cao thu thue")
    public ResponseEntity<byte[]> exportReport(
            @RequestParam(required = false) Integer areaId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer year) {

        if (!isOfficer()) return ResponseEntity.status(403).build();

        try {
            byte[] excelBytes = taxReportExportService.exportToExcel(areaId, status, year);

            String yearStr = (year != null) ? String.valueOf(year) : String.valueOf(LocalDate.now().getYear());
            String filename = String.format("bao-cao-thu-thue-%s.xlsx", yearStr);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            headers.setContentDispositionFormData("attachment", filename);
            headers.setContentLength(excelBytes.length);

            log.info("Xuat bao cao Excel: areaId={}, status={}, year={}, size={}KB",
                    areaId, status, year, excelBytes.length / 1024);
            return ResponseEntity.ok().headers(headers).body(excelBytes);

        } catch (Exception e) {
            log.error("Loi xuat bao cao Excel: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    private boolean isOfficer() {
        return org.springframework.security.core.context.SecurityContextHolder.getContext()
                .getAuthentication().getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().contains("ADMIN")
                        || a.getAuthority().contains("TAX_OFFICER")
                        || a.getAuthority().contains("OFFICER"));
    }
}
