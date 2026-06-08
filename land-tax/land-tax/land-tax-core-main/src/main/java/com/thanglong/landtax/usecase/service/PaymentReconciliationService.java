package com.thanglong.landtax.usecase.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.thanglong.landtax.infrastructure.adapter.persistence.entity.AccountEntity;
import com.thanglong.landtax.infrastructure.adapter.persistence.entity.CitizenLocalEntity;
import com.thanglong.landtax.infrastructure.adapter.persistence.entity.ProcessingLogEntity;
import com.thanglong.landtax.infrastructure.adapter.persistence.entity.ReconciliationLogEntity;
import com.thanglong.landtax.infrastructure.adapter.persistence.entity.RecordEntity;
import com.thanglong.landtax.infrastructure.adapter.persistence.entity.TaxPaymentEntity;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.AccountJpaRepository;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.CitizenLocalJpaRepository;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.ProcessingLogJpaRepository;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.ReconciliationLogJpaRepository;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.RecordJpaRepository;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.TaxPaymentJpaRepository;
import com.thanglong.landtax.domain.service.TaxPenaltyService;
import com.thanglong.landtax.domain.service.TaxPenaltyService.PenaltyResult;
import com.thanglong.landtax.usecase.dto.ReconciliationRowResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings("null")
public class PaymentReconciliationService {

    private static final ObjectMapper JSON = new ObjectMapper();

    private final TaxPaymentJpaRepository taxPaymentJpaRepository;
    private final ReconciliationLogJpaRepository reconciliationLogJpaRepository;
    private final RecordJpaRepository recordJpaRepository;
    private final CitizenLocalJpaRepository citizenLocalJpaRepository;
    private final AccountJpaRepository accountJpaRepository;
    private final ProcessingLogJpaRepository processingLogJpaRepository;
    private final TaxPenaltyService taxPenaltyService;
    private final AuditLogService auditLogService;

    @Transactional
    public List<ReconciliationRowResponse> runReconciliation() {
        List<TaxPaymentEntity> payments = taxPaymentJpaRepository.findAll();
        List<ReconciliationLogEntity> logs = reconciliationLogJpaRepository.findAll();

        Map<String, ReconciliationLogEntity> logByTx = new HashMap<>();
        for (ReconciliationLogEntity log : logs) {
            if (log.getTransactionCode() != null) {
                logByTx.putIfAbsent(log.getTransactionCode(), log);
            }
        }

        Map<Integer, RecordEntity> recordMap = new HashMap<>();
        Map<Integer, CitizenLocalEntity> citizenMap = new HashMap<>();
        recordJpaRepository.findAll().forEach(r -> recordMap.put(r.getRecordId(), r));
        citizenLocalJpaRepository.findAll().forEach(c -> citizenMap.put(c.getCitizenId(), c));

        List<ReconciliationRowResponse> rows = new ArrayList<>();

        for (TaxPaymentEntity payment : payments) {
            String txCode = payment.getTransactionCode();
            if (txCode == null || txCode.isBlank()) {
                continue;
            }

            ReconciliationLogEntity payosLog = logByTx.get(txCode);
            PenaltyResult penaltyCalc = taxPenaltyService.resolveForPayment(payment);
            CitizenLocalEntity citizen = resolveCitizen(payment, recordMap, citizenMap);

            ReconciliationRowResponse row = buildRow(payment, payosLog, penaltyCalc, citizen);
            if (row != null) {
                rows.add(row);
            }
        }

        rows.sort(Comparator
                .comparing(ReconciliationRowResponse::isNeedsAction).reversed()
                .thenComparing(r -> r.getInvoiceCode() != null ? r.getInvoiceCode() : ""));

        for (ReconciliationRowResponse row : rows) {
            if (!row.isNeedsAction() || row.getPayId() == null) {
                continue;
            }
            taxPaymentJpaRepository.findById(row.getPayId()).ifPresent(payment -> {
                String st = payment.getPaymentStatus();
                if (!"PAID".equalsIgnoreCase(st) && !"DISPUTED".equalsIgnoreCase(st) && !"FAILED".equalsIgnoreCase(st)) {
                    payment.setPaymentStatus("DISCREPANCY");
                    taxPaymentJpaRepository.save(payment);
                }
            });
        }

        return rows;
    }

