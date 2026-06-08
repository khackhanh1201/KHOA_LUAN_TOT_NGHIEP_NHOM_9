import React, { useReducer, useEffect } from 'react';
import TaxOfficerLayout from '../../components/TaxOfficerLayout';
import { useUserInfo } from '../../../hooks/useUserInfo';
import { useAppDialog } from '../../components/dialog/DialogContext';
import { useAsyncMountLoadWithReload } from '../../../hooks/useAsyncMountLoad';
import { notifyTaxOfficerWorkloadChanged } from '../../../hooks/useTaxOfficerWorkloadCount';
import { taxOfficerApi } from '../../../infrastructure/api/taxOfficerApi';
import AttachmentPreviewModal from '../../components/AttachmentPreviewModal';
import { getJsonAuthHeaders } from '../../../utils/authHeaders';
import TaxProcessingListSection from './TaxProcessingListSection';
import TaxProcessingDetailOverlay from './TaxProcessingDetailOverlay';
import TaxProcessingModals from './TaxProcessingModals';
import {
  API_BASE,
  matchesRecordCode,
  buildTaxDetailFromRecord,
  loadTaxProcessingRecords,
  initialState,
  taxProcessingReducer,
} from './taxProcessingUtils';
import { exportTaxProcessingRecord } from './taxProcessingExport';

