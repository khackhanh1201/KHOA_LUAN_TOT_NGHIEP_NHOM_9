import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CadastralNavItem from './CadastralNavItem';
import { styles } from './cadastralLayoutStyles';

const CadastralSidebar = ({ pendingRecords, pendingComplaints }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav style={styles.sidebar}>
      <div style={{ padding: '15px 12px' }}>
        <CadastralNavItem
          active={location.pathname === '/dashboard'}
          icon="bi-grid-3x3-gap-fill"
          label="Bảng điều khiển"
          onClick={() => navigate('/dashboard')}
        />

        <CadastralNavItem
          active={location.pathname === '/digital-cadastral-map'}
          icon="bi-map"
          label="Sổ địa chính số"
          onClick={() => navigate('/digital-cadastral-map')}
        />

        <CadastralNavItem
          active={location.pathname === '/land-price-management'}
          icon="bi-bank"
          label="Quản lý Giá đất"
          onClick={() => navigate('/land-price-management')}
        />

        <CadastralNavItem
          active={location.pathname === '/cadastral-records'}
          icon="bi-folder"
          label="Xử lý Hồ sơ"
          badge={pendingRecords}
          onClick={() => navigate('/cadastral-records')}
        />

        <CadastralNavItem
          active={location.pathname === '/cadastral-complaints'}
          icon="bi-envelope-paper"
          label="Xử lý Khiếu nại"
          badge={pendingComplaints}
          onClick={() => navigate('/cadastral-complaints', { state: { defaultTab: 'Tất cả' } })}
        />

        <CadastralNavItem
          active={location.pathname === '/cadastral-reports'}
          icon="bi-bar-chart-line"
          label="Báo cáo thống kê"
          onClick={() => navigate('/cadastral-reports')}
        />

        <CadastralNavItem
          active={location.pathname === '/account'}
          icon="bi-person-circle"
          label="Tài khoản"
          onClick={() => navigate('/account')}
        />
      </div>
    </nav>
  );
};

export default CadastralSidebar;
