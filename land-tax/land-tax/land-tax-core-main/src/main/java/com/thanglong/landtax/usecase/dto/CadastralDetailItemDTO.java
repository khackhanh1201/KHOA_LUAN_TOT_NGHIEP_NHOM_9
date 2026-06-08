package com.thanglong.landtax.usecase.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CadastralDetailItemDTO {
    private Integer id;
    private String code;
    private String itemType;
    private String category;
    private String status;
    private LocalDateTime submittedAt;
    private String unit;
    private boolean overdue;
}
