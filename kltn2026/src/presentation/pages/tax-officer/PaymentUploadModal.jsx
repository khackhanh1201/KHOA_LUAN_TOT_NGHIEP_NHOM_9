import React from 'react';
import {
  modalOverlay, reconUploadModalContent, inputLabel, formSelect, formInput, uploadArea, iconUploadBox,
  btnWhite, btnConfirmRed,
} from './paymentManagementStyles';

const rdStyleMarginTopBackgroundColor = { marginTop: 20, background: '#1e293b', color: '#fff', padding: '6px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 };

const PaymentUploadModal = ({
  reconAccount,
  reconStartDate,
  reconEndDate,
  reconFile,
  uploading,
  dispatch,
  onUpload,
  onClose,
}) => (
        <div style={modalOverlay}>
          <div style={reconUploadModalContent}>
            <div style={{ textAlign: 'center', marginBottom: 30 }}>
              <h3 style={{ margin: '0 0 8px 0', fontWeight: 800, fontSize: 20 }}>Tải dữ liệu đối soát</h3>
              <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>Vui lòng cung cấp file sao kê từ ngân hàng hoặc kho bạc để bắt đầu so khớp.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
              
              {/* Cột trái: Form nhập liệu */}
              <div>
                <div style={{ marginBottom: 20 }}>
                  <label htmlFor="reconAccount" style={inputLabel}>Chọn tài khoản đối soát</label>
                  <select id="reconAccount" style={formSelect} value={reconAccount} onChange={e => dispatch({ type: 'patch', payload: { reconAccount: e.target.value } })}>
                    <option>Vietcombank</option>
                    <option>BIDV</option>
                    <option>Agribank</option>
                  </select>
                </div>
                <div>
                  <label style={inputLabel}>
                    Chọn kỳ đối soát
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                      <input id="reconStartDate" type="date" style={formInput} value={reconStartDate} onChange={e => dispatch({ type: 'patch', payload: { reconStartDate: e.target.value } })} />
                      <input id="reconEndDate" type="date" style={formInput} value={reconEndDate} onChange={e => dispatch({ type: 'patch', payload: { reconEndDate: e.target.value } })} />
                    </div>
                  </label>
                  <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 8, fontStyle: 'italic' }}>* Hệ thống sẽ giới hạn dữ liệu nợ thuế trong khoảng thời gian này để so sánh.</p>
                </div>
              </div>

              {/* Cột phải: Vùng Upload */}
              <div>
                <div style={uploadArea}>
                  <input type="file" id="modalFile" accept=".xlsx,.csv" style={{ display: 'none' }} onChange={e => dispatch({ type: 'patch', payload: { reconFile: e.target.files[0] } })} />
                  <label htmlFor="modalFile" style={{ cursor: 'pointer', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={iconUploadBox}><i className="bi bi-upload"></i></div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: '#1e293b' }}>Kéo thả file sao kê vào đây</div>
                    <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 5 }}>Hỗ trợ .xlsx, .csv (Tối đa 10MB)</div>
                    
                    {reconFile && (
                      <div style={rdStyleMarginTopBackgroundColor}>
                        <i className="bi bi-file-earmark-excel"></i> {reconFile.name}
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </div>
            
            {/* Footer Modal Tải file */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 40 }}>
              <button type="button" style={btnWhite} onClick={() => onClose()}>Thoát</button>
              <button type="button" style={btnConfirmRed} onClick={onUpload} disabled={!reconFile || uploading}>
                {uploading ? 'Đang xử lý...' : 'Xác nhận'} <i className="bi bi-arrow-right"></i>
              </button>
            </div>
          </div>
        </div>
);

export default PaymentUploadModal;
