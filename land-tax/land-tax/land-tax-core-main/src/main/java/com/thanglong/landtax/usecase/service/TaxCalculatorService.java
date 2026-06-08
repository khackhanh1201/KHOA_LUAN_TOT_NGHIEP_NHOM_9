package com.thanglong.landtax.usecase.service;

import com.thanglong.landtax.domain.constant.TaxRateConstants;
import com.thanglong.landtax.domain.service.LandQuotaResolver;
import com.thanglong.landtax.domain.service.TaxCalculationService;
import com.thanglong.landtax.domain.service.TaxPayableAmountService;
import com.thanglong.landtax.infrastructure.adapter.controller.exception.ResourceNotFoundException;
import com.thanglong.landtax.infrastructure.adapter.persistence.entity.LandPriceEntity;
import com.thanglong.landtax.infrastructure.adapter.persistence.entity.TaxExemptSubjectEntity;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.CitizenLocalJpaRepository;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.LandPriceJpaRepository;
import com.thanglong.landtax.usecase.dto.CalculateTaxRequest;
import com.thanglong.landtax.usecase.dto.CalculateTaxResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class TaxCalculatorService {

    private final LandPriceJpaRepository landPriceJpaRepository;
    private final TaxCalculationService taxCalculationService;
    private final TaxPayableAmountService taxPayableAmountService;
    private final CitizenLocalJpaRepository citizenLocalJpaRepository;
    private final LandQuotaResolver landQuotaResolver;

    @Transactional(readOnly = true)
    public CalculateTaxResponse calculateEstimatedTax(CalculateTaxRequest request, String cccd) {
        log.info("Calculating tax: areaId={}, landTypeId={}, declaredArea={}, taxYear={}",
                request.getAreaId(), request.getLandTypeId(), request.getDeclaredArea(), request.getTaxYear());

        if (request.getAreaId() == null || request.getLandTypeId() == null || request.getDeclaredArea() == null) {
            throw new IllegalArgumentException("Các trường areaId, landTypeId, declaredArea không được để trống");
        }

        LandPriceEntity landPrice = landPriceJpaRepository.findLatestPrice(request.getLandTypeId(), request.getAreaId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy đơn giá cho khu vực và loại đất này"));

        double unitPrice = landPrice.getUnitPrice().doubleValue();
        double limitArea = landQuotaResolver.resolveLimitArea(request.getAreaId());
        double grossDouble = taxCalculationService.calculateTax(
                request.getDeclaredArea(), unitPrice, limitArea);
        BigDecimal grossTax = BigDecimal.valueOf(grossDouble).setScale(2, RoundingMode.HALF_UP);

        int taxYear = request.getTaxYear() != null ? request.getTaxYear() : LocalDate.now().getYear();
        Integer citizenId = resolveCitizenId(cccd);

        BigDecimal payable = grossTax;
        Optional<TaxExemptSubjectEntity> approvedExempt = Optional.empty();
        if (citizenId != null) {
            approvedExempt = taxPayableAmountService.findApprovedExemption(citizenId, taxYear);
            payable = taxPayableAmountService.resolvePayableAmount(grossTax, citizenId, taxYear);
        }

        BigDecimal reduction = grossTax.subtract(payable).max(BigDecimal.ZERO);

        log.info("Tax calculation completed: unitPrice={}, gross={}, payable={}, reduction={}",
                unitPrice, grossTax, payable, reduction);

        return CalculateTaxResponse.builder()
                .unitPrice(unitPrice)
                .taxRate(TaxRateConstants.RATE_TIER_1)
                .grossTaxAmount(grossTax.doubleValue())
                .calculatedAmount(payable.doubleValue())
                .reductionAmount(reduction.doubleValue())
                .discountRate(approvedExempt
                        .map(e -> e.getDiscountRate() != null ? e.getDiscountRate().doubleValue() : null)
                        .orElse(null))
                .exemptionApplied(approvedExempt.isPresent())
                .taxYear(taxYear)
                .landQuotaLimit(limitArea)
                .build();
    }

    private Integer resolveCitizenId(String cccd) {
        if (cccd == null || cccd.isBlank()) {
            return null;
        }
        return citizenLocalJpaRepository.findByCccdNumber(cccd)
                .map(c -> c.getCitizenId())
                .orElse(null);
    }
}
