import React, { useReducer, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import LandTaxLayout from '../../components/LandTaxLayout';
import { useUserInfo } from '../../../hooks/useUserInfo';
import { useAppDialog } from '../../components/dialog/DialogContext';
import { useAsyncMountLoadWithReload } from '../../../hooks/useAsyncMountLoad';
import PaymentQrModal from './PaymentQrModal';
import {
  normalizeExemptStatus,
  EXEMPT_STATUS_APPROVED,
  EXEMPT_STATUS_PENDING,
} from '../../../utils/taxExempt';
import { getBearerAuthHeaders, getJsonAuthHeaders } from '../../../utils/authHeaders';
import {
  API_BASE,
  PAYMENT_TAB,
  loadPaymentLists,
  INITIAL_PAYMENT_STATE,
  paymentPageReducer,
  isFullTaxExempt,
  buildSyncStatusAlert,
  fetchTaxDetail,
  downloadPaymentReceipt,
} from './payment/paymentPageUtils';
import PaymentTabPanel from './payment/PaymentTabPanel';
import PaymentTaxDetailModal from './payment/PaymentTaxDetailModal';

const syncPaymentStatus = async (paymentId) => {
  const res = await fetch(`${API_BASE}/payments/${paymentId}/sync-status`, {
    method: 'POST',
    headers: getBearerAuthHeaders(),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok && json.success !== true) {
    throw new Error(json.message || `HTTP ${res.status}`);
  }
  return json;
};

const canRequestExemptionOnDetail = (detail) => {
  if (!detail || detail.loading || detail.status === 'PAID') return false;
  if (isFullTaxExempt(detail)) return false;
  const st = normalizeExemptStatus(detail.exemptionStatus);
  return st !== EXEMPT_STATUS_APPROVED && st !== EXEMPT_STATUS_PENDING;
};

const PaymentPage = () => {
  const [searchParams] = useSearchParams();
  const { user } = useUserInfo();
  const { showAlert } = useAppDialog();

  const { data: loadedPayments, error: loadError, isLoading: paymentsLoading } =
    useAsyncMountLoadWithReload(loadPaymentLists);
  const [state, dispatch] = useReducer(paymentPageReducer, INITIAL_PAYMENT_STATE);
  const {
    localPayments, error, activeTab, selectedDetail, showExemptionForm,
    exemptionReason, exemptionDiscountRate, exemptionEvidenceName,
    submittingExemption, qrModal, creatingPaymentLink, copiedField,
  } = state;

  const paymentData = localPayments ?? loadedPayments;
  const pendingPayments = paymentData?.pending ?? [];
  const paidPayments = paymentData?.paid ?? [];
  const loading = paymentsLoading && !paymentData;
  const isHistoryTab = activeTab === PAYMENT_TAB.HISTORY;
  const displayedPayments = isHistoryTab ? paidPayments : pendingPayments;

  const autoOpenedRef = useRef(false);
  const syncPollRef = useRef(null);

  const stopSyncPolling = () => {
    if (syncPollRef.current) {
      clearInterval(syncPollRef.current);
      syncPollRef.current = null;
    }
  };

  const closeQrModal = () => {
    stopSyncPolling();
    dispatch({ type: 'CLOSE_QR_MODAL' });
  };

  const copyToClipboard = async (fieldKey, text, label) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(String(text));
      dispatch({ type: 'PATCH', payload: { copiedField: fieldKey } });
      setTimeout(() => dispatch({ type: 'PATCH', payload: { copiedField: '' } }), 2000);
    } catch {
      await showAlert({ title: 'Lỗi', message: `Không thể sao chép ${label}`, variant: 'error' });
    }
  };

  const fetchPayments = async () => {
    try {
      const result = await loadPaymentLists();
      dispatch({ type: 'PATCH', payload: { localPayments: result, error: '' } });
      const payId = searchParams.get('payId');
      if (payId && !autoOpenedRef.current && result.pending.length > 0) {
        const found = result.pending.find((p) => String(p.paymentId) === String(payId));
        if (found) {
          autoOpenedRef.current = true;
          await openTaxDetail(found);
        }
      }
      return result;
    } catch (err) {
      dispatch({ type: 'PATCH', payload: { error: err.message } });
      console.error(err);
    }
  };

  const onPaymentConfirmed = async () => {
    stopSyncPolling();
    dispatch({ type: 'CLOSE_QR_MODAL' });
    await fetchPayments();
    dispatch({ type: 'PATCH', payload: { activeTab: PAYMENT_TAB.HISTORY } });
    await showAlert({
      title: 'Thanh toán thành công',
      message: 'Hóa đơn đã được cập nhật trạng thái Đã thanh toán. Xem trong tab Lịch sử giao dịch.',
      variant: 'success',
    });
  };

  const startSyncPolling = (paymentId) => {
    stopSyncPolling();
    syncPollRef.current = setInterval(async () => {
      try {
        const sync = await syncPaymentStatus(paymentId);
        if (sync.paymentStatus === 'PAID') await onPaymentConfirmed();
      } catch { /* Bỏ qua lỗi tạm khi PayOS chưa cập nhật ngay */ }
    }, 5000);
    setTimeout(() => stopSyncPolling(), 180000);
  };

  useEffect(() => {
    if (loadError) dispatch({ type: 'PATCH', payload: { error: loadError.message } });
  }, [loadError]);

  useEffect(() => () => stopSyncPolling(), []);

  const handlePayment = async (item) => {
    if (isFullTaxExempt(item)) {
      await showAlert({ title: 'Miễn thuế', message: 'Bạn được miễn thuế 100% cho khoản này, không cần thanh toán.', variant: 'info' });
      return;
    }
    if (!['AWAITING_PAYMENT', 'OVERDUE'].includes(item.status) && !item.canPay) {
      await showAlert({ title: 'Chưa thể thanh toán', message: 'Hóa đơn chưa sẵn sàng thanh toán. Vui lòng chờ cán bộ thuế duyệt hồ sơ.', variant: 'warning' });
      return;
    }
    try {
      dispatch({ type: 'PATCH', payload: { creatingPaymentLink: true } });
      const res = await fetch(`${API_BASE}/payments/${item.paymentId}/create-link`, {
        method: 'POST', headers: getBearerAuthHeaders(),
      });
      const result = await res.json();
      if (!res.ok || result.success === false) {
        throw new Error(result.message || 'Không thể tạo link thanh toán từ cổng thanh toán');
      }
      dispatch({ type: 'PATCH', payload: { qrModal: { open: true, data: result, item } } });
      startSyncPolling(item.paymentId);
    } catch (err) {
      console.error(err);
      await showAlert({ title: 'Lỗi', message: err.message, variant: 'error' });
    } finally {
      dispatch({ type: 'PATCH', payload: { creatingPaymentLink: false } });
    }
  };

  const openTaxDetail = async (item) => {
    dispatch({ type: 'OPEN_DETAIL_LOADING', item });
    try {
      const detail = await fetchTaxDetail(item);
      dispatch({ type: 'PATCH', payload: { selectedDetail: detail } });
    } catch (e) {
      console.error(e);
      await showAlert({ title: 'Lỗi', message: 'Không tải được chi tiết thông báo thuế.', variant: 'error' });
      dispatch({ type: 'PATCH', payload: { selectedDetail: null } });
    }
  };

  const payIdFromUrl = searchParams.get('payId');
  if (payIdFromUrl && paymentData && !autoOpenedRef.current) {
    const found = pendingPayments.find((p) => String(p.paymentId) === String(payIdFromUrl));
    if (found) {
      autoOpenedRef.current = true;
      Promise.resolve().then(() => openTaxDetail(found));
    }
  }

  const handleSubmitExemptionRequest = async () => {
    if (!selectedDetail) return;
    const reason = exemptionReason.trim();
    if (!reason) {
      await showAlert({ title: 'Thiếu thông tin', message: 'Vui lòng nhập lý do miễn giảm.', variant: 'warning' });
      return;
    }
    dispatch({ type: 'PATCH', payload: { submittingExemption: true } });
    try {
      const res = await fetch(`${API_BASE}/tax/exemptions`, {
        method: 'POST',
        headers: getJsonAuthHeaders(),
        body: JSON.stringify({
          exemptionReason: reason,
          discountRate: Number(exemptionDiscountRate) || 50,
          appliedYear: selectedDetail.taxYear ?? new Date().getFullYear(),
        }),
      });
      const text = await res.text();
      if (!res.ok) throw new Error(text || `HTTP ${res.status}`);
      dispatch({ type: 'RESET_EXEMPTION_FORM' });
      await fetchPayments();
      await showAlert({ title: 'Thành công', message: 'Yêu cầu miễn giảm đã được gửi thành công.', variant: 'success' });
      dispatch({ type: 'PATCH', payload: { selectedDetail: null } });
    } catch (err) {
      await showAlert({ title: 'Lỗi', message: err.message || 'Gửi yêu cầu miễn giảm thất bại.', variant: 'error' });
    } finally {
      dispatch({ type: 'PATCH', payload: { submittingExemption: false } });
    }
  };

  const handleDownloadReceipt = async (paymentId) => {
    try {
      await downloadPaymentReceipt(paymentId);
    } catch (err) {
      await showAlert({ title: 'Lỗi', message: err.message, variant: 'error' });
    }
  };

  return (
    <LandTaxLayout user={user}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h3 style={{ fontWeight: 800, fontSize: 26, color: '#0f172a', margin: 0 }}>Thanh toán</h3>
          <p style={{ color: '#94a3b8', fontSize: 13, margin: '4px 0 0' }}>Quản lý nghĩa vụ tài chính và lịch sử giao dịch</p>
        </div>
      </div>

      {error && <div className="alert alert-danger mb-3">{error}</div>}

      <PaymentTabPanel
        activeTab={activeTab}
        pendingCount={pendingPayments.length}
        loading={loading}
        isHistoryTab={isHistoryTab}
        displayedPayments={displayedPayments}
        creatingPaymentLink={creatingPaymentLink}
        dispatch={dispatch}
        onOpenDetail={openTaxDetail}
        onDownloadReceipt={handleDownloadReceipt}
        onPayment={handlePayment}
      />

      <PaymentTaxDetailModal
        selectedDetail={selectedDetail}
        showExemptionForm={showExemptionForm}
        exemptionReason={exemptionReason}
        exemptionDiscountRate={exemptionDiscountRate}
        exemptionEvidenceName={exemptionEvidenceName}
        submittingExemption={submittingExemption}
        dispatch={dispatch}
        onClose={() => dispatch({ type: 'PATCH', payload: { selectedDetail: null } })}
        canRequestExemptionOnDetail={canRequestExemptionOnDetail}
        onSubmitExemption={handleSubmitExemptionRequest}
        onPayment={handlePayment}
        onDownloadReceipt={handleDownloadReceipt}
        showAlert={showAlert}
      />

      <PaymentQrModal
        open={qrModal.open}
        data={qrModal.data}
        item={qrModal.item}
        copiedField={copiedField}
        onClose={closeQrModal}
        onCopy={copyToClipboard}
        onConfirmTransfer={async () => {
          try {
            const payId = qrModal.item?.paymentId;
            if (!payId) return;
            const sync = await syncPaymentStatus(payId);
            if (sync.paymentStatus === 'PAID') {
              await onPaymentConfirmed();
              return;
            }
            await fetchPayments();
            await showAlert(buildSyncStatusAlert(sync));
          } catch (e) {
            await showAlert({ title: 'Lỗi', message: e.message, variant: 'error' });
          }
        }}
      />
    </LandTaxLayout>
  );
};

export default PaymentPage;
