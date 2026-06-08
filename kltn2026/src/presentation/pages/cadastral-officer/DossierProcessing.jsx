import React, { useReducer, useEffect, useMemo, useRef } from 'react';
import { useUserInfo } from '../../../hooks/useUserInfo';
import { useAppDialog } from '../../components/dialog/DialogContext';
import {
  compareCadastral,
  fetchMasterParcelByGcn,
} from '../../../utils/cadastralCompare';
import {
  buildMismatchMessage,
  formatMismatchFromResponse,
} from '../../../utils/cadastralMismatchLabels';
import { notifyCadastralWorkloadChanged } from '../../../hooks/useCadastralWorkloadCount';
import { cadastralApi } from '../../../infrastructure/api/cadastralApi';
import {
  API_BASE,
  getAuth,
  mapStatusLabel,
  mapRecordCategory,
  canReceiveRecord,
  DOSSIER_TABS,
  TAB_STATUS_MAP,
  DOSSIER_INITIAL_STATE,
  dossierReducer,
  mapDossierDetailsFromApi,
} from './dossierUtils';
import { downloadReceiptPdf } from './cadastralPdfExport';
import DossierListView from './DossierListView';
import DossierDetailView from './DossierDetailView';

const DossierProcessing = () => {
  const { user } = useUserInfo();
  const { showAlert, showConfirm } = useAppDialog();

  const [state, dispatch] = useReducer(dossierReducer, DOSSIER_INITIAL_STATE);
  const {
    view,
    activeTab,
    showAdvancedSearch,
    showPdfPreview,
    attachmentPreview,
    downloadingPdf,
    searchQuery,
    dossiers,
    selectedDossier,
    dossierDetails,
    loading,
    detailLoading,
    actionLoading,
    cadastralMaster,
    cadastralMismatches,
    compareDone,
  } = state;
  const patch = (payload) => dispatch({ type: 'patch', payload });
  const receiptPaperRef = useRef(null);

  const fetchDossiers = async () => {
    patch({ loading: true });
    try {
      const list = await cadastralApi.getCadastralRecords();
      const rows = Array.isArray(list) ? list : [];

      const formatted = rows.map((item) => {
        const status = item.currentStatus || 'SUBMITTED';
        return {
          id: `HS-${String(item.recordId).padStart(6, '0')}`,
          rawId: item.recordId,
          name: item.fullName?.trim() || `Công dân #${item.citizenId}`,
          cccd: item.senderCccd || item.cccdNumber || '',
          categoryLabel: mapRecordCategory(item.recordCategory),
          landType: item.landType || item.declaredUsage || '—',
          date: item.submittedAt
            ? new Date(item.submittedAt).toLocaleDateString('vi-VN')
            : '—',
          status,
          statusLabel: mapStatusLabel(status),
          canReceive: canReceiveRecord(status),
          originalData: item,
        };
      });

      patch({ dossiers: formatted });
    } catch (e) {
      console.error('Lỗi khi tải danh sách hồ sơ:', e);
      patch({ dossiers: [] });
    } finally {
      patch({ loading: false });
      notifyCadastralWorkloadChanged();
    }
  };

  const fetchDossierDetails = async (recordId, dossierFromList) => {
    dispatch({ type: 'beginDetailFetch' });
    try {
      const [detailRes, docsRes] = await Promise.all([
        fetch(`${API_BASE}/records/${recordId}`, { headers: getAuth() }),
        fetch(`${API_BASE}/records/${recordId}/documents`, { headers: getAuth() }),
      ]);

      if (!detailRes.ok) {
        patch({ dossierDetails: null });
        return;
      }

      const record = await detailRes.json();
      const docsRaw = docsRes.ok ? await docsRes.json() : [];
      const docs = Array.isArray(docsRaw) ? docsRaw : [];

      patch({ dossierDetails: mapDossierDetailsFromApi(record, dossierFromList, docs) });
    } catch (error) {
      console.error(error);
      patch({ dossierDetails: null });
    } finally {
      patch({ detailLoading: false });
    }
  };

  const handleDownloadReceiptPdf = async (recordId) => {
    const element = receiptPaperRef.current;
    if (!element) {
      await showAlert({ title: 'Lỗi', message: 'Không tìm thấy nội dung phiếu tiếp nhận.', variant: 'error' });
      return;
    }
    patch({ downloadingPdf: true });
    const prevShadow = element.style.boxShadow;
    element.style.boxShadow = 'none';
    try {
      await downloadReceiptPdf(element, recordId);
    } catch (err) {
      console.error('Export PDF error:', err);
      await showAlert({
        title: 'Lỗi',
        message: 'Không thể tạo file PDF. Vui lòng thử lại sau khi mở xem trước phiếu.',
        variant: 'error',
      });
    } finally {
      element.style.boxShadow = prevShadow;
      patch({ downloadingPdf: false });
    }
  };

  const runCadastralCompare = async (details) => {
    const gcn = details?.gcnBookNumber?.trim();
    if (!gcn) {
      await showAlert({
        title: 'Cảnh báo',
        message: 'Hồ sơ không có số vào sổ GCN để đối chiếu sổ địa chính.',
        variant: 'warning',
      });
      return { ok: false, hasMismatch: false };
    }

    const master = await fetchMasterParcelByGcn(API_BASE, gcn, getAuth);
    if (!master) {
      const mismatches = { gcnNotFound: true };
      dispatch({ type: 'setCompareResult', master: null, mismatches });
      await showAlert({
        title: 'Không tìm thấy trên sổ',
        message: `Không có thửa đất với GCN "${gcn}" trong sổ địa chính. Hồ sơ sẽ bị từ chối nếu bạn xác nhận.`,
        variant: 'warning',
      });
      return { ok: true, hasMismatch: true, mismatches };
    }

    const skipOwnerCheck = details.recordInfo?.recordCategoryRaw === 'LAND_OWNERSHIP_NEW';
    const { mismatches, hasMismatch } = compareCadastral(
      details.declaredInfo || details.landParcelInfo,
      master,
      {
        citizenId: details.citizenInfo?.citizenId,
        cccd: details.citizenInfo?.cccd,
      },
      { skipOwnerCheck }
    );

    dispatch({ type: 'setCompareResult', master, mismatches });
    return { ok: true, hasMismatch, mismatches };
  };

  const verifyRecord = async (recordId) => {
    const res = await fetch(`${API_BASE}/records/${recordId}/verify`, {
      method: 'PUT',
      headers: getAuth(),
    });

    const text = await res.text();
    let data = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { message: text };
    }

    if (!res.ok) {
      throw new Error(data.error || data.message || text || `Lỗi ${res.status}`);
    }

    return data;
  };

  const handleReceive = async (recordId) => {
    if (actionLoading || !dossierDetails) return;
    const status = dossierDetails.recordInfo?.currentStatus;
    if (!canReceiveRecord(status)) {
      await showAlert({
        title: 'Không thể tiếp nhận',
        message: `Hồ sơ đang ở trạng thái "${mapStatusLabel(status)}". Chỉ tiếp nhận được hồ sơ Chờ xác minh, Chờ xử lý hoặc Nghi gian lận.`,
        variant: 'warning',
      });
      return;
    }
    patch({ actionLoading: true });
    try {
      const { ok, hasMismatch, mismatches } = await runCadastralCompare(dossierDetails);
      if (!ok) return;

      if (hasMismatch) {
        const mismatchDetail = buildMismatchMessage(mismatches, {
          prefix: 'Phát hiện khai báo không khớp sổ địa chính:\n',
          suffix:
            '\n\nHồ sơ sẽ bị từ chối do sai lệch, công dân được thông báo và cần tạo hồ sơ mới. Xác nhận?',
        });
        const confirmed = await showConfirm({
          title: 'Từ chối hồ sơ do sai lệch',
          message: mismatchDetail,
          variant: 'danger',
          confirmLabel: 'Từ chối & thông báo công dân',
          cancelLabel: 'Quay lại',
        });
        if (!confirmed) return;
      } else {
        const confirmed = await showConfirm({
          title: 'Tiếp nhận hồ sơ',
          message: 'Dữ liệu khớp sổ địa chính. Xác nhận tiếp nhận và xác minh hồ sơ?',
          variant: 'info',
          confirmLabel: 'Tiếp nhận',
          cancelLabel: 'Hủy',
        });
        if (!confirmed) return;
      }

      const result = await verifyRecord(recordId);

      if (result.status === 'REJECTED') {
        const detail = formatMismatchFromResponse(result);
        await showAlert({
          title: 'Đã từ chối hồ sơ',
          message:
            (result.message || 'Hồ sơ đã bị từ chối.') +
            (detail ? `\n\nChi tiết:\n${detail}` : ''),
          variant: 'warning',
        });
      } else {
        await showAlert({
          title: 'Thành công',
          message: result.message || 'Hồ sơ đã được tiếp nhận và xác minh thành công!',
          variant: 'success',
        });
      }

      fetchDossiers();
      dispatch({ type: 'returnToList' });
    } catch (err) {
      await showAlert({
        title: 'Lỗi',
        message: err.message || 'Thao tác thất bại',
        variant: 'error',
      });
    } finally {
      patch({ actionLoading: false });
    }
  };

  useEffect(() => {
    if (view === 'list') {
      fetchDossiers();
    }
  }, [view]);

  const handleViewDetail = (dossier) => {
    patch({ selectedDossier: dossier, view: 'detail' });
    fetchDossierDetails(dossier.rawId, dossier);
  };

  const filteredDossiers = useMemo(() => {
    const allowedStatuses = TAB_STATUS_MAP[activeTab];
    let result = dossiers;

    if (allowedStatuses) {
      result = result.filter((d) => allowedStatuses.includes(d.status));
    }

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (d) =>
          d.id.toLowerCase().includes(q) ||
          d.name.toLowerCase().includes(q) ||
          (d.cccd && d.cccd.includes(q)) ||
          (d.categoryLabel && d.categoryLabel.toLowerCase().includes(q)) ||
          (d.landType && d.landType.toLowerCase().includes(q))
      );
    }

    return result;
  }, [dossiers, activeTab, searchQuery]);

  const tabCounts = useMemo(() => {
    const counts = { 'Tất cả': dossiers.length };
    DOSSIER_TABS.slice(1).forEach((tab) => {
      const allowed = TAB_STATUS_MAP[tab];
      counts[tab] = allowed
        ? dossiers.filter((d) => allowed.includes(d.status)).length
        : 0;
    });
    return counts;
  }, [dossiers]);

  if (view === 'list') {
    return (
      <DossierListView
        user={user}
        searchQuery={searchQuery}
        activeTab={activeTab}
        showAdvancedSearch={showAdvancedSearch}
        loading={loading}
        dossiers={dossiers}
        filteredDossiers={filteredDossiers}
        tabCounts={tabCounts}
        onSearchChange={(value) => patch({ searchQuery: value })}
        onToggleAdvancedSearch={() => patch({ showAdvancedSearch: !showAdvancedSearch })}
        onCloseAdvancedSearch={() => patch({ showAdvancedSearch: false })}
        onTabChange={(tab) => patch({ activeTab: tab })}
        onViewDetail={handleViewDetail}
      />
    );
  }

  if (view === 'detail' && selectedDossier) {
    return (
      <DossierDetailView
        user={user}
        selectedDossier={selectedDossier}
        dossierDetails={dossierDetails}
        detailLoading={detailLoading}
        actionLoading={actionLoading}
        cadastralMaster={cadastralMaster}
        cadastralMismatches={cadastralMismatches}
        compareDone={compareDone}
        showPdfPreview={showPdfPreview}
        downloadingPdf={downloadingPdf}
        attachmentPreview={attachmentPreview}
        receiptPaperRef={receiptPaperRef}
        onBack={() => patch({ view: 'list' })}
        onShowPdfPreview={() => patch({ showPdfPreview: true })}
        onClosePdfPreview={() => patch({ showPdfPreview: false })}
        onDownloadReceiptPdf={handleDownloadReceiptPdf}
        onReceive={handleReceive}
        onAttachmentPreview={(file) => patch({ attachmentPreview: file })}
        onCloseAttachmentPreview={() => patch({ attachmentPreview: null })}
        showAlert={showAlert}
      />
    );
  }

  return null;
};

export default DossierProcessing;
