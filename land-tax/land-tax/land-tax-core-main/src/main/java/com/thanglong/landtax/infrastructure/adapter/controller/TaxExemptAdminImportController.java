package com.thanglong.landtax.infrastructure.adapter.controller;

import com.thanglong.landtax.usecase.service.TaxExemptImportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/exemptions")
@RequiredArgsConstructor
@Slf4j
public class TaxExemptAdminImportController {

    private final TaxExemptImportService taxExemptImportService;

    /**
     * Import danh sách đối tượng miễn/giảm thuế từ Excel.
     * FE hiện đang gọi: POST /api/admin/exemptions (multipart/form-data, field name = "file")
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> importTaxExemptions(@RequestParam("file") MultipartFile file) {
        String uploaderCccd = SecurityContextHolder.getContext().getAuthentication().getName();
        log.info("POST /api/admin/exemptions - uploader={}, originalName={}, size={}KB, contentType={}",
                uploaderCccd, file.getOriginalFilename(), file.getSize() / 1024, file.getContentType());

        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "File không được để trống"));
        }

        try {
            var result = taxExemptImportService.importFromExcel(file, uploaderCccd);
            return ResponseEntity.ok(Map.of(
                    "message", "Import danh sách miễn/giảm thuế thành công",
                    "imported", result.imported(),
                    "updated", result.updated(),
                    "errors", result.errors(),
                    "errorCount", result.errors() != null ? result.errors().size() : 0
            ));
        } catch (Exception e) {
            log.error("Import tax exemptions failed: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "message", "Lỗi xử lý file Excel: " + e.getMessage()
            ));
        }
    }
}

