package com.thanglong.landtax.infrastructure.adapter.controller;

import com.thanglong.landtax.usecase.dto.ReviewDeclarationRequest;
import com.thanglong.landtax.usecase.dto.TaxDeclarationRequest;
import com.thanglong.landtax.usecase.dto.TaxDeclarationResponse;
import com.thanglong.landtax.usecase.service.ApproveDeclarationUseCase;
import com.thanglong.landtax.usecase.service.ReceiveTaxRecordUseCase;
import com.thanglong.landtax.usecase.service.RejectDeclarationUseCase;
import com.thanglong.landtax.usecase.service.SubmitDeclarationUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.Map;

/**
 * REST Controller cho quan ly thua dat.
 *
 * <p>
 * <b>API Endpoints:</b>
 * </p>
 * <ul>
 * <li>POST /api/tax/declarations - Nop to khai (Citizen)</li>
 * <li>PUT /api/tax/declarations/{id}/approve - Duyet to khai
 * (TAX_OFFICER/ADMIN)</li>
 * <li>PUT /api/tax/declarations/{id}/reject - Tu choi to khai
 * (TAX_OFFICER/ADMIN)</li>
 * </ul>
 */
@RestController
@RequestMapping("/api/tax")
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings("null")
public class TaxController {

    private final SubmitDeclarationUseCase submitDeclarationUseCase;
    private final ApproveDeclarationUseCase approveDeclarationUseCase;
    private final ReceiveTaxRecordUseCase receiveTaxRecordUseCase;
    private final RejectDeclarationUseCase rejectDeclarationUseCase;
    private final com.thanglong.landtax.usecase.service.TaxDeclarationService taxDeclarationService;
    private final com.thanglong.landtax.infrastructure.adapter.persistence.jpa.RecordJpaRepository recordJpaRepository;
    private final com.thanglong.landtax.usecase.service.AuditLogService auditLogService;

