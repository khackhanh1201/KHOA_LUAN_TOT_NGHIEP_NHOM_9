package com.thanglong.landtax.usecase.service;

import com.thanglong.landtax.domain.constant.TaxRateConstants;
import com.thanglong.landtax.domain.service.LandQuotaResolver;
import com.thanglong.landtax.domain.service.TaxCalculationService;
import com.thanglong.landtax.domain.service.TaxPayableAmountService;
import com.thanglong.landtax.infrastructure.adapter.persistence.entity.*;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.Year;
import java.util.*;

@Service
@RequiredArgsConstructor
public class RecordDetailQueryService {

    private final RecordJpaRepository recordJpaRepository;
    private final CitizenLocalJpaRepository citizenLocalJpaRepository;
    private final LandParcelService landParcelService;
    private final TaxDeclarationRepository taxDeclarationRepository;
    private final TaxPaymentJpaRepository taxPaymentJpaRepository;
    private final LandPriceJpaRepository landPriceJpaRepository;
    private final TaxExemptSubjectRepository taxExemptSubjectRepository;
    private final ProcessingLogJpaRepository processingLogJpaRepository;
    private final AccountJpaRepository accountJpaRepository;
    private final TaxCalculationService taxCalculationService;
    private final TaxPayableAmountService taxPayableAmountService;
    private final LandQuotaResolver landQuotaResolver;
    private final LandTypeJpaRepository landTypeJpaRepository;

    @Transactional(readOnly = true)
    public Optional<Map<String, Object>> buildRecordDetail(Integer recordId) {
        return recordJpaRepository.findById(recordId).map(this::assembleDetail);
    }

    private Map<String, Object> assembleDetail(RecordEntity record) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("recordId", record.getRecordId());
        response.put("citizenId", record.getCitizenId());
        response.put("landParcelId", record.getLandParcelId());
        response.put("recordCategory", record.getRecordCategory());
        response.put("currentStatus", record.getCurrentStatus());
        response.put("submittedAt", record.getSubmittedAt());

        CitizenLocalEntity citizen = citizenLocalJpaRepository.findById(record.getCitizenId()).orElse(null);
        if (citizen != null) {
            response.put("fullName", citizen.getFullName());
            response.put("cccdNumber", citizen.getCccdNumber());
            response.put("phoneNumber", citizen.getPhoneNumber());
        }

        LandParcelEntity parcel = landParcelService.getParcelById(record.getLandParcelId()).orElse(null);
        Map<String, Object> parcelDetail = parcel != null
                ? landParcelService.buildParcelDetailMap(parcel)
                : Collections.emptyMap();
        response.put("landParcel", parcelDetail.isEmpty() ? null : parcelDetail);

        TaxDeclarationEntity declaration = taxDeclarationRepository
                .findByRecordId(record.getRecordId()).orElse(null);
        if (declaration != null) {
            Map<String, Object> taxDecl = new LinkedHashMap<>();
            taxDecl.put("id", declaration.getDeclarationId());
            taxDecl.put("declaredArea", declaration.getDeclaredArea());
            taxDecl.put("declaredUsage", declaration.getDeclaredUsage());
            taxDecl.put("reviewNote", declaration.getDeclarationNotes());
            response.put("taxDeclaration", taxDecl);
        } else {
            response.put("taxDeclaration", null);
        }

        int taxYear = record.getSubmittedAt() != null
                ? record.getSubmittedAt().getYear()
                : Year.now().getValue();
        response.put("taxExemption", buildTaxExemptionSummary(record.getCitizenId(), taxYear));

        response.put("financialInfo", buildFinancialInfo(record, parcel, declaration, taxYear));

