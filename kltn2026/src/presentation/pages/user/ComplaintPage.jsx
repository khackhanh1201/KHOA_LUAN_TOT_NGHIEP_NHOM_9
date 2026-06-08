import React, { useReducer, useEffect } from 'react';
import LandTaxLayout from '../../components/LandTaxLayout';
import { useUserInfo } from '../../../hooks/useUserInfo';
import { userApi } from '../../../infrastructure/api/userApi';
import { useAppDialog } from '../../components/dialog/DialogContext';
import { useAsyncMountLoad } from '../../../hooks/useAsyncMountLoad';
import { parseTaxRecordId } from '../../../utils/taxRecordCode';
import ComplaintSuccessView from './complaint/ComplaintSuccessView';
import ComplaintForm from './complaint/ComplaintForm';
import SupplementSection from './complaint/SupplementSection';
import ComplaintHistoryTable from './complaint/ComplaintHistoryTable';
import {
  COMPLAINT_DOMAIN,
  INITIAL_COMPLAINT_STATE,
  complaintPageReducer,
  INITIAL_COMPLAINT_FORM,
  isTaxRecord,
  normalizeParcel,
  buildLandComplaintContent,
} from './complaint/complaintUtils';

const loadComplaintFormData = async () => {
  const [records, parcels] = await Promise.all([
    userApi.getMyDeclarations().catch(() => []),
    userApi.getMyLandParcels().catch(() => []),
  ]);
  return {
    records,
    parcels: (Array.isArray(parcels) ? parcels : []).map(normalizeParcel),
  };
};

