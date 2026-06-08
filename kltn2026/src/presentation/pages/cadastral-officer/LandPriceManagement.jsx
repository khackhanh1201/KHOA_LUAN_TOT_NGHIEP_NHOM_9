import React, { useReducer, useEffect, useMemo } from 'react';
import { useUserInfo } from '../../../hooks/useUserInfo';
import { useAppDialog } from '../../components/dialog/DialogContext';
import { useAsyncMountLoad } from '../../../hooks/useAsyncMountLoad';
import { getBearerAuthHeaders } from '../../../utils/authHeaders';
import {
  formatManagedAreas,
  buildDistrictLabelMap,
} from '../../../utils/areaLabels';
import { userApi } from '../../../infrastructure/api/userApi';
import {
  API_BASE,
  getAuth,
  loadMasterData,
  LAND_PRICE_INITIAL_STATE,
  landPriceReducer,
} from './landPriceState';
import LandPriceListView from './LandPriceListView';
import LandPriceDetailView from './LandPriceDetailView';
import LandPriceCreateView from './LandPriceCreateView';
import { EMPTY_ARRAY } from '../../../utils/emptyArray';

const formatAppliedFrom = (value) => {
  if (!value) return '—';
  const raw = String(value);
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
    const [y, m, d] = raw.slice(0, 10).split('-');
    return `${d}/${m}/${y}`;
  }
  return raw;
};

