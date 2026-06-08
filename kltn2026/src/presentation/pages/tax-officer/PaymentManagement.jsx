import React, { useReducer, useMemo } from 'react';
import TaxOfficerLayout from '../../components/TaxOfficerLayout';
import { useUserInfo } from '../../../hooks/useUserInfo';
import { useAppDialog } from '../../components/dialog/DialogContext';
import { useAsyncMountLoadWithReload } from '../../../hooks/useAsyncMountLoad';
import { getBearerAuthHeaders } from '../../../utils/authHeaders';
import PaymentListView from './PaymentListView';
import PaymentReconResultView from './PaymentReconResultView';
import PaymentUploadModal from './PaymentUploadModal';
import PaymentDetailPanel from './PaymentDetailPanel';
import PaymentErrorReconModal from './PaymentErrorReconModal';
import {
  API_BASE,
  loadAllPayments,
  mapReconRowFromApi,
  initialState,
  paymentManagementReducer,
  matchesListTab,
  matchesSearch,
  getAuthHeaders,
} from './paymentManagementUtils';
import { EMPTY_ARRAY } from '../../../utils/emptyArray';

const UNPAID_STATUSES = new Set(['UNPAID', 'AWAITING_PAYMENT', 'OVERDUE']);
const PAID_STATUSES = new Set(['PAID', 'SUCCESS']);
const FAILED_STATUSES = new Set(['FAILED', 'CANCELLED']);

