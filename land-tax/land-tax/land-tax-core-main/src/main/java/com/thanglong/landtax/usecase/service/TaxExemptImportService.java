package com.thanglong.landtax.usecase.service;

import com.thanglong.landtax.infrastructure.adapter.persistence.entity.TaxExemptSubjectEntity;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.AccountJpaRepository;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.CitizenLocalJpaRepository;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.TaxExemptSubjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedInputStream;
import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.math.BigDecimal;
import java.text.Normalizer;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

/**
 * Import danh sách đối tượng miễn/giảm thuế từ Excel (.xlsx).
 * Hỗ trợ file mẫu: CCCD | Họ và tên | Lý do miễn giảm | Tỷ lệ giảm (%) | Năm áp dụng | Trạng thái
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TaxExemptImportService {

    private final TaxExemptSubjectRepository taxExemptSubjectRepository;
    private final CitizenLocalJpaRepository citizenLocalJpaRepository;
    private final AccountJpaRepository accountJpaRepository;

    private final DataFormatter dataFormatter = new DataFormatter(Locale.US);

    public ImportResult importFromExcel(MultipartFile file, String uploaderCccd) throws Exception {
        log.info("TaxExempt import: uploader={}, file={}", uploaderCccd, file.getOriginalFilename());

        Integer uploaderAccountId = resolveUploaderAccountId(uploaderCccd).orElse(null);
        if (uploaderAccountId == null) {
            log.warn("Uploader account not found for CCCD={}, uploaded_by_account will be null", uploaderCccd);
        }

        int imported = 0;
        int updated = 0;
        List<String> errors = new ArrayList<>();

        byte[] bytes = file.getBytes();
        try (InputStream rawStream = new BufferedInputStream(new ByteArrayInputStream(bytes));
             Workbook workbook = new XSSFWorkbook(rawStream)) {

            Sheet sheet = workbook.getSheetAt(0);
            if (sheet == null) {
                return new ImportResult(0, 0, List.of("Sheet rỗng hoặc không đọc được"));
            }

            Map<String, Integer> headerIndex = tryBuildHeaderIndex(sheet);
            boolean hasHeader = !headerIndex.isEmpty();
            boolean useCccd = hasHeader ? headerIndex.containsKey("cccd") : true;

            for (Row row : sheet) {
                if (row == null) continue;
                if (hasHeader && row.getRowNum() == 0) continue;
                if (isRowEmpty(row)) continue;

                int displayRow = row.getRowNum() + 1;
                try {
                    Integer citizenId = resolveCitizenId(row, headerIndex, useCccd, displayRow, errors);
                    if (citizenId == null) continue;

                    String fullName = getString(row, headerIndex, "full_name", 1);
                    String reason = getString(row, headerIndex, "exemption_reason", 2);
                    BigDecimal discountRate = getDecimal(row, headerIndex, "discount_rate", 3);
                    Integer appliedYear = getInt(row, headerIndex, "applied_year", 4);
                    String status = parseStatus(getString(row, headerIndex, "status", 5));

                    if (appliedYear == null) {
                        errors.add("Dòng " + displayRow + ": thiếu năm áp dụng");
                        continue;
                    }
                    if (discountRate == null) {
                        errors.add("Dòng " + displayRow + ": thiếu tỷ lệ giảm (%)");
                        continue;
                    }

                    if (fullName == null || fullName.isBlank()) {
                        fullName = citizenLocalJpaRepository.findById(citizenId)
                                .map(c -> c.getFullName())
                                .orElse("—");
                    }

                    var existingList = taxExemptSubjectRepository
                            .findAllByCitizenIdAndAppliedYearOrderByExemptIdDesc(citizenId, appliedYear);

                    if (!existingList.isEmpty()) {
                        TaxExemptSubjectEntity entity = existingList.get(0);
                        entity.setFullName(fullName);
                        entity.setExemptionReason(reason);
                        entity.setDiscountRate(discountRate);
                        entity.setStatus(status);
                        entity.setUploadedByAccount(uploaderAccountId);
                        entity.setUploadedAt(LocalDateTime.now());
                        taxExemptSubjectRepository.save(entity);
                        if (existingList.size() > 1) {
                            taxExemptSubjectRepository.deleteAll(existingList.subList(1, existingList.size()));
                            log.info("Removed {} duplicate tax_exempt for citizenId={}, year={}",
                                    existingList.size() - 1, citizenId, appliedYear);
                        }
                        updated++;
                    } else {
                        taxExemptSubjectRepository.save(TaxExemptSubjectEntity.builder()
                                .citizenId(citizenId)
                                .uploadedByAccount(uploaderAccountId)
                                .fullName(fullName)
                                .exemptionReason(reason)
                                .discountRate(discountRate)
                                .appliedYear(appliedYear)
                                .status(status)
                                .uploadedAt(LocalDateTime.now())
                                .build());
                        imported++;
                    }
                } catch (Exception e) {
                    errors.add("Dòng " + displayRow + ": " + e.getMessage());
                    log.warn("TaxExempt row {} error: {}", displayRow, e.getMessage());
                }
            }
        }

        log.info("TaxExempt import done: imported={}, updated={}, errors={}", imported, updated, errors.size());
        return new ImportResult(imported, updated, errors);
    }

    private Integer resolveCitizenId(Row row, Map<String, Integer> headerIndex, boolean useCccd,
                                     int displayRow, List<String> errors) {
        if (useCccd) {
            String cccd = getCccdString(row, headerIndex, 0);
            if (cccd == null || cccd.isBlank()) {
                errors.add("Dòng " + displayRow + ": thiếu CCCD");
                return null;
            }
            var citizen = citizenLocalJpaRepository.findFirstByCccdNumberOrderByCitizenIdDesc(cccd);
            if (citizen.isEmpty()) {
                errors.add("Dòng " + displayRow + ": CCCD " + cccd + " chưa có trong hệ thống");
                return null;
            }
            return citizen.get().getCitizenId();
        }

        Integer citizenId = getInt(row, headerIndex, "citizen_id", 0);
        if (citizenId == null) {
            errors.add("Dòng " + displayRow + ": thiếu citizen_id");
            return null;
        }
        if (!citizenLocalJpaRepository.existsById(citizenId)) {
            errors.add("Dòng " + displayRow + ": citizen_id " + citizenId + " không tồn tại");
            return null;
        }
        return citizenId;
    }

    private Optional<Integer> resolveUploaderAccountId(String uploaderCccd) {
        if (uploaderCccd == null || uploaderCccd.isBlank()) return Optional.empty();
        return citizenLocalJpaRepository.findFirstByCccdNumberOrderByCitizenIdDesc(uploaderCccd)
                .flatMap(c -> accountJpaRepository.findFirstByCitizenIdOrderByAccountIdDesc(c.getCitizenId()))
                .map(a -> a.getAccountId());
    }

    private Map<String, Integer> tryBuildHeaderIndex(Sheet sheet) {
        Map<String, Integer> index = new HashMap<>();
        Row header = sheet.getRow(0);
        if (header == null) return index;

        for (Cell cell : header) {
            if (cell == null) continue;
            String raw = dataFormatter.formatCellValue(cell);
            if (raw == null || raw.isBlank()) continue;
            String key = normalizeHeader(raw);
            if (!key.isBlank()) index.putIfAbsent(key, cell.getColumnIndex());
        }

        boolean hasIdentity = index.containsKey("cccd") || index.containsKey("citizen_id");
        boolean hasData = index.containsKey("applied_year") || index.containsKey("discount_rate")
                || index.containsKey("full_name");
        return (hasIdentity && hasData) ? index : Map.of();
    }

    private String normalizeHeader(String s) {
        String noAccent = Normalizer.normalize(s.trim(), Normalizer.Form.NFD).replaceAll("\\p{M}", "");
        String simplified = noAccent.toLowerCase(Locale.ROOT)
                .replace('đ', 'd').replace('Đ', 'd')
                .replaceAll("[^a-z0-9_\\s-]", "")
                .replaceAll("[\\s-]+", "_")
                .replaceAll("_+", "_")
                .replaceAll("^_|_$", "");

        return switch (simplified) {
            case "cccd", "so_cccd", "cccd_number", "can_cuoc", "can_cuoc_cong_dan" -> "cccd";
            case "citizenid", "citizen_id", "id_congdan", "id_cong_dan" -> "citizen_id";
            case "full_name", "fullname", "ho_ten", "hoten", "ho_va_ten" -> "full_name";
            case "exemption_reason", "reason", "ly_do", "ly_do_mien_giam", "mien_giam", "ly_do_mien_giam_thue" -> "exemption_reason";
            case "discount_rate", "discount", "ty_le", "ty_le_mien_giam", "ty_le_giam", "muc_mien_giam" -> "discount_rate";
            case "applied_year", "year", "nam", "nam_ap_dung" -> "applied_year";
            case "status", "trang_thai", "trangthai" -> "status";
            default -> simplified;
        };
    }

    private String parseStatus(String raw) {
        if (raw == null || raw.isBlank()) return "PENDING";
        String n = Normalizer.normalize(raw.trim(), Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "").toUpperCase(Locale.ROOT);
        if (n.contains("APPROVED") || n.contains("PHE DUYET") || n.contains("DA DUYET")) return "APPROVED";
        if (n.contains("REJECTED") || n.contains("TU CHOI")) return "REJECTED";
        return "PENDING";
    }

    private boolean isRowEmpty(Row row) {
        for (int i = 0; i <= 10; i++) {
            Cell c = row.getCell(i);
            if (c != null && c.getCellType() != CellType.BLANK) {
                String v = dataFormatter.formatCellValue(c);
                if (v != null && !v.isBlank()) return false;
            }
        }
        return true;
    }

    private String getCccdString(Row row, Map<String, Integer> headerIndex, int fallbackCol) {
        int col = headerIndex.getOrDefault("cccd", fallbackCol);
        Cell cell = row.getCell(col);
        if (cell == null) return null;
        String raw = dataFormatter.formatCellValue(cell).trim().replaceAll("\\.0$", "");
        if (raw.isEmpty()) return null;
        if (raw.matches("\\d+") && raw.length() < 12) {
            raw = String.format("%012d", Long.parseLong(raw));
        }
        return raw;
    }

    private String getString(Row row, Map<String, Integer> headerIndex, String key, int fallback) {
        int col = headerIndex.getOrDefault(key, fallback);
        Cell cell = row.getCell(col);
        if (cell == null) return null;
        String raw = dataFormatter.formatCellValue(cell);
        if (raw == null || raw.isBlank()) return null;
        return Normalizer.normalize(raw.trim(), Normalizer.Form.NFC);
    }

    private Integer getInt(Row row, Map<String, Integer> headerIndex, String key, int fallback) {
        int col = headerIndex.getOrDefault(key, fallback);
        Cell cell = row.getCell(col);
        if (cell == null) return null;
        if (cell.getCellType() == CellType.NUMERIC) {
            return (int) cell.getNumericCellValue();
        }
        String s = dataFormatter.formatCellValue(cell).trim().replaceAll("\\.0$", "");
        return s.isEmpty() ? null : Integer.parseInt(s);
    }

    private BigDecimal getDecimal(Row row, Map<String, Integer> headerIndex, String key, int fallback) {
        int col = headerIndex.getOrDefault(key, fallback);
        Cell cell = row.getCell(col);
        if (cell == null) return null;
        if (cell.getCellType() == CellType.NUMERIC) {
            return BigDecimal.valueOf(cell.getNumericCellValue());
        }
        String s = dataFormatter.formatCellValue(cell).trim().replace(",", ".").replaceAll("[^0-9.]", "");
        return s.isEmpty() ? null : new BigDecimal(s);
    }

    public record ImportResult(int imported, int updated, List<String> errors) {}
}
