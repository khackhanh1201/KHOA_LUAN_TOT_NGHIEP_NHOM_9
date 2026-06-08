package com.thanglong.landtax.usecase.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CadastralAreaStatDTO {
    private String unit;
    private String wardCode;
    private long total;
    private long resolved;
    private long pending;
    private int rate;
}
