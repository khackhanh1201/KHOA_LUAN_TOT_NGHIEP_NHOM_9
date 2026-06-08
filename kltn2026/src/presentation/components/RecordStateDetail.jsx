import React, { useState } from 'react';

// Ánh xạ màu sắc, nhãn và biểu tượng cho 5 trạng thái tối giản
const rdStyleDisplayAlignItemsGap = {
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 14px',
            borderRadius: 20,
            backgroundColor: statusInfo.bg,
            color: statusInfo.color,
            border: `1px solid ${statusInfo.border}`,
            fontSize: 13,
            fontWeight: 700
          };

const statusColors = {
  SUBMITTED: {
    bg: '#fef3c7',
    color: '#d97706',
    border: '#fde68a',
    label: 'Chờ tiếp nhận',
    icon: 'bi-hourglass-split'
  },
  PROCESSING: {
    bg: '#dbeafe',
    color: '#2563eb',
    border: '#bfdbfe',
    label: 'Đang xử lý',
    icon: 'bi-gear-wide-connected'
  },
  APPROVED: {
    bg: '#e0f2fe',
    color: '#0284c7',
    border: '#bae6fd',
    label: 'Chờ thanh toán',
    icon: 'bi-wallet2'
  },
  COMPLETED: {
    bg: '#d1fae5',
    color: '#059669',
    border: '#a7f3d0',
    label: 'Hoàn thành',
    icon: 'bi-check-circle-fill'
  },
  CANCELLED: {
    bg: '#fee2e2',
    color: '#dc2626',
    border: '#fecaca',
    label: 'Đã hủy',
    icon: 'bi-x-circle-fill'
  }
};

/**
 * Component hiển thị chi tiết hồ sơ và kiểm soát nút thao tác theo vai trò & trạng thái.
 *
 * @param {Object} record Thông tin hồ sơ (chứa recordId, recordCode, currentStatus, amountDue...)
 * @param {string} userRole Vai trò của người dùng ('OFFICER' hoặc 'CITIZEN')
 * @param {Function} onUpdateStatus Hàm callback gọi API cập nhật trạng thái hồ sơ
 * @param {Function} onPay Hàm callback gọi API thanh toán lấy link PayOS
 */
