import React from 'react';
import { formatTaxRecordCode } from '../../../utils/taxRecordCode';
import {
  advBtnTrigger, advPopover, advTitle, advFieldGroup,
  advFieldLabel, advFieldInput, advFooter, advBtnReset, advBtnClose,
} from './_designTokens';
import { FOCUS_VISIBLE_CLASS } from '../../theme/designTokens';

const TaxRecordsListView = ({
  search, showAdvanced, advFilters, error, loading, filtered,
  dispatch, onViewDetail, onOpenExport,
}) => (
  <>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#1e293b', letterSpacing: '-0.01em' }}>Quản lý hồ sơ thuế</h2>
            <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: 14 }}>Tra cứu và quản lý nghĩa vụ tài chính của người dân</p>
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center', position: 'relative' }}>
            <div style={{ position: 'relative', width: 360 }}>
              <i className="bi bi-search" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
              <input
                type="text"
                aria-label="Tìm kiếm CCCD, số hồ sơ"
                placeholder="Tìm kiếm CCCD, số hồ sơ..."
                value={search}
                onChange={(e) => dispatch({ type: 'patch', payload: { search: e.target.value } })}
                className={FOCUS_VISIBLE_CLASS}
                style={{
                  width: '100%', padding: '10px 14px 10px 40px',
                  border: '1px solid #e2e8f0', borderRadius: 8,
                  fontSize: 14, background: '#fff', color: '#1e293b'
                }}
              />
            </div>

            <button type="button" style={advBtnTrigger} onClick={() => dispatch({ type: 'patch', payload: { showAdvanced: !showAdvanced } })}>
              <i className="bi bi-sliders" /> Tìm kiếm nâng cao
            </button>

            {showAdvanced && (
              <div style={advPopover}>
                <h4 style={advTitle}>Tìm kiếm nâng cao</h4>
                <div style={advFieldGroup}>
                  <label htmlFor="tr-adv-code" style={advFieldLabel}>Mã hồ sơ</label>
                  <input id="tr-adv-code" type="text" placeholder="Nhập mã hồ sơ..." style={advFieldInput} value={advFilters.code} onChange={e => dispatch({ type: 'patch', payload: { advFilters: { ...advFilters, code: e.target.value } } })} />
                </div>
                <div style={advFieldGroup}>
                  <label htmlFor="tr-adv-name" style={advFieldLabel}>Họ và tên</label>
                  <input id="tr-adv-name" type="text" placeholder="Nhập họ và tên..." style={advFieldInput} value={advFilters.name} onChange={e => dispatch({ type: 'patch', payload: { advFilters: { ...advFilters, name: e.target.value } } })} />
                </div>
                <div style={advFieldGroup}>
                  <label htmlFor="tr-adv-cccd" style={advFieldLabel}>CCCD</label>
                  <input id="tr-adv-cccd" type="text" placeholder="Nhập số CCCD..." style={advFieldInput} value={advFilters.cccd} onChange={e => dispatch({ type: 'patch', payload: { advFilters: { ...advFilters, cccd: e.target.value } } })} />
                </div>
                <div style={{...advFieldGroup, marginBottom: 0}}>
                  <label htmlFor="tr-adv-address" style={advFieldLabel}>Địa chỉ</label>
                  <input id="tr-adv-address" type="text" placeholder="Nhập địa chỉ thửa đất..." style={advFieldInput} value={advFilters.address} onChange={e => dispatch({ type: 'patch', payload: { advFilters: { ...advFilters, address: e.target.value } } })} />
                </div>
                <div style={advFooter}>
                  <button type="button" style={advBtnReset} onClick={() => dispatch({ type: 'resetFilters' })}>Xóa bộ lọc</button>
                  <button type="button" style={advBtnClose} onClick={() => dispatch({ type: 'patch', payload: { showAdvanced: false } })}>Đóng</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 2px rgba(15,23,42,0.04)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
  <thead>
    <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
      <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: 12, color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>STT</th>
      <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: 12, color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Mã hồ sơ</th>
      <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: 12, color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Họ và tên</th>
      <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: 12, color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>CCCD</th>
      <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: 12, color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Địa chỉ</th>
      <th style={{ padding: '14px 20px', textAlign: 'right', fontSize: 12, color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Số thuế (VNĐ)</th>
      <th style={{ padding: '14px 20px', textAlign: 'center', fontSize: 12, color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Thao tác</th>
    </tr>
  </thead>
  <tbody>
    {loading ? (
      <tr><td colSpan="7" style={{ textAlign: 'center', padding: '48px' }}>
        <div className="spinner-border text-danger" />
        <div style={{ marginTop: 8, color: '#64748b', fontSize: 13 }}>Đang tải dữ liệu…</div>
      </td></tr>
    ) : filtered.length === 0 ? (
      <tr><td colSpan="7" style={{ textAlign: 'center', padding: '48px', color: '#94a3b8', fontSize: 14 }}>Không có hồ sơ nào</td></tr>
    ) : (
      filtered.map((r, index) => (
        <tr key={r.recordId || index} style={{ borderBottom: '1px solid #f1f5f9' }}>
          <td style={{ padding: '14px 20px', fontSize: 14, color: '#64748b' }}>{index + 1}</td>
          <td style={{ padding: '14px 20px', fontWeight: 700, color: '#a30d11', fontSize: 14 }}>{formatTaxRecordCode(r.recordId)}</td>
          <td style={{ padding: '14px 20px', fontWeight: 600, color: '#1e293b', fontSize: 14 }}>{r.fullName || '—'}</td>
          <td style={{ padding: '14px 20px', fontWeight: 500, color: '#334155', fontSize: 14 }}>{r.senderCccd || '—'}</td>
          <td style={{ padding: '14px 20px', color: '#64748b', fontSize: 14 }}>{r.address || '—'}</td>
          <td style={{ padding: '14px 20px', textAlign: 'right', fontWeight: 700, color: '#a30d11', fontSize: 14 }}>
            {r.calculatedTaxAmount ? Number(r.calculatedTaxAmount).toLocaleString('vi-VN') + 'đ' : '—'}
          </td>
          <td style={{ padding: '14px 20px', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', gap: 4, justifyContent: 'center' }}>
              <button type="button" onClick={() => onViewDetail(r)}
                aria-label="Xem chi tiết"
                title="Xem chi tiết"
                style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 18, cursor: 'pointer', padding: '6px 8px', borderRadius: 6 }}
              >
                <i className="bi bi-eye" />
              </button>
              <button type="button" onClick={() => onOpenExport(r)}
                aria-label="Xuất dữ liệu"
                title="Xuất dữ liệu"
                style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 18, cursor: 'pointer', padding: '6px 8px', borderRadius: 6 }}
              >
                <i className="bi bi-download" />
              </button>
            </div>
          </td>
        </tr>
      ))
    )}
  </tbody>
</table>
        </div>
  </>
);

export default TaxRecordsListView;
