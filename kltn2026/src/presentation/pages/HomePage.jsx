import React from 'react';
import { useNavigate } from 'react-router-dom';
import { interactiveDivProps } from '../../utils/a11y';
import MainLayout from '../components/MainLayout';
import { getDisplayName, getLandTaxSystemPath } from '../../usecases/authService';
import { useAuth } from '../../hooks/useAuth';

const menuIconWrapStyle = (bg) => ({
  width: 44,
  height: 44,
  borderRadius: 12,
  background: bg,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 12,
});

const HomePage = () => {
  const navigate = useNavigate();
  const { user, role } = useAuth();

  // Card "Thuế đất" — đích phụ thuộc role hiện tại (xem authService).
  // Citizen → /land-tax; 3 role nghiệp vụ → dashboard riêng.
  const openLandTaxSystem = () => {
    window.open(getLandTaxSystemPath(role), '_blank');
  };

  const menuItems = [
    {
      title: 'Thuế đất',
      desc: 'Tra cứu, kê khai và nộp thuế đất trực tuyến',
      icon: 'bi-house-gear',
      color: '#f97316',
      bg: '#fff7ed',
      onClick: openLandTaxSystem,
    },
    {
      title: 'Kê khai tài sản',
      desc: 'Kê khai thông tin bất động sản đang sở hữu',
      icon: 'bi-file-earmark-text',
      color: '#3b82f6',
      bg: '#eff6ff',
      onClick: () => navigate('/property-declaration'),
    },
    {
      title: 'Khiếu nại',
      desc: 'Gửi khiếu nại về thuế đất, hồ sơ bất động sản',
      icon: 'bi-chat-left-dots',
      color: '#ef4444',
      bg: '#fff1f2',
      onClick: () => navigate('/complaint'),
    },
    {
      title: 'Tin tức - Sự kiện',
      desc: 'Tin tức nổi bật mới nhất trong ngày',
      icon: 'bi-newspaper',
      color: '#eab308',
      bg: '#fefce8',
      onClick: () => {},
    },
    {
      title: 'Cảnh báo lừa đảo',
      desc: 'Cảnh báo lừa đảo mới nhất trong ngày',
      icon: 'bi-shield-exclamation',
      color: '#8b5cf6',
      bg: '#f5f3ff',
      onClick: () => {},
    },
    {
      title: 'Câu hỏi thường gặp',
      desc: 'Những thắc mắc của người dùng về ứng dụng VNeID',
      icon: 'bi-question-circle',
      color: '#06b6d4',
      bg: '#ecfeff',
      onClick: () => {},
    },
  ];

  return (
    <MainLayout user={user}>
      {/* Banner */}
      <div className="mb-4 shadow-sm" style={styles.banner}>
        <div style={styles.bannerOverlay}>
          <h1 className="display-4 fw-light" style={{ fontFamily: 'cursive' }}>Welcome to Viet Nam</h1>
        </div>
      </div>

      {/* Welcome */}
      <div className="card border-0 shadow-sm p-4 mb-4" style={{ borderRadius: 20 }}>
        <h3 className="fw-bold">Chào, {getDisplayName(user, 'bạn')}!</h3>
        <p className="text-muted mb-0">Chào mừng bạn đến với Trang thông tin định danh điện tử</p>
      </div>

      {/* Grid Menu — GIAO DIỆN HỆT NHAU cho mọi role.
          Hành vi của card "Thuế đất" được dispatch theo role qua getLandTaxSystemPath. */}
      <div className="row g-4">
        {menuItems.map((item) => (
          <div key={item.title} className="col-md-4">
            <div
              {...interactiveDivProps(item.onClick, item.title)}
              className="card border-0 shadow-sm h-100 p-4"
              style={{ borderRadius: 20, cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = ''; }}
            >
              <div style={menuIconWrapStyle(item.bg)}>
                <i className={`bi ${item.icon}`} style={{ fontSize: 22, color: item.color }} />
              </div>
              <h5 className="fw-bold">{item.title}</h5>
              <p className="small text-muted mb-4">{item.desc}</p>
              <div className="mt-auto d-flex justify-content-end">
                <span style={{ color: item.color, fontWeight: 700, fontSize: 13 }}>
                  Xem ngay <i className="bi bi-arrow-right" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </MainLayout>
  );
};

const styles = {
  banner: {
    height: 250,
    borderRadius: 25,
    backgroundImage: `url('https://images.unsplash.com/photo-1528127269322-539801943592?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  bannerOverlay: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
  },
};

export default HomePage;