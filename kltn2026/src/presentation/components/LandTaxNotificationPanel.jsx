import React from 'react';
import { interactiveDivProps } from '../../utils/a11y';
import { layoutStyles as styles } from './landTaxLayoutStyles';

const rdStylePositionTopRight = {
          position: 'absolute',
          top: '42px',
          right: 0,
          width: 360,
          background: '#fff',
          borderRadius: 12,
          boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
          zIndex: 2000,
          maxHeight: 420,
          overflow: 'hidden',
          color: '#0f172a',
        };

const LandTaxNotificationPanel = ({
  notiRef,
  notiOpen,
  setNotiOpen,
  unreadCount,
  loading,
  notifications,
  markRead,
  markAllRead,
  navigate,
}) => (
  <div className="position-relative" ref={notiRef}>
    <button
      type="button"
      className="cursor-pointer border-0 bg-transparent text-white p-0 position-relative"
      onClick={() => setNotiOpen((v) => !v)}
      title="Thông báo"
      aria-label="Thông báo"
      aria-expanded={notiOpen}
      style={{ padding: '4px 8px' }}
    >
      <i className="bi bi-bell fs-5 text-white" />
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
      <div
        style={rdStylePositionTopRight}
      >
        <div
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid #eee',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <strong>Thông báo</strong>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllRead}
              style={{ border: 'none', background: 'none', color: '#a30d11', fontSize: 12, cursor: 'pointer' }}
            >
              Đánh dấu tất cả đã đọc
            </button>
          )}
        </div>

        <div style={{ maxHeight: 320, overflowY: 'auto' }}>
          {loading ? (
            <p style={{ padding: 16, margin: 0, color: '#94a3b8' }}>Đang tải...</p>
          ) : notifications.length === 0 ? (
            <p style={{ padding: 16, margin: 0, color: '#94a3b8' }}>Không có thông báo</p>
          ) : (
            notifications.slice(0, 8).map((n) => (
              <div
                key={n.notiId}
                {...interactiveDivProps(async () => {
                  if (!n.isRead) await markRead(n.notiId);
                  setNotiOpen(false);
                  if (n.notiType?.includes('TAX') || n.notiType === 'PAYMENT_SUCCESS') navigate('/tax');
                  else if (n.notiType?.includes('COMPLAINT')) navigate('/complaint');
                  else if (
                    n.notiType === 'DECLARATION_FRAUD_REJECTED'
                    || n.notiType === 'DECLARATION_CANCELLED'
                    || n.notiType === 'DECLARATION_SUBMITTED'
                  ) navigate('/property-declaration');
                  else navigate('/property-declaration');
                }, n.title)}
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid #f1f5f9',
                  cursor: 'pointer',
                  background: n.isRead ? '#fff' : '#fff7ed',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 13 }}>{n.title}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{n.content}</div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
                  {n.createdAt ? new Date(n.createdAt).toLocaleString('vi-VN') : ''}
                </div>
              </div>
            ))
          )}
        </div>

        <div style={{ padding: 10, textAlign: 'center', borderTop: '1px solid #eee' }}>
          <button
            type="button"
            onClick={() => {
              setNotiOpen(false);
              navigate('/notifications');
            }}
            style={{ border: 'none', background: 'none', color: '#a30d11', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
          >
            Xem tất cả
          </button>
        </div>
      </div>
    )}
  </div>
);

export default LandTaxNotificationPanel;
