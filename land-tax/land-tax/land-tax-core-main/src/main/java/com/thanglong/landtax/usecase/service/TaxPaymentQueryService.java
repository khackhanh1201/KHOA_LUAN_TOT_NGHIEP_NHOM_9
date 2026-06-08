package com.thanglong.landtax.usecase.service;

import com.thanglong.landtax.domain.RecordCategories;
import com.thanglong.landtax.domain.service.TaxPenaltyService;
import com.thanglong.landtax.domain.service.TaxPenaltyService.PenaltyResult;
import com.thanglong.landtax.infrastructure.adapter.persistence.entity.RecordEntity;
import com.thanglong.landtax.infrastructure.adapter.persistence.entity.TaxPaymentEntity;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.RecordJpaRepository;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.TaxPaymentJpaRepository;
import com.thanglong.landtax.usecase.dto.TaxPaymentResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TaxPaymentQueryService {

    private final TaxPaymentJpaRepository taxPaymentJpaRepository;
    private final RecordJpaRepository recordJpaRepository;
    private final TaxPenaltyService taxPenaltyService;

    @Transactional
    public TaxPaymentResponseDTO toResponse(TaxPaymentEntity payment) {
        String before = payment.getPaymentStatus();
        taxPenaltyService.refreshOverdueStatus(payment);
        if (before != null && !before.equals(payment.getPaymentStatus())) {
            taxPaymentJpaRepository.save(payment);
        }
        return buildResponse(payment);
    }

    @Transactional
    public List<TaxPaymentResponseDTO> toResponseList(List<TaxPaymentEntity> payments) {
        return payments.stream().map(this::toResponse).toList();
    }

    public TaxPaymentResponseDTO buildResponse(TaxPaymentEntity payment) {
        PenaltyResult penalty = taxPenaltyService.resolveForPayment(payment);
        BigDecimal base = payment.getTotalAmountDue() != null
                ? payment.getTotalAmountDue()
                : BigDecimal.ZERO;

        String recordCategory = resolveRecordCategory(payment.getRecordId());
        Integer installmentNo = TaxInstallmentHelper.resolveInstallmentNo(payment);
        String installmentLabel = TaxInstallmentHelper.resolveInstallmentLabel(payment, recordCategory);
        BigDecimal annualTaxTotal = null;
        if (RecordCategories.isAnnualTaxRenewal(recordCategory) && payment.getRecordId() != null) {
            List<TaxPaymentEntity> siblings = taxPaymentJpaRepository.findByRecordId(payment.getRecordId());
            annualTaxTotal = TaxInstallmentHelper.sumAnnualTaxTotal(siblings, recordCategory);
        }

        return TaxPaymentResponseDTO.builder()
                .payId(payment.getPayId())
                .recordId(payment.getRecordId())
                .landParcelId(payment.getLandParcelId())
                .taxYear(payment.getTaxYear())
                .totalAmountDue(base)
                .penaltyAmount(penalty.penaltyAmount())
                .totalPayable(penalty.totalPayable(base))
                .recordCategory(recordCategory)
                .installmentNo(installmentNo)
                .installmentLabel(installmentLabel)
                .annualTaxTotal(annualTaxTotal)
                .overdueDays(penalty.overdueDays())
                .overdue(penalty.overdueDays() > 0)
                .dueDate(payment.getDueDate())
                .paymentStatus(payment.getPaymentStatus())
                .transactionCode(payment.getTransactionCode())
                .paidAt(payment.getPaidAt())
                .build();
    }

    private String resolveRecordCategory(Integer recordId) {
        if (recordId == null) {
            return null;
        }
        Optional<RecordEntity> record = recordJpaRepository.findById(recordId);
        return record.map(RecordEntity::getRecordCategory).orElse(null);
    }
}
