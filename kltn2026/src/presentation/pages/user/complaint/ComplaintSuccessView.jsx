import React from 'react';
import LandTaxLayout from '../../../components/LandTaxLayout';
import { COMPLAINT_DOMAIN } from './complaintUtils';

const ComplaintSuccessView = ({ user, lastDomain, onCreateNew }) => (
  <LandTaxLayout user={user}>
    <div className="container py-5 text-center">
      <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '80px' }} />
      <h3 className="mt-4 fw-bold">Khiếu nại đã được gửi thành công!</h3>
      <p className="text-muted mt-3">
        {lastDomain === COMPLAINT_DOMAIN.TAX
          ? 'Cơ quan Thuế sẽ xử lý và phản hồi trong thời gian sớm nhất.'
          : 'Cơ quan Địa chính sẽ xử lý và phản hồi trong thời gian sớm nhất.'}
      </p>
      <button type="button" className="btn btn-danger mt-4 px-5 fw-semibold"
        style={{ borderRadius: '8px' }}
        onClick={onCreateNew}
      >
        Tạo khiếu nại mới
      </button>
    </div>
  </LandTaxLayout>
);

export default ComplaintSuccessView;
