import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from 'react-router-dom';
import { refreshSessionFromProfile, getLandTaxSystemPath } from './usecases/authService';
import { useAuth } from './hooks/useAuth';
import NotificationPage from './presentation/pages/user/NotificationPage';
import AiChatWidget from './presentation/components/AiChatWidget';
import { DialogProvider } from './presentation/components/dialog/DialogContext';
// Trang trung gian sau login cho MỌI role.
// Citizen tự click chức năng "Đất đai" để vào /land-tax;
// 3 role nghiệp vụ tự click card "Vào hệ thống" để vào dashboard riêng.
// Tập trung tại 1 hằng số để dễ đổi sau này.
const LANDING_PATH = '/home';

// ==================== IMPORT CÁC TRANG USER ====================
import LoginPage from './presentation/pages/LoginPage';
import HomePage from './presentation/pages/HomePage';
import LandTaxPage from './presentation/pages/user/LandTaxPage';
import TaxPage from './presentation/pages/user/TaxPage';
import LandInformationPage from './presentation/pages/user/LandInformationPage';
import PropertyDeclarationPage from './presentation/pages/user/PropertyDeclarationPage';
import SubmitDeclarationPage from './presentation/pages/user/SubmitDeclarationPage';
import ComplaintPage from './presentation/pages/user/ComplaintPage';
import PaymentPage from './presentation/pages/user/PaymentPage';
import PaymentSuccessPage from './presentation/pages/user/PaymentSuccessPage';
import SearchPage from './presentation/pages/user/SearchPage';
import AccountPage from './presentation/pages/user/AccountPage';

// ==================== IMPORT CÁC TRANG ADMIN ====================
import AdminReportStats from './presentation/pages/admin/AdminReportStats';
import AdminDashboard from './presentation/pages/admin/AdminDashboard';
import CategoryManagement from './presentation/pages/admin/CategoryManagement';
import OperationHistory from './presentation/pages/admin/OperationHistory';
import RoleDelegation from './presentation/pages/admin/RoleDelegation';
import UserManagement from './presentation/pages/admin/UserManagement';

// ==================== IMPORT CÁC TRANG TAX OFFICER ====================
import TaxOfficerDashboard from './presentation/pages/tax-officer/TaxOfficerDashboard';
import TaxProcessing from './presentation/pages/tax-officer/TaxProcessing';
import PaymentManagement from './presentation/pages/tax-officer/PaymentManagement';
import TaxRecords from './presentation/pages/tax-officer/TaxRecords';
import ReportManagement from './presentation/pages/tax-officer/ReportManagement';
import ComplaintManagement from './presentation/pages/tax-officer/ComplaintManagement';

// ==================== IMPORT CÁC TRANG LAND OFFICER ====================
import LandOfficerDashboard from './presentation/pages/cadastral-officer/CadastralDashboard';
import CadastralReportStats from './presentation/pages/cadastral-officer/CadastralReportStats';
import ComplaintHandling from './presentation/pages/cadastral-officer/ComplaintHandling';
import DossierProcessing from './presentation/pages/cadastral-officer/DossierProcessing';
import LandPriceManagement from './presentation/pages/cadastral-officer/LandPriceManagement';
import LandRegistry from './presentation/pages/cadastral-officer/LandRegistry';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './index.css';

// 1. PROTECTED ROUTE — bảo vệ route theo role.
// Mapping role → URL được tập trung tại `authService.getHomePathForRole`.
// Component dùng `useAuth()` nên TỰ ĐỘNG re-render khi session đổi
// (vd: sau khi saveSession ghi role mới), không cần reload trang.
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { token, role, isAuthenticated } = useAuth();

  // Log mỗi lần guard chạy để debug sync issue (chỉ in khi role thực sự đổi).
  useEffect(() => {
    console.debug(
      `[ProtectedRoute] token=${!!token} role="${role}" allowed=${
        allowedRoles ? allowedRoles.join(',') : 'ANY'
      }`
    );
  }, [token, role, allowedRoles]);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    const targetPath = getLandTaxSystemPath(role);
    console.warn(
      `[ProtectedRoute] Role "${role}" không có quyền truy cập ` +
      `(cần ${allowedRoles.join(', ')}). Chuyển về "${targetPath}".`
    );
    return <Navigate to={targetPath} replace />;
  }

  return children;
};

