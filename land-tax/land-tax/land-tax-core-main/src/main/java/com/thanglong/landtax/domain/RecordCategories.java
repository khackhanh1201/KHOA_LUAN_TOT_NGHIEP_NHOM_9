package com.thanglong.landtax.domain;

/**
 * Ma loai ho so (records.record_category).
 */
public final class RecordCategories {

    public static final String TAX_DECLARATION = "TAX_DECLARATION";
    /** Phat hanh thue dat tu dong hang nam (cron 01/04). */
    public static final String ANNUAL_TAX_RENEWAL = "ANNUAL_TAX_RENEWAL";
    public static final String LAND_OWNERSHIP_NEW = "LAND_OWNERSHIP_NEW";
    /** Nhan hien thi tren FE (legacy). */
    public static final String LAND_OWNERSHIP_NEW_LABEL = "Khai báo đất sở hữu (Đất mới)";

    private RecordCategories() {
    }

    public static boolean isAnnualTaxRenewal(String category) {
        return ANNUAL_TAX_RENEWAL.equals(category);
    }

    public static boolean isLandOwnershipNew(String category) {
        if (category == null || category.isBlank()) {
            return false;
        }
        String c = category.trim();
        return LAND_OWNERSHIP_NEW.equals(c) || LAND_OWNERSHIP_NEW_LABEL.equals(c);
    }

    /** Luu DB thong nhat ma code. */
    public static String normalizeCategory(String category) {
        if (isLandOwnershipNew(category)) {
            return LAND_OWNERSHIP_NEW;
        }
        if (category == null || category.isBlank()) {
            return TAX_DECLARATION;
        }
        return category.trim();
    }
}
