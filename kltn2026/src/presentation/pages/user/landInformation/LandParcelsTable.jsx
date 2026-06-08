import React from 'react';
import { getLandTypeLabel } from './landInfoUtils';

const LandParcelsTable = ({ loading, filtered, onSelectParcel }) => (
  <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
          <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: 700, color: '#475569' }}>SỐ VÀO SỔ CẤP GCN</th>
          <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: 700, color: '#475569' }}>THỬA ĐẤT SỐ</th>
          <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: 700, color: '#475569' }}>TỜ BẢN ĐỒ SỐ</th>
          <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: 700, color: '#475569' }}>LOẠI ĐẤT</th>
          <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: 700, color: '#475569' }}>ĐỊA CHỈ</th>
          <th style={{ padding: '16px 20px', textAlign: 'center', fontWeight: 700, color: '#475569' }}>THAO TÁC</th>
        </tr>
      </thead>
      <tbody>
        {loading ? (
          <tr>
            <td colSpan="6" style={{ textAlign: 'center', padding: '80px' }}>
              <output aria-live="polite" aria-label="Đang tải danh sách thửa đất">
                <span className="spinner-border text-danger" aria-hidden="true" />
                <span className="visually-hidden">Đang tải danh sách thửa đất</span>
              </output>
            </td>
          </tr>
        ) : filtered.length === 0 ? (
          <tr><td colSpan="6" style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>Không tìm thấy thửa đất nào</td></tr>
        ) : (
          filtered.map((p) => (
            <tr key={p.parcelId} style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '18px 20px', fontWeight: 600 }}>{p.gcnBookNumber || '—'}</td>
              <td style={{ padding: '18px 20px', fontWeight: 600 }}>{p.parcelNumber || '—'}</td>
              <td style={{ padding: '18px 20px' }}>{p.mapSheetNumber || '—'}</td>
              <td style={{ padding: '18px 20px' }}>{p.landTypeName || getLandTypeLabel(p.landTypeId)}</td>
              <td style={{ padding: '18px 20px', color: '#475569' }}>{p.address || '—'}</td>
              <td style={{ padding: '18px 20px', textAlign: 'center' }}>
                <button type="button" onClick={() => onSelectParcel(p)}
                  aria-label="Xem chi tiết thửa đất"
                  style={{ background: 'none', border: 'none', fontSize: 22, color: '#64748b', cursor: 'pointer' }}
                >
                  <i className="bi bi-eye" />
                </button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

export default LandParcelsTable;
