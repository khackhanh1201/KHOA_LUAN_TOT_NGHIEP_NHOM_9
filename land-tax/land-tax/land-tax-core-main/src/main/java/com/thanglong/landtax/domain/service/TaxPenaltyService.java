package com.thanglong.landtax.domain.service;

import com.thanglong.landtax.infrastructure.adapter.persistence.entity.TaxPaymentEntity;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

/**
 * Tính tiền phạt chậm nộp: Tiền gốc × 0,03%/ngày × Số ngày quá hạn.
 * Số ngày quá hạn tính từ ngày sau hạn nộp (due_date) đến ngày tham chiếu.
 */
@Service
public class TaxPenaltyService {

    public static final BigDecimal PENALTY_RATE_PER_DAY = new BigDecimal("0.0003");

    public record PenaltyResult(int overdueDays, BigDecimal penaltyAmount) {
        public static PenaltyResult zero() {
            return new PenaltyResult(0, BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP));
        }

        public BigDecimal totalPayable(BigDecimal baseAmount) {
            BigDecimal base = baseAmount != null
                    ? baseAmount.setScale(2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;
            return base.add(penaltyAmount != null ? penaltyAmount : BigDecimal.ZERO)
                    .setScale(2, RoundingMode.HALF_UP);
        }
    }

    public PenaltyResult calculate(BigDecimal baseAmount, LocalDate dueDate, LocalDate asOfDate) {
        if (baseAmount == null || baseAmount.compareTo(BigDecimal.ZERO) <= 0
                || dueDate == null || asOfDate == null) {
            return PenaltyResult.zero();
        }
        int overdueDays = (int) ChronoUnit.DAYS.between(dueDate, asOfDate);
        if (overdueDays <= 0) {
            return PenaltyResult.zero();
        }
        BigDecimal penalty = baseAmount
                .multiply(PENALTY_RATE_PER_DAY)
                .multiply(BigDecimal.valueOf(overdueDays))
                .setScale(0, RoundingMode.HALF_UP);
        return new PenaltyResult(overdueDays, penalty);
    }

    /**
     * Phạt tính động — không lưu DB. PAID: theo paid_at; chưa trả: theo hôm nay.
     */
    public PenaltyResult resolveForPayment(TaxPaymentEntity payment) {
        if (payment == null || payment.getTotalAmountDue() == null) {
            return PenaltyResult.zero();
        }
        BigDecimal base = payment.getTotalAmountDue();
        LocalDate dueDate = payment.getDueDate();
        LocalDate asOfDate = "PAID".equalsIgnoreCase(payment.getPaymentStatus())
                ? resolvePaidDate(payment.getPaidAt())
                : LocalDate.now();
        return calculate(base, dueDate, asOfDate);
    }

    public boolean isOverdue(TaxPaymentEntity payment) {
        if (payment == null || payment.getDueDate() == null
                || "PAID".equalsIgnoreCase(payment.getPaymentStatus())) {
            return false;
        }
        return payment.getDueDate().isBefore(LocalDate.now());
    }

    public void refreshOverdueStatus(TaxPaymentEntity payment) {
        if (payment == null || payment.getPaymentStatus() == null) {
            return;
        }
        if ("PAID".equalsIgnoreCase(payment.getPaymentStatus())) {
            return;
        }
        if (!isOverdue(payment)) {
            return;
        }
        String status = payment.getPaymentStatus();
        if ("UNPAID".equals(status) || "AWAITING_PAYMENT".equals(status)) {
            payment.setPaymentStatus("OVERDUE");
        }
    }

    private static LocalDate resolvePaidDate(LocalDateTime paidAt) {
        return paidAt != null ? paidAt.toLocalDate() : LocalDate.now();
    }
}
