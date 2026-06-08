package com.thanglong.landtax.infrastructure.adapter.controller;

import com.thanglong.landtax.infrastructure.adapter.persistence.entity.RecordEntity;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.ComplaintJpaRepository;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.CitizenLocalJpaRepository;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.RecordJpaRepository;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.TaxDeclarationRepository;
import com.thanglong.landtax.usecase.dto.ForwardRecordRequest;
import com.thanglong.landtax.usecase.dto.RecordRequestDTO;
import com.thanglong.landtax.usecase.dto.CadastralDashboardStatsDTO;
import com.thanglong.landtax.usecase.dto.OfficerNotificationDTO;
import com.thanglong.landtax.usecase.service.CadastralDashboardService;
import com.thanglong.landtax.usecase.service.CadastralOfficerNotificationService;
import com.thanglong.landtax.usecase.service.RecordDetailQueryService;
import com.thanglong.landtax.usecase.service.RecordService;
import com.thanglong.landtax.usecase.service.RecordReceiptPdfService;
import com.thanglong.landtax.usecase.service.VerifyDeclarationUseCase;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.RecordDocumentJpaRepository;
import java.util.List;
import java.util.Map;
import java.util.LinkedHashMap;
import com.thanglong.landtax.infrastructure.adapter.persistence.entity.RecordDocumentEntity;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.TaxPaymentJpaRepository;
import com.thanglong.landtax.infrastructure.adapter.persistence.entity.TaxPaymentEntity;
@RestController
@RequestMapping("/api/records")
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings("null")
public class RecordController {

    private final RecordJpaRepository recordJpaRepository;
    private final ComplaintJpaRepository complaintJpaRepository;
    private final VerifyDeclarationUseCase verifyDeclarationUseCase;
    private final RecordService recordService;
    private final RecordDocumentJpaRepository recordDocumentJpaRepository;
    private final CitizenLocalJpaRepository citizenLocalJpaRepository;
    private final TaxDeclarationRepository taxDeclarationRepository;
    private final TaxPaymentJpaRepository taxPaymentJpaRepository;
    private final RecordReceiptPdfService recordReceiptPdfService;
    private final RecordDetailQueryService recordDetailQueryService;
    private final CadastralOfficerNotificationService cadastralOfficerNotificationService;
    private final CadastralDashboardService cadastralDashboardService;
    /**
     * Tao ho so moi (chuan 3NF: nested taxDeclaration).
     *
     * <p>Body example:</p>
     * <pre>
     * {
     *   "citizenId": 4,
     *   "landParcelId": 1,
     *   "recordCategory": "TAX_DECLARATION",
     *   "taxDeclaration": {
     *     "declaredArea": 100,
     *     "declaredPurpose": "Nha o"
     *   }
     * }
     * </pre>
     */