        List<TaxPaymentEntity> payments = taxPaymentJpaRepository.findByRecordId(record.getRecordId());
        if (!payments.isEmpty()) {
            TaxPaymentEntity p = payments.get(0);
            Map<String, Object> paymentSummary = new LinkedHashMap<>();
            paymentSummary.put("payId", p.getPayId());
            paymentSummary.put("totalAmountDue", p.getTotalAmountDue());
            paymentSummary.put("taxYear", p.getTaxYear());
            paymentSummary.put("paymentStatus", p.getPaymentStatus());
            paymentSummary.put("dueDate", p.getDueDate());
            paymentSummary.put("transactionCode", p.getTransactionCode());
            paymentSummary.put("paidAt", p.getPaidAt());
            response.put("payment", paymentSummary);
            response.put("totalAmountDue", p.getTotalAmountDue());
            response.put("paymentStatus", p.getPaymentStatus());
        } else {
            response.put("payment", null);
        }

        response.put("history", buildHistory(record, citizen));
        return response;
    }

    private Map<String, Object> buildTaxExemptionSummary(Integer citizenId, int taxYear) {
        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("hasExemption", false);
        summary.put("label", "Không có");
        summary.put("discountRate", null);
        summary.put("status", null);
        summary.put("exemptionReason", null);

        taxExemptSubjectRepository.findFirstByCitizenIdAndAppliedYearOrderByExemptIdDesc(citizenId, taxYear)
                .ifPresent(exempt -> {
                    summary.put("hasExemption", true);
                    summary.put("discountRate", exempt.getDiscountRate());
                    summary.put("status", exempt.getStatus());
                    summary.put("exemptionReason", exempt.getExemptionReason());
                    String reason = exempt.getExemptionReason() != null && !exempt.getExemptionReason().isBlank()
                            ? exempt.getExemptionReason()
                            : "Giảm " + exempt.getDiscountRate() + "%";
                    String statusSuffix = exempt.getStatus() != null ? " (" + exempt.getStatus() + ")" : "";
                    summary.put("label", reason + statusSuffix);
                });
        return summary;
    }

    private Map<String, Object> buildFinancialInfo(
            RecordEntity record,
            LandParcelEntity parcel,
            TaxDeclarationEntity declaration,
            int taxYear) {

        Map<String, Object> fin = new LinkedHashMap<>();
        fin.put("taxYear", taxYear);
        fin.put("adjustmentFactor", TaxRateConstants.RATE_TIER_1);
        fin.put("unitPrice", null);
        fin.put("grossTaxAmount", null);
        fin.put("reductionAmount", null);
        fin.put("totalTaxAmount", null);
        fin.put("paymentStatus", null);
        fin.put("estimated", false);

        if (parcel == null) {
            return fin;
        }

        BigDecimal area = declaration != null && declaration.getDeclaredArea() != null
                ? declaration.getDeclaredArea()
                : parcel.getAreaSize();

        landPriceJpaRepository.findLatestPrice(parcel.getLandTypeId(), parcel.getAreaId())
                .ifPresent(price -> fin.put("unitPrice", price.getUnitPrice()));

        Object unitPriceObj = fin.get("unitPrice");
        if (unitPriceObj != null && area != null) {
            double limitArea = parcel != null
                    ? landQuotaResolver.resolveLimitArea(parcel.getAreaId())
                    : TaxRateConstants.LIMIT_AREA;
            double gross = taxCalculationService.calculateTax(
                    area.doubleValue(),
                    ((BigDecimal) unitPriceObj).doubleValue(),
                    limitArea);
            fin.put("grossTaxAmount", BigDecimal.valueOf(gross).setScale(2, RoundingMode.HALF_UP));
        }

        BigDecimal grossTax = (BigDecimal) fin.get("grossTaxAmount");
        BigDecimal reduction = BigDecimal.ZERO;
        if (grossTax != null && record.getCitizenId() != null) {
            BigDecimal payable = taxPayableAmountService.resolvePayableAmount(
                    grossTax, record.getCitizenId(), taxYear);
            reduction = grossTax.subtract(payable).max(BigDecimal.ZERO);
            if (reduction.compareTo(BigDecimal.ZERO) > 0) {
                fin.put("reductionAmount", reduction);
            }
        }

        List<TaxPaymentEntity> payments = taxPaymentJpaRepository.findByRecordId(record.getRecordId());
        if (!payments.isEmpty()) {
            TaxPaymentEntity p = payments.get(0);
            fin.put("paymentStatus", p.getPaymentStatus());
            BigDecimal due = p.getTotalAmountDue();
            if (due != null && due.compareTo(BigDecimal.ZERO) > 0) {
                fin.put("totalTaxAmount", due);
            } else if (grossTax != null) {
                fin.put("totalTaxAmount", grossTax.subtract(reduction).max(BigDecimal.ZERO));
                fin.put("estimated", true);
            } else {
                fin.put("totalTaxAmount", due);
            }
        } else if (grossTax != null) {
            fin.put("totalTaxAmount", grossTax.subtract(reduction).max(BigDecimal.ZERO));
            fin.put("paymentStatus", "UNPAID");
            fin.put("estimated", true);
        }

        return fin;
    }

    private List<Map<String, Object>> buildHistory(RecordEntity record, CitizenLocalEntity citizen) {
        List<Map<String, Object>> items = new ArrayList<>();

        if (record.getSubmittedAt() != null) {
            Map<String, Object> submit = new LinkedHashMap<>();
            submit.put("role", "CITIZEN");
            submit.put("action", "Nộp hồ sơ");
            submit.put("timestamp", record.getSubmittedAt());
            submit.put("user", citizen != null ? citizen.getFullName() : "Người nộp");
            submit.put("tag", "SUBMITTED");
            submit.put("notes", null);
            items.add(submit);
        }

        List<ProcessingLogEntity> logs = processingLogJpaRepository
                .findByRecordIdOrderByProcessedAtDesc(record.getRecordId());
        for (ProcessingLogEntity log : logs) {
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("role", "OFFICER");
            entry.put("action", mapProcessingStepLabel(log.getProcessingStep()));
            entry.put("timestamp", log.getProcessedAt() != null ? log.getProcessedAt() : LocalDateTime.now());
            entry.put("user", resolveProcessorName(log.getProcessorAccountId()));
            entry.put("tag", log.getNewStatus());
            entry.put("notes", log.getProcessorNotes());
            items.add(entry);
        }

        items.sort((a, b) -> {
            LocalDateTime ta = (LocalDateTime) a.get("timestamp");
            LocalDateTime tb = (LocalDateTime) b.get("timestamp");
            if (ta == null || tb == null) return 0;
            return ta.compareTo(tb);
        });
        return items;
    }

    private String resolveProcessorName(Integer accountId) {
        if (accountId == null) {
            return "Hệ thống";
        }
        return accountJpaRepository.findById(accountId)
                .flatMap(acc -> citizenLocalJpaRepository.findById(acc.getCitizenId()))
                .map(CitizenLocalEntity::getFullName)
                .orElse("Cán bộ xử lý");
    }

    private static String mapProcessingStepLabel(String step) {
        if (step == null) return "Xử lý hồ sơ";
        return switch (step) {
            case "APPROVE" -> "Phê duyệt";
            case "REJECT" -> "Từ chối";
            case "Xác nhận" -> "Xác nhận hồ sơ";
            case "Áp thuế" -> "Áp thuế";
            case "Tiếp nhận" -> "Tiếp nhận";
            default -> step;
        };
    }

    /** Tên loại đất chuẩn: land_types.type_name, rồi tờ khai, rồi usage_type trên thửa. */
    public String resolveLandTypeLabel(LandParcelEntity parcel, TaxDeclarationEntity declaration) {
        if (parcel != null && parcel.getLandTypeId() != null) {
            Optional<String> typeName = landTypeJpaRepository.findById(parcel.getLandTypeId())
                    .map(LandTypeEntity::getTypeName);
            if (typeName.isPresent() && !typeName.get().isBlank()) {
                return typeName.get();
            }
        }
        if (declaration != null && declaration.getDeclaredUsage() != null && !declaration.getDeclaredUsage().isBlank()) {
            return declaration.getDeclaredUsage();
        }
        if (parcel != null && parcel.getUsageType() != null && !parcel.getUsageType().isBlank()) {
            return parcel.getUsageType();
        }
        return null;
    }
}
