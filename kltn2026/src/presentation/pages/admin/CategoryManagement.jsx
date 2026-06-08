import React, { useReducer, useRef, useMemo } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useAppDialog } from '../../components/dialog/DialogContext';
import { useAsyncMountLoad } from '../../../hooks/useAsyncMountLoad';
import { getToken } from '../../../usecases/authService';
import { getBearerAuthHeaders } from '../../../utils/authHeaders';
import {
  APPLIED_YEAR,
  BASE_URL,
  loadRegions,
  loadExemptions,
  initialState,
  categoryManagementReducer,
} from './categoryManagement/categoryUtils';
import ExemptionCard from './categoryManagement/ExemptionCard';
import RegionQuotaCard from './categoryManagement/RegionQuotaCard';
import ExemptionListModal from './categoryManagement/ExemptionListModal';
import QuotaConfigModal from './categoryManagement/QuotaConfigModal';
import { EMPTY_ARRAY } from '../../../utils/emptyArray';

const CategoryManagement = () => {
  const user = JSON.parse(localStorage.getItem('user_info') || '{}');
  const { showAlert } = useAppDialog();
  const fileInputRef = useRef(null);

  const { data: loadedRegions, isLoading: isLoadingRegions } = useAsyncMountLoad(loadRegions);
  const { data: loadedExemptions, isLoading: isLoadingExemptions } = useAsyncMountLoad(loadExemptions);
  const [state, dispatch] = useReducer(categoryManagementReducer, initialState);
  const {
    regionsOverride,
    exemptionsOverride,
    isUploading,
    uploadMessage,
    isExemptModalOpen,
    isConfigModalOpen,
    selectedRegion,
    exemptSearch,
    exemptType,
    editLandQuota,
  } = state;

  const regions = regionsOverride ?? loadedRegions ?? EMPTY_ARRAY;
  const exemptions = exemptionsOverride ?? loadedExemptions ?? EMPTY_ARRAY;

  const exemptCount2026 = useMemo(
    () => exemptions.filter((e) => e.appliedYear === APPLIED_YEAR).length,
    [exemptions]
  );

  const filteredExemptions = useMemo(() => {
    const searchLower = exemptSearch.toLowerCase().trim();
    return exemptions.filter((item) => {
      const matchesSearch =
        !searchLower ||
        String(item.citizenId || '').includes(searchLower) ||
        (item.cccdNumber || '').includes(searchLower) ||
        (item.fullName || '').toLowerCase().includes(searchLower);
      const matchesType =
        exemptType === 'Tất cả lý do miễn giảm' ||
        item.exemptionReason === exemptType;
      return matchesSearch && matchesType;
    });
  }, [exemptions, exemptSearch, exemptType]);

  const fetchExemptions = async () => {
    try {
      dispatch({ type: 'patch', payload: { exemptionsOverride: await loadExemptions() } });
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRegions = async () => {
    try {
      dispatch({ type: 'patch', payload: { regionsOverride: await loadRegions() } });
    } catch (err) {
      console.error('Network error:', err);
      dispatch({ type: 'patch', payload: { regionsOverride: [] } });
    }
  };

  const handleOpenExemptModal = () => {
    dispatch({ type: 'openExemptModal' });
    fetchExemptions();
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    dispatch({ type: 'patch', payload: { isUploading: true, uploadMessage: null } });

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${BASE_URL}/api/admin/exemptions`, {
        method: 'POST',
        headers: getBearerAuthHeaders(),
        body: formData
      });

      if (res.ok) {
        const json = await res.json().catch(() => null);
        const imported = json?.imported ?? 0;
        const updated = json?.updated ?? 0;
        const errorCount = json?.errorCount ?? (json?.errors?.length ?? 0);
        const allFailed = imported === 0 && updated === 0;
        const hasPartialErrors = errorCount > 0 && !allFailed;

        dispatch({ type: 'patch', payload: { uploadMessage: null } });
        await fetchExemptions();
        dispatch({ type: 'openExemptModal' });

        let dialogMessage = `File: ${file.name}\n\n• Thêm mới: ${imported} bản ghi\n• Cập nhật: ${updated} bản ghi`;
        if (errorCount > 0) {
          dialogMessage += `\n• Lỗi: ${errorCount} dòng`;
          const errorLines = (json?.errors || []).slice(0, 5);
          if (errorLines.length > 0) {
            dialogMessage += `\n\n${errorLines.join('\n')}`;
            if (errorCount > 5) {
              dialogMessage += `\n... và ${errorCount - 5} lỗi khác`;
            }
          }
        }
        dialogMessage += '\n\nBấm OK để xem danh sách chi tiết (có thể cuộn nếu nhiều bản ghi).';

        await showAlert({
          title: allFailed
            ? 'Chưa import được bản ghi'
            : hasPartialErrors
              ? 'Import hoàn tất một phần'
              : 'Import thành công',
          message: dialogMessage,
          variant: allFailed ? 'warning' : hasPartialErrors ? 'warning' : 'success',
        });
      } else {
        const errJson = await res.json().catch(() => null);
        const errText = errJson?.message || errJson?.error || `HTTP ${res.status}`;
        dispatch({ type: 'patch', payload: { uploadMessage: null } });
        await showAlert({
          title: 'Tải lên thất bại',
          message: errText,
          variant: 'error',
        });
      }
    } catch (err) {
      dispatch({ type: 'patch', payload: { uploadMessage: null } });
      await showAlert({
        title: 'Lỗi kết nối',
        message: 'Không thể kết nối đến máy chủ. Vui lòng thử lại.',
        variant: 'error',
      });
    } finally {
      dispatch({ type: 'patch', payload: { isUploading: false } });
      event.target.value = null;
    }
  };

  const handleOpenConfig = (region) => {
    dispatch({
      type: 'openConfigModal',
      region,
      landQuota: region.landQuota || region.land_quota,
    });
  };

  const handleSaveConfig = async () => {
    try {
      const token = getToken();
      const areaId = selectedRegion?.area_id || selectedRegion?.areaId;

      if (!areaId) {
        await showAlert({ title: 'Lỗi', message: 'Không tìm thấy mã khu vực!', variant: 'error' });
        return;
      }

      const res = await fetch(`${BASE_URL}/api/admin/areas/${areaId}/quota`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          landQuota: parseFloat(editLandQuota)
        })
      });

      if (res.ok) {
        await showAlert({ title: 'Thành công', message: 'Cập nhật hạn mức thành công!', variant: 'success' });
        dispatch({ type: 'closeConfigModal' });
        fetchRegions();
      } else {
        await showAlert({
          title: 'Thất bại',
          message: 'Cập nhật thất bại. (Có thể Backend chưa code API cập nhật này)',
          variant: 'warning',
        });
      }
    } catch (err) {
      console.error(err);
      await showAlert({ title: 'Lỗi', message: 'Lỗi kết nối máy chủ!', variant: 'error' });
    }
  };

  const handlePatch = (payload) => dispatch({ type: 'patch', payload });

  return (
    <AdminLayout user={user}>
      <div className="container py-4" style={{ maxWidth: '1140px' }}>
        <div className="mb-4">
          <h3 className="fw-bold">Quản lý Danh mục</h3>
          <p className="text-muted">Quản lý các hạng mục gốc của hệ thống: Đối tượng miễn thuế, Hạn mức khu vực</p>
        </div>

        <div className="row g-4 mb-4">
          <ExemptionCard
            uploadMessage={uploadMessage}
            isUploading={isUploading}
            fileInputRef={fileInputRef}
            onFileUpload={handleFileUpload}
            exemptCount2026={exemptCount2026}
            onOpenExemptModal={handleOpenExemptModal}
          />
          <RegionQuotaCard
            regions={regions}
            isLoadingRegions={isLoadingRegions}
            onRefresh={fetchRegions}
            onOpenConfig={handleOpenConfig}
          />
        </div>

        {isExemptModalOpen && (
          <ExemptionListModal
            filteredExemptions={filteredExemptions}
            exemptions={exemptions}
            isLoadingExemptions={isLoadingExemptions}
            exemptSearch={exemptSearch}
            exemptType={exemptType}
            onClose={() => dispatch({ type: 'closeExemptModal' })}
            onPatch={handlePatch}
          />
        )}

        {isConfigModalOpen && selectedRegion && (
          <QuotaConfigModal
            selectedRegion={selectedRegion}
            editLandQuota={editLandQuota}
            onClose={() => dispatch({ type: 'closeConfigModal' })}
            onPatch={handlePatch}
            onSave={handleSaveConfig}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default CategoryManagement;
