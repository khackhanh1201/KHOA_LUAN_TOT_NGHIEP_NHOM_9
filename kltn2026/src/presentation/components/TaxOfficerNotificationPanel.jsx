import React from 'react';
import { interactiveDivProps } from '../../utils/a11y';
import {
  notiPanelStyle,
  notiPanelHeaderStyle,
  notiMarkAllBtnStyle,
  notiEmptyStyle,
  notiItemStyle,
  notiPanelFooterStyle,
  notiViewAllBtnStyle,
} from './taxOfficerLayoutStyles';

const TaxOfficerNotificationPanel = ({
  notiRef,
  notiOpen,
  setNotiOpen,
  unreadCount,
  notiLoading,
  notifications,
  markRead,
  markAllRead,
  navigate,
}) => (
  <div className="position-relative" ref={notiRef}>
    <button
      type="button"
      className="cursor-pointer border-0 bg-transparent text-white p-0 position-relative"
      title="Thông báo"
      aria-label="Thông báo"
      aria-expanded={notiOpen}
      style={{ padding: '4px 8px' }}
      onClick={() => setNotiOpen((v) => !v)}
    >
      <i className="bi bi-bell fs-5" />
      {unreadCount > 0 && (
        <span
          className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning text-dark"
          style={{ fontSize: '12px', padding: '2px 5px' }}
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>

    {notiOpen && (
      <div style={notiPanelStyle}>
        <div style={notiPanelHeaderStyle}>
          <strong>Thông báo</strong>
          {unreadCount > 0 && (
            <button type="button" onClick={markAllRead} style={notiMarkAllBtnStyle}>
              Đánh dấu tất cả đã đọc
            </button>
          )}
        </div>
        <div style={{ maxHeight: 320, overflowY: 'auto' }}>
          {notiLoading ? (
            <p style={notiEmptyStyle}>Đang tải...</p>
          ) : notifications.length === 0 ? (
            <p style={notiEmptyStyle}>Không có thông báo</p>
          ) : (
            notifications.slice(0, 10).map((n) => (
              <div
                key={n.id}
                {...interactiveDivProps(async () => {
                  if (!n.isRead) await markRead(n.id);
                  setNotiOpen(false);
                  if (n.linkPath) navigate(n.linkPath);
                }, n.title)}
                style={{
                  ...notiItemStyle,
                  background: n.isRead ? '#fff' : '#fff7ed',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 13, color: '#1e293b' }}>{n.title}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{n.content}</div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
                  {n.createdAt ? new Date(n.createdAt).toLocaleString('vi-VN') : ''}
                </div>
              </div>
            ))
          )}
        </div>
        <div style={notiPanelFooterStyle}>
          <button
            type="button"
            onClick={() => {
              setNotiOpen(false);
              navigate('/tax-officer/dashboard');
            }}
            style={notiViewAllBtnStyle}
          >
            Xem bảng điều khiển
          </button>
        </div>
      </div>
    )}
  </div>
);

export default TaxOfficerNotificationPanel;
