const STATUS_LABELS = {
  SUBMITTED: 'Đã nộp',
  PENDING: 'Chờ xử lý',
  PROCESSING: 'Đang xử lý',
  VERIFIED: 'Đã xác minh',
  APPROVED: 'Đã giải quyết',
  COMPLETED: 'Đã hoàn thành',
  REJECTED: 'Từ chối',
  CANCELLED: 'Đã hủy',
  NEED_MORE_DOCS: 'Bổ sung hồ sơ',
  RESOLVED: 'Đã giải quyết',
};

export const formatStatus = (status) => STATUS_LABELS[status] || status || '—';

export const formatDateTime = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export const buildFallbackFileName = (reportName) => {
  const base = (reportName || 'Bao_cao_dia_chinh').trim().replace(/[\\/:*?"<>|]/g, '').replace(/\s+/g, '_');
  return base.toLowerCase().endsWith('.xlsx') ? base : `${base}.xlsx`;
};

export const formatShortCount = (n) => {
  const v = Number(n) || 0;
  if (v >= 1000) return `${(v / 1000).toFixed(1)}k`;
  return String(v);
};

export const statsReducer = (state, action) => {
  switch (action.type) {
    case 'reset':
      return { stats: null, error: null, status: 'loading' };
    case 'success':
      return { stats: action.stats, error: null, status: 'ready' };
    case 'error':
      return { stats: null, error: action.message, status: 'error' };
    default:
      return state;
  }
};

const DEFAULT_FILTERS = {
  reportType: 'all',
  period: 'thisYear',
  area: 'all',
};

const DEFAULT_EXPORT_FORM = {
  reportName: '',
  reportType: 'all',
  period: 'thisYear',
  area: 'all',
};

export const PAGE_INITIAL_STATE = {
  wardOptions: [],
  wardLabelMap: {},
  filters: { ...DEFAULT_FILTERS },
  isExportModalOpen: false,
  exporting: false,
  exportForm: { ...DEFAULT_EXPORT_FORM },
};

export const pageReducer = (state, action) => {
  switch (action.type) {
    case 'patch':
      return { ...state, ...action.payload };
    case 'patchExportForm':
      return { ...state, exportForm: { ...state.exportForm, ...action.payload } };
    case 'setWardData':
      return {
        ...state,
        wardOptions: action.wardOptions,
        wardLabelMap: action.wardLabelMap,
      };
    case 'openExportModal':
      return {
        ...state,
        exportForm: {
          reportName: '',
          reportType: state.filters.reportType,
          period: state.filters.period,
          area: state.filters.area,
        },
        isExportModalOpen: true,
      };
    case 'closeExportModal':
      return { ...state, isExportModalOpen: false };
    default:
      return state;
  }
};

export const computeChartData = (stats) => {
  const changeSubtext =
    stats?.changePercentVsPreviousPeriod != null
      ? `${stats.changePercentVsPreviousPeriod >= 0 ? '+' : ''}${stats.changePercentVsPreviousPeriod}% so với kỳ trước`
      : 'Chưa có dữ liệu kỳ trước để so sánh';

  const resolvedSubtext =
    stats?.totalReceived > 0
      ? `Tỷ lệ hoàn thành ${stats.completionRate ?? Math.round((stats.totalResolved / stats.totalReceived) * 100)}%`
      : 'Chưa có hồ sơ trong kỳ';

  const monthlyTrend = stats?.monthlyTrend?.length === 12
    ? stats.monthlyTrend
    : Array.from({ length: 12 }, (_, i) => ({ month: i + 1, received: 0, resolved: 0 }));

  const maxMonthly = Math.max(...monthlyTrend.map((d) => d.received), 0);
  const maxMonthlyVal = maxMonthly > 0 ? maxMonthly : 1;
  const yTicks = [maxMonthlyVal, maxMonthlyVal * 0.75, maxMonthlyVal * 0.5, maxMonthlyVal * 0.25, 0];
  const linePoints = monthlyTrend.map((d, i) => ({
    x: 40 + i * 40,
    y: 125 - (d.received / maxMonthlyVal) * 110,
    amount: d.received,
  }));
  const linePathD = linePoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  const top5Areas = (stats?.areaStats || [])
    .toSorted((a, b) => b.total - a.total)
    .slice(0, 5);
  const maxAreaTotal = Math.max(...top5Areas.map((a) => a.total), 0);
  const maxAreaVal = maxAreaTotal > 0 ? maxAreaTotal : 1;
  const barTicks = [maxAreaVal, Math.ceil(maxAreaVal * 0.67), Math.ceil(maxAreaVal * 0.33), 0];

  const totalForDonut = stats?.totalReceived || 0;
  const donutTotal = totalForDonut || 1;
  const pctResolved = (stats?.totalResolved || 0) / donutTotal * 100;
  const pctProcessing = (stats?.totalProcessing || 0) / donutTotal * 100;
  const pctOverdue = (stats?.totalOverdue || 0) / donutTotal * 100;
  const pctOther = Math.max(0, 100 - pctResolved - pctProcessing - pctOverdue);
  const completionRate = stats?.completionRate ?? (totalForDonut ? Math.round(pctResolved) : 0);

  const r = 70;
  const circ = 2 * Math.PI * r;
  const lenResolved = (pctResolved / 100) * circ;
  const lenProcessing = (pctProcessing / 100) * circ;
  const lenOverdue = (pctOverdue / 100) * circ;
  const lenOther = (pctOther / 100) * circ;
  let angle = -90;
  const angleResolved = angle;
  angle += (pctResolved / 100) * 360;
  const angleProcessing = angle;
  angle += (pctProcessing / 100) * 360;
  const angleOverdue = angle;
  angle += (pctOverdue / 100) * 360;
  const angleOther = angle;

  return {
    changeSubtext,
    resolvedSubtext,
    monthlyTrend,
    maxMonthly,
    maxMonthlyVal,
    yTicks,
    linePoints,
    linePathD,
    top5Areas,
    maxAreaVal,
    barTicks,
    pctResolved,
    pctProcessing,
    pctOverdue,
    pctOther,
    completionRate,
    circ,
    lenResolved,
    lenProcessing,
    lenOverdue,
    lenOther,
    angleResolved,
    angleProcessing,
    angleOverdue,
    angleOther,
  };
};
