import { useReducer, useEffect, useRef, useMemo } from 'react';
import { cadastralApi } from '../../../infrastructure/api/cadastralApi';
import {
  LAND_REGISTRY_INITIAL_STATE,
  landRegistryReducer,
  buildEditForm,
} from './landRegistryState';
import {
  fetchLandParcelsList,
  fetchLandParcelDetail,
  importLandParcelsExcel,
  createLandParcel,
  updateLandParcel,
  deleteLandParcel,
} from './landRegistryApi';
import { downloadGcnPdf } from './cadastralPdfExport';

const display = (val, fallback = '—') =>
  val !== null && val !== undefined && val !== '' ? val : fallback;

const handleDownloadTemplate = () => {
  const link = document.createElement('a');
  link.href = '/templates/Bieu_mau_chuan_du_lieu_dat_dai.xlsx';
  link.download = 'Bieu_mau_chuan_du_lieu_dat_dai.xlsx';
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export const useLandRegistryPage = ({ user, showAlert, showConfirm }) => {
  const [state, dispatch] = useReducer(landRegistryReducer, LAND_REGISTRY_INITIAL_STATE);
  const patch = (payload) => dispatch({ type: 'patch', payload });
  const excelFileInputRef = useRef(null);
  const gcnPrintRef = useRef(null);

  const getLandTypeName = (id) =>
    state.landTypes.find((t) => t.landTypeId === id)?.typeName ?? display(id);

  const getAreaLabel = (id) => {
    const a = state.areas.find((x) => x.areaId === id);
    if (!a) return display(id);
    return [a.streetName, a.wardCode, a.districtCode].filter(Boolean).join(', ');
  };

  const clearExcelSelection = () => {
    patch({ selectedExcelFile: null });
    if (excelFileInputRef.current) {
      excelFileInputRef.current.value = '';
    }
  };

  const fetchLandParcels = async () => {
    patch({ loading: true, error: null });
    try {
      patch({ allLandRecords: await fetchLandParcelsList() });
    } catch (err) {
      console.error(err);
      patch({ error: 'Không thể tải dữ liệu từ server.' });
    } finally {
      patch({ loading: false });
    }
  };

  useEffect(() => {
    cadastralApi.getLandTypes().then((types) => patch({ landTypes: types }));
    cadastralApi.getAreas().then((areaList) => patch({ areas: areaList }));
  }, []);

  useEffect(() => {
    if (state.view === 'list') {
      fetchLandParcels();
    }
  }, [state.view]);

  const landRecords = useMemo(() => {
    const q = state.searchQuery.trim().toLowerCase();
    if (!q) return state.allLandRecords;
    const landTypes = state.landTypes;
    return state.allLandRecords.filter((rec) => {
      const landTypeName =
        landTypes.find((t) => t.landTypeId === rec.landTypeId)?.typeName ?? display(rec.landTypeId);
      const text = [
        rec.parcelNumber,
        rec.mapSheetNumber,
        rec.address,
        rec.certificateNumber,
        rec.gcnBookNumber,
        landTypeName,
      ]
        .filter((v) => v != null && v !== '')
        .join(' ')
        .toLowerCase();
      return text.includes(q);
    });
  }, [state.allLandRecords, state.searchQuery, state.landTypes]);

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    dispatch({ type: 'patchEditForm', payload: { [name]: value } });
  };

  const handleStartEdit = () => {
    dispatch({ type: 'startEdit', editForm: buildEditForm(state.selectedRecord) });
  };

  const handleCancelEdit = () => {
    dispatch({ type: 'cancelEdit', editForm: buildEditForm(state.selectedRecord) });
  };

  const handleDownloadGcnPdf = async () => {
    const element = gcnPrintRef.current;
    if (!element) {
      await showAlert({
        title: 'Lỗi',
        message: 'Không tìm thấy nội dung giấy chứng nhận. Vui lòng mở xem trước trước khi tải.',
        variant: 'error',
      });
      return;
    }

    patch({ downloadingGcnPdf: true });
    const prevShadow = element.style.boxShadow;
    element.style.boxShadow = 'none';
    try {
      await downloadGcnPdf(element, state.selectedRecord);
    } catch (err) {
      console.error('Export GCN PDF error:', err);
      await showAlert({
        title: 'Lỗi',
        message: 'Không thể tạo file PDF. Vui lòng thử lại.',
        variant: 'error',
      });
    } finally {
      element.style.boxShadow = prevShadow;
      patch({ downloadingGcnPdf: false });
    }
  };

  const handleViewDetail = async (record) => {
    if (!record) return;
    let detailRecord = record;
    try {
      detailRecord = await fetchLandParcelDetail(record.landParcelId, record);
    } catch (err) {
      console.error(err);
    }
    dispatch({
      type: 'openRecordDetail',
      record: detailRecord,
      editForm: buildEditForm(detailRecord),
    });
  };

  const handleExcelFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const name = file.name.toLowerCase();
    if (!name.endsWith('.xlsx')) {
      await showAlert({
        title: 'Thông báo',
        message: 'Vui lòng chọn file Excel (.xlsx). Hệ thống chưa hỗ trợ CSV.',
        variant: 'warning',
      });
      e.target.value = '';
      return;
    }

    patch({ selectedExcelFile: file });
  };

  const handleConfirmExcelImport = async () => {
    if (!state.selectedExcelFile) {
      await showAlert({
        title: 'Thông báo',
        message: 'Vui lòng chọn tệp Excel trước khi xác nhận.',
        variant: 'warning',
      });
      return;
    }

    patch({ uploading: true });
    try {
      const data = await importLandParcelsExcel(state.selectedExcelFile);
      await showAlert({
        title: 'Thành công',
        message: data.message || `Import thành công (${data.imported ?? ''} bản ghi).`,
        variant: 'success',
      });
      dispatch({ type: 'closePushModal' });
      clearExcelSelection();
      fetchLandParcels();
    } catch (err) {
      await showAlert({
        title: 'Lỗi',
        message: err.message || 'Có lỗi khi đẩy file Excel',
        variant: 'error',
      });
    } finally {
      patch({ uploading: false });
      if (excelFileInputRef.current) excelFileInputRef.current.value = '';
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    const { manualForm } = state;

    if (!manualForm.landTypeId || !manualForm.areaId || !manualForm.parcelNumber ||
        !manualForm.mapSheetNumber || !manualForm.areaSize || !manualForm.address ||
        !manualForm.gcnBookNumber.trim()) {
      await showAlert({ title: 'Thông báo', message: 'Vui lòng nhập đủ thông tin (bao gồm Số vào sổ GCN)', variant: 'warning' });
      return;
    }

    patch({ uploading: true });
    try {
      await createLandParcel({
        landTypeId: Number(manualForm.landTypeId),
        areaId: Number(manualForm.areaId),
        parcelNumber: manualForm.parcelNumber.trim(),
        mapSheetNumber: manualForm.mapSheetNumber.trim(),
        areaSize: Number(manualForm.areaSize),
        address: manualForm.address.trim(),
        gcnBookNumber: manualForm.gcnBookNumber.trim(),
        certificateNumber: manualForm.certificateNumber.trim() || undefined,
      });

      await showAlert({ title: 'Thành công', message: 'Thêm thửa đất thành công!', variant: 'success' });
      dispatch({ type: 'closePushModal' });
      dispatch({ type: 'resetManualForm' });
      fetchLandParcels();
    } catch (err) {
      await showAlert({ title: 'Lỗi', message: err.message || 'Thêm thất bại', variant: 'error' });
    } finally {
      patch({ uploading: false });
    }
  };

  const handleUpdateSubmit = async () => {
    if (!state.selectedRecord?.landParcelId) return;
    patch({ saving: true });
    try {
      const { editForm } = state;
      const res = await updateLandParcel(state.selectedRecord.landParcelId, {
        landTypeId: Number(editForm.landTypeId),
        areaId: Number(editForm.areaId),
        parcelNumber: editForm.parcelNumber?.trim(),
        mapSheetNumber: editForm.mapSheetNumber?.trim(),
        areaSize: Number(editForm.areaSize),
        address: editForm.address?.trim(),
        usageDuration: editForm.usageDuration?.trim() || null,
        usageType: editForm.usageType?.trim() || null,
        usageOrigin: editForm.usageOrigin?.trim() || null,
        attachedHouse: editForm.attachedHouse?.trim() || null,
        attachedOther: editForm.attachedOther?.trim() || null,
        notes: editForm.notes?.trim() || null,
      });
      const updated = res.data ?? res;
      patch({
        selectedRecord: updated,
        editForm: buildEditForm(updated),
        isEditing: false,
      });
      await showAlert({ title: 'Thành công', message: res.message || 'Cập nhật thành công', variant: 'success' });
    } catch (err) {
      await showAlert({ title: 'Lỗi', message: err.message || 'Cập nhật thất bại', variant: 'error' });
    } finally {
      patch({ saving: false });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    dispatch({ type: 'patchManualForm', payload: { [name]: value } });
  };

  const handleDelete = async (id) => {
    const ok = await showConfirm({
      title: 'Xác nhận xóa',
      message: 'Xóa vĩnh viễn thửa đất này?',
      variant: 'warning',
      confirmLabel: 'Xóa',
    });
    if (!ok) return;
    try {
      const res = await deleteLandParcel(id);
      await showAlert({ title: 'Thành công', message: res.message, variant: 'success' });
      fetchLandParcels();
      patch({ view: 'list', isEditing: false });
    } catch {
      await showAlert({
        title: 'Lỗi',
        message: 'Không xóa được: thửa đất có thể đang liên kết hồ sơ/thanh toán.',
        variant: 'error',
      });
    }
  };

  const closePushModal = () => {
    dispatch({ type: 'closePushModal' });
    clearExcelSelection();
  };

  return {
    user,
    state,
    patch,
    landRecords,
    isAdmin: user?.roles?.includes('ROLE_ADMIN'),
    excelFileInputRef,
    gcnPrintRef,
    display,
    getLandTypeName,
    getAreaLabel,
    clearExcelSelection,
    closePushModal,
    handleEditFormChange,
    handleStartEdit,
    handleCancelEdit,
    handleDownloadGcnPdf,
    handleViewDetail,
    handleExcelFileSelect,
    handleConfirmExcelImport,
    handleDownloadTemplate,
    handleManualSubmit,
    handleUpdateSubmit,
    handleInputChange,
    handleDelete,
  };
};
