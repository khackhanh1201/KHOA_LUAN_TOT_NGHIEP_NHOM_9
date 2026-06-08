package com.thanglong.landtax.usecase.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO phan hoi sau khi nop to khai thue dat.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaxDeclarationResponse {

    private Integer recordId;
    private Integer citizenId;
    private Integer parcelId;
    private BigDecimal declaredArea;
    private String declaredUsage;
    private String status;                      // mapped from RecordEntity
    private String declarationNotes;
    private LocalDateTime createdAt;

    private String recordCategory;
    
    // Thống tin từ bảng land_parcels
    private String parcelNumber;
    private String mapSheetNumber;
    private java.math.BigDecimal areaSize;
    private String usageDuration;
    private String usageType;
    private String address;
    private String usageOrigin;
    private String gcnBookNumber;
    private String certificateNumber;
    private String attachedHouse;
    private String attachedOther;

    // Thông tin từ bảng land_types
    private String landTypeName;
}
