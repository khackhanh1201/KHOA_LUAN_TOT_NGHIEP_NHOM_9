import React, { useState } from 'react';
import { FOCUS_VISIBLE_CLASS } from '../../theme/designTokens';
import { formatVND } from './paymentManagementUtils';
import { modalOverlay, modalContent } from './paymentManagementStyles';

const rdStyleWidthHeightBackground = { width: 42, height: 42, background: '#fef2f2', color: '#dc2626', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: 12, fontSize: 18 };
const rdStyleBackgroundColorPadding = { background: '#fff1f2', color: '#9f1239', padding: '16px', borderRadius: 16, fontSize: 13, marginBottom: 24, fontWeight: 500, lineHeight: 1.6, border: '1px solid #ffe4e6' };
const rdStyleDisplayJustifyContentAlignItems = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 10, fontSize: 12, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' };
const rdStyleWidthPaddingBorderRadius = { width: '100%', padding: '14px', borderRadius: 14, border: '1px solid #e2e8f0', minHeight: 100, fontSize: 14, resize: 'none', color: '#334155', fontFamily: 'inherit', background: '#fff', boxSizing: 'border-box' };
const rdStyleFlexPaddingBackground2 = { flex: 1, padding: '14px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, fontWeight: 700, color: '#334155', cursor: 'pointer', fontSize: 14 };
const confirmButtonStyle = (reason) => {
  const enabled = Boolean(reason.trim());
  return {
    flex: 1,
    padding: '14px',
    background: enabled ? '#a30d11' : '#cbd5e1',
    border: 'none',
    borderRadius: 12,
    fontWeight: 700,
    color: '#fff',
    cursor: enabled ? 'pointer' : 'not-allowed',
    fontSize: 14,
    boxShadow: enabled ? '0 4px 12px rgba(163, 13, 17, 0.2)' : 'none',
  };
};

const RESOLUTION_OPTIONS = [
  {
    id: 'confirm_paid',
    title: 'Xác nhận đã thu đủ',
    desc: 'Đánh dấu hóa đơn đã hoàn tất nộp thuế (PAID)',
  },
  {
    id: 'dispute',
    title: 'Chuyển thẩm định / giải trình',
    desc: 'Đánh dấu hóa đơn cần rà soát lại (DISPUTED)',
  },
  {
    id: 'reject',
    title: 'Từ chối giao dịch lỗi',
    desc: 'Đánh dấu giao dịch bị lỗi/hủy (FAILED)',
  },
];

const PaymentErrorReconModal = ({ item, user, onClose, onConfirm }) => {
  const [reason, setReason] = useState('');
  const [resolution, setResolution] = useState('confirm_paid');
  const now = new Date().toLocaleString('vi-VN');

  if (!item) return null;

  return (
    <div style={modalOverlay}>
      <div style={{ ...modalContent, width: 520, borderRadius: 28, padding: '28px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={rdStyleWidthHeightBackground}>
              <i className="bi bi-exclamation-triangle-fill" />
            </div>
            <h3 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: '#0f172a' }}>Xử lý lỗi đối soát</h3>
          </div>
          <button type="button" aria-label="Đóng" onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#94a3b8' }}>
            <i className="bi bi-x-lg" style={{ fontSize: 16 }} />
          </button>
        </div>

        <div style={rdStyleBackgroundColorPadding}>
          <div><b>Mã hóa đơn:</b> {item.invoiceCode || item.orderCode || '—'}</div>
          <div><b>Số tiền trên PayOS:</b> {item.hasPayosSignal ? formatVND(item.payosAmount) : '—'}</div>
          <div><b>Tổng cộng lũy tiến phải đóng (gồm phạt):</b> {formatVND(item.systemTotal)}</div>
        </div>

        <fieldset style={{ margin: '0 0 20px', padding: 0, border: 'none' }}>
          <legend style={rdStyleDisplayJustifyContentAlignItems}>
            CHỌN GIẢI PHÁP GIẢI QUYẾT *
          </legend>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {RESOLUTION_OPTIONS.map((opt, idx) => (
              <label
                key={opt.id}
                style={{
                  display: 'flex',
                  gap: 12,
                  padding: '14px 16px',
                  borderRadius: 14,
                  border: resolution === opt.id ? '2px solid #a30d11' : '1px solid #e2e8f0',
                  cursor: 'pointer',
                  background: resolution === opt.id ? '#fffafa' : '#fff',
                }}
              >
                <input
                  type="radio"
                  name="resolution"
                  checked={resolution === opt.id}
                  onChange={() => setResolution(opt.id)}
                  style={{ marginTop: 4 }}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#1e293b' }}>({idx + 1}) {opt.title}</div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{opt.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </fieldset>

        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <label htmlFor="recon-reason" style={{ fontSize: 12, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              LÝ DO XỬ LÝ *
            </label>
            <span style={{ fontSize: 12, color: '#dc2626', fontWeight: 700 }}>Bắt buộc nhập lý do</span>
          </div>
          <textarea
            id="recon-reason"
            className={FOCUS_VISIBLE_CLASS}
            style={rdStyleWidthPaddingBorderRadius}
            placeholder="Vui lòng cung cấp lý do chi tiết..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        <div style={{ background: '#f8fafc', borderRadius: 14, padding: '14px 16px', marginBottom: 24, border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#64748b', marginBottom: 8 }}>Thao tác này được lưu vết hệ thống (Audit Trail)</div>
          <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.6 }}>
            <div><b>Người thực hiện:</b> {user?.fullName || 'Cán bộ Thuế'}</div>
            <div><b>Thời gian:</b> {now}</div>
            <div><b>Lý do:</b> {reason.trim() || '(vui lòng nhập lý do để đối soát...)'}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button type="button" onClick={onClose} style={rdStyleFlexPaddingBackground2}>Hủy bỏ</button>
          <button type="button" onClick={() => onConfirm(reason, resolution)}
            disabled={!reason.trim()}
            style={confirmButtonStyle(reason)}
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentErrorReconModal;