    /**
     * Đối soát từ file sao kê ngân hàng (CSV hoặc Excel).
     * Cột bắt buộc: mã giao dịch / order code và số tiền.
     */
    @Transactional
    public List<ReconciliationRowResponse> reconcileFromUpload(MultipartFile file) throws Exception {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File doi soat khong duoc de trong");
        }

        List<BankStatementRow> bankRows = parseBankStatement(file);
        if (bankRows.isEmpty()) {
            throw new IllegalArgumentException(
                    "Khong doc duoc du lieu hop le. Can cot ma giao dich va so tien (CSV/Excel).");
        }

        Map<String, BankStatementRow> bankByCode = new HashMap<>();
        for (BankStatementRow row : bankRows) {
            if (row.transactionCode() != null && !row.transactionCode().isBlank()) {
                bankByCode.put(normalizeTxCode(row.transactionCode()), row);
            }
        }

        Map<Integer, RecordEntity> recordMap = new HashMap<>();
        Map<Integer, CitizenLocalEntity> citizenMap = new HashMap<>();
        recordJpaRepository.findAll().forEach(r -> recordMap.put(r.getRecordId(), r));
        citizenLocalJpaRepository.findAll().forEach(c -> citizenMap.put(c.getCitizenId(), c));

        List<ReconciliationRowResponse> rows = new ArrayList<>();
        Set<String> matchedBankCodes = new java.util.HashSet<>();

        for (TaxPaymentEntity payment : taxPaymentJpaRepository.findAll()) {
            String txCode = payment.getTransactionCode();
            if (txCode == null || txCode.isBlank()) {
                continue;
            }

            PenaltyResult penaltyCalc = taxPenaltyService.resolveForPayment(payment);
            CitizenLocalEntity citizen = resolveCitizen(payment, recordMap, citizenMap);
            BankStatementRow bankRow = bankByCode.get(normalizeTxCode(txCode));

            if (bankRow != null) {
                matchedBankCodes.add(normalizeTxCode(txCode));
                rows.add(buildRowFromBankSignal(payment, bankRow, penaltyCalc, citizen));
            } else if ("PAID".equalsIgnoreCase(payment.getPaymentStatus())
                    || "DISCREPANCY".equalsIgnoreCase(payment.getPaymentStatus())
                    || "DISPUTED".equalsIgnoreCase(payment.getPaymentStatus())) {
                rows.add(buildRowMissingBankSignal(payment, penaltyCalc, citizen));
            }
        }

        for (BankStatementRow orphan : bankRows) {
            String code = normalizeTxCode(orphan.transactionCode());
            if (code.isBlank() || matchedBankCodes.contains(code)) {
                continue;
            }
            rows.add(ReconciliationRowResponse.builder()
                    .orderCode(orphan.transactionCode())
                    .hasPayosSignal(true)
                    .payosAmount(orphan.amount())
                    .payosDescription(orphan.description() != null ? orphan.description() : "Sao ke ngan hang")
                    .reconciliationStatus("UNREGISTERED")
                    .reconciliationLabel("GIAO DICH KHONG CO TRONG HE THONG")
                    .needsAction(true)
                    .build());
        }

        rows.sort(Comparator
                .comparing(ReconciliationRowResponse::isNeedsAction).reversed()
                .thenComparing(r -> r.getInvoiceCode() != null ? r.getInvoiceCode() : ""));

