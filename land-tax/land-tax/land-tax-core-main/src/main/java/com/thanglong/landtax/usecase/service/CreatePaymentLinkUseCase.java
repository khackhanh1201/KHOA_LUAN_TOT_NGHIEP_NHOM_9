package com.thanglong.landtax.usecase.service;

import com.thanglong.landtax.domain.RecordCategories;
import com.thanglong.landtax.domain.service.TaxPenaltyService;
import com.thanglong.landtax.domain.service.TaxPenaltyService.PenaltyResult;
import com.thanglong.landtax.infrastructure.adapter.external.PayOSAdapter;
import com.thanglong.landtax.infrastructure.adapter.persistence.entity.TaxPaymentEntity;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.TaxPaymentJpaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Use case tao link thanh toan truc tuyen qua PayOS.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings("null")
public class CreatePaymentLinkUseCase {

    private static final Set<String> PAYABLE_STATUSES = Set.of("AWAITING_PAYMENT", "OVERDUE");

    private final TaxPaymentJpaRepository taxPaymentJpaRepository;
    private final PayOSAdapter payOSAdapter;
    private final com.thanglong.landtax.infrastructure.adapter.persistence.jpa.RecordJpaRepository recordJpaRepository;
    private final com.thanglong.landtax.infrastructure.adapter.persistence.jpa.CitizenLocalJpaRepository citizenLocalJpaRepository;
    private final TaxPaymentAmountService taxPaymentAmountService;
    private final TaxPenaltyService taxPenaltyService;

    @Value("${payos.return-url:http://localhost:5173/payment/success}")
    private String returnUrl;

    @Value("${payos.cancel-url:http://localhost:5173/payment/cancel}")
    private String cancelUrl;

    @Value("${payos.receiver.bank-name:}")
    private String receiverBankName;

    @Value("${payos.receiver.account-name:}")
    private String receiverAccountName;

    @Value("${payos.receiver.account-number:}")
    private String receiverAccountNumber;

    @Transactional
    public Map<String, Object> createPaymentLink(Integer payId) {

        TaxPaymentEntity payment = taxPaymentJpaRepository.findById(payId)
                .orElseThrow(() -> new RuntimeException("Payment record not found: " + payId));

        taxPaymentAmountService.refreshPaymentAmount(payment);
        taxPenaltyService.refreshOverdueStatus(payment);
        taxPaymentJpaRepository.save(payment);

        String status = payment.getPaymentStatus();
        if (!PAYABLE_STATUSES.contains(status)) {
            throw new IllegalStateException(
                    "Chỉ được tạo link thanh toán khi trạng thái là AWAITING_PAYMENT hoặc OVERDUE. Hiện tại: "
                            + status);
        }

        if (payment.getTotalAmountDue() == null
                || payment.getTotalAmountDue().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalStateException("Số tiền thanh toán phải lớn hơn 0.");
        }

        validateAnnualInstallmentOrder(payment);

        org.springframework.security.core.Authentication authentication =
                org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null) {
            String currentUsername = authentication.getName();
            boolean isAdminOrOfficer = authentication.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_TAX_OFFICER")
                            || a.getAuthority().equals("ROLE_ADMIN"));

            if (!isAdminOrOfficer) {
                if (payment.getRecordId() == null) {
                    throw new RuntimeException("Payment is not linked to any record, cannot verify permissions.");
                }

                com.thanglong.landtax.infrastructure.adapter.persistence.entity.RecordEntity record =
                        recordJpaRepository.findById(payment.getRecordId())
                                .orElseThrow(() -> new RuntimeException("Linked record not found."));
                com.thanglong.landtax.infrastructure.adapter.persistence.entity.CitizenLocalEntity citizen =
                        citizenLocalJpaRepository.findById(record.getCitizenId())
                                .orElseThrow(() -> new RuntimeException("Citizen info not found."));

                if (!citizen.getCccdNumber().equals(currentUsername)) {
                    throw new org.springframework.security.access.AccessDeniedException(
                            "You do not have permission to create a payment link for this tax amount.");
                }
            }
        }

        long orderCode = (long) payId * 10000 + (System.currentTimeMillis() % 10000);

        BigDecimal baseAmount = payment.getTotalAmountDue();
        PenaltyResult penalty = taxPenaltyService.calculate(
                baseAmount, payment.getDueDate(), LocalDate.now());
        BigDecimal totalPayable = penalty.totalPayable(baseAmount);
        long amount = totalPayable.longValue();

        // PayOS: mô tả tối đa 9 ký tự với tài khoản ngân hàng không liên kết trực tiếp
        String description = String.format("T%d", payId);
        if (description.length() > 9) {
            description = description.substring(0, 9);
        }

        String effectiveReturnUrl = returnUrl.contains("?")
                ? returnUrl + "&payId=" + payId
                : returnUrl + "?payId=" + payId;

        PayOSAdapter.PaymentLinkResult result = payOSAdapter.createPaymentLink(
                orderCode,
                amount,
                description,
                effectiveReturnUrl,
                cancelUrl
        );

        payment.setTransactionCode(String.valueOf(orderCode));
        taxPaymentJpaRepository.save(payment);

        log.info("Payment link created: payId={}, orderCode={}, base={}, penalty={}, total={}",
                payId, orderCode, baseAmount, penalty.penaltyAmount(), totalPayable);

        return Map.ofEntries(
                Map.entry("success", true),
                Map.entry("payId", payId),
                Map.entry("orderCode", result.getOrderCode()),
                Map.entry("amount", result.getAmount()),
                Map.entry("baseAmount", baseAmount.longValue()),
                Map.entry("penaltyAmount", penalty.penaltyAmount().longValue()),
                Map.entry("overdueDays", penalty.overdueDays()),
                Map.entry("totalPayable", totalPayable.longValue()),
                Map.entry("checkoutUrl", result.getCheckoutUrl()),
                Map.entry("qrCode", result.getQrCode()),
                Map.entry("description", result.getDescription()),
                Map.entry("bankName", receiverBankName),
                Map.entry("accountName", receiverAccountName),
                Map.entry("accountNumber", receiverAccountNumber),
                Map.entry("message", "Payment link created successfully")
        );
    }

    private void validateAnnualInstallmentOrder(TaxPaymentEntity payment) {
        if (payment.getRecordId() == null) {
            return;
        }
        var record = recordJpaRepository.findById(payment.getRecordId()).orElse(null);
        if (record == null || !RecordCategories.isAnnualTaxRenewal(record.getRecordCategory())) {
            return;
        }
        Integer installmentNo = TaxInstallmentHelper.resolveInstallmentNo(payment);
        if (installmentNo == null || installmentNo != 2) {
            return;
        }
        List<TaxPaymentEntity> payments = taxPaymentJpaRepository.findByRecordId(payment.getRecordId());
        TaxPaymentEntity installment1 = TaxInstallmentHelper.findInstallment(payments, 1);
        if (installment1 != null && !"PAID".equalsIgnoreCase(installment1.getPaymentStatus())) {
            throw new IllegalStateException(
                    "Vui lòng thanh toán Kỳ 1 (50%) trước khi nộp Kỳ 2.");
        }
    }
}
