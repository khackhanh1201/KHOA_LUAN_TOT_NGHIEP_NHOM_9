import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import LandTaxLayout from '../../components/LandTaxLayout';
import { useUserInfo } from '../../../hooks/useUserInfo';
import { usePaymentSyncStatus } from '../../../hooks/usePaymentSyncStatus';

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useUserInfo();
  const payId = searchParams.get('payId');
  const { status, message } = usePaymentSyncStatus(payId, navigate);

  return (
    <LandTaxLayout user={user}>
      <div className="container py-5" style={{ maxWidth: 560 }}>
        <div className="card border-0 shadow-sm p-4 text-center" style={{ borderRadius: 16 }}>
          {status === 'loading' && (
            <output className="spinner-border text-danger mb-3" aria-live="polite" />
          )}
          {status === 'success' && (
            <i className="bi bi-check-circle-fill text-success" style={{ fontSize: 48 }} />
          )}
          {status === 'warning' && (
            <i className="bi bi-exclamation-triangle-fill text-warning" style={{ fontSize: 48 }} />
          )}
          {status === 'error' && (
            <i className="bi bi-x-circle-fill text-danger" style={{ fontSize: 48 }} />
          )}
          <h4 className="fw-bold mt-3 mb-2">Kết quả thanh toán</h4>
          <p className="text-muted mb-4">{message}</p>
          <button type="button" className="btn btn-danger fw-semibold px-4"
            onClick={() => navigate('/payment')}
          >
            Về trang thanh toán
          </button>
        </div>
      </div>
    </LandTaxLayout>
  );
};

export default PaymentSuccessPage;
