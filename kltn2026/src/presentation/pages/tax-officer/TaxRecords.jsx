import React, { useReducer, useMemo } from 'react';
import TaxOfficerLayout from '../../components/TaxOfficerLayout';
import { useUserInfo } from '../../../hooks/useUserInfo';
import { useAsyncMountLoadWithReload } from '../../../hooks/useAsyncMountLoad';
import { useAppDialog } from '../../components/dialog/DialogContext';
import TaxRecordsListView from './TaxRecordsListView';
import TaxRecordDetailPanel from './TaxRecordDetailPanel';
import TaxRecordExportModals from './TaxRecordExportModals';
import {
  API_BASE,
  loadTaxOfficerRecords,
  initialState,
  taxRecordsReducer,
  fetchDeclarationDetail,
} from './taxRecordsUtils';
import { getJsonAuthHeaders } from '../../../utils/authHeaders';
import { exportTaxOfficerRecord } from './taxRecordsExport';
import { EMPTY_ARRAY } from '../../../utils/emptyArray';

const TaxRecords = () => {
  const { user } = useUserInfo();
  const { showAlert } = useAppDialog();
  const { data: loadedRecords, error: loadError, isLoading: loading, reload: fetchRecords } =
    useAsyncMountLoadWithReload(loadTaxOfficerRecords);
  const [state, dispatch] = useReducer(taxRecordsReducer, initialState);
  const {
    localRecords,
    search,
    showAdvanced,
    advFilters,
    selectedRecord,
    showDetail,
    showExportOptions,
    showPreview,
    exportFormat,
    isEditing,
    editValues,
    showHistory,
    loadingDetail,
    detailError,
  } = state;

  const records = localRecords ?? loadedRecords ?? EMPTY_ARRAY;
  const error = loadError?.message || '';

  const handleStartEdit = () => {
    dispatch({
      type: 'startEdit',
      editValues: {
        fullName: selectedRecord.fullName || '',
        senderCccd: selectedRecord.senderCccd || '',
        address: selectedRecord.address || '',
        landParcelNumber: selectedRecord.landParcelNumber || '',
        mapSheetNumber: selectedRecord.mapSheetNumber || '',
        area: selectedRecord.area || '',
        landType: selectedRecord.landType || '',
        landAddress: selectedRecord.landAddress || selectedRecord.address || '',
        taxType: selectedRecord.taxType || 'Thuế sử dụng đất',
        calculatedTaxAmount:
          selectedRecord.calculatedTaxAmount !== null && selectedRecord.calculatedTaxAmount !== undefined
            ? selectedRecord.calculatedTaxAmount
            : 0,
      },
    });
  };

  const handleCancelEdit = () => {
    dispatch({ type: 'cancelEdit' });
  };

  const handleCloseDetail = () => {
    dispatch({ type: 'closeDetail' });
  };

  const handleSaveEdit = async () => {
    dispatch({ type: 'patch', payload: { detailError: '' } });

    const requiredFields = {
      fullName: 'Họ và tên',
      senderCccd: 'Số CCCD/CMND',
      address: 'Địa chỉ thường trú',
      landParcelNumber: 'Thửa đất số',
      mapSheetNumber: 'Tờ bản đồ số',
      area: 'Diện tích',
      landType: 'Loại đất',
      landAddress: 'Địa chỉ thửa đất',
      taxType: 'Loại thuế/Lệ phí',
    };

    for (const [key, label] of Object.entries(requiredFields)) {
      if (!editValues[key] || editValues[key].toString().trim() === '') {
        dispatch({
          type: 'patch',
          payload: { detailError: `Trường "${label}" là bắt buộc và không được để trống.` },
        });
        return;
      }
    }

    let taxAmount = editValues.calculatedTaxAmount;
    if (taxAmount === undefined || taxAmount === null || taxAmount.toString().trim() === '') {
      taxAmount = 0;
    } else {
      const val = Number(taxAmount);
      if (isNaN(val) || !Number.isInteger(val) || val < 0) {
        dispatch({
          type: 'patch',
          payload: { detailError: 'Tổng tiền phải nộp phải là số nguyên không âm (lớn hơn hoặc bằng 0).' },
        });
        return;
      }
      taxAmount = val;
    }

    const updatedRecord = {
      ...selectedRecord,
      fullName: editValues.fullName.trim(),
      senderCccd: editValues.senderCccd.trim(),
      address: editValues.address.trim(),
      landParcelNumber: editValues.landParcelNumber.trim(),
      mapSheetNumber: editValues.mapSheetNumber.trim(),
      area: editValues.area.toString().trim(),
      landType: editValues.landType.trim(),
      landAddress: editValues.landAddress.trim(),
      taxType: editValues.taxType.trim(),
      calculatedTaxAmount: taxAmount,
    };

    dispatch({ type: 'patch', payload: { loadingDetail: true } });
    try {
      const response = await fetch(`${API_BASE}/tax/records/${selectedRecord.recordId}`, {
        method: 'PUT',
        headers: getJsonAuthHeaders(),
        body: JSON.stringify(updatedRecord),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.message || 'Không thể lưu thay đổi vào cơ sở dữ liệu');
      }

      dispatch({
        type: 'patch',
        payload: {
          localRecords: records.map((r) =>
            r.recordId === selectedRecord.recordId ? { ...r, ...updatedRecord } : r
          ),
          selectedRecord: updatedRecord,
          isEditing: false,
        },
      });

      dispatch({ type: 'patch', payload: { localRecords: null } });
      fetchRecords();
    } catch (err) {
      dispatch({ type: 'patch', payload: { detailError: err.message || 'Lỗi xảy ra khi lưu thay đổi' } });
    } finally {
      dispatch({ type: 'patch', payload: { loadingDetail: false } });
    }
  };

  const handleExportData = () =>
    exportTaxOfficerRecord({ selectedRecord, exportFormat, dispatch, showAlert });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return records.filter((r) => {
      const matchSearch =
        (r.recordId || '').toString().toLowerCase().includes(q) ||
        (r.senderCccd || '').toLowerCase().includes(q) ||
        (r.phoneNumber || '').toLowerCase().includes(q);
      const matchCode =
        !advFilters.code ||
        (r.recordId || '').toString().toLowerCase().includes(advFilters.code.toLowerCase().trim());
      const matchName =
        !advFilters.name ||
        (r.fullName || '').toLowerCase().includes(advFilters.name.toLowerCase().trim());
      const matchCccd = !advFilters.cccd || (r.senderCccd || '').includes(advFilters.cccd.trim());
      const matchAddr =
        !advFilters.address ||
        (r.address || '').toLowerCase().includes(advFilters.address.toLowerCase().trim());
      return matchSearch && matchCode && matchName && matchCccd && matchAddr;
    });
  }, [search, records, advFilters]);

  const handleViewDetail = (record) => {
    dispatch({ type: 'patch', payload: { showDetail: true } });
    fetchDeclarationDetail(record, dispatch);
  };

  const handleOpenExport = (record) => {
    dispatch({ type: 'openExport', record });
  };

  return (
    <TaxOfficerLayout user={user}>
      <div style={{ padding: '24px 32px' }}>
        <TaxRecordsListView
          search={search}
          showAdvanced={showAdvanced}
          advFilters={advFilters}
          error={error}
          loading={loading}
          filtered={filtered}
          dispatch={dispatch}
          onViewDetail={handleViewDetail}
          onOpenExport={handleOpenExport}
        />

        {showDetail && selectedRecord && (
          <TaxRecordDetailPanel
            selectedRecord={selectedRecord}
            isEditing={isEditing}
            editValues={editValues}
            loadingDetail={loadingDetail}
            detailError={detailError}
            dispatch={dispatch}
            onClose={handleCloseDetail}
            onStartEdit={handleStartEdit}
            onCancelEdit={handleCancelEdit}
            onSaveEdit={handleSaveEdit}
            onOpenExport={handleOpenExport}
            onShowHistory={() => dispatch({ type: 'patch', payload: { showHistory: true } })}
          />
        )}

        <TaxRecordExportModals
          selectedRecord={selectedRecord}
          showExportOptions={showExportOptions}
          showPreview={showPreview}
          showHistory={showHistory}
          exportFormat={exportFormat}
          dispatch={dispatch}
          onExportData={handleExportData}
        />
      </div>
    </TaxOfficerLayout>
  );
};

export default TaxRecords;
