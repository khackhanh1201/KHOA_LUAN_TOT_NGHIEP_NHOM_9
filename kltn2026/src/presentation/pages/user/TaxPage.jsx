import React, { useReducer, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import LandTaxLayout from '../../components/LandTaxLayout';
import { useUserInfo } from '../../../hooks/useUserInfo';
import { useAppDialog } from '../../components/dialog/DialogContext';
import { useAsyncMountLoadWithReload } from '../../../hooks/useAsyncMountLoad';
import TaxPageHeader from './taxPage/TaxPageHeader';
import TaxRecordsTable from './taxPage/TaxRecordsTable';
import TaxDetailModal from './taxPage/TaxDetailModal';
import TaxPaymentModal from './taxPage/TaxPaymentModal';
import TaxAdvancedSearchPanel from './taxPage/TaxAdvancedSearchPanel';
import {
  loadTaxPageRecords,
  INITIAL_TAX_UI,
  taxUiReducer,
  formatParcelDisplay,
  getLandTypeLabel,
  matchAmountRange,
  getAuth,
  API_BASE,
} from './taxPage/taxPageUtils';

const TaxPage = () => {
  const navigate = useNavigate();
  const { user } = useUserInfo();
  const { showAlert } = useAppDialog();

  const { data: records = [], isLoading: loading } = useAsyncMountLoadWithReload(loadTaxPageRecords);

  const [ui, dispatchUi] = useReducer(taxUiReducer, INITIAL_TAX_UI);
  const {
    tab,
    search,
    selectedDetail,
    selectedPayment,
    paymentLink,
    creatingLink,
    showAdv,
    advFilters,
  } = ui;

  const resetAdvFilters = () => dispatchUi({ type: 'RESET_ADV_FILTERS' });

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return records.filter((r) => {
      const matchTab =
        tab === 'all'
          ? true
          : tab === 'unpaid'
            ? ['UNPAID', 'OVERDUE', 'AWAITING_PAYMENT'].includes(r.status)
            : r.status === 'PAID';

      const matchSearch =
        !q ||
        formatParcelDisplay(r).toLowerCase().includes(q) ||
        (r.parcelCode || '').toLowerCase().includes(q) ||
        getLandTypeLabel(r).toLowerCase().includes(q) ||
        String(r.taxYear).includes(q);

      const matchYear = !advFilters.taxYear || String(r.taxYear) === advFilters.taxYear;
      const matchLandType = !advFilters.landTypeName || getLandTypeLabel(r) === advFilters.landTypeName;
      const matchAmount = matchAmountRange(r.taxAmount, advFilters.amountRange);

      return matchTab && matchSearch && matchYear && matchLandType && matchAmount;
    });
  }, [records, tab, search, advFilters]);

  const yearOptions = Array.from(
    new Set(records.flatMap((r) => (r.taxYear ? [r.taxYear] : [])))
  ).toSorted((a, b) => b - a);

  const landTypeOptions = Array.from(
    new Set(
      records.flatMap((r) => {
        const name = getLandTypeLabel(r);
        return name && name !== '—' ? [name] : [];
      })
    )
  ).toSorted((a, b) => a.localeCompare(b, 'vi'));

  const createPaymentLink = async (payId) => {
    if (selectedPayment?.status !== 'AWAITING_PAYMENT') {
      await showAlert({
        title: 'Chưa thể thanh toán',
        message: 'Hóa đơn chưa sẵn sàng thanh toán. Vui lòng chờ cán bộ thuế duyệt hồ sơ.',
        variant: 'warning',
      });
      return;
    }
    if (!selectedPayment?.taxAmount || selectedPayment.taxAmount <= 0) {
      await showAlert({ title: 'Lỗi', message: 'Số tiền thanh toán không hợp lệ.', variant: 'error' });
      return;
    }
    dispatchUi({ type: 'PATCH', payload: { creatingLink: true } });
    try {
      const res = await fetch(`${API_BASE}/payments/${payId}/create-link`, {
        method: 'POST',
        headers: getAuth(),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) {
        const errorMsg = result.message || result.error || JSON.stringify(result);
        await showAlert({ title: `Lỗi server ${res.status}`, message: errorMsg, variant: 'error' });
        return;
      }
      dispatchUi({ type: 'PATCH', payload: { paymentLink: result } });
      await showAlert({ title: 'Thành công', message: 'Tạo link thanh toán thành công!', variant: 'success' });
    } catch (err) {
      console.error(err);
      await showAlert({ title: 'Lỗi', message: 'Lỗi kết nối với server', variant: 'error' });
    } finally {
      dispatchUi({ type: 'PATCH', payload: { creatingLink: false } });
    }
  };

  return (
    <LandTaxLayout user={user}>
      <TaxPageHeader
        search={search}
        onSearchChange={(value) => dispatchUi({ type: 'PATCH', payload: { search: value } })}
        onOpenAdvanced={() => dispatchUi({ type: 'PATCH', payload: { showAdv: true } })}
      />

      <TaxRecordsTable
        loading={loading}
        tab={tab}
        filtered={filtered}
        onTabChange={(key) => dispatchUi({ type: 'PATCH', payload: { tab: key } })}
        onSelectDetail={(r) => dispatchUi({ type: 'PATCH', payload: { selectedDetail: r } })}
        onNavigatePayment={(taxId) => navigate(`/payment?payId=${taxId}`)}
      />

      {selectedDetail && (
        <TaxDetailModal
          selectedDetail={selectedDetail}
          onClose={() => dispatchUi({ type: 'PATCH', payload: { selectedDetail: null } })}
        />
      )}

      {selectedPayment && (
        <TaxPaymentModal
          selectedPayment={selectedPayment}
          paymentLink={paymentLink}
          creatingLink={creatingLink}
          onClose={() => dispatchUi({ type: 'CLOSE_PAYMENT_MODAL' })}
          onCreatePaymentLink={createPaymentLink}
        />
      )}

      {showAdv && (
        <TaxAdvancedSearchPanel
          advFilters={advFilters}
          yearOptions={yearOptions}
          landTypeOptions={landTypeOptions}
          onFilterChange={(payload) => dispatchUi({ type: 'PATCH_ADV_FILTERS', payload })}
          onReset={resetAdvFilters}
          onClose={() => dispatchUi({ type: 'PATCH', payload: { showAdv: false } })}
        />
      )}
    </LandTaxLayout>
  );
};

export default TaxPage;
