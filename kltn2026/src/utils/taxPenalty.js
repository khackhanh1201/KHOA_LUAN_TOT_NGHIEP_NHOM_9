/** Tiền phạt = Tiền gốc × 0,03%/ngày × Số ngày quá hạn */
const PENALTY_RATE_PER_DAY = 0.0003;

const calcPenalty = (base, dueDateStr, asOfDate = new Date()) => {
  if (!dueDateStr || !base || base <= 0) return { overdueDays: 0, penalty: 0 };

  const due = new Date(dueDateStr);
  if (isNaN(due.getTime())) return { overdueDays: 0, penalty: 0 };

  const dueMid = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  const ref = asOfDate instanceof Date ? asOfDate : new Date(asOfDate);
  const refMid = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate());

  const diffMs = refMid.getTime() - dueMid.getTime();
  if (diffMs <= 0) return { overdueDays: 0, penalty: 0 };

  const overdueDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const penalty = Math.round(base * PENALTY_RATE_PER_DAY * overdueDays);
  return { overdueDays, penalty };
};

export const resolveTotalPayable = (item) => {
  const base = Number(item?.totalAmountDue ?? item?.amount ?? item?.base ?? 0);
  const penalty = Number(item?.penaltyAmount ?? 0);
  if (item?.totalPayable != null && Number.isFinite(Number(item.totalPayable))) {
    return Number(item.totalPayable);
  }
  return base + penalty;
};
