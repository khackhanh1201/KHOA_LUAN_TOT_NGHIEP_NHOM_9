package com.thanglong.landtax.domain.constant;

/**
 * Hang so cho thuế dat tu dong hang nam (khong doi schema DB).
 * Phan ky nhan biet qua {@code due_date}: 31/05 = ky 1, 31/10 = ky 2.
 */
public final class AnnualTaxConstants {

    public static final int INSTALLMENT_1_DUE_MONTH = 5;
    public static final int INSTALLMENT_1_DUE_DAY = 31;
    public static final int INSTALLMENT_2_DUE_MONTH = 10;
    public static final int INSTALLMENT_2_DUE_DAY = 31;

    private AnnualTaxConstants() {
    }
}
