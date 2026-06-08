package com.thanglong.landtax.infrastructure.adapter.controller;

import com.thanglong.landtax.usecase.dto.CadastralReportStatsDTO;
import com.thanglong.landtax.usecase.dto.DossierStatusReportDTO;
import com.thanglong.landtax.usecase.dto.RevenueReportDTO;
import com.thanglong.landtax.usecase.service.CadastralReportExportService;
import com.thanglong.landtax.usecase.service.CadastralReportService;
import com.thanglong.landtax.usecase.service.ReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Slf4j
public class ReportController {

    private final ReportService reportService;
    private final CadastralReportService cadastralReportService;
    private final CadastralReportExportService cadastralReportExportService;

    /**
     * GET /api/reports/revenue - Báo cáo tổng doanh thu theo tháng của năm.
     */
    @GetMapping("/revenue")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_TAX_OFFICER', 'ROLE_LAND_OFFICER')")
    public ResponseEntity<List<RevenueReportDTO>> getRevenueReport(
            @RequestParam(defaultValue = "2026") Integer year) {
        log.info("GET /api/reports/revenue called for year {}", year);
        return ResponseEntity.ok(reportService.getRevenueReport(year));
    }

    /**
     * GET /api/reports/dossier-status - Báo cáo số lượng hồ sơ theo từng trạng thái.
     */
    @GetMapping("/dossier-status")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_TAX_OFFICER', 'ROLE_LAND_OFFICER')")
    public ResponseEntity<List<DossierStatusReportDTO>> getDossierStatusReport() {
        log.info("GET /api/reports/dossier-status called");
        return ResponseEntity.ok(reportService.getDossierStatusReport());
    }

    /**
     * GET /api/reports/cadastral-statistics - Thống kê báo cáo địa chính (hồ sơ + khu vực).
     */
    @GetMapping("/cadastral-statistics")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_LAND_OFFICER')")
    public ResponseEntity<CadastralReportStatsDTO> getCadastralStatistics(
            @RequestParam(defaultValue = "thisMonth") String period,
            @RequestParam(defaultValue = "all") String area,
            @RequestParam(defaultValue = "all") String reportType) {
        log.info("GET /api/reports/cadastral-statistics period={} area={} reportType={}", period, area, reportType);
        return ResponseEntity.ok(cadastralReportService.getCadastralStatistics(period, area, reportType));
    }

    /**
     * GET /api/reports/cadastral/export - Xuất báo cáo địa chính ra Excel.
     */
    @GetMapping("/cadastral/export")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_LAND_OFFICER')")
    public ResponseEntity<byte[]> exportCadastralReport(
            @RequestParam(required = false) String reportName,
            @RequestParam(defaultValue = "thisMonth") String period,
            @RequestParam(defaultValue = "all") String area,
            @RequestParam(defaultValue = "all") String reportType) {
        try {
            byte[] excelBytes = cadastralReportExportService.exportToExcel(period, area, reportType, reportName);
            String filename = cadastralReportExportService.buildFilename(reportName);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            headers.setContentDispositionFormData("attachment", filename);
            headers.setContentLength(excelBytes.length);

            return ResponseEntity.ok().headers(headers).body(excelBytes);
        } catch (Exception e) {
            log.error("Loi xuat bao cao dia chinh: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
