package com.thanglong.landtax.usecase.service;

import com.thanglong.landtax.domain.RecordCategories;
import com.thanglong.landtax.domain.service.NotificationService;
import com.thanglong.landtax.domain.service.TaxPayableAmountService;
import com.thanglong.landtax.infrastructure.adapter.persistence.entity.LandOwnerEntity;
import com.thanglong.landtax.infrastructure.adapter.persistence.entity.LandParcelEntity;
import com.thanglong.landtax.infrastructure.adapter.persistence.entity.RecordEntity;
import com.thanglong.landtax.infrastructure.adapter.persistence.entity.TaxPaymentEntity;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.LandOwnerJpaRepository;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.LandParcelJpaRepository;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.RecordJpaRepository;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.TaxPaymentJpaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Phat hanh thue dat tu dong hang nam (01/04): 1 record + 2 tax_payments (50%/50%).
 * Khong thay doi schema DB.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings("null")
public class AnnualTaxBillingService {

    private static final Set<String> PRIMARY_OWNER_TYPES = Set.of("PRIMARY", "MAIN");

    private final LandOwnerJpaRepository landOwnerJpaRepository;
    private final LandParcelJpaRepository landParcelJpaRepository;
    private final RecordJpaRepository recordJpaRepository;
    private final TaxPaymentJpaRepository taxPaymentJpaRepository;
    private final TaxPaymentAmountService taxPaymentAmountService;
    private final TaxPayableAmountService taxPayableAmountService;
    private final PaymentService paymentService;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    @Transactional
    public Map<String, Object> runAnnualBilling(int taxYear) {
        log.info("[ANNUAL-BILLING] Starting batch for taxYear={}", taxYear);

        int created = 0;
        int refreshed = 0;
        int skipped = 0;
        Set<Integer> notifiedCitizens = new HashSet<>();

        for (LandOwnerEntity owner : landOwnerJpaRepository.findAll()) {
            if (!isPrimaryOwner(owner)) {
                continue;
            }

            Integer parcelId = owner.getLandParcelId();
            Integer citizenId = owner.getCitizenId();

            if (hasNonAnnualPaymentForYear(parcelId, taxYear)) {
                skipped++;
                continue;
            }

            List<RecordEntity> annualRecords = recordJpaRepository
                    .findByLandParcelIdAndRecordCategory(parcelId, RecordCategories.ANNUAL_TAX_RENEWAL);
            RecordEntity annualRecord = annualRecords.stream()
                    .filter(r -> hasPaymentForYear(r.getRecordId(), taxYear))
                    .findFirst()
                    .orElse(null);

            if (annualRecord != null) {
                refreshAnnualPayments(annualRecord, taxYear, citizenId);
                refreshed++;
                notifiedCitizens.add(citizenId);
                continue;
            }

            createAnnualBilling(owner, taxYear);
            created++;
            notifiedCitizens.add(citizenId);
        }

        for (Integer citizenId : notifiedCitizens) {
            try {
                notificationService.notifyAnnualTaxBatchForCitizen(citizenId, taxYear);
            } catch (Exception e) {
                log.warn("[ANNUAL-BILLING] Notification failed citizenId={}: {}", citizenId, e.getMessage());
            }
        }

        auditLogService.log("ANNUAL_TAX_BILLING", "TAX_PAYMENT", String.valueOf(taxYear),
                String.format("Created=%d, refreshed=%d, skipped=%d", created, refreshed, skipped));

        log.info("[ANNUAL-BILLING] Done taxYear={}: created={}, refreshed={}, skipped={}",
                taxYear, created, refreshed, skipped);

        return Map.of(
                "taxYear", taxYear,
                "created", created,
                "refreshed", refreshed,
                "skipped", skipped,
                "notifiedCitizens", notifiedCitizens.size());
    }