    private final com.thanglong.landtax.usecase.service.TaxRecordQueryService taxRecordQueryService;
    private final com.thanglong.landtax.usecase.service.TaxOfficerNotificationService taxOfficerNotificationService;
    /**
     * Nop to khai thua dat.
     * JWT token trong Header Authorization a JwtFilter giai mA a cccd_number
     * a citizen_id.
     */
    @Operation(summary = "Nop to khai thua dat", description = "Nguoi dan nop to khai thua dat moi")
    @ApiResponse(responseCode = "200", description = "Nop to khai th nh cAng")
    @PostMapping("/declarations")
    @PreAuthorize("hasAnyRole('CITIZEN', 'ADMIN')")
    public ResponseEntity<TaxDeclarationResponse> submitDeclaration(
            @Valid @RequestBody TaxDeclarationRequest request) {
        log.info("User: {}, Authorities: {}", SecurityContextHolder.getContext().getAuthentication().getName(),
                SecurityContextHolder.getContext().getAuthentication().getAuthorities());
        TaxDeclarationResponse response = submitDeclarationUseCase.submitDeclaration(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Lay danh sach ho so thua dA duoc ia chAnh xac nhan
     * (VERIFIED).
     */
    @Operation(summary = "Danh sach ho so cho duyet", description = "Lay danh sach cac ho so dA duoc xac nhan (VERIFIED)")
    @GetMapping("/records/verified")
    @PreAuthorize("hasAnyRole('TAX_OFFICER', 'LAND_OFFICER', 'ADMIN')")
    public ResponseEntity<List<com.thanglong.landtax.usecase.dto.TaxRecordSummaryResponse>> getVerifiedRecords() {
        log.info("TAX_OFFICER lay danh sach ho so VERIFIED");
        return ResponseEntity.ok(
                taxRecordQueryService.getTaxRecordsForOfficer(List.of("VERIFIED", "PROCESSING"))
        );
    }

    /**
     * Duyet to khai thua dat.
     * Cho TAX_OFFICER moi co quyon.
     *
     * @param id      record_id trong bang records
     * @param request Ghi chu coa can bo (tAy chon)
     */
    /**
     * Cán bộ thuế tiếp nhận hồ sơ sau khi địa chính xác minh (VERIFIED → PROCESSING).
     */
    @Operation(summary = "Tiep nhan ho so thue", description = "Can bo thue tiep nhan ho so da VERIFIED")
    @PutMapping("/records/{id}/receive")
    @PreAuthorize("hasAnyRole('TAX_OFFICER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> receiveTaxRecord(@PathVariable Integer id) {
        log.info("PUT /api/tax/records/{}/receive", id);
        return ResponseEntity.ok(receiveTaxRecordUseCase.receiveTaxRecord(id));
    }

    @Operation(summary = "Duyet to khai thua dat", description = "Can bo thua duyet ho so PROCESSING")
    @ApiResponse(responseCode = "200", description = "Duyet ho so th nh cAng")
    @PutMapping("/records/{id}/approve")
    @PreAuthorize("hasAnyRole('TAX_OFFICER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> approveRecord(
            @PathVariable Integer id,
            @RequestBody(required = false) ReviewDeclarationRequest request) {
        Map<String, Object> result = approveDeclarationUseCase.approveDeclaration(id, request);
        return ResponseEntity.ok(result);
    }

    /**
     * Tu choi to khai thua dat.
     * Cho TAX_OFFICER moi co quyon.
     *
     * @param id      record_id trong bang records
     * @param request Ly do tu choi (bat buoc)
     */
    @Operation(summary = "Tu choi to khai thua dat", description = "Can bo thua tu choi ho so")
    @ApiResponse(responseCode = "200", description = "Tu choi ho so th nh cAng")
    @PutMapping("/records/{id}/verify")
    @PreAuthorize("hasRole('TAX_OFFICER')")
    public ResponseEntity<Map<String, Object>> rejectRecord(
            @PathVariable Integer id,
            @RequestBody ReviewDeclarationRequest request) {
        Map<String, Object> result = rejectDeclarationUseCase.rejectDeclaration(id, request);
        return ResponseEntity.ok(result);
    }

    /**
     * Xem lich so to khai thua dat.
     * D nh cho cAng dan tra cou to khai coa chAnh minh.
     */
    @Operation(summary = "Xem lich so to khai", description = "Nguoi dan xem lich so cac to khai dA nop")
    @ApiResponse(responseCode = "200", description = "Lay lich su thanh cong")
    @GetMapping({"/declarations/my-history", "/declarations/history"})
    @PreAuthorize("hasRole('CITIZEN')")
    public ResponseEntity<List<TaxDeclarationResponse>> getMyHistory() {
        String cccd = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication()
                .getName();
        List<TaxDeclarationResponse> history = taxDeclarationService.getMyHistory(cccd);
        return ResponseEntity.ok(history);
    }

    /**
     * Lay chi tiat mot to khai thua.
     * Cho cho phAp nguoi dan xem to khai coa chAnh minh.
     */
    @Operation(summary = "Xem chi tiat to khai", description = "Nguoi dan xem chi tiat to khai dA nop")
    @ApiResponse(responseCode = "200", description = "Lay chi tiat th nh cAng")
    @GetMapping("/declarations/{id}")
    @PreAuthorize("hasRole('CITIZEN')")
    public ResponseEntity<TaxDeclarationResponse> getDeclarationById(@PathVariable Integer id) {
        String cccd = SecurityContextHolder.getContext().getAuthentication().getName();
        TaxDeclarationResponse response = taxDeclarationService.getDeclarationById(id, cccd);
        return ResponseEntity.ok(response);
    }

    /**
     * Hoy to khai thua dat.
     * Cho cho phAp hoy nau trang thai l  PENDING.
     */
    @Operation(summary = "Hoy to khai", description = "Nguoi dan hoy to khai dang o trang thai PENDING")
    @ApiResponse(responseCode = "200", description = "Hoy to khai th nh cAng")
    @DeleteMapping("/declarations/{id}/cancel")
    public ResponseEntity<?> cancelDeclaration(@PathVariable Integer id) {
        String cccd = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication()
                .getName();
        taxDeclarationService.cancelDeclaration(id, cccd);
        return ResponseEntity.ok(Map.of("message", "Hoy to khai th nh cAng"));
    }

    /**
     * Lay danh sach hoa don thua chua thanh toan.
     * D nh cho cAng dan xem cac khoan can nop tion.
     */
    @Operation(summary = "Xem hoa don chua thanh toan", description = "Nguoi dan xem cac hoa don thua can nop")
    @ApiResponse(responseCode = "200", description = "Lay danh sach hoa don th nh cAng")
    @GetMapping("/bills/unpaid")
    public ResponseEntity<List<?>> getUnpaidBills() {
        return ResponseEntity.ok(List.of());
    }

    /**
     * Lay danh sach hoa don thua A thanh toan.
     * D nh cho cAng dan xem lich so nop tion.
     */
    @Operation(summary = "Xem ho so / hoa don dang cho xu ly", description = "Lay danh sach ho so thue dang cho xu ly (PENDING)")
    @ApiResponse(responseCode = "200", description = "Lay danh sach thanh cong")
    @GetMapping("/records/pending")
    @PreAuthorize("hasAnyRole('CITIZEN', 'ADMIN', 'TAX_OFFICER')")
    public ResponseEntity<List<?>> getPaidBills() {
        return ResponseEntity.ok(List.of());
    }

    /**
     * Cap nhat thAng tin to khai trong qua trinh kiem duyet (d nh cho
     * Can bo thua).
     * Cho TAX_OFFICER/ADMIN moi co quyon soa thAng tin nho trong to
     * khai.
     */
    @PutMapping("/declarations/{id}/update-info")
    @PreAuthorize("hasAnyRole('ADMIN', 'TAX_OFFICER')")
    @com.thanglong.landtax.infrastructure.config.aop.AuditLog(action = "Cap nhat thAng tin to khai")
    public ResponseEntity<?> updateDeclarationInfo(
            @PathVariable Integer id,
            @RequestBody Map<String, Object> updates) {

        com.thanglong.landtax.infrastructure.adapter.persistence.entity.TaxDeclarationEntity entity = taxDeclarationService
                .getRepository().findById(id)
                .orElseThrow(() -> new RuntimeException("KhAng tim thay to khai"));

        // Cho cho phAp soa cac truong an to n khi dang kiem duyet
        if (updates.containsKey("declaredUsage")) {
            entity.setDeclaredUsage((String) updates.get("declaredUsage"));
        }
        if (updates.containsKey("declarationNotes")) {
            entity.setDeclarationNotes((String) updates.get("declarationNotes"));
        }

        taxDeclarationService.getRepository().save(entity);
        return ResponseEntity.ok(Map.of("message", "Cap nhat thAng tin to khai th nh cAng", "id", id));
    }

    /**
     * Xem to n bo hoa don thua.
     */
    @Operation(summary = "Danh sach hoa don", description = "Can bo thua xem danh sach tat ca hoa don")
    @GetMapping("/history")
    @PreAuthorize("hasRole('TAX_OFFICER')")
    public ResponseEntity<List<?>> getAllBills() {
        return ResponseEntity.ok(List.of());
    }

    /**
     * Xuat du lieu ho so thua.
     */
    @Operation(summary = "Xuat du lieu", description = "Can bo thua xuat du lieu ra file CSV")
    @GetMapping(value = "/export/data", produces = MediaType.APPLICATION_OCTET_STREAM_VALUE)
    @PreAuthorize("hasRole('TAX_OFFICER')")
    public ResponseEntity<byte[]> exportData() {
        String cccd = SecurityContextHolder.getContext().getAuthentication().getName();
        log.info("Can bo thua {} dang xuat du lieu ho so thua", cccd);

        StringBuilder csvContent = new StringBuilder();
        csvContent.append("ID,CCCD,Trang thai,Thoi gian nop\n");

        List<com.thanglong.landtax.infrastructure.adapter.persistence.entity.RecordEntity> records = recordJpaRepository
                .findAll();
        for (com.thanglong.landtax.infrastructure.adapter.persistence.entity.RecordEntity r : records) {
            csvContent.append(r.getRecordId()).append(",")
                    .append(r.getCitizenId()).append(",")
                    .append(r.getCurrentStatus()).append(",")
                    .append(r.getSubmittedAt()).append("\n");
        }

        auditLogService.log("EXPORT_DATA", "RECORDS", "ALL",
                "Can bo thua " + cccd + " dA thoc hien xuat du lieu ho so thua");

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"tax_records_export.csv\"")
                .body(csvContent.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8));
    }
    /**
     * GET /api/tax/officer-notifications - Thông báo việc mới cho cán bộ thuế.
     */
    @GetMapping("/officer-notifications")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_TAX_OFFICER')")
    public ResponseEntity<List<com.thanglong.landtax.usecase.dto.OfficerNotificationDTO>> getTaxOfficerNotifications() {
        log.info("GET /api/tax/officer-notifications");
        return ResponseEntity.ok(taxOfficerNotificationService.getTaxOfficerNotifications());
    }

