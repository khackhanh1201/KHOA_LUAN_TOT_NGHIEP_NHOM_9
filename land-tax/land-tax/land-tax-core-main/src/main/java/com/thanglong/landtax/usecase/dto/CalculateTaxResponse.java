package com.thanglong.landtax.usecase.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CalculateTaxResponse {
    private Double unitPrice;
    /** Thuế suất bậc 1 (0,03%) — tham chiếu hiển thị; thuế thực tế tính lũy tiến. */
    private Double taxRate;
    /** Số tiền phải nộp sau miễn giảm (nếu đã duyệt). */
    private Double calculatedAmount;
    /** Thuế gốc trước miễn giảm (lũy tiến). */
    private Double grossTaxAmount;
    /** Số tiền được giảm (chỉ khi miễn giảm APPROVED). */
    private Double reductionAmount;
    /** Tỷ lệ miễn giảm đã duyệt (%), null nếu không có. */
    private Double discountRate;
    /** true nếu có hồ sơ miễn giảm APPROVED cho năm thuế. */
    private Boolean exemptionApplied;
    private Integer taxYear;
    /** Hạn mức đất ở (m²) theo khu vực — dùng cho hiển thị lũy tiến. */
    private Double landQuotaLimit;
}
