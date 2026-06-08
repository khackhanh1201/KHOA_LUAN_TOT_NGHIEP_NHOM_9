import React from 'react';
import LandTaxNavItem from './LandTaxNavItem';
import { layoutStyles as styles } from './landTaxLayoutStyles';

const LandTaxSidebar = ({ location, navigate, pendingDeclarationCount }) => (
  <nav style={styles.sidebar}>
    <div style={{ padding: '8px 12px' }}>
      <LandTaxNavItem
        active={location.pathname === '/land-tax' || location.pathname === '/home'}
        icon="bi-grid-3x3-gap-fill"
        label="Bảng điều khiển"
        onClick={() => navigate('/land-tax')}
      />
      <LandTaxNavItem
        active={location.pathname === '/land-information'}
        icon="bi-info-circle-fill"
        label="Thông tin đất đai"
        onClick={() => navigate('/land-information')}
      />
      <LandTaxNavItem
        active={location.pathname === '/tax'}
        icon="bi-receipt-cutoff"
        label="Thuế đất đai"
        onClick={() => navigate('/tax')}
      />
      <LandTaxNavItem
        active={location.pathname === '/property-declaration'}
        icon="bi-folder2-open"
        label="Hồ sơ khai báo"
        onClick={() => navigate('/property-declaration')}
        badge={pendingDeclarationCount > 0 ? String(pendingDeclarationCount) : undefined}
      />
      <LandTaxNavItem
        active={location.pathname === '/payment'}
        icon="bi-credit-card-2-front"
        label="Thanh toán"
        onClick={() => navigate('/payment')}
      />
      <LandTaxNavItem
        active={location.pathname === '/complaint'}
        icon="bi-exclamation-triangle-fill"
        label="Khiếu nại"
        onClick={() => navigate('/complaint')}
      />
      <LandTaxNavItem
        active={location.pathname === '/search'}
        icon="bi-search"
        label="Tra cứu"
        onClick={() => navigate('/search')}
      />
      <LandTaxNavItem
        active={location.pathname === '/account'}
        icon="bi-person-circle"
        label="Tài khoản"
        onClick={() => navigate('/account')}
      />
    </div>
  </nav>
);

export default LandTaxSidebar;
