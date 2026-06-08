import React, { useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import { backdropA11yProps, interactiveDivProps } from '../../../utils/a11y';
import LandTaxLayout from '../../components/LandTaxLayout';
import { useUserInfo } from '../../../hooks/useUserInfo';
import { useAppDialog } from '../../components/dialog/DialogContext';
import { useAsyncMountLoadWithReload } from '../../../hooks/useAsyncMountLoad';
import {
  countPendingDeclarations,
  isPendingDeclaration,
} from '../../../utils/declarationStatus';
import { notifyPendingDeclarationsChanged } from '../../../hooks/usePendingDeclarationCount';
import { FOCUS_VISIBLE_CLASS } from '../../theme/designTokens';

const statusBadgeStyle = (cfg) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 5,
  padding: '4px 12px',
  borderRadius: 20,
  fontSize: 12,
  fontWeight: 600,
  background: cfg.bg,
  color: cfg.color,
});

const modalBackdropStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0,0,0,0.6)',
  zIndex: 9999,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const createDeclarationButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 7,
  padding: '9px 18px',
  background: '#a30d11',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 700,
  cursor: 'pointer',
};

const tabButtonStyle = (activeTab, tabKey) => ({
  padding: '6px 16px',
  borderRadius: 20,
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
  border: activeTab === tabKey ? '2px solid #a30d11' : '2px solid #e2e8f0',
  background: activeTab === tabKey ? '#fff1f2' : '#fff',
  color: activeTab === tabKey ? '#a30d11' : '#64748b',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
});

const tabBadgeStyle = (activeTab, tabKey) => ({
  background: activeTab === tabKey ? '#a30d11' : '#e2e8f0',
  color: activeTab === tabKey ? '#fff' : '#64748b',
  fontSize: 12,
  fontWeight: 700,
  padding: '1px 7px',
  borderRadius: 10,
  minWidth: 20,
  textAlign: 'center',
});

const API_BASE = 'http://localhost:8080/api';

const getAuth = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

const formatDate = (v) => v ? new Date(v).toLocaleString('vi-VN', {
  hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
}) : '—';

// ==================== STATUS CONFIG & BADGE ====================
const STATUS_CONFIG = {
  PENDING: { label: 'Chờ duyệt', bg: '#fef9c3', color: '#ca8a04', icon: 'bi-clock' },
  SUBMITTED: { label: 'Đã nộp', bg: '#e0f2fe', color: '#0284c7', icon: 'bi-box-arrow-in-right' },
  'Chờ duyệt': { label: 'Chờ duyệt', bg: '#fef9c3', color: '#ca8a04', icon: 'bi-clock' },
  APPROVED: { label: 'Đã duyệt', bg: '#dcfce7', color: '#16a34a', icon: 'bi-check-circle' },
  COMPLETED: { label: 'Hoàn thành', bg: '#dcfce7', color: '#16a34a', icon: 'bi-check-circle-fill' },
  REJECTED: { label: 'Bị từ chối', bg: '#fee2e2', color: '#dc2626', icon: 'bi-x-circle' },
  CANCELLED: { label: 'Đã hủy', bg: '#f1f5f9', color: '#64748b', icon: 'bi-slash-circle' },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || { label: status, bg: '#f3f4f6', color: '#6b7280', icon: 'bi-circle' };
  return (
    <span style={statusBadgeStyle(cfg)}>
      <i className={`bi ${cfg.icon}`} style={{ fontSize: 12 }} /> {cfg.label}
    </span>
  );
};

const TABS = [
  { key: 'PENDING', label: 'Chờ xử lý' },
  { key: 'APPROVED', label: 'Đã duyệt' },
  { key: 'REJECTED', label: 'Bị từ chối' },
];

