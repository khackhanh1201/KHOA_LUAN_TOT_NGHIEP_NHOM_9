package com.thanglong.landtax.usecase.service;

import com.thanglong.landtax.infrastructure.adapter.persistence.entity.AreaEntity;
import com.thanglong.landtax.infrastructure.adapter.persistence.entity.LandOwnerEntity;
import com.thanglong.landtax.infrastructure.adapter.persistence.entity.LandParcelEntity;
import com.thanglong.landtax.infrastructure.adapter.persistence.entity.LandTypeEntity;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.AreaJpaRepository;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.CitizenLocalJpaRepository;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.LandOwnerJpaRepository;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.LandParcelJpaRepository;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.LandTypeJpaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
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
import java.nio.charset.StandardCharsets;
import java.text.Normalizer;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Service xu ly import hang loat du lieu thua dat tu file Excel (.xlsx).
 *
 * <p>Excel layout (header row 0, data from row 1):</p>
 * <pre>
 * Col 0  : parcelNumber       (String)   VD: "101"
 * Col 1  : mapSheetNumber     (String)   VD: "01"
 * Col 2  : landTypeName       (String)   VD: "Đất ở tại đô thị" or "ODT" or "1"
 * Col 3  : ward               (String)   VD: "Thanh Liệt" or "W01"
 * Col 4  : streetName         (String)   VD: "Nguyễn Xiển"
 * Col 5  : positionLevel      (Integer)  VD: 1
 * Col 6  : areaSize           (Decimal)  VD: 85.5
 * Col 7  : address            (String)   VD: "Số 10 Phố Huế"
 * Col 8  : usageType          (String)   VD: "Đất ở đô thị"
 * Col 9  : usageDuration      (String)   VD: "50 năm"
 * Col 10 : certificateNumber  (String)   VD: "CH12345678"
 * Col 11 : ownerCccd          (String)   VD: "001099012345"
 * </pre>
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class LandParcelImportService {

    private final LandParcelJpaRepository landParcelJpaRepository;
    private final CitizenLocalJpaRepository citizenLocalJpaRepository;
    private final LandOwnerJpaRepository landOwnerJpaRepository;
    private final AreaJpaRepository areaJpaRepository;
    private final LandTypeJpaRepository landTypeJpaRepository;

    public int importFromExcel(MultipartFile file) throws Exception {
        log.info("Starting Excel import: fileName={}, size={}KB, contentType={}",
                file.getOriginalFilename(), file.getSize() / 1024, file.getContentType());

        int importedCount = 0;
        List<String> errors = new ArrayList<>();

        // =====================================================================
        // FIX 1: Force UTF-8 encoding for the input stream.
        //
        // Apache POI (XSSFWorkbook) reads .xlsx as ZIP/XML which is inherently
        // UTF-8. However, the MultipartFile byte stream can be corrupted if:
        //   a) The servlet container applies charset transformation before we
        //      read it (e.g., Tomcat with useBodyEncodingForURI=true).
        //   b) The file is actually a CSV/text file misidentified as .xlsx.
        //
        // To guarantee correctness, we:
        //   1. Read ALL bytes from the MultipartFile eagerly.
        //   2. Wrap in a fresh ByteArrayInputStream (no charset interference).
        //   3. Buffer it for POI performance.
        //   4. Normalize all extracted strings to NFC (canonical composition)
        //      to prevent Unicode decomposition mismatches with the database.
        // =====================================================================
        byte[] fileBytes = file.getBytes();
        log.debug("Read {} bytes from uploaded file, first 4 bytes (hex): {}",
                fileBytes.length, bytesToHex(fileBytes, 4));

        try (InputStream rawStream = new BufferedInputStream(new ByteArrayInputStream(fileBytes));
             Workbook workbook = new XSSFWorkbook(rawStream)) {

            Sheet sheet = workbook.getSheetAt(0);
            log.info("Sheet '{}' contains {} rows (including header)",
                    sheet.getSheetName(), sheet.getPhysicalNumberOfRows());

            for (Row row : sheet) {
                if (row.getRowNum() == 0) {
                    continue;
                }
                if (isRowEmpty(row)) {
                    continue;
                }

                int rowNum = row.getRowNum() + 1;

                try {
                    // STEP 1: Read raw values from Excel cells
                    String gcnBookNumber = getCellString(row, 0);
                    String certificateNumber = getCellString(row, 1);
                    String landTypeInput = getCellString(row, 2);
                    String wardInput = getCellString(row, 3);
                    String streetName = getCellString(row, 4);
                    Integer positionLevel = getCellInt(row, 5);
                    String parcelNumber = getCellString(row, 6);
                    String mapSheetNumber = getCellString(row, 7);
                    BigDecimal areaSize = getCellDecimal(row, 8);
                    String usageDuration = getCellString(row, 9);
                    String usageType = getCellString(row, 10);
                    String address = getCellString(row, 11);
                    String ownerCccd = null; // No owner CCCD column in the new Excel layout

                    // Log extracted values for encoding diagnosis
                    log.debug("Row {} raw values: parcel='{}', mapSheet='{}', landType='{}', ward='{}', "
                                    + "street='{}', pos={}, address='{}', cert='{}', gcnBook='{}'",
                            rowNum, parcelNumber, mapSheetNumber, landTypeInput, wardInput,
                            streetName, positionLevel, address, certificateNumber, gcnBookNumber);

                    // STEP 2: Resolve Land Type
                    Integer landTypeId = resolveLandTypeId(landTypeInput, rowNum);
                    if (landTypeId == null) {
                        String msg = "Row " + rowNum
                                + ": Land type not found for '" + landTypeInput + "' — skipping";
                        errors.add(msg);
                        log.warn(msg);
                        continue;
                    }

                    // STEP 3: Resolve Area
                    Integer areaId = resolveAreaId(wardInput, streetName, positionLevel, rowNum);
                    if (areaId == null) {
                        String msg = "Row " + rowNum
                                + ": Area not found for ward='" + wardInput
                                + "', street='" + streetName
                                + "', position=" + positionLevel + " — skipping";
                        errors.add(msg);
                        log.warn(msg);
                        continue;
                    }

                    // STEP 4: Build and save LandParcel
                    LandParcelEntity entity = LandParcelEntity.builder()
                            .parcelNumber(parcelNumber)
                            .mapSheetNumber(mapSheetNumber)
                            .landTypeId(landTypeId)
                            .areaId(areaId)
                            .areaSize(areaSize)
                            .address(address)
                            .usageType(usageType)
                            .usageDuration(usageDuration)
                            .certificateNumber(certificateNumber)
                            .gcnBookNumber(gcnBookNumber)
                            .build();

                    LandParcelEntity saved = landParcelJpaRepository.save(entity);
                    log.debug("Row {}: Saved land_parcel_id={} (type={}, area={})",
                            rowNum, saved.getLandParcelId(), landTypeId, areaId);

                    // STEP 5: Link owner if CCCD provided
                    if (ownerCccd != null && !ownerCccd.isBlank()) {
                        linkOwner(ownerCccd, saved.getLandParcelId(), rowNum);
                    }

                    importedCount++;

                } catch (Exception e) {
                    String msg = "Row " + rowNum + ": " + e.getMessage();
                    errors.add(msg);
                    log.warn("Error importing row {}: {}", rowNum, e.getMessage());
                }
            }
        }

        if (!errors.isEmpty()) {
            log.warn("=== IMPORT FINISHED WITH {} ERRORS ===", errors.size());
            errors.forEach(err -> log.warn("  - {}", err));
        }
        log.info("Successfully imported {} land parcels (errors: {})",
                importedCount, errors.size());

        return importedCount;
    }

    // =========================================================================
    //  Land Type resolution: typeName -> typeCode -> raw ID
    // =========================================================================

    private Integer resolveLandTypeId(String input, int rowNum) {
        if (input == null || input.isBlank()) {
            log.warn("Row {}: Land type column is empty", rowNum);
            return null;
        }
        String trimmed = input.trim();

        // 1) By Vietnamese name  e.g. "Đất ở tại đô thị"
        Optional<LandTypeEntity> byName = landTypeJpaRepository.findByTypeName(trimmed);
        if (byName.isPresent()) {
            return byName.get().getLandTypeId();
        }

        // 2) By type code  e.g. "ODT"
        Optional<LandTypeEntity> byCode = landTypeJpaRepository.findByTypeCode(trimmed);
        if (byCode.isPresent()) {
            return byCode.get().getLandTypeId();
        }

        // 3) By raw integer ID (backward compat)
        try {
            int id = Integer.parseInt(trimmed);
            if (landTypeJpaRepository.existsById(id)) {
                return id;
            }
        } catch (NumberFormatException ignored) {
            // not a number
        }

        // 4) Auto-create LandType if not found
        try {
            String code = generateLandTypeCode(trimmed);
            LandTypeEntity newType = LandTypeEntity.builder()
                    .typeCode(code)
                    .typeName(trimmed)
                    .isTaxPayment(true)
                    .build();
            LandTypeEntity saved = landTypeJpaRepository.save(newType);
            log.info("Row {}: Auto-created missing land type '{}' with code '{}' (id={})",
                    rowNum, trimmed, code, saved.getLandTypeId());
            return saved.getLandTypeId();
        } catch (Exception e) {
            log.error("Row {}: Failed to auto-create land type '{}': {}", rowNum, trimmed, e.getMessage(), e);
        }

        log.warn("Row {}: Cannot resolve land type '{}'", rowNum, trimmed);
        return null;
    }

    private String generateLandTypeCode(String name) {
        String base = Normalizer.normalize(name, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "") // Remove diacritics
                .replaceAll("[^a-zA-Z0-9\\s]", "")
                .replaceAll("\\s+", " ")
                .trim();
        String[] words = base.split(" ");
        StringBuilder codeBuilder = new StringBuilder();
        for (String w : words) {
            if (!w.isEmpty()) {
                codeBuilder.append(Character.toUpperCase(w.charAt(0)));
            }
        }
        String code = codeBuilder.toString();
        if (code.length() > 8) {
            code = code.substring(0, 8);
        }
        if (code.isEmpty()) {
            code = "LT";
        }
        
        // Ensure uniqueness
        String uniqueCode = code;
        int suffix = 1;
        while (landTypeJpaRepository.findByTypeCode(uniqueCode).isPresent() && suffix < 100) {
            uniqueCode = code + suffix;
            suffix++;
        }
        return uniqueCode;
    }

    // =========================================================================
    //  Area resolution: street+position -> wardCode+street+position -> street -> raw ID
    //
    //  IMPORTANT: The `areas.ward_code` column stores alphanumeric codes
    //  (e.g. "W01", "W02"), NOT Vietnamese ward names (e.g. "Thanh Liệt").
    //  The Excel file may provide either format in the "ward" column.
    //  This resolver handles both cases with multiple fallback strategies.
    // =========================================================================

    private Integer resolveAreaId(String wardInput, String streetName,
                                  Integer positionLevel, int rowNum) {
        if (streetName == null || streetName.isBlank()) {
            log.warn("Row {}: Street name is empty — cannot resolve area", rowNum);
            return null;
        }
        String street = streetName.trim();

        // 1) street_name + position_level (primary — both are human-readable)
        if (positionLevel != null) {
            Optional<AreaEntity> found =
                    areaJpaRepository.findByStreetNameAndPositionLevel(street, positionLevel);
            if (found.isPresent()) {
                log.debug("Row {}: Area resolved by street='{}' + position={} -> area_id={}",
                        rowNum, street, positionLevel, found.get().getAreaId());
                return found.get().getAreaId();
            }
        }

        // 2) ward_code + street_name + position_level (if Excel has ward codes like "W01")
        if (wardInput != null && !wardInput.isBlank() && positionLevel != null) {
            String ward = wardInput.trim();
            Optional<AreaEntity> found =
                    areaJpaRepository.findByWardCodeAndStreetNameAndPositionLevel(
                            ward, street, positionLevel);
            if (found.isPresent()) {
                log.debug("Row {}: Area resolved by wardCode='{}' + street='{}' + position={} -> area_id={}",
                        rowNum, ward, street, positionLevel, found.get().getAreaId());
                return found.get().getAreaId();
            }
            // If ward input looks like a Vietnamese name (not a code like "W01"),
            // log a diagnostic hint
            if (!ward.matches("^[A-Za-z0-9_-]+$")) {
                log.info("Row {}: Ward input '{}' appears to be a Vietnamese name, "
                                + "but areas.ward_code stores codes like 'W01'. "
                                + "Falling back to street-based lookup.",
                        rowNum, ward);
            }
        }

        // 3) street_name only (fallback)
        Optional<AreaEntity> byStreet = areaJpaRepository.findFirstByStreetName(street);
        if (byStreet.isPresent()) {
            log.info("Row {}: Area resolved by street only (position ignored) -> area_id={}",
                    rowNum, byStreet.get().getAreaId());
            return byStreet.get().getAreaId();
        }

        // 4) raw integer area_id (backward compat)
        if (wardInput != null && !wardInput.isBlank()) {
            try {
                int id = Integer.parseInt(wardInput.trim());
                if (areaJpaRepository.existsById(id)) {
                    log.info("Row {}: Area resolved by raw id={}", rowNum, id);
                    return id;
                }
            } catch (NumberFormatException ignored) {
                // not a number
            }
        }

        // 5) Auto-create Area if not found
        try {
            String districtCode = "D01"; // Default district
            String wardCode = generateWardCode(wardInput);
            
            AreaEntity newArea = AreaEntity.builder()
                    .districtCode(districtCode)
                    .wardCode(wardCode)
                    .streetName(street)
                    .positionLevel(positionLevel != null ? positionLevel : 1)
                    .landQuota(BigDecimal.valueOf(100.00)) // Default quota
                    .build();
            AreaEntity saved = areaJpaRepository.save(newArea);
            log.info("Row {}: Auto-created missing area: wardCode='{}', street='{}', position={} -> area_id={}",
                    rowNum, wardCode, street, positionLevel, saved.getAreaId());
            return saved.getAreaId();
        } catch (Exception e) {
            log.error("Row {}: Failed to auto-create area for ward='{}', street='{}', pos={}: {}",
                    rowNum, wardInput, street, positionLevel, e.getMessage(), e);
        }

        log.warn("Row {}: Cannot resolve area — ward='{}', street='{}', pos={}",
                rowNum, wardInput, streetName, positionLevel);
        return null;
    }

    private String generateWardCode(String wardName) {
        if (wardName == null || wardName.isBlank()) {
            return "W_UNKNOWN";
        }
        String trimmed = wardName.trim();
        if (trimmed.matches("^W\\d+$")) {
            return trimmed;
        }
        String normalized = Normalizer.normalize(trimmed, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toUpperCase()
                .replaceAll("[^A-Z0-9]", "_")
                .replaceAll("_+", "_")
                .trim();
        if (normalized.startsWith("_")) normalized = normalized.substring(1);
        if (normalized.endsWith("_")) normalized = normalized.substring(0, normalized.length() - 1);
        
        String code = "W_" + normalized;
        if (code.length() > 20) {
            code = code.substring(0, 20);
        }
        return code;
    }

    // =========================================================================
    //  Owner linking
    // =========================================================================

    private void linkOwner(String cccd, Integer landParcelId, int rowNum) {
        citizenLocalJpaRepository.findByCccdNumber(cccd).ifPresentOrElse(
                citizen -> {
                    LandOwnerEntity owner = LandOwnerEntity.builder()
                            .citizenId(citizen.getCitizenId())
                            .landParcelId(landParcelId)
                            .ownershipType("PRIMARY")
                            .build();
                    landOwnerJpaRepository.save(owner);
                    log.debug("Row {}: Linked CCCD '{}' to parcel {}", rowNum, cccd, landParcelId);
                },
                () -> log.warn("Row {}: Owner CCCD '{}' not found in citizen_local", rowNum, cccd)
        );
    }

    // =========================================================================
    //  Cell reading utilities — with UTF-8 / NFC normalization
    // =========================================================================

    private boolean isRowEmpty(Row row) {
        if (row == null) {
            return true;
        }
        for (int c = 0; c <= 11; c++) {
            Cell cell = row.getCell(c);
            if (cell != null && cell.getCellType() != CellType.BLANK) {
                return false;
            }
        }
        return true;
    }

    /**
     * Extracts a string value from the given cell and normalizes it to NFC Unicode form.
     * This prevents mismatches caused by different Unicode compositions
     * (e.g. "ệ" as single codepoint vs "e" + combining diacritics).
     */
    private String getCellString(Row row, int col) {
        Cell cell = row.getCell(col);
        if (cell == null) {
            return null;
        }
        String raw = switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue().trim();
            case NUMERIC -> String.valueOf((long) cell.getNumericCellValue());
            default -> null;
        };
        return normalizeUnicode(raw);
    }

    private Integer getCellInt(Row row, int col) {
        Cell cell = row.getCell(col);
        if (cell == null) {
            return null;
        }
        if (cell.getCellType() == CellType.NUMERIC) {
            return (int) cell.getNumericCellValue();
        }
        try {
            return Integer.parseInt(cell.getStringCellValue().trim());
        } catch (Exception e) {
            return null;
        }
    }

    private BigDecimal getCellDecimal(Row row, int col) {
        Cell cell = row.getCell(col);
        if (cell == null) {
            return null;
        }
        if (cell.getCellType() == CellType.NUMERIC) {
            return BigDecimal.valueOf(cell.getNumericCellValue());
        }
        try {
            return new BigDecimal(cell.getStringCellValue().trim());
        } catch (Exception e) {
            return null;
        }
    }

    // =========================================================================
    //  Unicode & encoding utilities
    // =========================================================================

    /**
     * Normalizes a string to NFC (Canonical Decomposition, followed by Canonical Composition).
     * This ensures that Vietnamese characters like "ệ", "ồ", "ứ" are stored as
     * single precomposed codepoints rather than base + combining sequences.
     * Also re-encodes any Mojibake caused by wrong charset interpretation.
     */
    private String normalizeUnicode(String input) {
        if (input == null) {
            return null;
        }
        // Attempt to fix Mojibake: if the string contains typical Windows-1252
        // misinterpretation patterns (e.g. Ã, Æ°, á»), try re-encoding
        String fixed = attemptMojibakeFix(input);

        // Apply NFC normalization for consistent Unicode comparison
        return Normalizer.normalize(fixed, Normalizer.Form.NFC);
    }

    /**
     * Attempts to fix Mojibake caused by reading UTF-8 bytes as Windows-1252/ISO-8859-1.
     * If the string contains typical garbled patterns, re-encode: Latin1 bytes -> UTF-8.
     */
    private String attemptMojibakeFix(String input) {
        // Detect common Mojibake signatures:
        //   "Ã" (U+00C3), "Æ" (U+00C6), "á»" (U+00E1 + U+00BB), "╗" etc.
        // These appear when UTF-8 byte sequences are interpreted as Windows-1252.
        if (containsMojibakeSignatures(input)) {
            try {
                // Re-encode: treat the string's chars as Latin-1 byte values,
                // then decode those bytes as UTF-8
                byte[] latin1Bytes = input.getBytes(StandardCharsets.ISO_8859_1);
                String recovered = new String(latin1Bytes, StandardCharsets.UTF_8);

                // Verify the recovered string is valid (contains no replacement chars)
                if (!recovered.contains("\uFFFD") && recovered.length() <= input.length()) {
                    log.debug("Mojibake fix applied: '{}' -> '{}'", input, recovered);
                    return recovered;
                }
            } catch (Exception e) {
                log.trace("Mojibake fix attempt failed for '{}': {}", input, e.getMessage());
            }
        }
        return input;
    }

    /**
     * Checks if a string contains byte patterns typical of UTF-8 Mojibake
     * when read through a single-byte charset (Windows-1252 / ISO-8859-1).
     */
    private boolean containsMojibakeSignatures(String s) {
        // Vietnamese UTF-8 Mojibake commonly produces these sequences:
        //   Ã (U+00C3) followed by another high character
        //   Ä (U+00C4), Æ (U+00C6), á» (á followed by »)
        //   â (U+00E2) followed by high chars
        //   Ã° (Ð), Ã¡ (á), Ã© (é), etc.
        for (int i = 0; i < s.length() - 1; i++) {
            char c = s.charAt(i);
            char next = s.charAt(i + 1);
            // UTF-8 two-byte sequence decoded as Latin-1 produces C2-C3 + 80-BF range
            if ((c == '\u00C3' || c == '\u00C2') && (next >= '\u0080' && next <= '\u00BF')) {
                return true;
            }
            // UTF-8 three-byte sequence (Vietnamese) produces E1-E2 + high chars
            if ((c == '\u00E1' || c == '\u00E2' || c == '\u00C4' || c == '\u00C6')
                    && (next >= '\u0080')) {
                return true;
            }
        }
        // Also check for box-drawing / special chars that never appear in normal Vietnamese
        if (s.contains("╗") || s.contains("║") || s.contains("╔") || s.contains("╚")
                || s.contains("╝") || s.contains("╞") || s.contains("╠")) {
            return true;
        }
        return false;
    }

    /**
     * Returns hex representation of the first N bytes for diagnostic logging.
     */
    private String bytesToHex(byte[] bytes, int maxBytes) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < Math.min(bytes.length, maxBytes); i++) {
            sb.append(String.format("%02X ", bytes[i]));
        }
        return sb.toString().trim();
    }
}
