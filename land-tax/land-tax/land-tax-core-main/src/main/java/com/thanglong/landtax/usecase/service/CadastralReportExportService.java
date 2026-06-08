package com.thanglong.landtax.usecase.service;

import com.thanglong.landtax.usecase.dto.CadastralAreaStatDTO;
import com.thanglong.landtax.usecase.dto.CadastralDetailItemDTO;
import com.thanglong.landtax.usecase.dto.CadastralReportStatsDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class CadastralReportExportService {

    private static final Map<String, String> STATUS_LABELS = Map.ofEntries(
            Map.entry("SUBMITTED", "Đã nộp"),
            Map.entry("PENDING", "Chờ xử lý"),
            Map.entry("PROCESSING", "Đang xử lý"),
            Map.entry("VERIFIED", "Đã xác minh"),
            Map.entry("APPROVED", "Đã giải quyết"),
            Map.entry("COMPLETED", "Đã hoàn thành"),
            Map.entry("REJECTED", "Từ chối"),
            Map.entry("CANCELLED", "Đã hủy"),
            Map.entry("NEED_MORE_DOCS", "Bổ sung hồ sơ"),
            Map.entry("RESOLVED", "Đã giải quyết")
    );

    private static final Map<String, String> REPORT_TYPE_LABELS = Map.of(
            "all", "Báo cáo tổng hợp",
            "gcn", "Báo cáo cấp GCN",
            "complaint", "Báo cáo khiếu nại"
    );

    private static final Map<String, String> PERIOD_LABELS = Map.of(
            "thisMonth", "Tháng này",
            "thisQuarter", "Quý này",
            "thisYear", "Năm nay",
            "all", "Toàn bộ thời gian"
    );

    private final CadastralReportService cadastralReportService;

    public byte[] exportToExcel(String period, String area, String reportType, String reportName) throws Exception {
        CadastralReportStatsDTO stats = cadastralReportService.getCadastralStatistics(period, area, reportType);
        String title = (reportName != null && !reportName.isBlank())
                ? reportName.trim()
                : "Báo cáo thống kê địa chính";

        try (Workbook workbook = new XSSFWorkbook()) {
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle titleStyle = createTitleStyle(workbook);

            writeSummarySheet(workbook, titleStyle, headerStyle, title, period, area, reportType, stats);
            writeAreaSheet(workbook, headerStyle, stats.getAreaStats());
            writeDetailSheet(workbook, headerStyle, stats.getDetails());

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            return out.toByteArray();
        }
    }

    public String buildFilename(String reportName) {
        if (reportName == null || reportName.isBlank()) {
            return "bao-cao-dia-chinh-" + LocalDate.now() + ".xlsx";
        }
        String safe = reportName.trim()
                .replaceAll("[\\\\/:*?\"<>|]", "")
                .replaceAll("\\s+", "_");
        if (!safe.toLowerCase().endsWith(".xlsx")) {
            safe = safe + ".xlsx";
        }
        return safe;
    }

    private void writeSummarySheet(
            Workbook workbook,
            CellStyle titleStyle,
            CellStyle headerStyle,
            String title,
            String period,
            String area,
            String reportType,
            CadastralReportStatsDTO stats) {
        Sheet sheet = workbook.createSheet("Tổng hợp");
        int rowIdx = 0;

        Row titleRow = sheet.createRow(rowIdx++);
        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue(title);
        titleCell.setCellStyle(titleStyle);

        rowIdx++;
        createLabelValueRow(sheet, rowIdx++, "Loại báo cáo", REPORT_TYPE_LABELS.getOrDefault(reportType, reportType));
        createLabelValueRow(sheet, rowIdx++, "Kỳ báo cáo", PERIOD_LABELS.getOrDefault(period, period));
        createLabelValueRow(sheet, rowIdx++, "Khu vực", "all".equalsIgnoreCase(area) ? "Toàn huyện" : area);
        createLabelValueRow(sheet, rowIdx++, "Ngày xuất", LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));

        rowIdx++;
        createKpiRow(sheet, rowIdx++, "Tổng tiếp nhận", stats.getTotalReceived());
        createKpiRow(sheet, rowIdx++, "Đã giải quyết", stats.getTotalResolved());
        createKpiRow(sheet, rowIdx++, "Đang xử lý", stats.getTotalProcessing());
        createKpiRow(sheet, rowIdx++, "Hồ sơ trễ hạn", stats.getTotalOverdue());

        sheet.autoSizeColumn(0);
        sheet.autoSizeColumn(1);
    }

    private void writeAreaSheet(Workbook workbook, CellStyle headerStyle, List<CadastralAreaStatDTO> areaStats) {
        Sheet sheet = workbook.createSheet("Theo đơn vị");
        int rowIdx = 0;

        Row header = sheet.createRow(rowIdx++);
        String[] columns = {"Đơn vị", "Tổng", "Đã giải quyết", "Đang xử lý", "Tỷ lệ (%)"};
        for (int i = 0; i < columns.length; i++) {
            Cell cell = header.createCell(i);
            cell.setCellValue(columns[i]);
            cell.setCellStyle(headerStyle);
        }

        if (areaStats != null) {
            for (CadastralAreaStatDTO row : areaStats) {
                Row dataRow = sheet.createRow(rowIdx++);
                dataRow.createCell(0).setCellValue(row.getUnit());
                dataRow.createCell(1).setCellValue(row.getTotal());
                dataRow.createCell(2).setCellValue(row.getResolved());
                dataRow.createCell(3).setCellValue(row.getPending());
                dataRow.createCell(4).setCellValue(row.getRate());
            }
        }

        for (int i = 0; i < columns.length; i++) {
            sheet.autoSizeColumn(i);
        }
    }

    private void writeDetailSheet(Workbook workbook, CellStyle headerStyle, List<CadastralDetailItemDTO> details) {
        Sheet sheet = workbook.createSheet("Chi tiết");
        int rowIdx = 0;

        Row header = sheet.createRow(rowIdx++);
        String[] columns = {"Mã", "Loại", "Nội dung", "Đơn vị", "Ngày tiếp nhận", "Trạng thái"};
        for (int i = 0; i < columns.length; i++) {
            Cell cell = header.createCell(i);
            cell.setCellValue(columns[i]);
            cell.setCellStyle(headerStyle);
        }

        if (details != null) {
            DateTimeFormatter dtf = DateTimeFormatter.ofPattern("dd/MM/yyyy");
            for (CadastralDetailItemDTO item : details) {
                Row dataRow = sheet.createRow(rowIdx++);
                dataRow.createCell(0).setCellValue(item.getCode());
                dataRow.createCell(1).setCellValue("COMPLAINT".equals(item.getItemType()) ? "Khiếu nại" : "Hồ sơ");
                dataRow.createCell(2).setCellValue(item.getCategory());
                dataRow.createCell(3).setCellValue(item.getUnit());
                dataRow.createCell(4).setCellValue(
                        item.getSubmittedAt() != null ? item.getSubmittedAt().format(dtf) : "");
                String statusLabel = STATUS_LABELS.getOrDefault(item.getStatus(), item.getStatus());
                if (item.isOverdue()) {
                    statusLabel = statusLabel + " (Trễ hạn)";
                }
                dataRow.createCell(5).setCellValue(statusLabel);
            }
        }

        for (int i = 0; i < columns.length; i++) {
            sheet.autoSizeColumn(i);
        }
    }

    private void createLabelValueRow(Sheet sheet, int rowIdx, String label, String value) {
        Row row = sheet.createRow(rowIdx);
        row.createCell(0).setCellValue(label);
        row.createCell(1).setCellValue(value);
    }

    private void createKpiRow(Sheet sheet, int rowIdx, String label, long value) {
        Row row = sheet.createRow(rowIdx);
        row.createCell(0).setCellValue(label);
        row.createCell(1).setCellValue(value);
    }

    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle headerStyle = workbook.createCellStyle();
        Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerStyle.setFont(headerFont);
        return headerStyle;
    }

    private CellStyle createTitleStyle(Workbook workbook) {
        CellStyle titleStyle = workbook.createCellStyle();
        Font titleFont = workbook.createFont();
        titleFont.setBold(true);
        titleFont.setFontHeightInPoints((short) 14);
        titleStyle.setFont(titleFont);
        return titleStyle;
    }
}