    @GetMapping("/{id}/documents")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_LAND_OFFICER', 'ROLE_TAX_OFFICER')")
    public ResponseEntity<List<RecordDocumentEntity>> getRecordDocuments(@PathVariable Integer id) {
        return ResponseEntity.ok(
            recordDocumentJpaRepository.findByRecordId(id.longValue())
        );
    }
    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_LAND_OFFICER', 'ROLE_TAX_OFFICER', 'ROLE_CITIZEN')")
    public ResponseEntity<?> createRecord(@RequestBody RecordRequestDTO request) {
        log.info("POST /api/records - Tao ho so moi");
        try {
            RecordEntity saved = recordService.createRecord(request);
            return ResponseEntity.ok(buildRecordResponse(saved));
        } catch (Exception e) {
            log.error("Loi khi tao ho so: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Lay danh sach tat ca ho so.
     */
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_LAND_OFFICER', 'ROLE_TAX_OFFICER')")
    public ResponseEntity<List<Map<String, Object>>> getAllRecords() {
        log.info("GET /api/records - Lay danh sach tat ca ho so");
        List<RecordEntity> records = recordJpaRepository.findAll();
        List<Map<String, Object>> response = records.stream()
                .map(this::buildRecordResponse)
                .toList();
        return ResponseEntity.ok(response);
    }

    /**
     * Xem chi tiet ho so (tra ve nested taxDeclaration neu co).
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_LAND_OFFICER', 'ROLE_TAX_OFFICER')")
    public ResponseEntity<?> getRecordById(@PathVariable Integer id) {
        log.info("GET /api/records/{} - Xem chi tiet ho so", id);
        return recordDetailQueryService.buildRecordDetail(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /** Xuất phiếu tiếp nhận hồ sơ (PDF). */
    @GetMapping("/{id}/receipt")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_LAND_OFFICER', 'ROLE_TAX_OFFICER')")
    public ResponseEntity<byte[]> downloadReceipt(
            @PathVariable Integer id,
            @RequestParam(required = false) String officerName) {
        log.info("GET /api/records/{}/receipt", id);
        try {
            byte[] pdfBytes = recordReceiptPdfService.generateReceipt(id, officerName);
            String filename = String.format("PhieuTiepNhan_HS-%06d.pdf", id);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", filename);
            headers.setContentLength(pdfBytes.length);
            return ResponseEntity.ok().headers(headers).body(pdfBytes);
        } catch (RuntimeException e) {
            log.error("Export receipt failed for record {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * GET /api/records/cadastral-dashboard - Thống kê + hoạt động gần đây (bảng điều khiển địa chính).
     */
    @GetMapping("/cadastral-dashboard")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_LAND_OFFICER')")
    public ResponseEntity<CadastralDashboardStatsDTO> getCadastralDashboard() {
        log.info("GET /api/records/cadastral-dashboard");
        return ResponseEntity.ok(cadastralDashboardService.getDashboardStats());
    }

    /**
     * GET /api/records/officer-notifications - Thông báo việc mới (hồ sơ/khiếu nại mới).
     */
    @GetMapping("/officer-notifications")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_LAND_OFFICER')")
    public ResponseEntity<List<OfficerNotificationDTO>> getOfficerNotifications() {
        log.info("GET /api/records/officer-notifications");
        return ResponseEntity.ok(cadastralOfficerNotificationService.getLandOfficerNotifications());
    }

    /**
     * GET /api/records/pending-workload - Số hồ sơ/khiếu nại chờ xử lý (badge menu cán bộ địa chính).
     */
    @GetMapping("/pending-workload")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_LAND_OFFICER')")
    public ResponseEntity<Map<String, Long>> getPendingWorkload() {
        long pendingRecords = recordJpaRepository.countByCurrentStatusIn(
                List.of("SUBMITTED", "PENDING", "FRAUD_SUSPECTED"));
        long pendingComplaints = complaintJpaRepository.countByStatusAndComplaintType("PENDING", "LAND");
        return ResponseEntity.ok(Map.of(
                "pendingRecords", pendingRecords,
                "pendingComplaints", pendingComplaints));
    }

    /**
     * Lay danh sach ho so dang cho xac minh (trang thai SUBMITTED).
     */
    @GetMapping("/submitted")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_LAND_OFFICER', 'ROLE_TAX_OFFICER')")
    public ResponseEntity<List<Map<String, Object>>> getSubmittedRecords() {
        log.info("GET /api/records/submitted - lay danh sach ho so cho xac minh");
        List<RecordEntity> records = recordJpaRepository.findByCurrentStatus("SUBMITTED");
        List<Map<String, Object>> response = records.stream()
                .map(this::buildRecordResponse)
                .toList();
        return ResponseEntity.ok(response);
    }

    /**
     * Tiep nhan va xac minh ho so.
     */
    @PutMapping("/{id}/verify")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_LAND_OFFICER')")
    public ResponseEntity<?> verifyRecord(@PathVariable Integer id) {
        log.info("PUT /api/records/{}/verify", id);
        try {
            return ResponseEntity.ok(verifyDeclarationUseCase.verifyDeclaration(id));
        } catch (IllegalArgumentException e) {
            log.error("Loi khi xac minh ho so {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            log.error("Loi khi xac minh ho so {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Luân chuyển hồ sơ sang cơ quan Thuế.
     */
    @PostMapping("/{id}/forward")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_LAND_OFFICER')")
    public ResponseEntity<?> forwardRecord(@PathVariable Integer id, @RequestBody ForwardRecordRequest request) {
        log.info("POST /api/records/{}/forward - luan chuyen ho so", id);
        try {
            recordService.forwardRecord(id, request);
            return ResponseEntity.ok(Map.of("message", "Luân chuyển hồ sơ sang cơ quan Thuế thành công"));
        } catch (IllegalArgumentException e) {
            log.error("Loi khi luan chuyen ho so {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Build response voi nested taxDeclaration object (chuan 3NF).
     */
    private Map<String, Object> buildRecordResponse(RecordEntity record) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("recordId", record.getRecordId());
        response.put("citizenId", record.getCitizenId());
        response.put("landParcelId", record.getLandParcelId());
        response.put("recordCategory", record.getRecordCategory());
        response.put("currentStatus", record.getCurrentStatus());
        response.put("submittedAt", record.getSubmittedAt());

        citizenLocalJpaRepository.findById(record.getCitizenId()).ifPresent(c -> {
            response.put("fullName", c.getFullName());
            response.put("cccdNumber", c.getCccdNumber());
        });

        // Nested taxDeclaration object (3NF compliance)
        var declOpt = record.getTaxDeclaration() != null
                ? java.util.Optional.of(record.getTaxDeclaration())
                : taxDeclarationRepository.findByRecordId(record.getRecordId());
        if (declOpt.isPresent()) {
            var decl = declOpt.get();
            Map<String, Object> taxDecl = new LinkedHashMap<>();
            taxDecl.put("id", decl.getDeclarationId());
            taxDecl.put("declaredArea", decl.getDeclaredArea());
            taxDecl.put("declaredUsage", decl.getDeclaredUsage());
            taxDecl.put("declaredPurpose", decl.getDeclaredUsage());
            taxDecl.put("reviewNote", decl.getDeclarationNotes());
            response.put("taxDeclaration", taxDecl);
        } else {
            response.put("taxDeclaration", null);
        }
                // Thông tin thanh toán thuế (tax_payments) theo record_id
                List<TaxPaymentEntity> payments =
                taxPaymentJpaRepository.findByRecordId(record.getRecordId());

        Map<String, Object> paymentSummary = new LinkedHashMap<>();
        if (!payments.isEmpty()) {
            TaxPaymentEntity p = payments.get(0); // hóa đơn mới nhất / duy nhất
            paymentSummary.put("payId", p.getPayId());
            paymentSummary.put("totalAmountDue", p.getTotalAmountDue());
            paymentSummary.put("taxYear", p.getTaxYear());
            paymentSummary.put("paymentStatus", p.getPaymentStatus());
            paymentSummary.put("dueDate", p.getDueDate());
            paymentSummary.put("transactionCode", p.getTransactionCode());
            paymentSummary.put("paidAt", p.getPaidAt());
        }
        response.put("payment", paymentSummary.isEmpty() ? null : paymentSummary);
        // Alias để FE đọc nhanh không cần nested
        if (!payments.isEmpty()) {
            response.put("totalAmountDue", payments.get(0).getTotalAmountDue());
            response.put("paymentStatus", payments.get(0).getPaymentStatus());
        }
        return response;
    }
}
