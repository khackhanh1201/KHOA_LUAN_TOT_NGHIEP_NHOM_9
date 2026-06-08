import React, { useReducer, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useUserInfo } from '../../../hooks/useUserInfo';
import { useAppDialog } from '../../components/dialog/DialogContext';
import { notifyCadastralWorkloadChanged } from '../../../hooks/useCadastralWorkloadCount';
import {
  API_BASE,
  getAuth,
  mapComplaintFromApi,
  COMPLAINT_LIST_PATH,
  DEFAULT_COMPLAINT_TAB,
  COMPLAINT_INITIAL_STATE,
  complaintReducer,
} from './complaintUtils';
import ComplaintListView from './ComplaintListView';
import ComplaintDetailView from './ComplaintDetailView';

const ComplaintHandling = () => {
  const { user } = useUserInfo();
  const { showAlert, showPrompt } = useAppDialog();
  const location = useLocation();

  const [state, dispatch] = useReducer(complaintReducer, COMPLAINT_INITIAL_STATE);
  const {
    view,
    activeTab,
    complaints,
    loading,
    showAdvancedSearch,
    selectedComplaint,
    attachmentPreview,
  } = state;
  const patch = (payload) => dispatch({ type: 'patch', payload });

  const fetchComplaints = async () => {
    patch({ loading: true });
    try {
      const res = await fetch(`${API_BASE}/complaints`, { headers: getAuth() });

      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.data || []);
        patch({ complaints: list.map(mapComplaintFromApi) });
      } else {
        console.error(`Server báo lỗi: ${res.status}`);
        patch({ complaints: [] });
      }
    } catch (err) {
      console.error('Lỗi kết nối:', err);
      patch({ complaints: [] });
    } finally {
      patch({ loading: false });
      notifyCadastralWorkloadChanged();
    }
  };

  const lastPathRef = useRef('');
  useEffect(() => {
    const pathname = location.pathname;
    if (pathname === lastPathRef.current) return;
    lastPathRef.current = pathname;
    if (pathname === COMPLAINT_LIST_PATH) {
      patch({ activeTab: DEFAULT_COMPLAINT_TAB });
    }
  });

  useEffect(() => {
    if (view === 'list' && user) {
      fetchComplaints();
    }
  }, [view, user]);

  const handleViewDetail = (complaint) => {
    dispatch({ type: 'openDetail', complaint });
  };

  const filteredComplaints = complaints.filter((item) => {
    if (activeTab === 'Tất cả') return true;
    if (activeTab === 'Chờ xử lý') return item.status === 'PENDING';
    if (activeTab === 'Đang xử lý') return item.status === 'IN_PROGRESS' || item.status === 'PROCESSING';
    if (activeTab === 'Chờ bổ sung') return item.status === 'NEED_SUPPLEMENT';
    if (activeTab === 'Đã giải quyết') return item.status === 'RESOLVED' || item.status === 'REJECTED';
    return true;
  });

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
      patch({ selectedComplaint: mapped });
      fetchComplaints();
      notifyCadastralWorkloadChanged();
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
      placeholder: 'VD: Bản sao GCN, sơ đồ thửa đất...',
      required: true,
    });
    if (!note) return;
    handleUpdateStatus(selectedComplaint.id, 'NEED_SUPPLEMENT', note);
  };

  if (view === 'list') {
    return (
      <ComplaintListView
        user={user}
        activeTab={activeTab}
        loading={loading}
        filteredComplaints={filteredComplaints}
        showAdvancedSearch={showAdvancedSearch}
        onTabChange={(tab) => patch({ activeTab: tab })}
        onToggleAdvancedSearch={() => patch({ showAdvancedSearch: !showAdvancedSearch })}
        onViewDetail={handleViewDetail}
      />
    );
  }

  if (view === 'detail' && selectedComplaint) {
    return (
      <ComplaintDetailView
        user={user}
        complaint={selectedComplaint}
        attachmentPreview={attachmentPreview}
        dispatch={dispatch}
        onBack={() => patch({ view: 'list', attachmentPreview: null })}
        onAccept={handleAccept}
        onResolve={handleResolve}
        onReject={handleReject}
        onUpdateNote={handleUpdateNote}
        onRequestSupplement={handleRequestSupplement}
      />
    );
  }

  return null;
};

export default ComplaintHandling;
