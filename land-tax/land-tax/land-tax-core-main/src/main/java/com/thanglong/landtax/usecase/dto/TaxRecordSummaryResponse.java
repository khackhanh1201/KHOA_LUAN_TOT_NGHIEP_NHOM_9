package com.thanglong.landtax.usecase.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaxRecordSummaryResponse {
    private Integer recordId;
    private Integer citizenId;
    private Integer landParcelId;
    private String recordCategory;
    private String currentStatus;
    private LocalDateTime submittedAt;

    // Field FE TaxRecords.jsx đang dùng
    private String fullName;
    private String senderCccd;
    private String phoneNumber;
    private String address;

    private String landParcelNumber;
    private String mapSheetNumber;
    private BigDecimal area;
    private String landType;
    private String landAddress;

    private BigDecimal calculatedTaxAmount;

    // nested tùy chọn
    private BigDecimal declaredArea;
    private String declaredUsage;
}