const RecordStateDetail = ({ record, userRole, onUpdateStatus, onPay }) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(record.currentStatus || 'SUBMITTED');

  const currentStatus = record.currentStatus || 'SUBMITTED';
  const statusInfo = statusColors[currentStatus] || statusColors.SUBMITTED;

  const isOfficer = userRole === 'OFFICER' || userRole === 'TAX_OFFICER';
  const isCitizen = userRole === 'CITIZEN';

  const handleAction = async (targetStatus) => {
    setLoading(true);
    try {
      await onUpdateStatus(record.recordId, targetStatus);
    } catch (err) {
      console.error("Lỗi cập nhật trạng thái:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      await onPay(record.recordId);
    } catch (err) {
      console.error("Lỗi gọi liên kết PayOS:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={cardStyle}>
      {/* 1. Nhóm Tab / Bộ lọc phân loại hồ sơ */}
      <div style={tabContainerStyle}>
        {Object.keys(statusColors).map((statusKey) => {
          const info = statusColors[statusKey];
          const isActive = activeTab === statusKey;
          return (
            <button type="button" key={statusKey}
              onClick={() => setActiveTab(statusKey)}
              style={isActive ? activeTabStyle : tabStyle}
            >
              <i className={`bi ${info.icon} me-1`}></i>
              {info.label}
            </button>
          );
        })}
      </div>

      {/* 2. Hiển thị chi tiết hồ sơ */}
      <div style={cardBodyStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h4 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#1e293b', letterSpacing: '-0.01em' }}>
              Chi tiết hồ sơ: <span style={{ color: '#a30d11' }}>#{record.recordCode || record.recordId}</span>
            </h4>
            <span style={{ fontSize: 12, color: '#64748b' }}>Ngày nộp: {record.submittedAt || 'Hôm nay'}</span>
          </div>
          
          {/* Badge Trạng thái hiện tại */}
          <div style={rdStyleDisplayAlignItemsGap}>
            <i className={`bi ${statusInfo.icon}`}></i>
            {statusInfo.label}
          </div>
        </div>

        {/* Grid thông tin chi tiết */}
        <div style={gridStyle}>
          <div style={infoBox}>
            <div style={labelStyle}>Họ và tên người nộp</div>
            <div style={valueStyle}>{record.fullName || '---'}</div>
          </div>
          <div style={infoBox}>
            <div style={labelStyle}>Số CCCD/CMND</div>
            <div style={valueStyle}>{record.senderCccd || '---'}</div>
          </div>
          <div style={infoBox}>
            <div style={labelStyle}>Thửa đất số</div>
            <div style={valueStyle}>{record.landParcelNumber || '---'}</div>
          </div>
          <div style={infoBox}>
            <div style={labelStyle}>Địa chỉ thửa đất</div>
            <div style={valueStyle}>{record.address || '---'}</div>
          </div>
        </div>

        {/* Hiển thị thông tin thanh toán khi ở trạng thái APPROVED hoặc COMPLETED */}
        {(currentStatus === 'APPROVED' || currentStatus === 'COMPLETED') && record.amountDue && (
          <div style={paymentCardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.05em' }}>NGHĨA VỤ TÀI CHÍNH (THUẾ ĐẤT)</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#0369a1', marginTop: 4 }}>
                  {Number(record.amountDue).toLocaleString('vi-VN')} VNĐ
                </div>
              </div>
              <div style={{
                fontSize: 12,
                fontWeight: 700,
                color: currentStatus === 'COMPLETED' ? '#047857' : '#b45309',
                backgroundColor: currentStatus === 'COMPLETED' ? '#d1fae5' : '#fef3c7',
                padding: '6px 12px',
                borderRadius: 12,
                border: `1px solid ${currentStatus === 'COMPLETED' ? '#a7f3d0' : '#fde68a'}`
              }}>
                {currentStatus === 'COMPLETED' ? 'ĐÃ HOÀN THÀNH' : 'CHỜ NỘP THUẾ'}
              </div>
            </div>
          </div>
        )}

        {/* Khu vực Action CTA */}
        <div style={actionSectionStyle}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#64748b', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Tác vụ khả dụng ({isOfficer ? 'Vai trò: Cán bộ thuế' : 'Vai trò: Công dân'})
          </div>
          <RecordStateCTA
            loading={loading}
            isOfficer={isOfficer}
            isCitizen={isCitizen}
            currentStatus={currentStatus}
            onAction={handleAction}
            onPay={handlePayment}
          />
        </div>
      </div>
    </div>
  );
};

// Định nghĩa CSS trong JS theo phong cách Glassmorphism & Material Sleek
const cardStyle = {
  background: '#fff',
  borderRadius: 16,
  border: '1px solid #e2e8f0',
  boxShadow: '0 4px 10px rgba(0,0,0,0.03)',
  overflow: 'hidden',
  fontFamily: "'Outfit', 'Inter', sans-serif"
};

const tabContainerStyle = {
  display: 'flex',
  background: '#f8fafc',
  borderBottom: '1px solid #e2e8f0',
  padding: '12px 16px 0',
  gap: 8,
  overflowX: 'auto'
};

const tabStyle = {
  padding: '10px 18px',
  background: 'none',
  border: 'none',
  borderBottom: '3px solid transparent',
  color: '#64748b',
  fontWeight: 600,
  fontSize: 13,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  transition: 'all 0.2s',
  display: 'flex',
  alignItems: 'center',
  gap: 6
};

const activeTabStyle = {
  ...tabStyle,
  color: '#a30d11',
  borderBottom: '3px solid #a30d11',
  background: '#fff',
  borderRadius: '8px 8px 0 0'
};

const cardBodyStyle = {
  padding: 24
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: 16,
  marginBottom: 24
};

const infoBox = {
  background: '#f8fafc',
  border: '1px solid #f1f5f9',
  borderRadius: 10,
  padding: 14
};

const labelStyle = {
  fontSize: 12,
  fontWeight: 800,
  color: '#94a3b8',
  marginBottom: 6,
  textTransform: 'uppercase',
  letterSpacing: '0.04em'
};

const valueStyle = {
  fontSize: 14,
  fontWeight: 600,
  color: '#334155'
};

const paymentCardStyle = {
  background: '#f0f9ff',
  border: '1px solid #bae6fd',
  borderRadius: 12,
  padding: 18,
  marginBottom: 24
};

const actionSectionStyle = {
  borderTop: '1px solid #e2e8f0',
  paddingTop: 18
};

// Khung nút bấm
const btnBase = {
  padding: '10px 20px',
  borderRadius: 8,
  border: 'none',
  fontWeight: 700,
  fontSize: 13,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  lineHeight: 1.2,
  transition: 'all 0.15s ease-in-out'
};

const btnPrimary = {
  ...btnBase,
  background: '#3b82f6',
  color: '#fff',
  boxShadow: '0 2px 4px rgba(59,130,246,0.1)'
};

const btnSuccess = {
  ...btnBase,
  background: '#10b981',
  color: '#fff',
  boxShadow: '0 2px 4px rgba(16,185,129,0.1)'
};

const btnDanger = {
  ...btnBase,
  background: '#ef4444',
  color: '#fff',
  boxShadow: '0 2px 4px rgba(239,68,68,0.1)'
};

const btnPayOS = {
  ...btnBase,
  background: 'linear-gradient(135deg, #a30d11 0%, #e11d48 100%)',
  color: '#fff',
  boxShadow: '0 4px 10px rgba(163,13,17,0.15)',
  fontSize: 14,
  padding: '12px 24px'
};

const btnDisabled = {
  ...btnBase,
  background: '#cbd5e1',
  color: '#94a3b8',
  cursor: 'not-allowed'
};

const textMuted = {
  fontSize: 13,
  color: '#94a3b8',
  fontStyle: 'italic',
  display: 'flex',
  alignItems: 'center',
  gap: 4
};

const RecordStateCTA = ({ loading, isOfficer, isCitizen, currentStatus, onAction, onPay }) => {
  if (loading) {
    return (
      <button type="button" style={btnDisabled} disabled>
        <output className="spinner-border spinner-border-sm me-2" aria-live="polite" aria-hidden="true"></output>
        Đang thực hiện...
      </button>
    );
  }

  if (isOfficer) {
    if (currentStatus === 'SUBMITTED' || currentStatus === 'PROCESSING') {
      return (
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {currentStatus === 'SUBMITTED' && (
            <button type="button" style={btnPrimary} onClick={() => onAction('PROCESSING')}>
              <i className="bi bi-play-fill me-1"></i> Tiếp nhận (Chuyển xử lý)
            </button>
          )}
          {currentStatus === 'PROCESSING' && (
            <button type="button" style={btnSuccess} onClick={() => onAction('APPROVED')}>
              <i className="bi bi-check2-circle me-1"></i> Duyệt hồ sơ (Tạo hóa đơn)
            </button>
          )}
          <button type="button" style={btnDanger} onClick={() => onAction('CANCELLED')}>
            <i className="bi bi-x-octagon-fill me-1"></i> Hủy hồ sơ
          </button>
        </div>
      );
    }
    return (
      <div style={textMuted}>
        <i className="bi bi-info-circle me-1"></i> Hồ sơ đang chờ thanh toán hoặc đã hoàn thành. Cán bộ không cần thao tác thêm.
      </div>
    );
  }

  if (isCitizen) {
    if (currentStatus === 'SUBMITTED') {
      return (
        <button type="button" style={btnDanger} onClick={() => onAction('CANCELLED')}>
          <i className="bi bi-trash-fill me-1"></i> Rút/Hủy hồ sơ
        </button>
      );
    }
    if (currentStatus === 'APPROVED') {
      return (
        <button type="button" style={btnPayOS} onClick={onPay}>
          <i className="bi bi-credit-card-2-front-fill me-1"></i> Thanh toán ngay qua PayOS
        </button>
      );
    }
    if (currentStatus === 'COMPLETED' || currentStatus === 'CANCELLED') {
      return (
        <div style={textMuted}>
          <i className="bi bi-lock-fill me-1"></i> Hồ sơ đã đóng ở trạng thái hoàn thành hoặc hủy bỏ.
        </div>
      );
    }
  }

  return null;
};

export default RecordStateDetail;