const TaxProcessing = () => {
  const { user } = useUserInfo();
  const { showAlert } = useAppDialog();

  const { data = [], error: loadError, isLoading, reload: fetchData } =
    useAsyncMountLoadWithReload(loadTaxProcessingRecords);

  useEffect(() => {
    if (loadError) {
      showAlert({
        title: 'Lỗi',
        message: 'Không thể tải danh sách hồ sơ xử lý thuế',
        variant: 'error',
      });
    }
  }, [loadError, showAlert]);

  const [state, dispatch] = useReducer(taxProcessingReducer, initialState);
  const {
    activeTab,
    search,
    filters,
    showAdvanced,
    showDetail,
    selectedRecord,
    actionModal,
    actionReason,
    actionDetail,
    attachments,
    attachmentPreview,
    loadingAttachments,
    detailLoading,
    showExportOptions,
    showPreview,
    exportFormat,
    showHistory,
  } = state;

  const handleViewDetail = async (item) => {
    dispatch({ type: 'openDetail', item });

    const authHeaders = getJsonAuthHeaders();

    try {
      const [detailRes, docsRes] = await Promise.all([
        fetch(`${API_BASE}/records/${item.id}`, { headers: authHeaders }),
        fetch(`${API_BASE}/records/${item.id}/documents`, { headers: authHeaders }),
      ]);

      if (detailRes.ok) {
        const record = await detailRes.json();
        dispatch({
          type: 'patch',
          payload: { selectedRecord: buildTaxDetailFromRecord(record, item) },
        });
      }

      if (docsRes.ok) {
        const docs = await docsRes.json();
        const list = Array.isArray(docs) ? docs : [];
        dispatch({
          type: 'patch',
          payload: {
            attachments: list.map((doc) => ({
              documentId: doc.documentId ?? doc.document_id,
              fileName: doc.fileName || doc.file_name || 'Tài liệu',
              fileUrl: doc.fileUrl || doc.file_url || '',
              fileType: doc.fileType || doc.file_type || '',
            })),
          },
        });
      }
    } catch (err) {
      console.error('Không tải chi tiết hồ sơ:', err);
    } finally {
      dispatch({
        type: 'patch',
        payload: { loadingAttachments: false, detailLoading: false },
      });
    }
  };

  const handleProcessAction = async (action) => {
    if (action === 'RECEIVE') {
      try {
        await taxOfficerApi.receiveTaxRecord(selectedRecord.id);
        await showAlert({
          title: 'Thành công',
          message: 'Đã tiếp nhận hồ sơ thành công!',
          variant: 'success',
        });
        dispatch({ type: 'closeDetail' });
        fetchData();
        notifyTaxOfficerWorkloadChanged();
      } catch (err) {
        await showAlert({
          title: 'Lỗi',
          message: `Tiếp nhận thất bại: ${err.message}`,
          variant: 'error',
        });
      }
      return;
    }

    try {
      let endpoint = '';
      let payload = {};

      if (action === 'SUBMIT_APPROVE') {
        endpoint = `/tax/records/${selectedRecord.id}/approve`;
        payload = { processorNotes: 'Hồ sơ hợp lệ, đủ điều kiện phê duyệt' };
      } else if (action === 'SUBMIT_REJECT' || action === 'SUBMIT_REQUEST_INFO') {
        if (!actionDetail.trim()) {
          await showAlert({
            title: 'Thông báo',
            message: 'Vui lòng nhập lý do từ chối / nội dung giải trình!',
            variant: 'warning',
          });
          return;
        }
        endpoint = `/tax/records/${selectedRecord.id}/verify`;
        payload = { processorNotes: actionDetail };
      }

      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'PUT',
        headers: getJsonAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Lỗi hệ thống: ${res.status}`);
      }

      await showAlert({
        title: 'Thành công',
        message:
          action === 'SUBMIT_APPROVE'
            ? 'Phê duyệt hồ sơ thành công!'
            : action === 'SUBMIT_REJECT'
              ? 'Đã từ chối hồ sơ thành công!'
              : 'Đã từ chối/yêu cầu bổ sung hồ sơ!',
        variant: 'success',
      });

      dispatch({ type: 'completeAction' });
      fetchData();
      notifyTaxOfficerWorkloadChanged();
    } catch (err) {
      console.error('Lỗi xử lý hồ sơ:', err);
      await showAlert({ title: 'Lỗi', message: `Thao tác thất bại: ${err.message}`, variant: 'error' });
    }
  };

  const handleExportData = () =>
    exportTaxProcessingRecord({ selectedRecord, exportFormat, dispatch, showAlert });

  const displayedData = data.filter((item) => {
    const q = search.toLowerCase().trim();
    const matchSearch =
      q === '' ||
      matchesRecordCode(item, search) ||
      (item.name && item.name.toLowerCase().includes(q));
    const matchAdvCode = filters.code === '' || matchesRecordCode(item, filters.code);
    const matchAdvName =
      filters.name === '' ||
      (item.name && item.name.toLowerCase().includes(filters.name.toLowerCase().trim()));
    const matchAdvStatus =
      filters.status === 'Tất cả' ||
      (item.status && item.status.toUpperCase() === filters.status.toUpperCase());
    const matchAdvTax =
      filters.taxType === 'Tất cả' ||
      (item.landType && item.landType.toLowerCase().includes(filters.taxType.toLowerCase()));

    let matchTab = true;
    if (activeTab === 'PENDING') matchTab = item.status === 'PENDING' || item.status === 'SUBMITTED';
    else if (activeTab === 'PROCESSING') matchTab = item.status === 'VERIFIED' || item.status === 'PROCESSING';
    else if (activeTab === 'APPROVED') matchTab = item.status === 'APPROVED';
    else if (activeTab === 'COMPLETED') {
      matchTab = item.status === 'COMPLETED' || item.status === 'CANCELLED' || item.status === 'REJECTED';
    }

    return matchSearch && matchAdvCode && matchAdvName && matchAdvStatus && matchAdvTax && matchTab;
  });

  return (
    <TaxOfficerLayout user={user}>
      <div style={{ padding: '24px 32px', position: 'relative' }}>
        <TaxProcessingListSection
          search={search}
          filters={filters}
          showAdvanced={showAdvanced}
          activeTab={activeTab}
          isLoading={isLoading}
          displayedData={displayedData}
          dispatch={dispatch}
          onViewDetail={handleViewDetail}
        />

        {showDetail && selectedRecord && (
          <TaxProcessingDetailOverlay
            selectedRecord={selectedRecord}
            detailLoading={detailLoading}
            loadingAttachments={loadingAttachments}
            attachments={attachments}
            dispatch={dispatch}
            onClose={() => dispatch({ type: 'closeDetail' })}
            onProcessAction={handleProcessAction}
          />
        )}

        <TaxProcessingModals
          selectedRecord={selectedRecord}
          modalVisibility={{ showExportOptions, showPreview, showHistory, showDetail }}
          exportFormat={exportFormat}
          actionModal={actionModal}
          actionReason={actionReason}
          actionDetail={actionDetail}
          dispatch={dispatch}
          onExportData={handleExportData}
          onProcessAction={handleProcessAction}
        />

        <AttachmentPreviewModal
          file={attachmentPreview}
          onClose={() => dispatch({ type: 'patch', payload: { attachmentPreview: null } })}
        />
      </div>
    </TaxOfficerLayout>
  );
};

export default TaxProcessing;
