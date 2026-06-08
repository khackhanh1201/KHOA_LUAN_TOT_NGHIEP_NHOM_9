package com.thanglong.landtax.usecase.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class ReconciliationRowResponse {
    private Integer logId;
    private Integer payId;
    private String invoiceCode;
    private String orderCode;
    private boolean hasPayosSignal;
    private BigDecimal payosAmount;
    private String payosDescription;
    private String mst;
    private String payerName;
    private BigDecimal systemBase;
    private BigDecimal systemPenalty;
    private BigDecimal systemTotal;
    private String systemStatusLabel;
    /** MATCHED | AMOUNT_MISMATCH | MISSING_WEBHOOK | DISCREPANCY */
    private String reconciliationStatus;
    private String reconciliationLabel;
    private boolean needsAction;
}
