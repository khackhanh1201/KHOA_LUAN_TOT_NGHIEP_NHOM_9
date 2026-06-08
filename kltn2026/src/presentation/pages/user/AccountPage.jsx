import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import LandTaxLayout from '../../components/LandTaxLayout';
import TaxOfficerLayout from '../../components/TaxOfficerLayout';
import AdminLayout from '../../components/AdminLayout';
import CadastralLayout from '../../components/CadastralLayout';
import AccountPageContent from '../shared/AccountPageContent';
import { useAccountProfile } from '../../../hooks/useAccountProfile';
import { clearSession } from '../../../usecases/authService';

const LAYOUT_BY_ROLE = {
  ROLE_CITIZEN: LandTaxLayout,
  ROLE_TAX_OFFICER: TaxOfficerLayout,
  ROLE_ADMIN: AdminLayout,
  ROLE_LAND_OFFICER: CadastralLayout,
};

const AccountPage = ({ Layout: LayoutOverride }) => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const { userInfo, loading, error } = useAccountProfile();

  const Layout = LayoutOverride || LAYOUT_BY_ROLE[role] || LandTaxLayout;

  const handleLogout = () => {
    clearSession();
    navigate('/');
  };

  if (loading) {
    return (
      <Layout user={userInfo}>
        <div className="container py-5 text-center">
          <div className="spinner-border text-danger" style={{ width: '3rem', height: '3rem' }} />
          <p className="mt-3">Đang tải thông tin tài khoản...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout user={userInfo}>
        <div className="container py-4" style={{ maxWidth: '1000px' }}>
          <div className="alert alert-danger">{error}</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={userInfo}>
      <AccountPageContent userInfo={userInfo} onLogout={handleLogout} />
    </Layout>
  );
};

export default AccountPage;