        return rows;
    }

    private ReconciliationRowResponse buildRowFromBankSignal(
            TaxPaymentEntity payment,
            BankStatementRow bankRow,
            PenaltyResult penaltyCalc,
            CitizenLocalEntity citizen) {

        BigDecimal systemBase = payment.getTotalAmountDue() != null
                ? payment.getTotalAmountDue()
                : BigDecimal.ZERO;
        BigDecimal systemTotal = penaltyCalc.totalPayable(systemBase);
        String systemStatusLabel = penaltyCalc.overdueDays() > 0 ? "TRỄ HẠN" : "BÌNH THƯỜNG";
        BigDecimal bankAmount = bankRow.amount() != null ? bankRow.amount() : BigDecimal.ZERO;

        boolean amountMatch = bankAmount.setScale(0, RoundingMode.HALF_UP)
                .compareTo(systemTotal.setScale(0, RoundingMode.HALF_UP)) == 0;

        return ReconciliationRowResponse.builder()
                .payId(payment.getPayId())
                .invoiceCode(formatInvoiceCode(payment))
                .orderCode(payment.getTransactionCode())
                .hasPayosSignal(true)
                .payosAmount(bankAmount)
                .payosDescription(bankRow.description() != null ? bankRow.description() : "Sao ke ngan hang")
                .mst(formatMst(citizen))
                .payerName(citizen != null ? citizen.getFullName() : "—")
                .systemBase(systemBase)
                .systemPenalty(penaltyCalc.penaltyAmount())
                .systemTotal(systemTotal)
                .systemStatusLabel(systemStatusLabel)
                .reconciliationStatus(amountMatch ? "MATCHED" : "AMOUNT_MISMATCH")
                .reconciliationLabel(amountMatch ? "KHỚP 100%" : "LỆCH SỐ TIỀN (SO KHỚP THEO TỔNG CỘNG GỒM PHẠT)")
                .needsAction(!amountMatch)
                .build();
    }

    private ReconciliationRowResponse buildRowMissingBankSignal(
            TaxPaymentEntity payment,
            PenaltyResult penaltyCalc,
            CitizenLocalEntity citizen) {

        BigDecimal systemBase = payment.getTotalAmountDue() != null
                ? payment.getTotalAmountDue()
                : BigDecimal.ZERO;
        BigDecimal systemTotal = penaltyCalc.totalPayable(systemBase);
        String systemStatusLabel = penaltyCalc.overdueDays() > 0 ? "TRỄ HẠN" : "BÌNH THƯỜNG";

        return ReconciliationRowResponse.builder()
                .payId(payment.getPayId())
                .invoiceCode(formatInvoiceCode(payment))
                .orderCode(payment.getTransactionCode())
                .hasPayosSignal(false)
                .mst(formatMst(citizen))
                .payerName(citizen != null ? citizen.getFullName() : "—")
                .systemBase(systemBase)
                .systemPenalty(penaltyCalc.penaltyAmount())
                .systemTotal(systemTotal)
                .systemStatusLabel(systemStatusLabel)
                .reconciliationStatus("MISSING_IN_BANK")
                .reconciliationLabel("KHÔNG THẤY TRONG FILE SAO KÊ")
                .needsAction(true)
                .build();
    }

    private List<BankStatementRow> parseBankStatement(MultipartFile file) throws Exception {
        String name = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase() : "";
        String contentType = file.getContentType() != null ? file.getContentType().toLowerCase() : "";
        if (name.endsWith(".xlsx") || name.endsWith(".xls")
                || contentType.contains("spreadsheet") || contentType.contains("excel")) {
            return parseBankExcel(file);
        }
        return parseBankCsv(file);
    }

    private List<BankStatementRow> parseBankExcel(MultipartFile file) throws Exception {
        byte[] bytes = file.getBytes();
        List<BankStatementRow> rows = new ArrayList<>();
        DataFormatter formatter = new DataFormatter();

        try (Workbook workbook = new XSSFWorkbook(new ByteArrayInputStream(bytes))) {
            Sheet sheet = workbook.getSheetAt(0);
            if (sheet == null || sheet.getPhysicalNumberOfRows() < 2) {
                return rows;
            }

            Row headerRow = sheet.getRow(0);
            int codeCol = findColumnIndex(headerRow, formatter, "ma", "order", "transaction", "giao dich", "magd");
            int amountCol = findColumnIndex(headerRow, formatter, "tien", "amount", "so tien", "sotien");
            int descCol = findColumnIndex(headerRow, formatter, "mo ta", "description", "noi dung", "noidung");

            if (codeCol < 0 || amountCol < 0) {
                return rows;
            }

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) {
                    continue;
                }
                String code = cellText(row.getCell(codeCol), formatter);
                BigDecimal amount = parseAmount(cellText(row.getCell(amountCol), formatter));
                String desc = descCol >= 0 ? cellText(row.getCell(descCol), formatter) : null;
                if (!code.isBlank() && amount != null) {
                    rows.add(new BankStatementRow(code.trim(), amount, desc));
                }
            }
        }
        return rows;
    }

    private List<BankStatementRow> parseBankCsv(MultipartFile file) throws Exception {
        List<BankStatementRow> rows = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), java.nio.charset.StandardCharsets.UTF_8))) {
            String headerLine = reader.readLine();
            if (headerLine == null) {
                return rows;
            }

            String[] headers = splitCsvLine(headerLine);
            int codeCol = findColumnIndex(headers, "ma", "order", "transaction", "giao dich", "magd");
            int amountCol = findColumnIndex(headers, "tien", "amount", "so tien", "sotien");
            int descCol = findColumnIndex(headers, "mo ta", "description", "noi dung", "noidung");

            if (codeCol < 0 || amountCol < 0) {
                return rows;
            }

            String line;
            while ((line = reader.readLine()) != null) {
                if (line.isBlank()) {
                    continue;
                }
                String[] cols = splitCsvLine(line);
                if (codeCol >= cols.length || amountCol >= cols.length) {
                    continue;
                }
                String code = cols[codeCol].trim();
                BigDecimal amount = parseAmount(cols[amountCol]);
                String desc = descCol >= 0 && descCol < cols.length ? cols[descCol].trim() : null;
                if (!code.isBlank() && amount != null) {
                    rows.add(new BankStatementRow(code, amount, desc));
                }
            }
        }
        return rows;
    }

    private static int findColumnIndex(Row headerRow, DataFormatter formatter, String... keywords) {
        if (headerRow == null) {
            return -1;
        }
        for (int i = 0; i < headerRow.getLastCellNum(); i++) {
            String header = normalizeHeader(cellText(headerRow.getCell(i), formatter));
            for (String kw : keywords) {
                if (header.contains(normalizeHeader(kw))) {
                    return i;
                }
            }
        }
        return -1;
    }

    private static int findColumnIndex(String[] headers, String... keywords) {
        for (int i = 0; i < headers.length; i++) {
            String header = normalizeHeader(headers[i]);
            for (String kw : keywords) {
                if (header.contains(normalizeHeader(kw))) {
                    return i;
                }
            }
        }
        return -1;
    }

    private static String cellText(Cell cell, DataFormatter formatter) {
        if (cell == null) {
            return "";
        }
        return formatter.formatCellValue(cell).trim();
    }

    private static String[] splitCsvLine(String line) {
        return line.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)", -1);
    }

    private static String normalizeHeader(String value) {
        if (value == null) {
            return "";
        }
        return value.toLowerCase()
                .replaceAll("[^a-z0-9\\s]", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }

    private static String normalizeTxCode(String code) {
        if (code == null) {
            return "";
        }
        return code.trim().toUpperCase().replaceAll("\\s+", "");
    }

    private static BigDecimal parseAmount(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        String cleaned = raw.replaceAll("[^0-9,.-]", "").replace(".", "").replace(",", ".");
        if (cleaned.isBlank() || "-".equals(cleaned)) {
            return null;
        }
        try {
            return new BigDecimal(cleaned);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private record BankStatementRow(String transactionCode, BigDecimal amount, String description) {}

    @Transactional
    public Map<String, Object> adjustBillStatus(Integer payId, String newStatus, String note) {
        if (note == null || note.isBlank()) {
            throw new IllegalArgumentException("Ly do xu ly la bat buoc");
        }

        TaxPaymentEntity payment = taxPaymentJpaRepository.findById(payId)
                .orElseThrow(() -> new IllegalArgumentException("Khong tim thay hoa don payId=" + payId));

        String oldStatus = payment.getPaymentStatus() != null ? payment.getPaymentStatus() : "UNPAID";
        payment.setPaymentStatus(newStatus);

        if ("PAID".equals(newStatus)) {
            if (payment.getPaidAt() == null) {
                payment.setPaidAt(LocalDateTime.now());
            }
        } else if (Set.of("FAILED", "DISPUTED", "DISCREPANCY", "UNPAID", "AWAITING_PAYMENT").contains(newStatus)) {
            payment.setPaidAt(null);
        }

        taxPaymentJpaRepository.save(payment);

        if (payment.getRecordId() != null) {
            AccountEntity officerAccount = resolveOfficerAccount();
            processingLogJpaRepository.save(ProcessingLogEntity.builder()
                    .recordId(payment.getRecordId())
                    .processorAccountId(officerAccount.getAccountId())
                    .processingStep("RECONCILE_ADJUST")
                    .oldStatus(oldStatus)
                    .newStatus(newStatus)
                    .processorNotes(note)
                    .build());
        }

        auditLogService.log(
                "RECONCILE_ADJUST",
                "TAX_PAYMENT",
                String.valueOf(payId),
                "Dieu chinh trang thai " + oldStatus + " -> " + newStatus + ": " + note
        );

        return Map.of(
                "message", "Dieu chinh trang thai hoa don thanh cong",
                "billId", payId,
                "oldStatus", oldStatus,
                "newStatus", newStatus,
                "note", note
        );
    }

    private ReconciliationRowResponse buildRow(
            TaxPaymentEntity payment,
            ReconciliationLogEntity payosLog,
            PenaltyResult penaltyCalc,
            CitizenLocalEntity citizen) {

        BigDecimal systemBase = payment.getTotalAmountDue() != null
                ? payment.getTotalAmountDue()
                : BigDecimal.ZERO;
        BigDecimal systemTotal = penaltyCalc.totalPayable(systemBase);
        String systemStatusLabel = penaltyCalc.overdueDays() > 0 ? "TRỄ HẠN" : "BÌNH THƯỜNG";

        String invoiceCode = formatInvoiceCode(payment);
        String mst = formatMst(citizen);
        String payerName = citizen != null ? citizen.getFullName() : "—";

        if (payosLog != null) {
            BigDecimal payosAmount = payosLog.getAmountReceived() != null
                    ? payosLog.getAmountReceived()
                    : BigDecimal.ZERO;
            boolean amountMatch = payosAmount.setScale(0, RoundingMode.HALF_UP)
                    .compareTo(systemTotal.setScale(0, RoundingMode.HALF_UP)) == 0;

            if (amountMatch && "MATCHED".equalsIgnoreCase(payosLog.getStatus())) {
                return ReconciliationRowResponse.builder()
                        .logId(payosLog.getLogId())
                        .payId(payment.getPayId())
                        .invoiceCode(invoiceCode)
                        .orderCode(payment.getTransactionCode())
                        .hasPayosSignal(true)
                        .payosAmount(payosAmount)
                        .payosDescription(extractDescription(payosLog.getWebhookPayload()))
                        .mst(mst)
                        .payerName(payerName)
                        .systemBase(systemBase)
                        .systemPenalty(penaltyCalc.penaltyAmount())
                        .systemTotal(systemTotal)
                        .systemStatusLabel(systemStatusLabel)
                        .reconciliationStatus("MATCHED")
                        .reconciliationLabel("KHỚP 100%")
                        .needsAction(false)
                        .build();
            }

            return ReconciliationRowResponse.builder()
                    .logId(payosLog.getLogId())
                    .payId(payment.getPayId())
                    .invoiceCode(invoiceCode)
                    .orderCode(payment.getTransactionCode())
                    .hasPayosSignal(true)
                    .payosAmount(payosAmount)
                    .payosDescription(extractDescription(payosLog.getWebhookPayload()))
                    .mst(mst)
                    .payerName(payerName)
                    .systemBase(systemBase)
                    .systemPenalty(penaltyCalc.penaltyAmount())
                    .systemTotal(systemTotal)
                    .systemStatusLabel(systemStatusLabel)
                    .reconciliationStatus("AMOUNT_MISMATCH")
                    .reconciliationLabel("LỆCH SỐ TIỀN (SO KHỚP THEO TỔNG CỘNG GỒM PHẠT)")
                    .needsAction(true)
                    .build();
        }

        if ("PAID".equalsIgnoreCase(payment.getPaymentStatus())
                || "DISCREPANCY".equalsIgnoreCase(payment.getPaymentStatus())
                || "DISPUTED".equalsIgnoreCase(payment.getPaymentStatus())) {
            return ReconciliationRowResponse.builder()
                    .payId(payment.getPayId())
                    .invoiceCode(invoiceCode)
                    .orderCode(payment.getTransactionCode())
                    .hasPayosSignal(false)
                    .mst(mst)
                    .payerName(payerName)
                    .systemBase(systemBase)
                    .systemPenalty(penaltyCalc.penaltyAmount())
                    .systemTotal(systemTotal)
                    .systemStatusLabel(systemStatusLabel)
                    .reconciliationStatus("MISSING_WEBHOOK")
                    .reconciliationLabel("KHÔNG THẤY TÍN HIỆU WEBHOOK PAYOS")
                    .needsAction(true)
                    .build();
        }

        return null;
    }

    static String formatInvoiceCode(TaxPaymentEntity payment) {
        int year = payment.getTaxYear() != null ? payment.getTaxYear() : LocalDate.now().getYear();
        int id = payment.getPayId() != null ? payment.getPayId() : 0;
        return String.format("HD-%d-%03d", year, id);
    }

    static String formatMst(CitizenLocalEntity citizen) {
        if (citizen == null || citizen.getCccdNumber() == null || citizen.getCccdNumber().isBlank()) {
            return "—";
        }
        String digits = citizen.getCccdNumber().replaceAll("\\D", "");
        if (digits.length() >= 10) {
            return digits.substring(0, 10);
        }
        return String.format("%010d", Long.parseLong(digits.isEmpty() ? "0" : digits));
    }

    private CitizenLocalEntity resolveCitizen(
            TaxPaymentEntity payment,
            Map<Integer, RecordEntity> recordMap,
            Map<Integer, CitizenLocalEntity> citizenMap) {
        if (payment.getRecordId() == null) {
            return null;
        }
        RecordEntity record = recordMap.get(payment.getRecordId());
        if (record == null || record.getCitizenId() == null) {
            return null;
        }
        return citizenMap.get(record.getCitizenId());
    }

    private AccountEntity resolveOfficerAccount() {
        String cccd = SecurityContextHolder.getContext().getAuthentication().getName();
        CitizenLocalEntity citizen = citizenLocalJpaRepository.findByCccdNumber(cccd)
                .orElseThrow(() -> new IllegalArgumentException("Khong tim thay cong dan: " + cccd));
        return accountJpaRepository.findByCitizenId(citizen.getCitizenId())
                .orElseThrow(() -> new IllegalArgumentException("Khong tim thay tai khoan can bo"));
    }

    private String extractDescription(String webhookPayload) {
        if (webhookPayload == null || webhookPayload.isBlank()) {
            return "Tín hiệu PayOS";
        }
        try {
            JsonNode node = JSON.readTree(webhookPayload);
            if (node.has("description")) {
                return node.get("description").asText();
            }
            if (node.has("source")) {
                return "Nguồn: " + node.get("source").asText();
            }
        } catch (Exception ignored) {
            // fall through
        }
        String trimmed = webhookPayload.trim();
        return trimmed.length() > 80 ? trimmed.substring(0, 80) + "…" : trimmed;
    }

}
