import React from 'react';
import { formatTaxRecordCode } from '../../../utils/taxRecordCode';
import {
  fsOverlayStyle, fsHeaderStyle, fsBodyStyle, sectionCardStyle, sectionTitleStyle,
  grid4Style, grid3Style, grayBoxStyle, labelStyle, inputStyle, btnSaveRedStyle, btnCancelStyle,
  DetailField, getPriorityBadge,
} from './taxRecordsShared';

const TaxRecordDetailPanel = ({
  selectedRecord, isEditing, editValues, loadingDetail, detailError, dispatch,
  onClose, onStartEdit, onCancelEdit, onSaveEdit, onOpenExport, onShowHistory,
}) => (
  <div style={fsOverlayStyle}>
    <div style={{ ...fsHeaderStyle, flexDirection: 'column', alignItems: 'flex-start', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 15, width: '100%' }}>
        <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, color: '#64748b', cursor: 'pointer' }}>←</button>
        <div>
          <h5 style={{ margin: 0, fontWeight: 800, fontSize: 18 }}>{isEditing ? 'CẬP NHẬT CHI TIẾT HỒ SƠ' : 'CHI TIẾT HỒ SƠ'}</h5>
          <small style={{ color: '#64748b' }}>Mã hồ sơ: <span style={{ color: '#a30d11', fontWeight: 600 }}>HS-{selectedRecord.recordId}</span></small>
        </div>
      </div>
      
      {/* Horizontal Actions Bar (Thanh Khoanh Đỏ) */}
      <div style={{ display: 'flex', gap: 12, width: '100%', borderTop: '1px solid #e2e8f0', paddingTop: 12, paddingBottom: 4 }}>
        {isEditing ? (
          <>
            <button type="button" onClick={onSaveEdit} style={btnSaveRedStyle}>
              <i className="bi bi-check-lg"></i> LƯU THAY ĐỔI
            </button>
            <button type="button" onClick={onCancelEdit} style={btnCancelStyle}>HỦY BỎ</button>
          </>
        ) : (
          <>
            <button type="button" onClick={onStartEdit} style={btnSaveRedStyle}>
              <i className="bi bi-pencil-square"></i> CẬP NHẬT
            </button>
            <button type="button" onClick={() => onOpenExport(selectedRecord)} style={btnSaveRedStyle}>
              <i className="bi bi-download"></i> XUẤT DỮ LIỆU
            </button>
            <button type="button" onClick={() => dispatch({ type: 'patch', payload: { showHistory: true } })} style={btnSaveRedStyle}>
              <i className="bi bi-clock-history"></i> LỊCH SỬ
            </button>
          </>
        )}
      </div>
    </div>
    
    <div style={fsBodyStyle}>
      {/* CỘT TRÁI: CHI TIẾT HỒ SƠ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {loadingDetail ? (
          <div style={{ textAlign: 'center', padding: '40px', background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <div className="spinner-border text-danger" />
            <p style={{ marginTop: 12, color: '#64748b' }}>Đang tải chi tiết...</p>
          </div>
        ) : (
          <>
            {detailError && <div className="alert alert-danger" style={{ marginBottom: 16, borderRadius: 8, fontSize: 14 }}>{detailError}</div>}

            {/* 1. THÔNG TIN CHUNG HỒ SƠ */}
            <div style={sectionCardStyle}>
              <div style={sectionTitleStyle}>
                <i className="bi bi-file-earmark-text" style={{ color: '#3b82f6' }}></i> 
                <span>Thông tin chung hồ sơ</span>
                <span style={{ marginLeft: 'auto', ...getPriorityBadge('TRUNG BÌNH') }}>ƯU TIÊN: TRUNG BÌNH</span>
              </div>
              <div style={grid4Style}>
                <DetailField label="MÃ HỒ SƠ" value={formatTaxRecordCode(selectedRecord.recordId)} strong />
                
                <div>
                  <div style={labelStyle}>NGƯỜI NỘP HỒ SƠ</div>
                  {isEditing ? (
                    <input
                      type="text"
                      aria-label="Người nộp hồ sơ"
                      value={editValues.fullName || ''}
                      onChange={(e) => dispatch({ type: 'patch', payload: { editValues: { ...editValues, fullName: e.target.value } } })}
                      style={inputStyle}
                    />
                  ) : (
                    <div style={{ fontSize: 14, color: '#1e293b', fontWeight: 700 }}>{selectedRecord.fullName || '—'}</div>
                  )}
                </div>

                <DetailField label="LOẠI HỒ SƠ" value="Đăng ký biến động đất đai" strong />

                <div>
                  <div style={labelStyle}>SỐ CCCD</div>
                  {isEditing ? (
                    <input
                      type="text"
                      aria-label="Số CCCD"
                      value={editValues.senderCccd || ''}
                      onChange={(e) => dispatch({ type: 'patch', payload: { editValues: { ...editValues, senderCccd: e.target.value } } })}
                      style={inputStyle}
                    />
                  ) : (
                    <div style={{ fontSize: 14, color: '#1e293b', fontWeight: 700 }}>{selectedRecord.senderCccd || '—'}</div>
                  )}
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={labelStyle}>ĐỊA CHỈ THƯỜNG TRÚ</div>
                  {isEditing ? (
                    <input
                      type="text"
                      aria-label="Địa chỉ thường trú"
                      value={editValues.address || ''}
                      onChange={(e) => dispatch({ type: 'patch', payload: { editValues: { ...editValues, address: e.target.value } } })}
                      style={inputStyle}
                    />
                  ) : (
                    <div style={{ fontSize: 14, color: '#1e293b', fontWeight: 500 }}>{selectedRecord.address || '—'}</div>
                  )}
                </div>
              </div>
            </div>

            {/* 2. THÔNG TIN THỬA ĐẤT */}
            <div style={sectionCardStyle}>
              <div style={sectionTitleStyle}>
                <i className="bi bi-geo-alt" style={{ color: '#ef4444' }}></i> 
                <span>Thông tin thửa đất</span>
              </div>
              <div style={grid3Style}>
                <div style={grayBoxStyle}>
                  <div style={labelStyle}>THỬA ĐẤT SỐ</div>
                  {isEditing ? (
                    <input
                      type="text"
                      aria-label="Thửa đất số"
                      value={editValues.landParcelNumber || ''}
                      onChange={(e) => dispatch({ type: 'patch', payload: { editValues: { ...editValues, landParcelNumber: e.target.value } } })}
                      style={inputStyle}
                    />
                  ) : (
                    <div style={{ fontSize: 14, color: '#1e293b', fontWeight: 700 }}>{selectedRecord.landParcelNumber || '—'}</div>
                  )}
                </div>

                <div style={grayBoxStyle}>
                  <div style={labelStyle}>TỜ BẢN ĐỒ SỐ</div>
                  {isEditing ? (
                    <input
                      type="text"
                      aria-label="Tờ bản đồ số"
                      value={editValues.mapSheetNumber || ''}
                      onChange={(e) => dispatch({ type: 'patch', payload: { editValues: { ...editValues, mapSheetNumber: e.target.value } } })}
                      style={inputStyle}
                    />
                  ) : (
                    <div style={{ fontSize: 14, color: '#1e293b', fontWeight: 700 }}>{selectedRecord.mapSheetNumber || '—'}</div>
                  )}
                </div>

                <div style={grayBoxStyle}>
                  <div style={labelStyle}>DIỆN TÍCH</div>
                  {isEditing ? (
                    <input
                      type="text"
                      aria-label="Diện tích"
                      value={editValues.area || ''}
                      onChange={(e) => dispatch({ type: 'patch', payload: { editValues: { ...editValues, area: e.target.value } } })}
                      style={inputStyle}
                    />
                  ) : (
                    <div style={{ fontSize: 14, color: '#1e293b', fontWeight: 700 }}>{selectedRecord.area ? `${selectedRecord.area} m²` : '—'}</div>
                  )}
                </div>

                <div style={grayBoxStyle}>
                  <div style={labelStyle}>LOẠI ĐẤT</div>
                  {isEditing ? (
                    <input
                      type="text"
                      aria-label="Loại đất"
                      value={editValues.landType || ''}
                      onChange={(e) => dispatch({ type: 'patch', payload: { editValues: { ...editValues, landType: e.target.value } } })}
                      style={inputStyle}
                    />
                  ) : (
                    <div style={{ fontSize: 14, color: '#1e293b', fontWeight: 700 }}>{selectedRecord.landType || '—'}</div>
                  )}
                </div>

                <div style={grayBoxStyle}>
                  <DetailField label="HÌNH THỨC SỬ DỤNG" value="Sử dụng riêng" strong />
                </div>

                <div style={{ ...grayBoxStyle, gridColumn: '1 / -1' }}>
                  <div style={labelStyle}>ĐỊA CHỈ THỬA ĐẤT</div>
                  {isEditing ? (
                    <input
                      type="text"
                      aria-label="Địa chỉ thửa đất"
                      value={editValues.landAddress || ''}
                      onChange={(e) => dispatch({ type: 'patch', payload: { editValues: { ...editValues, landAddress: e.target.value } } })}
                      style={inputStyle}
                    />
                  ) : (
                    <div style={{ fontSize: 14, color: '#1e293b', fontWeight: 700 }}>{selectedRecord.landAddress || selectedRecord.address || '—'}</div>
                  )}
                </div>
              </div>
            </div>

            {/* 3. NGHĨA VỤ TÀI CHÍNH */}
            <div style={sectionCardStyle}>
              <div style={sectionTitleStyle}>
                <i className="bi bi-currency-dollar" style={{ color: '#f59e0b' }}></i> 
                <span>Nghĩa vụ tài chính</span>
              </div>
              <div style={grid4Style}>
                <div style={{ ...grayBoxStyle, gridColumn: '1 / span 2' }}>
                  <div style={labelStyle}>LOẠI THUẾ/LỆ PHÍ</div>
                  {isEditing ? (
                    <input
                      type="text"
                      aria-label="Loại thuế/lệ phí"
                      value={editValues.taxType || ''}
                      onChange={(e) => dispatch({ type: 'patch', payload: { editValues: { ...editValues, taxType: e.target.value } } })}
                      style={inputStyle}
                    />
                  ) : (
                    <div style={{ fontSize: 14, color: '#1e293b', fontWeight: 700 }}>{selectedRecord.taxType || 'Thuế sử dụng đất'}</div>
                  )}
                </div>

                <div style={{ ...grayBoxStyle, background: '#fff1f2', borderColor: '#fecdd3', gridColumn: '3 / span 2' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#a30d11', marginBottom: 4, textTransform: 'uppercase' }}>TỔNG TIỀN PHẢI NỘP</div>
                  {isEditing ? (
                    <input
                      type="number"
                      aria-label="Tổng tiền phải nộp"
                      min="0"
                      step="1"
                      value={editValues.calculatedTaxAmount !== undefined ? editValues.calculatedTaxAmount : ''}
                      onChange={(e) => dispatch({ type: 'patch', payload: { editValues: { ...editValues, calculatedTaxAmount: e.target.value } } })}
                      style={{ ...inputStyle, border: '1px solid #fecdd3', marginTop: 4 }}
                    />
                  ) : (
                    <div style={{ fontSize: 18, color: '#a30d11', fontWeight: 900 }}>{selectedRecord.calculatedTaxAmount ? Number(selectedRecord.calculatedTaxAmount).toLocaleString('vi-VN') + 'đ' : '0đ'}</div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

    </div>
  </div>
);

export default TaxRecordDetailPanel;
