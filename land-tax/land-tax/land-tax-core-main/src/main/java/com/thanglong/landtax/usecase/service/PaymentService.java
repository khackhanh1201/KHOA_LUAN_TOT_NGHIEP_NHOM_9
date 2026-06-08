package com.thanglong.landtax.usecase.service;

import com.thanglong.landtax.infrastructure.adapter.persistence.entity.TaxPaymentEntity;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.TaxPaymentJpaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final TaxPaymentJpaRepository taxPaymentJpaRepository;

    /**
     * Sinh ma transactionCode ngau nhien va duy nhat khi hoa don/khoan thanh toan duoc tao.
     */
    public String generateTransactionCode(TaxPaymentEntity payment) {
        String code = "TX-" + UUID.randomUUID().toString().replaceAll("-", "").substring(0, 12).toUpperCase();
        payment.setTransactionCode(code);
        taxPaymentJpaRepository.save(payment);
        log.info("Generated transactionCode: {} for payId: {}", code, payment.getPayId());
        return code;
    }
}
