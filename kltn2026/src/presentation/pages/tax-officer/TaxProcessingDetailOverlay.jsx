import React from 'react';
import { formatTaxRecordCode } from '../../../utils/taxRecordCode';
import { DetailField, AttachmentItem } from './TaxProcessingParts';
import {
  mapStatusToText, getStatusBadge, getStatusColor,
} from './taxProcessingStyles';
import {
  fsOverlayStyle, fsHeaderStyle, fsBodyStyle, sectionCardStyle, sectionTitleStyle,
  grid4Style, grid3Style, grayBoxStyle, labelStyle, btnSaveRedStyle,
} from './taxProcessingStyles';

const rdStyleFlexBackgroundBorder = {
                      flex: 1,
                      background: '#eff6ff',
                      border: '1px solid #dbeafe',
                      color: '#1d4ed8',
                      borderRadius: 8,
                      padding: '10px 14px',
                      fontWeight: 800,
                      fontSize: 13,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    };

const TaxProcessingDetailOverlay = ({
  selectedRecord, detailLoading, loadingAttachments, attachments, dispatch, onClose, onProcessAction,
}) => (
  <div style={fsOverlayStyle}>
            <div style={{ ...fsHeaderStyle, flexDirection: 'column', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
                <button type="button" onClick={() => onClose()} style={{ background: 'none', border: 'none', fontSize: 20, color: '#64748b', cursor: 'pointer' }}>←</button>
                <div>
                  <h3 style={{ margin: 0, fontWeight: 800, fontSize: 18 }}>Chi tiết hồ sơ khai thuế</h3>
                  <small style={{ color: '#64748b' }}>Mã hồ sơ: <span style={{ color: '#a30d11', fontWeight: 600 }}>{formatTaxRecordCode(selectedRecord.id, selectedRecord.submittedAt)}</span></small>
                </div>
              </div>
              
              {/* Horizontal Actions Bar (Thanh Khoanh Đỏ) */}
              <div style={{ display: 'flex', gap: 12, width: '100%', borderTop: '1px solid #e2e8f0', paddingTop: 12, paddingBottom: 4 }}>
                {(selectedRecord.status === 'PENDING' || selectedRecord.status === 'SUBMITTED') && (
                  <div
                    style={rdStyleFlexBackgroundBorder}
                  >
                    <i className="bi bi-hourglass-split" /> Đang chờ cán bộ địa chính xử lý
                  </div>
                )}

                {selectedRecord.status === 'VERIFIED' && (
                  <button type="button" onClick={() => onProcessAction('RECEIVE')} style={btnSaveRedStyle}>
                    <i className="bi bi-inbox" /> Tiếp nhận
                  </button>
                )}

                {selectedRecord.status === 'PROCESSING' && (
                    <>
                      <button type="button" onClick={() => dispatch({ type: 'patch', payload: { actionModal: 'APPROVE', actionDetail: '' } })} style={btnSaveRedStyle}>
                        <i className="bi bi-check-circle" /> Phê duyệt
                      </button>
                      <button type="button" onClick={() => dispatch({ type: 'patch', payload: { actionModal: 'REJECT', actionDetail: '' } })} style={btnSaveRedStyle}>
                        <i className="bi bi-x" /> Từ chối
                      </button>
                    </>
                )}

                <button type="button" onClick={() => dispatch({ type: 'patch', payload: { showExportOptions: true } })} style={btnSaveRedStyle}>
                  <i className="bi bi-download" /> Xuất hồ sơ
                </button>
                <button type="button" onClick={() => dispatch({ type: 'patch', payload: { showHistory: true } })} style={btnSaveRedStyle}>
                  <i className="bi bi-clock-history" /> Lịch sử
                </button>
              </div>
            </div>

            <div style={fsBodyStyle}>
              {/* CỘT TRÁI: THÔNG TIN CHI TIẾT */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
                
                {/* 1. Thông tin chung hồ sơ */}
                <div style={sectionCardStyle}>
                  <div style={sectionTitleStyle}><i className="bi bi-file-earmark-text" style={{color:'#3b82f6'}}></i> Thông tin chung hồ sơ</div>
                  <div style={grid4Style}>
                    <DetailField label="MÃ HỒ SƠ" value={formatTaxRecordCode(selectedRecord.id, selectedRecord.submittedAt)} strong />
                    <DetailField label="NGƯỜI NỘP HỒ SƠ" value={selectedRecord.name} strong />
                    <DetailField label="LOẠI HỒ SƠ" value={selectedRecord.recordCategory} strong />
                    <DetailField label="SỐ CCCD" value={selectedRecord.cccd} strong />
                    <DetailField label="NGÀY TIẾP NHẬN" value={selectedRecord.date} strong />
                    <div>
                        <div style={labelStyle}>TRẠNG THÁI HIỆN TẠI</div>
                        <div style={{ fontWeight: 700, color: getStatusColor(selectedRecord.status) }}>
                            {mapStatusToText(selectedRecord.status)}
                        </div>
                    </div>
                    <DetailField label="ĐỐI TƯỢNG MIỄN THUẾ" value={selectedRecord.exemptSubject} color="#ea580c" strong />
                  </div>
                </div>

                {/* 2. Thông tin thửa đất */}
                <div style={sectionCardStyle}>
                  <div style={sectionTitleStyle}><i className="bi bi-geo-alt" style={{color:'#ef4444'}}></i> Thông tin thửa đất khai thuế</div>
                  <div style={grid3Style}>
                    <div style={grayBoxStyle}><DetailField label="THỬA ĐẤT SỐ" value={selectedRecord.parcelNumber} strong /></div>
                    <div style={grayBoxStyle}><DetailField label="TỜ BẢN ĐỒ SỐ" value={selectedRecord.mapSheetNumber} strong /></div>
                    <div style={grayBoxStyle}><DetailField label="DIỆN TÍCH" value={selectedRecord.areaSize} strong /></div>
                    <div style={grayBoxStyle}><DetailField label="LOẠI ĐẤT" value={selectedRecord.landType} strong /></div>
                    <div style={grayBoxStyle}><DetailField label="HÌNH THỨC SỬ DỤNG" value={selectedRecord.usageOrigin} strong /></div>
                    <div style={{...grayBoxStyle, gridColumn: '1 / -1'}}><DetailField label="ĐỊA CHỈ THỬA ĐẤT" value={selectedRecord.address} strong /></div>
                  </div>
                </div>

                {/* 3. Thông tin nghĩa vụ tài chính (chỉ cán bộ thuế) */}
                <div style={sectionCardStyle}>
                  <div style={sectionTitleStyle}><i className="bi bi-currency-dollar" style={{color:'#f59e0b'}}></i> Thông tin nghĩa vụ tài chính</div>
                  {detailLoading ? (
                    <div style={{ color: '#64748b', fontSize: 14 }}>Đang tải thông tin nghĩa vụ tài chính...</div>
                  ) : (
                    <>
                      <div style={grid4Style}>
                        <div style={grayBoxStyle}><DetailField label="GIÁ ĐẤT ÁP DỤNG" value={selectedRecord.landPrice} strong /></div>
                        <div style={grayBoxStyle}><DetailField label="HỆ SỐ THUẾ (BẬC 1)" value={selectedRecord.taxRate} strong /></div>
                        <div style={grayBoxStyle}><DetailField label="MIỄN GIẢM (ƯỚC TÍNH)" value={selectedRecord.discount} color="#10b981" strong /></div>
                        <div style={grayBoxStyle}><DetailField label="TIỀN THUẾ PHẢI NỘP" value={selectedRecord.totalTax} strong /></div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
                        <div style={grayBoxStyle}><DetailField label="THUẾ TRƯỚC MIỄN GIẢM" value={selectedRecord.grossTax} strong /></div>
                        <div style={grayBoxStyle}><DetailField label="TRẠNG THÁI THANH TOÁN" value={selectedRecord.paymentStatus} strong /></div>
                      </div>
                    </>
                  )}
                </div>

                {/* 4. Hồ sơ đính kèm */}
                <div style={sectionCardStyle}>
                  <div style={sectionTitleStyle}><i className="bi bi-check-square" style={{color:'#10b981'}}></i> Danh mục hồ sơ đính kèm</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {loadingAttachments && (
                      <div style={{ color: '#64748b', fontSize: 14 }}>Đang tải hồ sơ đính kèm...</div>
                    )}

                    {!loadingAttachments && attachments.length === 0 && (
                      <div style={{ color: '#64748b', fontSize: 14 }}>Không có file đính kèm</div>
                    )}

                    {attachments.map((doc) => (
                      <AttachmentItem
                        key={doc.documentId}
                        name={doc.fileName}
                        fileUrl={doc.fileUrl}
                        fileType={doc.fileType}
                        onView={(file) => dispatch({ type: 'patch', payload: { attachmentPreview: file } })}
                      />
                    ))}
                  </div>
                </div>

              </div>

            </div>
          </div>
);

export default TaxProcessingDetailOverlay;
