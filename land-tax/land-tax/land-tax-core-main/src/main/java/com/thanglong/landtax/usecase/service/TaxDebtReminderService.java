package com.thanglong.landtax.usecase.service;

import com.thanglong.landtax.domain.RecordCategories;
import com.thanglong.landtax.domain.service.NotificationService;
import com.thanglong.landtax.infrastructure.adapter.persistence.entity.RecordEntity;
import com.thanglong.landtax.infrastructure.adapter.persistence.entity.TaxPaymentEntity;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.RecordJpaRepository;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.TaxPaymentJpaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Nhac no ky 2 (01/10): mo khoan ky 2 va gui thong bao neu chua nop du 100%.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings("null")
public class TaxDebtReminderService {

    private static final Set<String> UNPAID_STATUSES = Set.of("UNPAID", "AWAITING_PAYMENT", "OVERDUE");

    private final RecordJpaRepository recordJpaRepository;
    private final TaxPaymentJpaRepository taxPaymentJpaRepository;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    @Transactional
    public Map<String, Object> runDebtReminder(int taxYear) {
        log.info("[DEBT-REMINDER] Starting for taxYear={}", taxYear);

        int reminded = 0;
        int activated = 0;
        Set<Integer> citizens = new HashSet<>();

        List<RecordEntity> annualRecords = recordJpaRepository.findByRecordCategory(
                RecordCategories.ANNUAL_TAX_RENEWAL);

        for (RecordEntity record : annualRecords) {
            List<TaxPaymentEntity> payments = taxPaymentJpaRepository.findByRecordIdAndTaxYear(
                    record.getRecordId(), taxYear);
            if (payments.isEmpty()) {
                continue;
            }

            if (TaxInstallmentHelper.isAnnualFullyPaid(payments)) {
                continue;
            }

            TaxPaymentEntity installment1 = TaxInstallmentHelper.findInstallment(payments, 1);
            TaxPaymentEntity installment2 = TaxInstallmentHelper.findInstallment(payments, 2);

            if (installment2 != null && "UNPAID".equals(installment2.getPaymentStatus())) {
                boolean ky1Paid = installment1 == null || "PAID".equalsIgnoreCase(installment1.getPaymentStatus());
                if (ky1Paid) {
                    installment2.setPaymentStatus("AWAITING_PAYMENT");
                    taxPaymentJpaRepository.save(installment2);
                    activated++;
                }
            }

            if (installment1 != null && UNPAID_STATUSES.contains(installment1.getPaymentStatus())) {
                if ("UNPAID".equals(installment1.getPaymentStatus())) {
                    installment1.setPaymentStatus("AWAITING_PAYMENT");
                    taxPaymentJpaRepository.save(installment1);
                    activated++;
                }
            }

            BigDecimal remaining = computeRemaining(payments);
            if (remaining.compareTo(BigDecimal.ZERO) > 0) {
                notificationService.notifySecondInstallmentDue(
                        record.getCitizenId(), taxYear, remaining, record.getRecordId());
                citizens.add(record.getCitizenId());
                reminded++;
            }
        }

        auditLogService.log("ANNUAL_TAX_DEBT_REMINDER", "TAX_PAYMENT", String.valueOf(taxYear),
                String.format("reminded=%d, activated=%d", reminded, activated));

        log.info("[DEBT-REMINDER] Done taxYear={}: reminded={}, activated={}", taxYear, reminded, activated);

        return Map.of(
                "taxYear", taxYear,
                "remindedRecords", reminded,
                "activatedPayments", activated,
                "notifiedCitizens", citizens.size());
    }

    private static BigDecimal computeRemaining(List<TaxPaymentEntity> payments) {
        BigDecimal total = TaxInstallmentHelper.sumAnnualTaxTotal(payments, RecordCategories.ANNUAL_TAX_RENEWAL);
        if (total == null) {
            total = BigDecimal.ZERO;
        }
        BigDecimal paid = payments.stream()
                .filter(p -> "PAID".equalsIgnoreCase(p.getPaymentStatus()))
                .map(TaxPaymentEntity::getTotalAmountDue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return total.subtract(paid).max(BigDecimal.ZERO);
    }
}
