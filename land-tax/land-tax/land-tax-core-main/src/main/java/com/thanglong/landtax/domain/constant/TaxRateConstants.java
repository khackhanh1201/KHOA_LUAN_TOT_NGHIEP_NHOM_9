package com.thanglong.landtax.domain.constant;

public class TaxRateConstants {
    // Hạn mức đất ở tại Thanh Liệt (m2)
    public static final double LIMIT_AREA = 180.0;
    
    // Thuế suất (đổi từ % sang số thập phân)
    public static final double RATE_TIER_1 = 0.0003; // 0.03%
    public static final double RATE_TIER_2 = 0.0007; // 0.07%
    public static final double RATE_TIER_3 = 0.0015; // 0.15%
    
    // Hệ số bậc lũy tiến
    public static final double TIER_2_THRESHOLD_MULTIPLIER = 3.0; 
}