// ==================== MODAL CHI TIẾT ====================
const DeclarationDetailModal = ({ isOpen, onClose, declaration, onCancel, isCancelling }) => {
  if (!isOpen || !declaration) return null;

  // Chỉ cho phép hủy khi ở trạng thái PENDING hoặc SUBMITTED
  const canCancel = ['PENDING', 'SUBMITTED', 'Chờ duyệt'].includes(declaration?.status);

  return (
    <div style={modalBackdropStyle} {...backdropA11yProps(onClose)}>
      
      <div style={{
        background: '#fff', borderRadius: 12, width: '95%', maxWidth: 920,
        maxHeight: '92vh', overflow: 'auto', boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
      }}>
        
        {/* Header Modal */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 22, color: '#0f172a' }}>{declaration?.type || 'Đăng ký biến động đất đai'}</h2>
            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 14 }}>
              Mã hồ sơ: <strong>HS-{String(declaration?.id).padStart(5, '0')}</strong>
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <StatusBadge status={declaration?.status} />
            <p style={{ margin: '6px 0 0', fontSize: 13, color: '#64748b' }}>
              Nộp lúc: {formatDate(declaration?.date)}
            </p>
          </div>
        </div>

        <div style={{ padding: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div>
              <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>THÔNG TIN THỬA ĐẤT</h4>
              <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8, lineHeight: 1.8 }}>
                <p><strong>Thửa đất số:</strong> {declaration?.parcelId || '—'}</p>
                <p><strong>Diện tích:</strong> {declaration?.actualArea ? `${declaration.actualArea} m²` : '—'}</p>
                <p><strong>Địa chỉ:</strong> {declaration?.address || '—'}</p>
                <p><strong>Loại đất:</strong> {declaration?.land_type || '—'}</p>
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>TÀI SẢN GẮN LIỀN VỚI ĐẤT</h4>
              <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8, lineHeight: 1.8 }}>
                <p><strong>Nhà ở:</strong> {declaration?.attachedHouse || '—'}</p>
                <p><strong>Công trình khác:</strong> {declaration?.attachedOther || '—'}</p>
                <p><strong>Ghi chú:</strong> {declaration?.note || 'Không có'}</p>
              </div>
            </div>
          </div>

          {/* Tiến độ luân chuyển */}
          <div style={{ marginTop: 28 }}>
            <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>
              <i className="bi bi-clock-history"></i> Tiến độ luân chuyển
            </h4>
            <div style={{ borderLeft: '3px solid #e2e8f0', paddingLeft: 20 }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, color: '#64748b' }}>{formatDate(declaration?.date)}</div>
                <div>Người dân nộp hồ sơ trực tuyến</div>
                <small style={{ color: '#10b981' }}>Hồ sơ đã được gửi lên hệ thống thành công.</small>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button type="button" onClick={onClose} 
            style={{ padding: '10px 24px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}
          >
            Đóng
          </button>

          {canCancel && (
            <button type="button" onClick={() => onCancel(declaration.id)}
              disabled={isCancelling}
              style={{ 
                padding: '10px 24px', borderRadius: 8, 
                background: isCancelling ? '#fca5a5' : '#a30d11', 
                color: '#fff', border: 'none', cursor: isCancelling ? 'not-allowed' : 'pointer' 
              }}
            >
              {isCancelling ? 'Đang hủy...' : 'Hủy hồ sơ'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const loadMyDeclarations = async () => {
  const res = await fetch(`${API_BASE}/tax/declarations/my-history`, {
    headers: getAuth(),
  });
  const json = await res.json();
  const raw = Array.isArray(json) ? json : (json.data || []);

  const formattedData = raw.map((d) => ({
    id: d.recordId || d.id,
    type:
      d.recordCategory === 'LAND_OWNERSHIP_NEW'
        ? 'Khai báo đất sở hữu (Đất mới)'
        : d.recordCategory || 'Khai báo thuế đất',
    address: d.address || `Thửa đất #${d.parcelId || '—'}`,
    date: d.createdAt || d.submittedAt,
    status: d.status || d.currentStatus || 'PENDING',
    parcelId: d.parcelId || d.parcelNumber || '—',
    mapSheetNumber: d.mapSheetNumber || '—',
    actualArea: d.areaSize || d.declaredArea,
    land_type: d.usageType || d.declaredUsage || d.landTypeName || '—',
    note: d.declarationNotes || d.notes || '—',
    attachedHouse: d.attachedHouse || 'Không có',
    attachedOther: d.attachedOther || 'Không có',
  }));

  formattedData.sort((a, b) => b.id - a.id);
  notifyPendingDeclarationsChanged(countPendingDeclarations(formattedData));
  return formattedData;
};

const propertyUiReducer = (state, action) => {
  switch (action.type) {
    case 'PATCH':
      return { ...state, ...action.payload };
    case 'OPEN_DETAIL':
      return { ...state, selectedDecl: action.decl, modalOpen: true };
    case 'CLOSE_MODAL':
      return { ...state, modalOpen: false };
    default:
      return state;
  }
};

// ==================== MAIN PAGE ====================
const PropertyDeclarationPage = () => {
  const { showAlert, showConfirm } = useAppDialog();
  const navigate = useNavigate();
  const { user } = useUserInfo();

  const { data: declarations = [], error: loadError, isLoading: loading, reload: fetchDeclarations } =
    useAsyncMountLoadWithReload(loadMyDeclarations);
  const error = loadError ? 'Không thể tải dữ liệu' : '';

  const [ui, dispatchUi] = useReducer(propertyUiReducer, {
    search: '',
    tab: 'PENDING',
    selectedDecl: null,
    modalOpen: false,
    isCancelling: false,
  });
  const { search, tab, selectedDecl, modalOpen, isCancelling } = ui;

  const openDetail = (decl) => dispatchUi({ type: 'OPEN_DETAIL', decl });

  // Hàm gọi API xử lý hủy hồ sơ
  const handleCancelDeclaration = async (id) => {
    const ok = await showConfirm({
      title: 'Xác nhận hủy hồ sơ',
      message: 'Bạn có chắc chắn muốn hủy hồ sơ này không? Hành động này không thể hoàn tác.',
      variant: 'warning',
      confirmLabel: 'Hủy hồ sơ',
    });
    if (!ok) return;

    dispatchUi({ type: 'PATCH', payload: { isCancelling: true } });
    try {
      const res = await fetch(`${API_BASE}/tax/declarations/${id}/cancel`, {
        method: 'DELETE',
        headers: getAuth()
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Lỗi server: ${res.status}`);
      }

      await showAlert({ title: 'Thành công', message: 'Hủy hồ sơ thành công!', variant: 'success' });
      dispatchUi({ type: 'CLOSE_MODAL' });
      fetchDeclarations(); // Tải lại danh sách sau khi hủy
    } catch (err) {
      console.error("Lỗi hủy hồ sơ:", err);
      await showAlert({
        title: 'Lỗi',
        message: `Hủy hồ sơ thất bại: ${err.message}`,
        variant: 'error',
      });
    } finally {
      dispatchUi({ type: 'PATCH', payload: { isCancelling: false } });
    }
  };

  const getTabData = () => {
    const q = search.toLowerCase().trim();
    const hsCode = (id) => (id ? `hs-${String(id).padStart(5, '0')}` : '');
    return declarations.filter(d => {
      const matchSearch = !q ||
        (d.type && d.type.toLowerCase().includes(q)) ||
        String(d.id ?? '').includes(q) ||
        hsCode(d.id).includes(q) ||
        (d.address && d.address.toLowerCase().includes(q));
      
      const s = d.status;
      let matchTab = false;
      if (tab === 'PENDING') {
        matchTab = isPendingDeclaration(d);
      } else if (tab === 'APPROVED') {
        matchTab = (s === 'APPROVED' || s === 'COMPLETED');
      } else if (tab === 'REJECTED') {
        matchTab = (s === 'REJECTED' || s === 'CANCELLED');
      }
      return matchSearch && matchTab;
    });
  };

  const tabData = getTabData();
  const pendingCount = countPendingDeclarations(declarations);

  return (
    <LandTaxLayout user={user}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h3 style={{ fontWeight: 800, fontSize: 26, color: '#0f172a', margin: 0 }}>Hồ sơ khai báo</h3>
          <p style={{ color: '#94a3b8', fontSize: 13, margin: '4px 0 0' }}>Quản lý và theo dõi hồ sơ đất đai của bạn</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ position: 'relative' }}>
            <i className="bi bi-search" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 13 }} />
            <input 
              value={search} 
              onChange={e => dispatchUi({ type: 'PATCH', payload: { search: e.target.value } })} 
              placeholder="Tìm kiếm mã hồ sơ, tên hồ sơ, địa chỉ..."
              aria-label="Tìm kiếm mã hồ sơ, tên hồ sơ, địa chỉ"
              className={FOCUS_VISIBLE_CLASS}
              style={{ padding: '9px 14px 9px 36px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, width: 280 }} 
            />
          </div>
          <button type="button" onClick={() => navigate('/submit-declaration')}
            style={createDeclarationButtonStyle}
          >
            <i className="bi bi-file-earmark-plus" /> Tạo hồ sơ
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        {/* Tabs — pill style giống TaxPage */}
        <div style={{ display: 'flex', gap: 4, padding: '14px 16px', borderBottom: '1px solid #f1f5f9' }}>
          {TABS.map((t) => (
            <button type="button" key={t.key}
              onClick={() => dispatchUi({ type: 'PATCH', payload: { tab: t.key } })}
              style={tabButtonStyle(tab, t.key)}
            >
              {t.label}
              {t.key === 'PENDING' && pendingCount > 0 && (
                <span
                  style={tabBadgeStyle(tab, t.key)}
                >
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Table Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 3fr 1.5fr 1.5fr', gap: 0, background: '#fafafa', borderBottom: '1px solid #e2e8f0' }}>
          {['LOẠI THỦ TỤC', 'TÀI SẢN LIÊN QUAN', 'NGÀY NỘP', 'TRẠNG THÁI'].map(h => (
            <div key={h} style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700, color: '#64748b', letterSpacing: '0.06em' }}>
              {h}
            </div>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
            <output className="spinner-border text-danger" aria-live="polite" />
          </div>
        ) : tabData.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
            <i className="bi bi-inbox" style={{ fontSize: 36 }} />
            <p style={{ marginTop: 12, fontSize: 13 }}>Không có hồ sơ nào khớp với bộ lọc</p>
          </div>
        ) : (
          tabData.map((d, i) => (
            <div 
              key={d.id || i} 
              {...interactiveDivProps(() => openDetail(d), `Xem chi tiết hồ sơ ${d.id ? `HS-${String(d.id).padStart(5, '0')}` : ''}`)}
              style={{ 
                display: 'grid', 
                gridTemplateColumns: '2fr 3fr 1.5fr 1.5fr', 
                borderBottom: i < tabData.length - 1 ? '1px solid #f1f5f9' : 'none',
                cursor: 'pointer'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ padding: '16px' }}>
                <p style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', margin: 0 }}>{d.type}</p>
                <p style={{ fontSize: 12, color: '#94a3b8', margin: '3px 0 0' }}>
                  {d.id ? `HS-${String(d.id).padStart(5,'0')}` : '—'}
                </p>
              </div>
              <div style={{ padding: '16px', color: '#475569', fontSize: 13, display: 'flex', alignItems: 'center' }}>
                {d.address}
              </div>
              <div style={{ padding: '16px', color: '#475569', fontSize: 13, display: 'flex', alignItems: 'center' }}>
                {formatDate(d.date)}
              </div>
              <div style={{ padding: '16px', display: 'flex', alignItems: 'center' }}>
                <StatusBadge status={d.status} />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Chi Tiết */}
      <DeclarationDetailModal 
        isOpen={modalOpen} 
        onClose={() => dispatchUi({ type: 'CLOSE_MODAL' })} 
        declaration={selectedDecl} 
        onCancel={handleCancelDeclaration}
        isCancelling={isCancelling}
      />
    </LandTaxLayout>
  );
};

export default PropertyDeclarationPage;