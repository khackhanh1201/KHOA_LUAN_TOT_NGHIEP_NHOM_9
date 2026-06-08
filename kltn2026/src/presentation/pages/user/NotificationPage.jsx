import React, { useState } from 'react';
import { interactiveDivProps } from '../../../utils/a11y';
import LandTaxLayout from '../../components/LandTaxLayout';
import { useUserInfo } from '../../../hooks/useUserInfo';
import { useNotifications } from '../../../hooks/useNotifications';

const NotificationPage = () => {
  const { user } = useUserInfo();
  const { notifications, unreadCount, loading, markRead, markAllRead } = useNotifications(60000);
  const [tab, setTab] = useState('all');

  const list = tab === 'unread'
    ? notifications.filter(n => !n.isRead)
    : notifications;

  return (
    <LandTaxLayout user={user}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h3 style={{ margin: 0, fontWeight: 800 }}>Thông báo</h3>
            <p style={{ margin: '4px 0 0', color: '#94a3b8' }}>
              {unreadCount > 0 ? `${unreadCount} chưa đọc` : 'Tất cả đã đọc'}
            </p>
          </div>
          {unreadCount > 0 && (
            <button type="button" onClick={markAllRead} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff' }}>
              Đánh dấu tất cả đã đọc
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {['all', 'unread'].map(key => (
            <button type="button" key={key} onClick={() => setTab(key)} style={{
              padding: '6px 16px', borderRadius: 20, border: tab === key ? '2px solid #a30d11' : '1px solid #e2e8f0',
              background: tab === key ? '#fff1f2' : '#fff', color: tab === key ? '#a30d11' : '#64748b', fontWeight: 600
            }}>
              {key === 'all' ? 'Tất cả' : 'Chưa đọc'}
            </button>
          ))}
        </div>

        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0' }}>
          {loading ? (
            <p style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Đang tải...</p>
          ) : list.length === 0 ? (
            <p style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Không có thông báo</p>
          ) : (
            list.map(n => (
              <div key={n.notiId} {...interactiveDivProps(() => !n.isRead && markRead(n.notiId), n.title)}
                style={{
                  padding: '16px 20px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer',
                  background: n.isRead ? '#fff' : '#fff7ed'
                }}>
                <div style={{ fontWeight: 700 }}>{n.title}</div>
                <div style={{ color: '#64748b', marginTop: 6 }}>{n.content}</div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 6 }}>
                  {n.createdAt ? new Date(n.createdAt).toLocaleString('vi-VN') : ''}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </LandTaxLayout>
  );
};

export default NotificationPage;