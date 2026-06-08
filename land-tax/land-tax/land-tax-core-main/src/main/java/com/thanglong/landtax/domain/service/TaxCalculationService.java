package com.thanglong.landtax.domain.service;

import com.thanglong.landtax.domain.constant.TaxRateConstants;
import org.springframework.stereotype.Service;

@Service
public class TaxCalculationService {

    public double calculateTax(double area, double pricePerM2) {
        return calculateTax(area, pricePerM2, TaxRateConstants.LIMIT_AREA);
    }

    /**
     * @param limitArea han muc dat o (m2) theo dia phuong — tu areas.land_quota
     */
    public double calculateTax(double area, double pricePerM2, double limitArea) {
        double limit = limitArea > 0 ? limitArea : TaxRateConstants.LIMIT_AREA;
        double tax = 0;

        if (area <= limit) {
            tax = area * pricePerM2 * TaxRateConstants.RATE_TIER_1;
        } else if (area <= limit * (1 + TaxRateConstants.TIER_2_THRESHOLD_MULTIPLIER)) {
            // Phần trong hạn mức + Phần vượt không quá 3 lần
            tax = (limit * pricePerM2 * TaxRateConstants.RATE_TIER_1) +
                  ((area - limit) * pricePerM2 * TaxRateConstants.RATE_TIER_2);
        } else {
            // Phần trong hạn mức + Bậc 2 (3 lần) + Bậc 3 (phần còn lại)
            double tier2Max = limit * TaxRateConstants.TIER_2_THRESHOLD_MULTIPLIER;
            tax = (limit * pricePerM2 * TaxRateConstants.RATE_TIER_1) +
                  (tier2Max * pricePerM2 * TaxRateConstants.RATE_TIER_2) +
                  ((area - limit - tier2Max) * pricePerM2 * TaxRateConstants.RATE_TIER_3);
        }
        return tax;
    }
};