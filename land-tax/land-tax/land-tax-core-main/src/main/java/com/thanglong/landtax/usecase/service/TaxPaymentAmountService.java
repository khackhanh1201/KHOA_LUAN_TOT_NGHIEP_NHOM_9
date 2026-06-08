package com.thanglong.landtax.usecase.service;

import com.thanglong.landtax.domain.RecordCategories;
import com.thanglong.landtax.domain.service.LandQuotaResolver;
import com.thanglong.landtax.domain.service.TaxCalculationService;
import com.thanglong.landtax.domain.service.TaxPayableAmountService;
import com.thanglong.landtax.infrastructure.adapter.controller.exception.ResourceNotFoundException;
import com.thanglong.landtax.infrastructure.adapter.persistence.entity.LandParcelEntity;
import com.thanglong.landtax.infrastructure.adapter.persistence.entity.LandPriceEntity;
import com.thanglong.landtax.infrastructure.adapter.persistence.entity.RecordEntity;
import com.thanglong.landtax.infrastructure.adapter.persistence.entity.TaxDeclarationEntity;
import com.thanglong.landtax.infrastructure.adapter.persistence.entity.TaxPaymentEntity;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.LandParcelJpaRepository;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.LandPriceJpaRepository;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.TaxDeclarationRepository;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.RecordJpaRepository;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.TaxPaymentJpaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

/**
 * Tính lại total_amount_due trên tax_payments (thuế lũy tiến ± miễn giảm đã duyệt).
 */
@Service
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings("null")
public class TaxPaymentAmountService {

    private final TaxPaymentJpaRepository taxPaymentJpaRepository;
    private final RecordJpaRepository recordJpaRepository;
    private final LandParcelJpaRepository landParcelJpaRepository;
    private final LandPriceJpaRepository landPriceJpaRepository;
    private final TaxDeclarationRepository taxDeclarationRepository;
    private final TaxCalculationService taxCalculationService;
    private final TaxPayableAmountService taxPayableAmountService;
    private final LandQuotaResolver landQuotaResolver;

    public BigDecimal computeGrossTax(LandParcelEntity parcel, BigDecimal declaredArea) {
        double area = resolveAreaForTax(parcel, declaredArea);
        LandPriceEntity landPrice = landPriceJpaRepository
                .findLatestPrice(parcel.getLandTypeId(), parcel.getAreaId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy đơn giá cho khu vực và loại đất này"));
        double limitArea = landQuotaResolver.resolveLimitArea(parcel.getAreaId());
        double tax = taxCalculationService.calculateTax(
                area, landPrice.getUnitPrice().doubleValue(), limitArea);
        return BigDecimal.valueOf(tax).setScale(2, RoundingMode.HALF_UP);
    }

    private double resolveAreaForTax(LandParcelEntity parcel, BigDecimal declaredArea) {
        if (declaredArea != null && declaredArea.compareTo(BigDecimal.ZERO) > 0) {
            return declaredArea.doubleValue();
        }
        if (parcel.getAreaSize() == null) {
            throw new RuntimeException("Thua dat khong co dien tich de tinh thue.");
        }
        return parcel.getAreaSize().doubleValue();
    }

    @Transactional
    public BigDecimal refreshPaymentAmount(TaxPaymentEntity payment) {
        if (payment.getRecordId() == null) {
            return payment.getTotalAmountDue();
        }
        RecordEntity record = recordJpaRepository.findById(payment.getRecordId())
                .orElseThrow(() -> new RuntimeException("Record not found: " + payment.getRecordId()));
        LandParcelEntity parcel = landParcelJpaRepository.findById(payment.getLandParcelId())
                .orElseThrow(() -> new RuntimeException("Land parcel not found: " + payment.getLandParcelId()));

        BigDecimal declaredArea = taxDeclarationRepository.findByRecordId(payment.getRecordId())
                .map(TaxDeclarationEntity::getDeclaredArea)
                .orElse(null);

        int taxYear = payment.getTaxYear() != null ? payment.getTaxYear() : java.time.LocalDate.now().getYear();
        try {
            BigDecimal gross = computeGrossTax(parcel, declaredArea);
            BigDecimal payable = taxPayableAmountService.resolvePayableAmount(gross, record.getCitizenId(), taxYear);
            if (RecordCategories.isAnnualTaxRenewal(record.getRecordCategory())) {
                payable = payable.divide(BigDecimal.valueOf(2), 2, RoundingMode.HALF_UP);
            }
            payment.setTotalAmountDue(payable);
            taxPaymentJpaRepository.save(payment);
            log.info("Refreshed tax payment payId={}: gross={}, payable={}", payment.getPayId(), gross, payable);
            return payable;
        } catch (RuntimeException ex) {
            if (payment.getTotalAmountDue() != null
                    && payment.getTotalAmountDue().compareTo(BigDecimal.ZERO) > 0) {
                log.warn("Cannot refresh payId={} ({}), keeping total_amount_due={}",
                        payment.getPayId(), ex.getMessage(), payment.getTotalAmountDue());
                return payment.getTotalAmountDue();
            }
            throw ex;
        }
    }

    @Transactional
    public void refreshPaymentsForCitizenYear(Integer citizenId, Integer taxYear) {
        List<TaxPaymentEntity> payments = taxPaymentJpaRepository.findAdjustableByCitizenIdAndTaxYear(
                citizenId, taxYear);
        for (TaxPaymentEntity payment : payments) {
            refreshPaymentAmount(payment);
        }
    }
}
