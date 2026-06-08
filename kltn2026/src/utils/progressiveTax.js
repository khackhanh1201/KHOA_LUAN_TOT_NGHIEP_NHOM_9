/** Khớp TaxCalculationService (BE). Hạn mức mặc định nếu API chưa trả landQuotaLimit. */
const DEFAULT_TAX_LIMIT_AREA = 180;
const TAX_RATE_TIER_1 = 0.0003;
const TAX_RATE_TIER_2 = 0.0007;
const TAX_RATE_TIER_3 = 0.0015;
const TIER_2_MULTIPLIER = 3;

const resolveLimit = (limitArea) => {
  const n = Number(limitArea);
  return n > 0 ? n : DEFAULT_TAX_LIMIT_AREA;
};

const formatRatePercent = (rate) => {
  const pct = rate * 100;
  return pct % 1 === 0 ? String(pct) : pct.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
};

export const calcProgressiveTax = (area, unitPrice, limitArea = DEFAULT_TAX_LIMIT_AREA) => {
  const a = Number(area);
  const p = Number(unitPrice);
  if (!a || !p || a <= 0) return 0;

  const limit = resolveLimit(limitArea);
  const tier2MaxArea = limit * TIER_2_MULTIPLIER;

  if (a <= limit) {
    return a * p * TAX_RATE_TIER_1;
  }
  if (a <= limit + tier2MaxArea) {
    return limit * p * TAX_RATE_TIER_1 + (a - limit) * p * TAX_RATE_TIER_2;
  }
  return (
    limit * p * TAX_RATE_TIER_1 +
    tier2MaxArea * p * TAX_RATE_TIER_2 +
    (a - limit - tier2MaxArea) * p * TAX_RATE_TIER_3
  );
};

/** Các dòng bậc thuế để hiển thị modal / chi tiết. */
export const buildProgressiveBreakdown = (area, unitPrice, limitArea = DEFAULT_TAX_LIMIT_AREA) => {
  const a = Number(area);
  const p = Number(unitPrice);
  if (!a || !p || a <= 0) return [];

  const limit = resolveLimit(limitArea);
  const tier2MaxArea = limit * TIER_2_MULTIPLIER;
  const lines = [];

  const tier1Area = Math.min(a, limit);
  if (tier1Area > 0) {
    lines.push({
      tier: 1,
      label: `Bậc 1 (trong hạn mức ≤ ${limit.toLocaleString('vi-VN')} m²)`,
      area: tier1Area,
      ratePercent: formatRatePercent(TAX_RATE_TIER_1),
      lineAmount: tier1Area * p * TAX_RATE_TIER_1,
      formula: `${tier1Area.toLocaleString('vi-VN')} m² × ${p.toLocaleString('vi-VN')} đ/m² × ${formatRatePercent(TAX_RATE_TIER_1)}%`,
    });
  }

  if (a > limit) {
    const tier2Area = Math.min(a - limit, tier2MaxArea);
    if (tier2Area > 0) {
      lines.push({
        tier: 2,
        label: 'Bậc 2 (vượt không quá 3 lần hạn mức)',
        area: tier2Area,
        ratePercent: formatRatePercent(TAX_RATE_TIER_2),
        lineAmount: tier2Area * p * TAX_RATE_TIER_2,
        formula: `${tier2Area.toLocaleString('vi-VN')} m² × ${p.toLocaleString('vi-VN')} đ/m² × ${formatRatePercent(TAX_RATE_TIER_2)}%`,
      });
    }
  }

  if (a > limit + tier2MaxArea) {
    const tier3Area = a - limit - tier2MaxArea;
    lines.push({
      tier: 3,
      label: 'Bậc 3 (vượt trên 3 lần hạn mức)',
      area: tier3Area,
      ratePercent: formatRatePercent(TAX_RATE_TIER_3),
      lineAmount: tier3Area * p * TAX_RATE_TIER_3,
      formula: `${tier3Area.toLocaleString('vi-VN')} m² × ${p.toLocaleString('vi-VN')} đ/m² × ${formatRatePercent(TAX_RATE_TIER_3)}%`,
    });
  }

  return lines;
};

export const progressiveTaxRateLabel = (area, limitArea = DEFAULT_TAX_LIMIT_AREA) => {
  const a = Number(area);
  const limit = resolveLimit(limitArea);
  if (!a || a <= 0) return '—';
  if (a <= limit) return '0,03%';
  return 'Lũy tiến (0,03% – 0,15%)';
};

/**
 * Số tiền hiển thị phải nộp: có miễn giảm đã duyệt → sau miễn; không → thuế tính lũy tiến.
 */
const resolvePayableAmount = ({
  taxBeforeExempt,
  discountRate = 0,
  hasApprovedExemption = false,
  fallbackAmount = 0,
}) => {
  if (hasApprovedExemption && Number(discountRate) >= 100) return 0;
  if (taxBeforeExempt == null || !Number.isFinite(Number(taxBeforeExempt))) {
    return Number(fallbackAmount ?? 0);
  }
  const before = Math.round(Number(taxBeforeExempt));
  if (hasApprovedExemption && Number(discountRate) > 0) {
    return Math.max(0, Math.round((before * (100 - Number(discountRate))) / 100));
  }
  return before;
};
