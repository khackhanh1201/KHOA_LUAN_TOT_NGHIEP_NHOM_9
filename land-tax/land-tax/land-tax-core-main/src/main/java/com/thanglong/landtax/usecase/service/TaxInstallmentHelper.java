package com.thanglong.landtax.usecase.service;

import com.thanglong.landtax.domain.RecordCategories;
import com.thanglong.landtax.domain.constant.AnnualTaxConstants;
import com.thanglong.landtax.infrastructure.adapter.persistence.entity.TaxPaymentEntity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

/**
 * Nhan biet ky nop va tong thue nam tu cac cot hien co (due_date, total_amount_due).
 */
public final class TaxInstallmentHelper {

    private TaxInstallmentHelper() {
    }

    public static boolean isInstallmentDueDate(LocalDate dueDate, int installmentNo) {
        if (dueDate == null) {
            return false;
        }
        if (installmentNo == 1) {
            return dueDate.getMonthValue() == AnnualTaxConstants.INSTALLMENT_1_DUE_MONTH
                    && dueDate.getDayOfMonth() == AnnualTaxConstants.INSTALLMENT_1_DUE_DAY;
        }
        if (installmentNo == 2) {
            return dueDate.getMonthValue() == AnnualTaxConstants.INSTALLMENT_2_DUE_MONTH
                    && dueDate.getDayOfMonth() == AnnualTaxConstants.INSTALLMENT_2_DUE_DAY;
        }
        return false;
    }

    public static Integer resolveInstallmentNo(TaxPaymentEntity payment) {
        if (payment == null || payment.getDueDate() == null) {
            return null;
        }
        if (isInstallmentDueDate(payment.getDueDate(), 1)) {
            return 1;
        }
        if (isInstallmentDueDate(payment.getDueDate(), 2)) {
            return 2;
        }
        return null;
    }

    public static String resolveInstallmentLabel(TaxPaymentEntity payment, String recordCategory) {
        if (!RecordCategories.isAnnualTaxRenewal(recordCategory)) {
            return null;
        }
        Integer no = resolveInstallmentNo(payment);
        if (no == null) {
            return "Thuế đất hằng năm";
        }
        return no == 1 ? "Kỳ 1 (50% — hạn 31/05)" : "Kỳ 2 (50% còn lại — hạn 31/10)";
    }

    public static BigDecimal sumAnnualTaxTotal(List<TaxPaymentEntity> payments, String recordCategory) {
        if (!RecordCategories.isAnnualTaxRenewal(recordCategory) || payments == null || payments.isEmpty()) {
            return null;
        }
        return payments.stream()
                .map(TaxPaymentEntity::getTotalAmountDue)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public static TaxPaymentEntity findInstallment(List<TaxPaymentEntity> payments, int installmentNo) {
        if (payments == null) {
            return null;
        }
        return payments.stream()
                .filter(p -> installmentNo == Objects.requireNonNullElse(resolveInstallmentNo(p), -1))
                .findFirst()
                .orElse(null);
    }

    public static boolean isAnnualFullyPaid(List<TaxPaymentEntity> payments) {
        if (payments == null || payments.isEmpty()) {
            return false;
        }
        return payments.stream().allMatch(p -> "PAID".equalsIgnoreCase(p.getPaymentStatus()));
    }

    public static LocalDate dueDateForInstallment(int taxYear, int installmentNo) {
        if (installmentNo == 1) {
            return LocalDate.of(taxYear, AnnualTaxConstants.INSTALLMENT_1_DUE_MONTH,
                    AnnualTaxConstants.INSTALLMENT_1_DUE_DAY);
        }
        return LocalDate.of(taxYear, AnnualTaxConstants.INSTALLMENT_2_DUE_MONTH,
                AnnualTaxConstants.INSTALLMENT_2_DUE_DAY);
    }

    public static List<TaxPaymentEntity> sortByInstallment(List<TaxPaymentEntity> payments) {
        return payments.stream()
                .sorted(Comparator.comparing(
                        p -> Objects.requireNonNullElse(resolveInstallmentNo(p), 99)))
                .toList();
    }
}
