package com.thanglong.landtax.domain.service;

import com.thanglong.landtax.domain.constant.TaxRateConstants;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.AreaJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

/**
 * Tra cuu han muc dat o theo khu vuc (areas.land_quota).
 * Fallback {@link TaxRateConstants#LIMIT_AREA} neu chua cau hinh.
 */
@Service
@RequiredArgsConstructor
public class LandQuotaResolver {

    private final AreaJpaRepository areaJpaRepository;

    public double resolveLimitArea(Integer areaId) {
        if (areaId == null) {
            return TaxRateConstants.LIMIT_AREA;
        }
        return areaJpaRepository.findById(areaId)
                .map(a -> a.getLandQuota())
                .filter(q -> q != null && q.compareTo(BigDecimal.ZERO) > 0)
                .map(BigDecimal::doubleValue)
                .orElse(TaxRateConstants.LIMIT_AREA);
    }
}