// AppRoutes
const AppRoutes = () => {
  const navigate = useNavigate();
  const { role, isAuthenticated } = useAuth();

  // Khi app khởi động: nếu user đã có token (ví dụ vừa F5), gọi /api/profile
  // để refresh role thật từ BE. Tránh trường hợp role trong localStorage bị
  // sai/cũ do BE login không trả roles[], hoặc do user đã được cấp role mới
  // ở phía BE từ lần dùng trước.
  useEffect(() => {
    if (!isAuthenticated) return;
    refreshSessionFromProfile().then((res) => {
      if (res) console.debug('[App] session đã refresh khi mount:', res.role);
    });
  }, [isAuthenticated]);

  // 2. POST-LOGIN REDIRECT.
  // Theo thiết kế: TẤT CẢ role sau khi login đều landing ở trang trung gian
  // (/home). Từ đó user tự click chức năng tương ứng — citizen click
  // "Đất đai", admin/cán bộ click card "Vào hệ thống". Việc routing đến
  // dashboard nghiệp vụ xảy ra trên action của user, KHÔNG phải auto-redirect.
  const handleLoginSuccess = () => {
    const freshRole = localStorage.getItem('role');
    console.log(
      `[Login] Role: "${freshRole}" | useAuth: "${role}" → navigate("${LANDING_PATH}")`
    );
    navigate(LANDING_PATH, { replace: true });
  };

  return (
    <Routes>
      {/* ==================== PUBLIC ==================== */}
      <Route 
        path="/" 
        element={<LoginPage onLoginSuccess={handleLoginSuccess} />} 
      />

      {/* ==================== PROTECTED ADMIN ==================== */}
      <Route 
        path="/admin/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/report-stats" 
        element={
          <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
            <AdminReportStats />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/categories" 
        element={
          <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
            <CategoryManagement />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/operations" 
        element={
          <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
            <OperationHistory />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/roles" 
        element={
          <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
            <RoleDelegation />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/users" 
        element={
          <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
            <UserManagement />
          </ProtectedRoute>
        } 
      />

      {/* ==================== PROTECTED TAX OFFICER ==================== */}
      <Route 
        path="/tax-officer/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['ROLE_TAX_OFFICER']}>
            <TaxOfficerDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/tax-officer/tax-processing" 
        element={
          <ProtectedRoute allowedRoles={['ROLE_TAX_OFFICER']}>
            <TaxProcessing />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/tax-officer/payment-management" 
        element={
          <ProtectedRoute allowedRoles={['ROLE_TAX_OFFICER']}>
            <PaymentManagement />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/tax-officer/tax-records" 
        element={
          <ProtectedRoute allowedRoles={['ROLE_TAX_OFFICER']}>
            <TaxRecords />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/tax-officer/report-management" 
        element={
          <ProtectedRoute allowedRoles={['ROLE_TAX_OFFICER']}>
            <ReportManagement />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/tax-officer/complaint-management" 
        element={
          <ProtectedRoute allowedRoles={['ROLE_TAX_OFFICER']}>
            <ComplaintManagement />
          </ProtectedRoute>
        } 
      />
      <Route
        path="/tax-officer/account"
        element={
          <ProtectedRoute allowedRoles={['ROLE_TAX_OFFICER']}>
            <AccountPage />
          </ProtectedRoute>
        }
      />

      {/* Tài khoản — mọi role (layout tự chọn theo role đang active) */}
      <Route
        path="/account"
        element={
          <ProtectedRoute>
            <AccountPage />
          </ProtectedRoute>
        }
      />

      {/* ==================== PROTECTED USER ==================== */}
      {/* /home là TRANG TRUNG GIAN cho mọi role đã đăng nhập.
          Citizen thấy menu công dân; 3 role nghiệp vụ thấy thêm card
          "Vào hệ thống nghiệp vụ" dẫn tới dashboard riêng. */}
      <Route 
        path="/home" 
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/land-tax" 
        element={
          <ProtectedRoute allowedRoles={['ROLE_CITIZEN']}>
            <LandTaxPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/land-information" 
        element={
          <ProtectedRoute allowedRoles={['ROLE_CITIZEN']}>
            <LandInformationPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/tax" 
        element={
          <ProtectedRoute allowedRoles={['ROLE_CITIZEN']}>
            <TaxPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/payment" 
        element={
          <ProtectedRoute allowedRoles={['ROLE_CITIZEN']}>
            <PaymentPage />
          </ProtectedRoute>
        } 
      />
      <Route
        path="/payment/success"
        element={
          <ProtectedRoute allowedRoles={['ROLE_CITIZEN']}>
            <PaymentSuccessPage />
          </ProtectedRoute>
        }
      />
      <Route 
        path="/search" 
        element={
          <ProtectedRoute allowedRoles={['ROLE_CITIZEN']}>
            <SearchPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/property-declaration" 
        element={
          <ProtectedRoute allowedRoles={['ROLE_CITIZEN']}>
            <PropertyDeclarationPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/submit-declaration" 
        element={
          <ProtectedRoute allowedRoles={['ROLE_CITIZEN']}>
            <SubmitDeclarationPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/complaint" 
        element={
          <ProtectedRoute allowedRoles={['ROLE_CITIZEN']}>
            <ComplaintPage />
          </ProtectedRoute>
        } 
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute allowedRoles={['ROLE_CITIZEN']}>
            <NotificationPage />
          </ProtectedRoute>
        }
      />

      {/* ==================== PROTECTED LAND OFFICER ==================== */}
      <Route 
        path="/dashboard" 
        element={<ProtectedRoute allowedRoles={['ROLE_LAND_OFFICER']}><LandOfficerDashboard /></ProtectedRoute>} 
      />

      <Route 
        path="/cadastral-reports" 
        element={<ProtectedRoute allowedRoles={['ROLE_LAND_OFFICER']}><CadastralReportStats /></ProtectedRoute>} 
      />

      <Route 
        path="/digital-cadastral-map" 
        element={<ProtectedRoute allowedRoles={['ROLE_LAND_OFFICER']}><LandRegistry /></ProtectedRoute>} 
      />

      <Route 
        path="/land-price-management" 
        element={<ProtectedRoute allowedRoles={['ROLE_LAND_OFFICER']}><LandPriceManagement /></ProtectedRoute>} 
      />

      <Route 
        path="/cadastral-records" 
        element={<ProtectedRoute allowedRoles={['ROLE_LAND_OFFICER']}><DossierProcessing /></ProtectedRoute>} 
      />

      <Route 
        path="/cadastral-complaints" 
        element={<ProtectedRoute allowedRoles={['ROLE_LAND_OFFICER']}><ComplaintHandling /></ProtectedRoute>} 
      />

      {/* ==================== FALLBACK ROUTE ==================== */}
      {/* URL không khớp: nếu đã login → về /home (trang trung gian); nếu chưa → /. */}
      <Route
        path="*"
        element={
          isAuthenticated
            ? <Navigate to={LANDING_PATH} replace />
            : <Navigate to="/" replace />
        }
      />
    </Routes>
  );
};

// Root App
function App() {
  return (
    <Router>
      <DialogProvider>
        <div className="App">
          <AppRoutes />
          <AiChatWidget />
        </div>
      </DialogProvider>
    </Router>
  );
}

export default App;