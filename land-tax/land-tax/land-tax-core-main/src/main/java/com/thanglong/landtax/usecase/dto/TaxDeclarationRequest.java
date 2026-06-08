package com.thanglong.landtax.usecase.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO cho yeu cau nop / cap nhat to khai thue dat.
 *
 * <p>Cong dan chi cap thong tin "khai bao" (declared_*); cac thong tin tinh
 * trong cua thua dat (parcel_number, area_size, address, ...) la du lieu
 * cua co quan dia chinh, KHONG bi ghi de qua API nay.</p>
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaxDeclarationRequest {

    /**
     * ID thua dat (FK -> land_parcels.land_parcel_id).
     * Bat buoc voi to khai thue thong thuong; voi LAND_OWNERSHIP_NEW co the tra cuu bang gcnBookNumber.
     */
    private Integer parcelId;

    /** So vao so cap GCN — dung khi khai bao dat moi (tra cuu thua chua co chu). */
    private String gcnBookNumber;

    /** Dien tich nguoi dan ke khai (m2) - bat buoc. */
    @NotNull(message = "Dien tich khai bao khong duoc de trong")
    @Positive(message = "Dien tich khai bao phai lon hon 0")
    private BigDecimal declaredArea;

    /**
     * Muc dich su dung do nguoi dan ke khai (vd "Dat o", "Trong lua").
     * Neu de trong, service se mac dinh theo {@code land_parcels.usage_type}.
     */
    private String declaredUsage;

    /** Ghi chu them khi ke khai (tuy chon). */
    private String declarationNotes;

    /**
     * Loai ho so (record_category). Default = {@code TAX_DECLARATION} neu khong truyen.
     * Cac gia tri kha c: TRANSFER, CHANGE_PURPOSE, ... (mo rong sau).
     */
    private String recordCategory;

    /** Danh sach ID tai lieu dinh kem da upload. */
    private List<Long> attachmentIds;
}
