package com.thanglong.landtax.usecase.service;

import com.thanglong.landtax.infrastructure.adapter.persistence.entity.AreaEntity;
import com.thanglong.landtax.infrastructure.adapter.persistence.entity.LandPriceEntity;
import com.thanglong.landtax.infrastructure.adapter.persistence.entity.LandTypeEntity;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.AreaJpaRepository;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.LandPriceJpaRepository;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.LandTypeJpaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Xuất bảng giá đất ra file Excel (.xlsx).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class LandPriceExportService {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final LandPriceJpaRepository landPriceJpaRepository;
    private final LandTypeJpaRepository landTypeJpaRepository;
    private final AreaJpaRepository areaJpaRepository;

    public byte[] exportToExcel(String keyword) throws Exception {
        log.info("Exporting land prices Excel, keyword={}", keyword);

        Map<Integer, LandTypeEntity> landTypeMap = landTypeJpaRepository.findAll().stream()
                .collect(Collectors.toMap(LandTypeEntity::getLandTypeId, lt -> lt, (a, b) -> a));
        Map<Integer, AreaEntity> areaMap = areaJpaRepository.findAll().stream()
                .collect(Collectors.toMap(AreaEntity::getAreaId, a -> a, (a, b) -> a));

        String q = keyword != null ? keyword.trim().toLowerCase() : "";
        List<LandPriceEntity> prices = landPriceJpaRepository.findAll().stream()
                .filter(p -> q.isEmpty() || matchesKeyword(p, q, landTypeMap, areaMap))
                .sorted((a, b) -> {
                    int cmp = Integer.compare(a.getAreaId(), b.getAreaId());
                    if (cmp != 0) return cmp;
                    return Integer.compare(a.getLandTypeId(), b.getLandTypeId());
                })
                .toList();

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Bang gia dat");

            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.LIGHT_CORNFLOWER_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            String[] headers = {
                    "Ma gia",
                    "Loai dat",
                    "Ma loai dat",
                    "Khu vuc",
                    "Vi tri",
                    "Phuong/Xa",
                    "Quan/Huyen",
                    "Muc gia (VND/m2)",
                    "Ap dung tu"
            };
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowIdx = 1;
            for (LandPriceEntity price : prices) {
                LandTypeEntity landType = landTypeMap.get(price.getLandTypeId());
                AreaEntity area = areaMap.get(price.getAreaId());

                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue("GD-" + price.getPriceId());
                row.createCell(1).setCellValue(landType != null ? landType.getTypeName() : "Loai " + price.getLandTypeId());
                row.createCell(2).setCellValue(landType != null ? landType.getTypeCode() : "");
                row.createCell(3).setCellValue(area != null ? area.getStreetName() : "Khu " + price.getAreaId());
                if (area != null) {
                    row.createCell(4).setCellValue(area.getPositionLevel());
                } else {
                    row.createCell(4).setCellValue("");
                }
                row.createCell(5).setCellValue(area != null ? area.getWardCode() : "");
                row.createCell(6).setCellValue(area != null ? area.getDistrictCode() : "");
                row.createCell(7).setCellValue(price.getUnitPrice() != null ? price.getUnitPrice().doubleValue() : 0);
                row.createCell(8).setCellValue(
                        price.getAppliedFrom() != null ? price.getAppliedFrom().format(DATE_FMT) : "");
            }

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            log.info("Exported {} land price rows", prices.size());
            return out.toByteArray();
        }
    }

    private boolean matchesKeyword(
            LandPriceEntity price,
            String q,
            Map<Integer, LandTypeEntity> landTypeMap,
            Map<Integer, AreaEntity> areaMap) {
        LandTypeEntity landType = landTypeMap.get(price.getLandTypeId());
        AreaEntity area = areaMap.get(price.getAreaId());

        String haystack = String.join(" ",
                "gd-" + price.getPriceId(),
                landType != null ? landType.getTypeName() : "",
                landType != null ? landType.getTypeCode() : "",
                area != null ? area.getStreetName() : "",
                area != null ? String.valueOf(area.getPositionLevel()) : "",
                area != null ? area.getWardCode() : "",
                area != null ? area.getDistrictCode() : "",
                price.getUnitPrice() != null ? price.getUnitPrice().toPlainString() : "",
                price.getAppliedFrom() != null ? price.getAppliedFrom().toString() : ""
        ).toLowerCase();

        return haystack.contains(q);
    }
}
