import React from 'react';
import TaxOfficerNavItem from './TaxOfficerNavItem';
import { layoutStyles as styles } from './taxOfficerLayoutStyles';

const TaxOfficerSidebar = ({
  location,
  navigate,
  pendingTaxRecords,
  pendingComplaints,
}) => (
  <nav style={styles.sidebar}>
    <div style={{ padding: '18px 14px' }}>
      <TaxOfficerNavItem
        active={location.pathname === '/tax-officer/dashboard'}
        icon="bi-grid"
        label="Bảng điều khiển"
        onClick={() => navigate('/tax-officer/dashboard')}
      />
      <TaxOfficerNavItem
        active={location.pathname === '/tax-officer/tax-records'}
        icon="bi-archive"
        label="Hồ sơ thuế"
        onClick={() => navigate('/tax-officer/tax-records')}
      />
      <TaxOfficerNavItem
        active={location.pathname === '/tax-officer/tax-processing'}
        icon="bi-file-earmark-check"
        label="Xử lý khai thuế"
        onClick={() => navigate('/tax-officer/tax-processing')}
        badge={pendingTaxRecords > 0 ? pendingTaxRecords : null}
      />
      <TaxOfficerNavItem
        active={location.pathname === '/tax-officer/payment-management'}
        icon="bi-credit-card-2-front"
        label="Quản lý thanh toán"
        onClick={() => navigate('/tax-officer/payment-management')}
      />
      <TaxOfficerNavItem
        active={location.pathname === '/tax-officer/complaint-management'}
        icon="bi-chat-square-text"
        label="Xử lý khiếu nại"
        onClick={() => navigate('/tax-officer/complaint-management')}
        badge={pendingComplaints > 0 ? pendingComplaints : null}
      />
      <TaxOfficerNavItem
        active={location.pathname === '/tax-officer/report-management'}
        icon="bi-bar-chart"
        label="Báo cáo thống kê"
        onClick={() => navigate('/tax-officer/report-management')}
      />
      <TaxOfficerNavItem
        active={location.pathname === '/account'}
        icon="bi-person-circle"
        label="Tài khoản"
        onClick={() => navigate('/account')}
      />
    </div>
  </nav>
);

export default TaxOfficerSidebar;