const ComplaintPage = () => {
  const { user } = useUserInfo();
  const { showAlert } = useAppDialog();

  const [state, dispatch] = useReducer(complaintPageReducer, INITIAL_COMPLAINT_STATE);
  const {
    form, loading, success, error, complaints, listLoading, lastDomain,
    supplementDrafts, supplementFiles, supplementSubmitting,
  } = state;

  const { data: formData, isLoading: recordsLoading } = useAsyncMountLoad(loadComplaintFormData);
  const myRecords = formData?.records ?? [];
  const myLandParcels = formData?.parcels ?? [];

  const reloadComplaints = () => {
    dispatch({ type: 'PATCH', payload: { listLoading: true } });
    return userApi.getMyComplaints()
      .then((list) => dispatch({ type: 'PATCH', payload: { complaints: list } }))
      .catch(() => {})
      .finally(() => dispatch({ type: 'PATCH', payload: { listLoading: false } }));
  };

  useEffect(() => { reloadComplaints(); }, [success]);

  const needSupplementList = complaints.filter((c) => c.status === 'NEED_SUPPLEMENT');
  const taxRecords = myRecords.filter((r) => isTaxRecord(r.recordCategory));
  const isLandDomain = form.complaintDomain === COMPLAINT_DOMAIN.LAND;

  const handleChange = (e) => {
    const { name, value } = e.target;
    dispatch({ type: 'PATCH_FORM', payload: { [name]: value } });
  };

  const handleDomainChange = (e) => dispatch({ type: 'SET_DOMAIN', domain: e.target.value });

  const handleFileChange = (e, field) => {
    if (e.target.files?.[0]) {
      dispatch({ type: 'PATCH_FORM', payload: { [field]: e.target.files[0] } });
    }
  };

  const handleSubmitSupplement = async (complaintId) => {
    const note = (supplementDrafts[complaintId] || '').trim();
    if (!note) {
      dispatch({ type: 'PATCH', payload: { error: 'Vui lòng nhập nội dung bổ sung' } });
      return;
    }
    dispatch({ type: 'PATCH', payload: { supplementSubmitting: complaintId, error: '' } });
    try {
      const files = supplementFiles[complaintId] || [];
      let attachmentIds = [];
      if (files.length > 0) {
        const uploadResults = await Promise.all(files.map((file) => userApi.uploadFile(file)));
        attachmentIds = uploadResults.map((res) => Number(res.documentId));
      }
      await userApi.submitComplaintSupplement(complaintId, note, attachmentIds);
      dispatch({ type: 'CLEAR_SUPPLEMENT_DRAFT', id: complaintId });
      await reloadComplaints();
      window.dispatchEvent(new CustomEvent('notifications-changed'));
      await showAlert({
        title: 'Đã gửi bổ sung',
        message: 'Hệ thống đã nhận nội dung bổ sung. Bạn sẽ nhận thông báo và cán bộ sẽ tiếp tục xử lý khiếu nại.',
        variant: 'success',
      });
    } catch (err) {
      dispatch({ type: 'PATCH', payload: { error: err.message || 'Gửi bổ sung thất bại' } });
      await showAlert({ title: 'Gửi bổ sung thất bại', message: err.message || 'Vui lòng thử lại sau.', variant: 'error' });
    } finally {
      dispatch({ type: 'PATCH', payload: { supplementSubmitting: null } });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.content.trim()) {
      dispatch({ type: 'PATCH', payload: { error: 'Vui lòng nhập nội dung khiếu nại' } });
      return;
    }

    const isLand = form.complaintDomain === COMPLAINT_DOMAIN.LAND;
    let recordId = null;
    let complaintContent = `[${form.title}] - ${form.content.trim()}`;

    if (isLand) {
      if (myLandParcels.length > 0 && !form.landParcelId) {
        dispatch({ type: 'PATCH', payload: { error: 'Vui lòng chọn thửa đất liên quan' } });
        return;
      }
      const parcel = myLandParcels.find((p) => String(p.landParcelId) === String(form.landParcelId))
        || (form.landParcelId ? { landParcelId: form.landParcelId } : null);
      if (parcel) complaintContent = buildLandComplaintContent(form.title, form.content, parcel);
    } else {
      recordId = form.recordId ? parseTaxRecordId(form.recordId) : null;
      if (recordId) {
        const selected = myRecords.find((r) => Number(r.recordId ?? r.id) === recordId);
        if (selected && !isTaxRecord(selected.recordCategory)) {
          dispatch({ type: 'PATCH', payload: { error: 'Hồ sơ này không thuộc loại thuế. Hãy chọn "Khiếu nại về thuế".' } });
          return;
        }
      }
    }

    dispatch({ type: 'PATCH', payload: { loading: true, error: '' } });
    try {
      const filesToUpload = [form.file, form.attachment].filter(Boolean);
      let attachmentIds = [];
      if (filesToUpload.length > 0) {
        const uploadResults = await Promise.all(filesToUpload.map((file) => userApi.uploadFile(file)));
        attachmentIds = uploadResults.map((res) => Number(res.documentId));
      }
      await userApi.submitComplaint({ recordId, content: complaintContent, attachmentIds });
      dispatch({ type: 'PATCH', payload: { lastDomain: form.complaintDomain, success: true, form: INITIAL_COMPLAINT_FORM } });
    } catch (err) {
      dispatch({ type: 'PATCH', payload: { error: err.message || 'Có lỗi xảy ra khi gửi khiếu nại.' } });
    } finally {
      dispatch({ type: 'PATCH', payload: { loading: false } });
    }
  };

  if (success) {
    return (
      <ComplaintSuccessView
        user={user}
        lastDomain={lastDomain}
        onCreateNew={() => dispatch({ type: 'PATCH', payload: { success: false } })}
      />
    );
  }

  return (
    <LandTaxLayout user={user}>
      <div className="container py-4" style={{ maxWidth: '760px' }}>
        <div className="mb-4">
          <h3 className="fw-bold">Khiếu nại & Phản ánh</h3>
          <p className="text-muted">Gửi và theo dõi các phản ánh về đất đai và thuế</p>
        </div>

        <ComplaintForm
          form={form}
          loading={loading}
          error={error}
          recordsLoading={recordsLoading}
          isLandDomain={isLandDomain}
          taxRecords={taxRecords}
          myLandParcels={myLandParcels}
          onDomainChange={handleDomainChange}
          onChange={handleChange}
          onFileChange={handleFileChange}
          onSubmit={handleSubmit}
        />

        <SupplementSection
          needSupplementList={needSupplementList}
          supplementDrafts={supplementDrafts}
          supplementFiles={supplementFiles}
          supplementSubmitting={supplementSubmitting}
          onDraftChange={(id, value) => dispatch({ type: 'PATCH_SUPPLEMENT_DRAFT', id, value })}
          onFileChange={(id, fileList) => dispatch({
            type: 'PATCH_SUPPLEMENT_FILES',
            id,
            files: fileList ? Array.from(fileList) : [],
          })}
          onSubmit={handleSubmitSupplement}
        />

        <ComplaintHistoryTable listLoading={listLoading} complaints={complaints} />
      </div>
    </LandTaxLayout>
  );
};

export default ComplaintPage;
