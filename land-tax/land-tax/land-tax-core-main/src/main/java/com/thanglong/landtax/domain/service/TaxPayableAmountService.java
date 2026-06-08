package com.thanglong.landtax.domain.service;

import com.thanglong.landtax.infrastructure.adapter.persistence.entity.TaxExemptSubjectEntity;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.TaxExemptSubjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Optional;

/**
 * Tính số tiền thuế phải nộp sau khi áp dụng miễn giảm (nếu đã duyệt).
 */
@Service
@RequiredArgsConstructor
public class TaxPayableAmountService {

    private static final BigDecimal HUNDRED = new BigDecimal("100");

    private final TaxExemptSubjectRepository taxExemptSubjectRepository;

    public Optional<TaxExemptSubjectEntity> findApprovedExemption(Integer citizenId, int taxYear) {
        if (citizenId == null) {
            return Optional.empty();
        }
        return taxExemptSubjectRepository
                .findFirstByCitizenIdAndAppliedYearOrderByExemptIdDesc(citizenId, taxYear)
                .filter(e -> "APPROVED".equalsIgnoreCase(e.getStatus()));
    }

    /**
     * Có miễn giảm đã duyệt → trừ %; không có → giữ nguyên thuế gốc.
     */
    public BigDecimal resolvePayableAmount(BigDecimal grossTax, Integer citizenId, int taxYear) {
        if (grossTax == null) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        BigDecimal gross = grossTax.setScale(2, RoundingMode.HALF_UP);
        return findApprovedExemption(citizenId, taxYear)
                .map(e -> applyDiscount(gross, e.getDiscountRate()))
                .orElse(gross);
    }

    public BigDecimal applyDiscount(BigDecimal grossTax, BigDecimal discountRatePercent) {
        if (grossTax == null || grossTax.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        if (discountRatePercent == null || discountRatePercent.compareTo(BigDecimal.ZERO) <= 0) {
            return grossTax.setScale(2, RoundingMode.HALF_UP);
        }
        if (discountRatePercent.compareTo(HUNDRED) >= 0) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        BigDecimal factor = BigDecimal.ONE.subtract(
                discountRatePercent.divide(HUNDRED, 6, RoundingMode.HALF_UP));
        return grossTax.multiply(factor).setScale(2, RoundingMode.HALF_UP);
    }
}
