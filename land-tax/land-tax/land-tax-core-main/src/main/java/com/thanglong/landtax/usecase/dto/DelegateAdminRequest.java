package com.thanglong.landtax.usecase.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DelegateAdminRequest {
    private String currentAdminCccd;
    private Integer currentAdminAccountId;
    private String delegateeCccd;
    private Integer delegateeAccountId;
}
