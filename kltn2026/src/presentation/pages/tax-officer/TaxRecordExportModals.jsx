import React from 'react';
import { ClientTodayVi, ClientViDateTime } from '../../components/ClientDateDisplay';
import { formatTaxRecordCode } from '../../../utils/taxRecordCode';
import {
  modalOverlayStyle, modalContentStyle, modalHeaderStyle, modalFooterStyle,
  closeButtonStyle, btnPrimary, btnSecondary, btnLarge, btnCancelStyle,
  SectionTitle, FormatCard,
} from './taxRecordsShared';

const rdStylePositionLeftTop3 = { position: 'absolute', left: -33, top: 2, width: 16, height: 16, borderRadius: '50%', background: '#a30d11', border: '3px solid #fff', boxShadow: '0 0 0 2px #fecdd3' };
const rdStylePositionLeftTop2 = { position: 'absolute', left: -33, top: 2, width: 16, height: 16, borderRadius: '50%', background: '#16a34a', border: '3px solid #fff', boxShadow: '0 0 0 2px #dcfce7' };
const rdStylePositionLeftTop = { position: 'absolute', left: -33, top: 2, width: 16, height: 16, borderRadius: '50%', background: '#3b82f6', border: '3px solid #fff', boxShadow: '0 0 0 2px #eff6ff' };
const rdStyleBackgroundWidthMaxWidth = { background: '#fff', width: '100%', maxWidth: 750, padding: '60px 50px', borderRadius: 4, boxShadow: '0 10px 25px rgba(0,0,0,0.1)', position: 'relative', fontFamily: 'Arial, sans-serif' };

