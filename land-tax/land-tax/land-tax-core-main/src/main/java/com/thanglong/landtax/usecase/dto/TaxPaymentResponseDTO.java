package com.thanglong.landtax.usecase.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaxPaymentResponseDTO {
    private Integer payId;
    private Integer recordId;
    private Integer landParcelId;
    private Integer taxYear;
    /** Tiền thuế gốc (sau miễn giảm nếu có) — cột tax_payments.total_amount_due. */
    private BigDecimal totalAmountDue;
    /** Tiền phạt chậm nộp — tính động, không lưu DB. */
    private BigDecimal penaltyAmount;
    /** Tổng phải nộp = totalAmountDue + penaltyAmount. */
    private BigDecimal totalPayable;
    /** records.record_category — ANNUAL_TAX_RENEWAL, TAX_DECLARATION, ... */
    private String recordCategory;
    /** 1 hoặc 2 — suy ra từ due_date (31/05 / 31/10). */
    private Integer installmentNo;
    private String installmentLabel;
    /** Tổng thuế cả năm (cộng 2 kỳ) — chỉ ANNUAL_TAX_RENEWAL. */
    private BigDecimal annualTaxTotal;
    private Integer overdueDays;
    private Boolean overdue;
    private LocalDate dueDate;
    private String paymentStatus;
    private String transactionCode;
    private LocalDateTime paidAt;
}
