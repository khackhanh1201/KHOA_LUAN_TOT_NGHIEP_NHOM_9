import React, { useReducer, useEffect } from 'react';
import TaxOfficerLayout from '../../components/TaxOfficerLayout';
import { useUserInfo } from '../../../hooks/useUserInfo';
import { useAppDialog } from '../../components/dialog/DialogContext';
import { notifyTaxOfficerWorkloadChanged } from '../../../hooks/useTaxOfficerWorkloadCount';
import ComplaintManagementListView from './ComplaintManagementListView';
import ComplaintManagementDetailView from './ComplaintManagementDetailView';
import {
  API_BASE,
  getAuth,
  mapComplaintFromApi,
  initialState,
  complaintManagementReducer,
} from './complaintManagementUtils';

const ComplaintManagement = () => {
  const { user } = useUserInfo();
  const { showAlert, showPrompt } = useAppDialog();
  const [state, dispatch] = useReducer(complaintManagementReducer, initialState);
  const {
    view,
    activeTab,
    complaints,
    loading,
    showAdvancedSearch,
    selectedComplaint,
    attachmentPreview,
    searchTerm,
    advFilters,
  } = state;

  const filteredComplaints = complaints.filter((item) => {
    const q = searchTerm.trim().toLowerCase();
    const matchSearch =
      !q ||
      String(item.id).includes(q) ||
      item.complaintCode.toLowerCase().includes(q) ||
      item.name.toLowerCase().includes(q) ||
      (item.cccdNumber || '').includes(q) ||
      (item.type || '').toLowerCase().includes(q);

    const matchAdvCode = !advFilters.code || item.complaintCode.toLowerCase().includes(advFilters.code.toLowerCase().trim());
    const matchAdvName = !advFilters.name || item.name.toLowerCase().includes(advFilters.name.toLowerCase().trim());
    const matchAdvCccd = !advFilters.cccd || (item.cccdNumber || '').includes(advFilters.cccd.trim());
    const matchAdvType =
      advFilters.type === 'Tất cả' ||
      (advFilters.type === 'Khiếu nại về thuế' && (item.type.includes('thuế') || item.type.includes('TAX'))) ||
      (advFilters.type === 'Khiếu nại đất đai' && (item.type.includes('đất đai') || item.type.includes('LAND') || item.type.includes('địa chính'))) ||
      (advFilters.type === 'Khiếu nại chung' && !item.type.includes('thuế') && !item.type.includes('đất đai') && !item.type.includes('địa chính')) ||
      (item.type || '').toLowerCase().includes(advFilters.type.toLowerCase());

    const matchAllAdv = matchAdvCode && matchAdvName && matchAdvCccd && matchAdvType;

    if (activeTab === 'Tất cả') return matchSearch && matchAllAdv;
    if (activeTab === 'Chờ xử lý') return matchSearch && matchAllAdv && item.status === 'PENDING';
    if (activeTab === 'Đang xử lý') {
      return matchSearch && matchAllAdv && (item.status === 'IN_PROGRESS' || item.status === 'PROCESSING');
    }
    if (activeTab === 'Chờ bổ sung') {
      return matchSearch && matchAllAdv && item.status === 'NEED_SUPPLEMENT';
    }
    if (activeTab === 'Đã giải quyết') {
      return matchSearch && matchAllAdv && (item.status === 'RESOLVED' || item.status === 'REJECTED');
    }
    return matchSearch && matchAllAdv;
  });

  const fetchComplaints = async () => {
    dispatch({ type: 'patch', payload: { loading: true } });
    try {
      const res = await fetch(`${API_BASE}/complaints`, { headers: getAuth() });
      if (!res.ok) throw new Error(`Lỗi ${res.status}`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.data || []);
      dispatch({ type: 'patch', payload: { complaints: list.map(mapComplaintFromApi) } });
    } catch (err) {
      console.error(err);
      dispatch({ type: 'patch', payload: { complaints: [] } });
    } finally {
      dispatch({ type: 'patch', payload: { loading: false } });
    }
  };

  useEffect(() => {
    if (view === 'list' && user) {
      fetchComplaints();
    }
  }, [view, user]);

  const handleViewDetail = (complaint) => {
    dispatch({ type: 'openDetail', complaint });
  };

  const handleUpdateStatus = async (id, status, responseNote = null) => {
    try {
      const res = await fetch(`${API_BASE}/complaints/${id}`, {
        method: 'PUT',
        headers: getAuth(),
        body: JSON.stringify({ status, responseNote }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const updated = await res.json();
      const mapped = mapComplaintFromApi(updated);
      dispatch({ type: 'patch', payload: { selectedComplaint: mapped } });
      fetchComplaints();
      notifyTaxOfficerWorkloadChanged();
      await showAlert({ title: 'Thành công', message: 'Cập nhật thành công', variant: 'success' });
    } catch (err) {
      await showAlert({ title: 'Lỗi', message: 'Cập nhật thất bại: ' + err.message, variant: 'error' });
    }
  };

  const handleAccept = async () => {
    const note = await showPrompt({
      title: 'Tiếp nhận khiếu nại',
      message: 'Nhập ghi chú tạm thời (không bắt buộc):',
      placeholder: 'Ghi chú...',
      required: false,
    });
    if (note === null) return;
    handleUpdateStatus(selectedComplaint.id, 'IN_PROGRESS', note || null);
  };

  const handleResolve = async () => {
    const note = await showPrompt({
      title: 'Giải quyết khiếu nại',
      message: 'Nhập kết luận giải quyết (bắt buộc):',
      placeholder: 'Nội dung kết luận...',
      required: true,
    });
    if (!note) return;
    handleUpdateStatus(selectedComplaint.id, 'RESOLVED', note);
  };

  const handleReject = async () => {
    const note = await showPrompt({
      title: 'Từ chối khiếu nại',
      message: 'Nhập lý do từ chối (bắt buộc):',
      placeholder: 'Lý do từ chối...',
      required: true,
    });
    if (!note) return;
    handleUpdateStatus(selectedComplaint.id, 'REJECTED', note);
  };

  const handleUpdateNote = async () => {
    const note = await showPrompt({
      title: 'Cập nhật ghi chú',
      message: 'Nhập ghi chú tạm thời cập nhật:',
      placeholder: 'Ghi chú...',
      required: true,
    });
    if (!note) return;
    handleUpdateStatus(selectedComplaint.id, 'IN_PROGRESS', note);
  };

  const handleRequestSupplement = async () => {
    const note = await showPrompt({
      title: 'Yêu cầu bổ sung hồ sơ',
      message: 'Mô tả tài liệu / thông tin công dân cần bổ sung (bắt buộc):',
      placeholder: 'VD: Bản sao tờ khai thuế, biên lai thanh toán...',
      required: true,
    });
    if (!note) return;
    handleUpdateStatus(selectedComplaint.id, 'NEED_SUPPLEMENT', note);
  };

  if (view === 'list') {
    return (
      <TaxOfficerLayout user={user}>
        <ComplaintManagementListView
          searchTerm={searchTerm}
          advFilters={advFilters}
          showAdvancedSearch={showAdvancedSearch}
          activeTab={activeTab}
          loading={loading}
          filteredComplaints={filteredComplaints}
          dispatch={dispatch}
          onViewDetail={handleViewDetail}
        />
      </TaxOfficerLayout>
    );
  }

  if (view === 'detail' && selectedComplaint) {
    return (
      <TaxOfficerLayout user={user}>
        <ComplaintManagementDetailView
          complaint={selectedComplaint}
          attachmentPreview={attachmentPreview}
          dispatch={dispatch}
          onBack={() => dispatch({ type: 'closeDetail' })}
          onAccept={handleAccept}
          onResolve={handleResolve}
          onReject={handleReject}
          onUpdateNote={handleUpdateNote}
          onRequestSupplement={handleRequestSupplement}
        />
      </TaxOfficerLayout>
    );
  }

  return null;
};

export default ComplaintManagement;