    /**
     * GET /api/tax/pending-workload - Số tờ khai/khiếu nại chờ xử lý (badge menu cán bộ thuế).
     */
    @GetMapping("/pending-workload")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_TAX_OFFICER')")
    public ResponseEntity<Map<String, Long>> getTaxPendingWorkload() {
        return ResponseEntity.ok(Map.of(
                "pendingTaxRecords", taxOfficerNotificationService.countPendingTaxRecords(),
                "pendingComplaints", taxOfficerNotificationService.countPendingTaxComplaints()));
    }

    @GetMapping("/records")
    @PreAuthorize("hasAnyRole('TAX_OFFICER', 'LAND_OFFICER', 'ADMIN')")
    public ResponseEntity<List<com.thanglong.landtax.usecase.dto.TaxRecordSummaryResponse>> getTaxRecords() {
        log.info("Lay danh sach ho so thue cho can bo");
        List<String> statuses = List.of(
                "SUBMITTED",
                "PENDING",
                "VERIFIED",
                "PROCESSING",
                "APPROVED",
                "FRAUD_SUSPECTED",
                "REJECTED",
                "CANCELLED",
                "COMPLETED"
        );
        return ResponseEntity.ok(taxRecordQueryService.getTaxRecordsForOfficer(statuses));
    }

    @PutMapping("/records/{id}")
    @PreAuthorize("hasAnyRole('TAX_OFFICER', 'ADMIN')")
    @com.thanglong.landtax.infrastructure.config.aop.AuditLog(action = "Cập nhật hồ sơ thuế")
    public ResponseEntity<?> updateTaxRecord(
            @PathVariable Integer id,
            @RequestBody com.thanglong.landtax.usecase.dto.TaxRecordSummaryResponse updates) {
        log.info("Cán bộ thuế cập nhật hồ sơ thuế, id: {}", id);
        taxRecordQueryService.updateTaxRecord(id, updates);
        return ResponseEntity.ok(Map.of("message", "Cập nhật hồ sơ thuế thành công", "id", id));
    }
}