const LandPriceManagement = () => {
  const { user } = useUserInfo();
  const { showAlert } = useAppDialog();

  const [state, dispatch] = useReducer(landPriceReducer, LAND_PRICE_INITIAL_STATE);
  const {
    view,
    landPrices,
    loading,
    searchTerm,
    selectedRecord,
    attachmentPreview,
    priceHistory,
    historyLoading,
    createForm,
    decisionFile,
    priceDocuments,
    creating,
    exporting,
  } = state;
  const patch = (payload) => dispatch({ type: 'patch', payload });

  const { data: masterData } = useAsyncMountLoad(loadMasterData);
  const masterLandTypes = masterData?.masterLandTypes ?? EMPTY_ARRAY;
  const masterAreas = masterData?.masterAreas ?? EMPTY_ARRAY;

  const fetchLandPrices = async () => {
    try {
      const res = await fetch(`${API_BASE}/land-prices`, { headers: getAuth() });
      if (res.ok) {
        const data = await res.json();
        const records = Array.isArray(data) ? data : (data.data || data.content || []);
        patch({ landPrices: records });
      }
    } catch (err) {
      console.error(err);
    } finally {
      patch({ loading: false });
    }
  };

  useEffect(() => {
    if (view === 'list') fetchLandPrices();
  }, [view]);

  const fetchPriceHistory = async (landTypeId, areaId) => {
    if (landTypeId == null || areaId == null) {
      patch({ priceHistory: [] });
      return;
    }
    patch({ historyLoading: true });
    try {
      const params = new URLSearchParams({
        landTypeId: String(landTypeId),
        areaId: String(areaId),
      });
      const res = await fetch(`${API_BASE}/land-prices/history?${params}`, { headers: getAuth() });
      if (res.ok) {
        const data = await res.json();
        patch({ priceHistory: Array.isArray(data) ? data : (data.data || []) });
      } else {
        patch({ priceHistory: [] });
      }
    } catch (err) {
      console.error('Error fetching price history:', err);
      patch({ priceHistory: [] });
    } finally {
      patch({ historyLoading: false });
    }
  };

  const handleViewDetail = async (record) => {
    const id = record.price_id || record.priceId || record.id;
    if (id) {
      try {
        const res = await fetch(`${API_BASE}/land-prices/${id}`, { headers: getAuth() });
        if (res.ok) {
          const responseJson = await res.json();
          const realData = responseJson.data || responseJson;
          dispatch({ type: 'openDetail', record: realData });
          await fetchPriceHistory(realData.landTypeId, realData.areaId);
          const priceId = realData.priceId ?? realData.price_id ?? id;
          try {
            const docRes = await fetch(`${API_BASE}/land-prices/${priceId}/documents`, { headers: getAuth() });
            if (docRes.ok) {
              const docs = await docRes.json();
              patch({ priceDocuments: Array.isArray(docs) ? docs : (docs.data || []) });
            }
          } catch {
            patch({ priceDocuments: [] });
          }
        } else {
          await showAlert({
            title: 'Không tìm thấy',
            message: `Dữ liệu không tồn tại trên hệ thống (Lỗi 404). ID: ${id}`,
            variant: 'error',
          });
        }
      } catch (err) {
        await showAlert({ title: 'Lỗi', message: 'Lỗi kết nối server', variant: 'error' });
      }
    }
  };

  const handleCreateFormChange = (e) => {
    const { name, value } = e.target;
    dispatch({ type: 'patchCreateForm', payload: { [name]: value } });
  };

  const handleCreatePrice = async (e) => {
    e.preventDefault();
    patch({ creating: true });
    try {
      let decisionDocumentId = null;
      if (decisionFile) {
        const uploaded = await userApi.uploadFile(decisionFile);
        decisionDocumentId = Number(uploaded.documentId);
      }

      const payload = {
        landTypeId: Number(createForm.landTypeId),
        areaId: Number(createForm.areaId),
        unitPrice: Number(createForm.unitPrice),
        appliedFrom: createForm.appliedFrom,
        ...(decisionDocumentId ? { decisionDocumentId } : {}),
      };
      const res = await fetch(`${API_BASE}/land-prices`, {
        method: 'POST',
        headers: getAuth(),
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        await showAlert({
          title: 'Thành công',
          message: 'Thêm giá đất thành công!',
          variant: 'success',
        });
        dispatch({ type: 'resetCreateForm' });
        patch({ view: 'list' });
        fetchLandPrices();
      } else {
        const errorData = await res.json().catch(() => ({}));
        await showAlert({ title: 'Lỗi', message: errorData.error || 'Thêm thất bại', variant: 'error' });
      }
    } catch (err) {
      await showAlert({ title: 'Lỗi', message: 'Lỗi kết nối server', variant: 'error' });
    } finally {
      patch({ creating: false });
    }
  };

  const handleExportExcel = async () => {
    patch({ exporting: true });
    try {
      const params = new URLSearchParams();
      const keyword = searchTerm.trim();
      if (keyword) params.set('keyword', keyword);

      const url = `${API_BASE}/land-prices/export${params.toString() ? `?${params}` : ''}`;
      const res = await fetch(url, {
        headers: getBearerAuthHeaders(),
      });

      if (!res.ok) {
        await showAlert({
          title: 'Lỗi',
          message: 'Xuất Excel thất bại. Vui lòng thử lại sau khi khởi động lại backend.',
          variant: 'error',
        });
        return;
      }

      const blob = await res.blob();
      const disposition = res.headers.get('Content-Disposition') || '';
      const match = disposition.match(/filename="?([^";]+)"?/i);
      const filename = match?.[1] || `bang-gia-dat-${new Date().toISOString().slice(0, 10)}.xlsx`;

      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(objectUrl);
    } catch (err) {
      console.error('Export Excel error:', err);
      await showAlert({ title: 'Lỗi', message: 'Không thể xuất file Excel', variant: 'error' });
    } finally {
      patch({ exporting: false });
    }
  };

  const filteredLandPrices = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return landPrices;

    return landPrices.filter((rec) => {
      const matchedArea = masterAreas.find((a) => a.areaId === rec.areaId);
      const matchedLandType = masterLandTypes.find((t) => t.landTypeId === rec.landTypeId);

      const priceCode = `gđ-${rec.priceId ?? ''}`;
      const landTypeLabel = matchedLandType
        ? `${matchedLandType.typeName} ${matchedLandType.typeCode || ''}`
        : `loại ${rec.landTypeId}`;
      const areaLabel = matchedArea
        ? `${matchedArea.streetName} vị trí ${matchedArea.positionLevel} ${matchedArea.wardCode || ''} ${matchedArea.districtCode || ''}`
        : `khu ${rec.areaId}`;
      const priceValue = String(rec.unitPrice ?? '');
      const appliedFrom = String(rec.appliedFrom ?? '');

      const haystack = [priceCode, landTypeLabel, areaLabel, priceValue, appliedFrom]
        .join(' ')
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [landPrices, searchTerm, masterAreas, masterLandTypes]);

  const managedAreaLabel = useMemo(
    () => formatManagedAreas(masterAreas),
    [masterAreas]
  );

  const districtLabelMap = useMemo(
    () => buildDistrictLabelMap(masterAreas),
    [masterAreas]
  );

  if (view === 'list') {
    return (
      <LandPriceListView
        user={user}
        managedAreaLabel={managedAreaLabel}
        exporting={exporting}
        loading={loading}
        searchTerm={searchTerm}
        onSearchChange={(value) => patch({ searchTerm: value })}
        onExportExcel={handleExportExcel}
        onCreateClick={() => patch({ view: 'create' })}
        filteredLandPrices={filteredLandPrices}
        landPrices={landPrices}
        masterAreas={masterAreas}
        masterLandTypes={masterLandTypes}
        onViewDetail={handleViewDetail}
      />
    );
  }

  if (view === 'detail' && selectedRecord) {
    return (
      <LandPriceDetailView
        user={user}
        selectedRecord={selectedRecord}
        masterAreas={masterAreas}
        masterLandTypes={masterLandTypes}
        districtLabelMap={districtLabelMap}
        priceDocuments={priceDocuments}
        priceHistory={priceHistory}
        historyLoading={historyLoading}
        attachmentPreview={attachmentPreview}
        formatAppliedFrom={formatAppliedFrom}
        onBack={() => patch({ view: 'list', priceHistory: [] })}
        onPreviewAttachment={(file) => patch({ attachmentPreview: file })}
        onClosePreview={() => patch({ attachmentPreview: null })}
      />
    );
  }

  if (view === 'create') {
    return (
      <LandPriceCreateView
        user={user}
        managedAreaLabel={managedAreaLabel}
        createForm={createForm}
        decisionFile={decisionFile}
        creating={creating}
        masterAreas={masterAreas}
        masterLandTypes={masterLandTypes}
        districtLabelMap={districtLabelMap}
        onBack={() => patch({ view: 'list' })}
        onFormChange={handleCreateFormChange}
        onSubmit={handleCreatePrice}
        onDecisionFileChange={(file) => patch({ decisionFile: file })}
      />
    );
  }

  return null;
};

export default LandPriceManagement;