const TaxRecordExportModals = ({
  selectedRecord, showExportOptions, showPreview, showHistory, exportFormat,
  dispatch, onExportData,
}) => {
  const historyNow = Date.now();
  const recordCode = selectedRecord ? formatTaxRecordCode(selectedRecord.recordId) : '';

  return (
  <>
        {/* 2. Modal Lựa chọn Xuất */}
        {showExportOptions && selectedRecord && (
          <div style={modalOverlayStyle}>
            <div style={{ ...modalContentStyle, maxWidth: 480, borderRadius: 40 }}>
              <div style={{ padding: '40px 40px 30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <h2 style={{ fontWeight: 900, margin: 0, fontSize: 28, letterSpacing: -0.5 }}>XUẤT DỮ LIỆU HỒ SƠ</h2>
                  <button type="button" aria-label="Đóng" onClick={() => dispatch({ type: 'patch', payload: { showExportOptions: false } })} style={closeButtonStyle}><i className="bi bi-x-lg"></i></button>
                </div>
                <p style={{ color: '#64748b', marginBottom: 30 }}>Chọn định dạng và kiểm tra thông tin trước khi xuất</p>

                <div style={{ background: '#f8fafc', padding: '20px 24px', borderRadius: 24, marginBottom: 30 }}>
                  <SectionTitle icon="info-circle" title="Thông tin hồ sơ" />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, alignItems: 'center' }}>
                    <span style={{ color: '#94a3b8', fontSize: 13, fontWeight: 700 }}>MÃ HỒ SƠ</span>
                    <span style={{ color: '#a30d11', background: '#fff1f2', padding: '4px 12px', borderRadius: 12, fontWeight: 700, fontSize: 14 }}>HS-{selectedRecord.recordId}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#94a3b8', fontSize: 13, fontWeight: 700 }}>CCCD</span>
                    <span style={{ fontWeight: 700, color: '#1e293b' }}>{selectedRecord.senderCccd}</span>
                  </div>
                </div>

                <div style={{ marginBottom: 10 }}>
                   <small style={{ color: '#94a3b8', fontWeight: 800, fontSize: 12, letterSpacing: 1 }}>ĐỊNH DẠNG XUẤT</small>
                </div>
                <div style={{ display: 'flex', gap: 16, marginBottom: 30 }}>
                  <FormatCard active={exportFormat === 'PDF'} label="PDF" onClick={() => dispatch({ type: 'patch', payload: { exportFormat: 'PDF' } })} />
                  <FormatCard active={exportFormat === 'DOC'} label="DOC" onClick={() => dispatch({ type: 'patch', payload: { exportFormat: 'DOC' } })} />
                </div>

                <button type="button" onClick={() => dispatch({ type: 'patch', payload: { showPreview: true } })} style={{ ...btnLarge, background: '#f1f5f9', color: '#1e293b', marginBottom: 12 }}>
                  <i className="bi bi-eye"></i> XEM TRƯỚC DỮ LIỆU
                </button>
                <button type="button" onClick={onExportData} style={{ ...btnLarge, background: '#a30d11', color: '#fff' }}>
                  <i className="bi bi-download"></i> XUẤT DỮ LIỆU NGAY
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2.5. Modal Lịch sử Thay đổi */}
        {showHistory && selectedRecord && (
          <div style={modalOverlayStyle}>
            <div style={{ ...modalContentStyle, maxWidth: 550, borderRadius: 24 }}>
              <div style={{ padding: '30px 40px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: 0, fontWeight: 900, fontSize: 20, color: '#1e293b' }}>LỊCH SỬ THAY ĐỔI HỒ SƠ</h4>
                  <small style={{ color: '#64748b', fontWeight: 600 }}>Hồ sơ: {recordCode}</small>
                </div>
                <button type="button" aria-label="Đóng" onClick={() => dispatch({ type: 'patch', payload: { showHistory: false } })} style={closeButtonStyle}><i className="bi bi-x-lg"></i></button>
              </div>
              
              <div style={{ padding: '24px 40px', maxHeight: '400px', overflowY: 'auto' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20, position: 'relative', paddingLeft: 24, borderLeft: '2px dashed #e2e8f0' }}>
                  
                  {/* Timeline Item 3 */}
                  <div style={{ position: 'relative' }}>
                    <div style={rdStylePositionLeftTop3} />
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#1e293b' }}>Cập nhật thông tin hồ sơ thuế</div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                      <i className="bi bi-clock" style={{ marginRight: 6 }}></i>
                      <ClientViDateTime timestamp={historyNow} />
                    </div>
                    <div style={{ fontSize: 13, color: '#64748b', marginTop: 6, background: '#f8fafc', padding: '8px 12px', borderRadius: 8, border: '1px solid #f1f5f9' }}>
                      Cán bộ thuế chỉnh sửa chi tiết thông tin nghĩa vụ tài chính và thông tin người nộp.
                    </div>
                  </div>

                  {/* Timeline Item 2 */}
                  <div style={{ position: 'relative' }}>
                    <div style={rdStylePositionLeftTop2} />
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#1e293b' }}>Phê duyệt nghĩa vụ tài chính</div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                      <i className="bi bi-clock" style={{ marginRight: 6 }}></i>
                      <ClientViDateTime timestamp={historyNow - 3600000} />
                    </div>
                    <div style={{ fontSize: 13, color: '#64748b', marginTop: 6, background: '#f8fafc', padding: '8px 12px', borderRadius: 8, border: '1px solid #f1f5f9' }}>
                      Hồ sơ đã được thẩm định và xác nhận thông báo thuế thành công.
                    </div>
                  </div>

                  {/* Timeline Item 1 */}
                  <div style={{ position: 'relative' }}>
                    <div style={rdStylePositionLeftTop} />
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#1e293b' }}>Tạo mới hồ sơ khai thuế</div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                      <i className="bi bi-clock" style={{ marginRight: 6 }}></i>
                      <ClientViDateTime timestamp={historyNow - 86400000} />
                    </div>
                    <div style={{ fontSize: 13, color: '#64748b', marginTop: 6, background: '#f8fafc', padding: '8px 12px', borderRadius: 8, border: '1px solid #f1f5f9' }}>
                      Hồ sơ được đồng bộ từ Cơ sở dữ liệu đất đai Quốc gia.
                    </div>
                  </div>

                </div>
              </div>
              
              <div style={{ padding: '20px 40px 30px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', background: '#fff' }}>
                <button type="button" onClick={() => dispatch({ type: 'patch', payload: { showHistory: false } })} style={btnCancelStyle}>Đóng</button>
              </div>
            </div>
          </div>
        )}

        {/* 3. Modal Xem trước */}
{showPreview && selectedRecord && (
  <div style={{ ...modalOverlayStyle, zIndex: 6000 }}>
    <div style={{ ...modalContentStyle, maxWidth: 900, background: '#f1f5f9', height: '90vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ ...modalHeaderStyle, background: '#fff' }}>
        <div>
          <h5 style={{ margin: 0, fontWeight: 800 }}>Xem trước dữ liệu xuất</h5>
          <small style={{ color: '#64748b' }}>Định dạng: {exportFormat} | Hồ sơ: {recordCode}</small>
        </div>
        <button type="button" aria-label="Đóng" onClick={() => dispatch({ type: 'patch', payload: { showPreview: false } })} style={closeButtonStyle}><i className="bi bi-x-lg"></i></button>
      </div>
      
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto', display: 'flex', justifyContent: 'center' }}>
        <div style={rdStyleBackgroundWidthMaxWidth}>
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 40, borderBottom: '2px solid #e2e8f0', paddingBottom: 20 }}>
            <p style={{ fontWeight: 700, margin: 0, fontSize: 12, textTransform: 'uppercase' }}>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
            <p style={{ fontSize: 12, margin: '4px 0 0', color: '#64748b' }}>Độc lập - Tự do - Hạnh phúc</p>
          </div>

          {/* Title */}
          <div style={{ textAlign: 'center', marginBottom: 30 }}>
            <h3 style={{ fontWeight: 900, margin: 0, fontSize: 18, color: '#a30d11' }}>THÔNG BÁO NGHĨA VỤ TÀI CHÍNH</h3>
            <small style={{ color: '#64748b', fontWeight: 600, marginTop: 8, display: 'block' }}>Mã hồ sơ: {recordCode}</small>
          </div>

          {/* THÔNG TIN NGƯỜI NỘP */}
          <div style={{ marginBottom: 28 }}>
            <h5 style={{ fontWeight: 800, fontSize: 13, color: '#1e293b', margin: '0 0 16px', textTransform: 'uppercase', borderBottom: '1px solid #cbd5e1', paddingBottom: 8 }}>THÔNG TIN NGƯỜI NỘP</h5>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <p style={{ fontSize: 12, color: '#94a3b8', margin: 0, fontWeight: 700, textTransform: 'uppercase' }}>Họ và tên</p>
                <p style={{ fontSize: 14, color: '#1e293b', margin: '4px 0 0', fontWeight: 600 }}>{selectedRecord.fullName || 'Trần Văn A'}</p>
              </div>
              <div>
                <p style={{ fontSize: 12, color: '#94a3b8', margin: 0, fontWeight: 700, textTransform: 'uppercase' }}>Số CCCD</p>
                <p style={{ fontSize: 14, color: '#1e293b', margin: '4px 0 0', fontWeight: 600 }}>{selectedRecord.senderCccd || '001090123456'}</p>
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <p style={{ fontSize: 12, color: '#94a3b8', margin: 0, fontWeight: 700, textTransform: 'uppercase' }}>Địa chỉ thường trú</p>
              <p style={{ fontSize: 13, color: '#1e293b', margin: '4px 0 0', lineHeight: '1.5' }}>{selectedRecord.address || '123 Đường Kim Giang, Phường Thanh Liệt, Huyện Thanh Trì, TP. Hà Nội'}</p>
            </div>
          </div>

          {/* THÔNG TIN THỬA ĐẤT */}
          <div style={{ marginBottom: 28 }}>
            <h5 style={{ fontWeight: 800, fontSize: 13, color: '#1e293b', margin: '0 0 16px', textTransform: 'uppercase', borderBottom: '1px solid #cbd5e1', paddingBottom: 8 }}>THÔNG TIN THỬA ĐẤT</h5>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <p style={{ fontSize: 12, color: '#94a3b8', margin: 0, fontWeight: 700, textTransform: 'uppercase' }}>Thửa đất số</p>
                <p style={{ fontSize: 14, color: '#1e293b', margin: '4px 0 0', fontWeight: 600 }}>{selectedRecord.landParcelNumber || '101'}</p>
              </div>
              <div>
                <p style={{ fontSize: 12, color: '#94a3b8', margin: 0, fontWeight: 700, textTransform: 'uppercase' }}>Tờ bản đồ số</p>
                <p style={{ fontSize: 14, color: '#1e293b', margin: '4px 0 0', fontWeight: 600 }}>{selectedRecord.mapSheetNumber || '10'}</p>
              </div>
              <div>
                <p style={{ fontSize: 12, color: '#94a3b8', margin: 0, fontWeight: 700, textTransform: 'uppercase' }}>Diện tích</p>
                <p style={{ fontSize: 14, color: '#1e293b', margin: '4px 0 0', fontWeight: 600 }}>{selectedRecord.area || '120'}m²</p>
              </div>
              <div>
                <p style={{ fontSize: 12, color: '#94a3b8', margin: 0, fontWeight: 700, textTransform: 'uppercase' }}>Loại đất</p>
                <p style={{ fontSize: 14, color: '#1e293b', margin: '4px 0 0', fontWeight: 600 }}>{selectedRecord.landType || 'Đất ở đô thị'}</p>
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <p style={{ fontSize: 12, color: '#94a3b8', margin: 0, fontWeight: 700, textTransform: 'uppercase' }}>Địa chỉ thửa đất</p>
              <p style={{ fontSize: 13, color: '#1e293b', margin: '4px 0 0', lineHeight: '1.5' }}>{selectedRecord.landAddress || selectedRecord.address || '123 Đường Kim Giang, Phường Thanh Liệt, Huyện Thanh Trì, TP. Hà Nội'}</p>
            </div>
          </div>

          {/* CHI TIẾT NGHĨA VỤ TÀI CHÍNH */}
          <div style={{ marginBottom: 28 }}>
            <h5 style={{ fontWeight: 800, fontSize: 13, color: '#1e293b', margin: '0 0 16px', textTransform: 'uppercase', borderBottom: '1px solid #cbd5e1', paddingBottom: 8 }}>CHI TIẾT NGHĨA VỤ TÀI CHÍNH</h5>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <p style={{ fontSize: 12, color: '#94a3b8', margin: 0, fontWeight: 700, textTransform: 'uppercase' }}>Loại thuế</p>
                <p style={{ fontSize: 14, color: '#1e293b', margin: '4px 0 0', fontWeight: 600 }}>{selectedRecord.taxType || 'Thuế sử dụng đất PNN'}</p>
              </div>
            </div>
            <div style={{ marginTop: 20, background: '#fff1f2', padding: '16px 20px', borderRadius: 12, textAlign: 'center' }}>
              <p style={{ fontSize: 12, color: '#a30d11', margin: 0, fontWeight: 700, textTransform: 'uppercase' }}>Tổng số tiền phải nộp</p>
              <p style={{ fontSize: 22, color: '#a30d11', margin: '8px 0 0', fontWeight: 900 }}>{selectedRecord.calculatedTaxAmount ? Number(selectedRecord.calculatedTaxAmount).toLocaleString('vi-VN') + 'đ' : '0đ'}</p>
            </div>
          </div>

          {/* Footer Info */}
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 16, marginBottom: 24 }}>
            <p style={{ fontSize: 12, color: '#94a3b8', margin: 0, textAlign: 'center' }}>* Đây là bản xem trước dữ liệu xuất định dạng {exportFormat}.</p>
            <p style={{ fontSize: 12, color: '#94a3b8', margin: '4px 0 0', textAlign: 'center' }}>* Ngày tạo: <ClientTodayVi /></p>
          </div>

          {/* Signature */}
          <div style={{ textAlign: 'right', marginTop: 40 }}>
            <p style={{ fontWeight: 700, fontSize: 12, margin: 0, marginBottom: 60 }}>CƠ QUAN THUẾ</p>
            <p style={{ color: '#94a3b8', fontSize: 12, margin: 0 }}>(Ký và ghi rõ họ tên)</p>
          </div>
        </div>
      </div>

      <div style={modalFooterStyle}>
        <button type="button" onClick={() => dispatch({ type: 'patch', payload: { showPreview: false } })} style={btnSecondary}>ĐÓNG BẢN XEM TRƯỚC</button>
        <button type="button" onClick={onExportData} style={{ ...btnPrimary, background: '#a30d11', padding: '12px 30px' }}>XUẤT DỮ LIỆU NGAY</button>
      </div>
    </div>
  </div>
)}
  </>
  );
};

export default TaxRecordExportModals;