const PaymentManagement = () => {
  const { user } = useUserInfo();
  const { showAlert } = useAppDialog();

  const { data: loadedPayments, error: loadError, isLoading: paymentsLoading, reload: fetchAllPayments } =
    useAsyncMountLoadWithReload(loadAllPayments);
  const [state, dispatch] = useReducer(paymentManagementReducer, initialState);
  const {
    view,
    activeTab,
    showDetail,
    selectedPayment,
    localPayments,
    error,
    showAdvanced,
    advFilters,
    showUploadModal,
    reconAccount,
    reconStartDate,
    reconEndDate,
    reconFile,
    uploading,
    reconResult,
    loadingDetail,
    searchQuery,
    reconTab,
    showErrorModal,
    selectedErrorItem,
    loadingRecon,
  } = state;

  const allPayments = localPayments ?? loadedPayments ?? (loadError ? EMPTY_ARRAY : null);
  const loading = allPayments === null && paymentsLoading && view === 'list';
  const displayError = error || (loadError?.message ? `Lỗi tải dữ liệu: ${loadError.message}` : '');

  const refreshPayments = () => {
    dispatch({ type: 'resetLocalPayments' });
    fetchAllPayments();
  };

  const payments = useMemo(() => {
    if (!allPayments) return null;
    const results = [];
    for (const p of allPayments) {
      if (!matchesListTab(p, activeTab) || !matchesSearch(p, searchQuery)) continue;
      const matchCode = !advFilters.transactionCode || (p.invoiceCode || '').toLowerCase().includes(advFilters.transactionCode.toLowerCase().trim());
      const matchMst = !advFilters.mst || (p.mst || '').toLowerCase().includes(advFilters.mst.toLowerCase().trim()) || (p.name || '').toLowerCase().includes(advFilters.mst.toLowerCase().trim());
      let matchStatus = true;
      if (advFilters.status && advFilters.status !== 'Tất cả') {
        if (advFilters.status === 'Chờ thanh toán') {
          matchStatus = UNPAID_STATUSES.has(p.paymentStatusRaw);
        } else if (advFilters.status === 'Đã nộp') {
          matchStatus = PAID_STATUSES.has(p.paymentStatusRaw);
        } else if (advFilters.status === 'Đang đối soát') {
          matchStatus = p.paymentStatusRaw === 'DISCREPANCY';
        } else if (advFilters.status === 'Cần thẩm định') {
          matchStatus = p.paymentStatusRaw === 'DISPUTED';
        } else if (advFilters.status === 'Thất bại') {
          matchStatus = FAILED_STATUSES.has(p.paymentStatusRaw);
        } else if (advFilters.status === 'Miễn/Giảm') {
          matchStatus = p.paymentStatusRaw === 'WAIVED';
        }
      }
      if (matchCode && matchMst && matchStatus) results.push(p);
    }
    return results;
  }, [allPayments, activeTab, searchQuery, advFilters]);

  const fetchPaymentDetail = async (payment) => {
    dispatch({ type: 'openDetail' });
    try {
      let detail = {
        ...payment,
        name: '—',
        cccdNumber: '—',
        address: '—',
        recordCategory: '—',
        landAddress: '—',
        area: '—',
        landType: '—',
        exemptSubject: 'Không',
      };
      if (payment.recordId) {
        const res = await fetch(`${API_BASE}/tax/records`, { headers: getAuthHeaders() });
        if (res.ok) {
          const records = await res.json();
          const record = records.find((r) => Number(r.recordId) === Number(payment.recordId));
          if (record) {
            detail = {
              ...detail,
              name: record.fullName || '—',
              cccdNumber: record.senderCccd || '—',
              phoneNumber: record.phoneNumber || '—',
              address: record.address || record.landAddress || '—',
              recordCategory: record.recordCategory || '—',
              landAddress: record.landAddress || record.address || '—',
              area: record.area ? `${record.area} m²` : '—',
              landType: record.landType || record.declaredUsage || '—',
              base: Number(record.calculatedTaxAmount ?? payment.base ?? 0),
              total: Number(record.calculatedTaxAmount ?? payment.base ?? 0) + Number(payment.penalty || 0),
            };
          }
        }
      }
      dispatch({ type: 'patch', payload: { selectedPayment: detail } });
    } catch (err) {
      console.error(err);
      dispatch({ type: 'patch', payload: { selectedPayment: payment } });
    } finally {
      dispatch({ type: 'patch', payload: { loadingDetail: false } });
    }
  };

  const fetchReconciliation = async () => {
    dispatch({ type: 'patch', payload: { loadingRecon: true, error: '', reconTab: 'Tất cả' } });
    try {
      const res = await fetch(`${API_BASE}/payments/reconcile/run`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error(`Không chạy đối soát được (HTTP ${res.status})`);
      const rows = await res.json();
      dispatch({
        type: 'patch',
        payload: {
          reconResult: (Array.isArray(rows) ? rows : []).map(mapReconRowFromApi),
          view: 'recon_result',
        },
      });
    } catch (err) {
      console.error(err);
      await showAlert({ title: 'Lỗi', message: 'Lỗi đối soát: ' + err.message, variant: 'error' });
    } finally {
      dispatch({ type: 'patch', payload: { loadingRecon: false } });
    }
  };

  const handleConfirmReconError = async (item, reason, resolution) => {
    if (!reason?.trim()) {
      await showAlert({ title: 'Thiếu thông tin', message: 'Vui lòng nhập lý do xử lý.', variant: 'warning' });
      return;
    }
    if (!item?.payId) {
      await showAlert({ title: 'Lỗi', message: 'Không tìm thấy mã thanh toán (payId).', variant: 'error' });
      return;
    }
    const statusMap = { confirm_paid: 'PAID', dispute: 'DISPUTED', reject: 'FAILED' };
    const newStatus = statusMap[resolution] || 'PAID';
    try {
      const res = await fetch(`${API_BASE}/payments/bills/${item.payId}/adjust`, {
        method: 'PUT',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, note: reason.trim() }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      dispatch({ type: 'closeErrorModal' });
      await fetchReconciliation();
      await showAlert({ title: 'Thành công', message: 'Đã ghi nhận xử lý đối soát.', variant: 'success' });
    } catch (err) {
      console.error(err);
      await showAlert({ title: 'Lỗi', message: 'Xử lý lỗi thất bại: ' + err.message, variant: 'error' });
    }
  };

  const downloadReceipt = async (payId) => {
    try {
      const res = await fetch(`${API_BASE}/payments/${payId}/receipt`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Không tải được biên lai');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `BienLai_${payId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      await showAlert({ title: 'Lỗi', message: err.message, variant: 'error' });
    }
  };

  const handleReconUpload = async () => {
    dispatch({ type: 'patch', payload: { loadingRecon: true } });
    if (!reconFile) {
      await showAlert({ title: 'Thông báo', message: 'Vui lòng chọn file!', variant: 'warning' });
      return;
    }
    dispatch({ type: 'patch', payload: { uploading: true } });
    const formData = new FormData();
    formData.append('file', reconFile);
    try {
      const res = await fetch(`${API_BASE}/payments/reconcile/upload`, {
        method: 'POST',
        headers: getBearerAuthHeaders(),
        body: formData,
      });
      if (!res.ok) throw new Error('Upload file thất bại');
      const result = await res.json();
      const rows = Array.isArray(result) ? result : (result.data || []);
      dispatch({
        type: 'patch',
        payload: {
          reconResult: rows.map(mapReconRowFromApi),
          showUploadModal: false,
          view: 'recon_result',
        },
      });
    } catch (err) {
      console.error(err);
      await showAlert({ title: 'Lỗi', message: 'Upload thất bại: ' + err.message, variant: 'error' });
    } finally {
      dispatch({ type: 'patch', payload: { uploading: false } });
    }
  };

  const getFilteredReconResult = () => {
    if (!reconResult) return [];
    if (reconTab === 'Khớp') return reconResult.filter((item) => item.status === 'MATCHED');
    if (reconTab === 'Lệch') return reconResult.filter((item) => item.status !== 'MATCHED');
    return reconResult;
  };

  return (
    <TaxOfficerLayout user={user}>
      <div style={{ padding: '24px 32px' }}>
        {view === 'list' && (
          <PaymentListView
            activeTab={activeTab}
            searchQuery={searchQuery}
            showAdvanced={showAdvanced}
            advFilters={advFilters}
            displayError={displayError}
            loading={loading}
            payments={payments}
            loadingRecon={loadingRecon}
            dispatch={dispatch}
            onReconcile={fetchReconciliation}
            onViewDetail={fetchPaymentDetail}
            onDownloadReceipt={downloadReceipt}
          />
        )}
        {loadingRecon && (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div className="spinner-border text-danger" />
          </div>
        )}
        {view === 'recon_result' && (
          <PaymentReconResultView
            reconResult={reconResult}
            reconTab={reconTab}
            filteredRows={getFilteredReconResult()}
            dispatch={dispatch}
            onOpenError={(item) => dispatch({ type: 'openErrorModal', item })}
            onExit={() => {
              dispatch({ type: 'patch', payload: { view: 'list' } });
              refreshPayments();
            }}
          />
        )}
      </div>

      {showUploadModal && (
        <PaymentUploadModal
          reconAccount={reconAccount}
          reconStartDate={reconStartDate}
          reconEndDate={reconEndDate}
          reconFile={reconFile}
          uploading={uploading}
          dispatch={dispatch}
          onUpload={handleReconUpload}
          onClose={() => dispatch({ type: 'closeUploadModal' })}
        />
      )}

      {showDetail && selectedPayment && (
        <PaymentDetailPanel
          payment={selectedPayment}
          loading={loadingDetail}
          onClose={() => dispatch({ type: 'closeDetail' })}
        />
      )}

      {showErrorModal && (
        <PaymentErrorReconModal
          item={selectedErrorItem}
          user={user}
          onClose={() => dispatch({ type: 'closeErrorModal' })}
          onConfirm={(reason, resolution) => handleConfirmReconError(selectedErrorItem, reason, resolution)}
        />
      )}
    </TaxOfficerLayout>
  );
};

export default PaymentManagement;
