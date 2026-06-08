import React from 'react';
import { FOCUS_VISIBLE_CLASS } from '../../../theme/designTokens';

const rdStylePaddingBackgroundColor = {
          padding: '12px 24px',
          background: '#a30d11',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          cursor: 'pointer',
        };

const LandPageHeader = ({ search, onSearchChange, onOpenAdvanced }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
    <div>
      <h4 style={{ fontWeight: 800, color: '#0f172a', margin: 0, fontSize: 28 }}>Danh sách đất đai</h4>
      <p style={{ color: '#64748b', fontSize: 14, margin: '4px 0 0' }}>Quản lý thông tin các thửa đất của bạn</p>
    </div>
    <div style={{ display: 'flex', gap: 12 }}>
      <div style={{ position: 'relative', width: 340 }}>
        <i className="bi bi-search" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
        <input
          type="text"
          placeholder="Tìm kiếm mã thửa, số GCN, địa chỉ..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Tìm kiếm mã thửa, số GCN, địa chỉ"
          className={FOCUS_VISIBLE_CLASS}
          style={{
            width: '100%',
            padding: '12px 14px 12px 40px',
            border: '1px solid #e2e8f0',
            borderRadius: 50,
            fontSize: 14,
            boxSizing: 'border-box',
          }}
        />
      </div>
      <button type="button" onClick={onOpenAdvanced}
        style={rdStylePaddingBackgroundColor}
      >
        <i className="bi bi-sliders2" /> Tìm kiếm nâng cao
      </button>
    </div>
  </div>
);

export default LandPageHeader;