    private void createAnnualBilling(LandOwnerEntity owner, int taxYear) {
        LandParcelEntity parcel = landParcelJpaRepository.findById(owner.getLandParcelId())
                .orElseThrow(() -> new IllegalStateException("Parcel not found: " + owner.getLandParcelId()));

        BigDecimal annualPayable = computeAnnualPayable(parcel, owner.getCitizenId(), taxYear);
        BigDecimal half = splitHalf(annualPayable);

        RecordEntity record = RecordEntity.builder()
                .citizenId(owner.getCitizenId())
                .landParcelId(parcel.getLandParcelId())
                .recordCategory(RecordCategories.ANNUAL_TAX_RENEWAL)
                .currentStatus("APPROVED")
                .build();
        RecordEntity savedRecord = recordJpaRepository.save(record);

        TaxPaymentEntity installment1 = saveInstallment(
                savedRecord.getRecordId(), parcel.getLandParcelId(), taxYear,
                half, TaxInstallmentHelper.dueDateForInstallment(taxYear, 1), "AWAITING_PAYMENT");
        paymentService.generateTransactionCode(installment1);

        TaxPaymentEntity installment2 = saveInstallment(
                savedRecord.getRecordId(), parcel.getLandParcelId(), taxYear,
                half, TaxInstallmentHelper.dueDateForInstallment(taxYear, 2), "UNPAID");
        paymentService.generateTransactionCode(installment2);

        log.info("[ANNUAL-BILLING] Created recordId={}, payIds=[{}, {}], annual={} VND",
                savedRecord.getRecordId(), installment1.getPayId(), installment2.getPayId(), annualPayable);
    }

    private void refreshAnnualPayments(RecordEntity record, int taxYear, Integer citizenId) {
        LandParcelEntity parcel = landParcelJpaRepository.findById(record.getLandParcelId())
                .orElseThrow(() -> new IllegalStateException("Parcel not found: " + record.getLandParcelId()));

        BigDecimal annualPayable = computeAnnualPayable(parcel, citizenId, taxYear);
        BigDecimal half = splitHalf(annualPayable);

        List<TaxPaymentEntity> payments = TaxInstallmentHelper.sortByInstallment(
                taxPaymentJpaRepository.findByRecordIdAndTaxYear(record.getRecordId(), taxYear));

        for (TaxPaymentEntity payment : payments) {
            if ("PAID".equalsIgnoreCase(payment.getPaymentStatus())) {
                continue;
            }
            payment.setTotalAmountDue(half);
            taxPaymentJpaRepository.save(payment);
        }

        log.info("[ANNUAL-BILLING] Refreshed recordId={} taxYear={} half={}", record.getRecordId(), taxYear, half);
    }

    private TaxPaymentEntity saveInstallment(Integer recordId, Integer parcelId, int taxYear,
                                              BigDecimal amount, LocalDate dueDate, String status) {
        TaxPaymentEntity payment = TaxPaymentEntity.builder()
                .recordId(recordId)
                .landParcelId(parcelId)
                .taxYear(taxYear)
                .totalAmountDue(amount)
                .dueDate(dueDate)
                .paymentStatus(status)
                .build();
        return taxPaymentJpaRepository.save(payment);
    }

    private BigDecimal computeAnnualPayable(LandParcelEntity parcel, Integer citizenId, int taxYear) {
        BigDecimal gross = taxPaymentAmountService.computeGrossTax(parcel, null);
        return taxPayableAmountService.resolvePayableAmount(gross, citizenId, taxYear);
    }

    private static BigDecimal splitHalf(BigDecimal annual) {
        if (annual == null || annual.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        return annual.divide(BigDecimal.valueOf(2), 2, RoundingMode.HALF_UP);
    }

    private boolean hasNonAnnualPaymentForYear(Integer parcelId, int taxYear) {
        List<TaxPaymentEntity> existing = taxPaymentJpaRepository.findByLandParcelIdAndTaxYearExcludingRecordCategory(
                parcelId, taxYear, RecordCategories.ANNUAL_TAX_RENEWAL);
        return !existing.isEmpty();
    }

    private boolean hasPaymentForYear(Integer recordId, int taxYear) {
        return !taxPaymentJpaRepository.findByRecordIdAndTaxYear(recordId, taxYear).isEmpty();
    }

    private static boolean isPrimaryOwner(LandOwnerEntity owner) {
        String type = owner.getOwnershipType();
        if (type == null || type.isBlank()) {
            return true;
        }
        return PRIMARY_OWNER_TYPES.contains(type.trim().toUpperCase());
    }
}
