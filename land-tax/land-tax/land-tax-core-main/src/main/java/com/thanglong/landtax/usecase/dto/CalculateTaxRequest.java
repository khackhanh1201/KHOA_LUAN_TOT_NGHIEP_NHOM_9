package com.thanglong.landtax.usecase.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CalculateTaxRequest {
    private Integer areaId;
    private Integer landTypeId;
    private Double declaredArea;
    /** Năm thuế để tra cứu miễn giảm; mặc định năm hiện tại nếu null. */
    private Integer taxYear;
}
