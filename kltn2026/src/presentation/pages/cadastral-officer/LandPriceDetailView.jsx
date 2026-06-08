import React from 'react';
import CadastralLayout from '../../components/CadastralLayout';
import AttachmentPreviewModal from '../../components/AttachmentPreviewModal';
import { downloadFileFromUrl } from '../../../utils/downloadFile';
import {
  formatAreaDistrictLabel,
  formatAreaWardLabel,
} from '../../../utils/areaLabels';
import { InfoData } from './LandPriceFormParts';
import {
  containerStyle,
  btnBackStyle,
  cardStyle,
  positionBadgeStyle,
  statusBadgeStyle,
} from './landPriceStyles';

const rdStyleDisplayAlignItemsGap3 = { display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, color: '#1e293b', borderBottom: '1px solid #f1f5f9', paddingBottom: 16, marginBottom: 20 };
const rdStyleDisplayAlignItemsGap2 = { display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, color: '#1e293b', borderBottom: '1px solid #f1f5f9', paddingBottom: 16, marginBottom: 20 };
const rdStyleDisplayJustifyContentAlignItems = {
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 16px',
                      backgroundColor: '#f8fafc',
                      borderRadius: 8,
                      border: '1px solid #f1f5f9',
                      marginBottom: 8,
                    };
const rdStyleDisplayAlignItemsGap = { display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, color: '#1e293b', borderBottom: '1px solid #f1f5f9', paddingBottom: 16, marginBottom: 30 };
const timelineDotStyle = (isLatest) => ({
  width: 14,
  height: 14,
  borderRadius: '50%',
  backgroundColor: isLatest ? '#dc2626' : '#cbd5e1',
  border: '3px solid #fff',
  position: 'relative',
  zIndex: 2,
  marginTop: 4,
});

const LandPriceDetailView = ({
  user,
  selectedRecord,
  masterAreas,
  masterLandTypes,
  districtLabelMap,
  priceDocuments,
  priceHistory,
  historyLoading,
  attachmentPreview,
  formatAppliedFrom,
  onBack,
  onPreviewAttachment,
  onClosePreview,
}) => (
  <CadastralLayout user={user}>
    <div style={containerStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 15, marginBottom: 30 }}>
        <button type="button" onClick={onBack} style={btnBackStyle} aria-label="Quay lại"><i className="bi bi-arrow-left"></i></button>
        <div>
          <h2 style={{ margin: 0, fontWeight: 800, color: '#1e293b' }}>Chi tiết Giá đất</h2>
          <p style={{ color: '#64748b', margin: 0, fontSize: 14 }}>Mã tham chiếu: GĐ-{selectedRecord.priceId}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        <div style={cardStyle}>
          <div style={rdStyleDisplayAlignItemsGap2}>
            <i className="bi bi-geo-alt" style={{ color: '#dc2626' }}></i> Thông tin vị trí & Mức giá
          </div>

          {(() => {
            const matchedArea = masterAreas.find((a) => a.areaId === selectedRecord.areaId);
            const matchedLandType = masterLandTypes.find((t) => t.landTypeId === selectedRecord.landTypeId);
            return (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px 20px' }}>
                <InfoData label="TUYẾN ĐƯỜNG" value={matchedArea ? matchedArea.streetName : '—'} />
                <InfoData label="ĐOẠN ĐƯỜNG" value={matchedArea ? `Vị trí ${matchedArea.positionLevel}` : '—'} />
                <InfoData label="QUẬN/HUYỆN" value={formatAreaDistrictLabel(matchedArea, districtLabelMap)} />
                <InfoData label="XÃ/PHƯỜNG" value={formatAreaWardLabel(matchedArea)} />
                <InfoData label="LOẠI ĐẤT" value={matchedLandType ? matchedLandType.typeName : `Loại ${selectedRecord.landTypeId}`} />
                <div>
                  <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 800, marginBottom: 4 }}>VỊ TRÍ</div>
                  <span style={positionBadgeStyle}>Vị trí {matchedArea ? matchedArea.positionLevel : selectedRecord.areaId}</span>
                </div>
              </div>
            );
          })()}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 40, paddingTop: 20, borderTop: '1px dashed #e2e8f0' }}>
            <div>
              <div style={{ fontSize: 12, color: '#64748b', fontWeight: 800, marginBottom: 4 }}>MỨC GIÁ QUY ĐỊNH</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontSize: 32, fontWeight: 800, color: '#dc2626', lineHeight: 1 }}>
                  {(selectedRecord.unitPrice || 0).toLocaleString('vi-VN')}
                </span>
                <span style={{ fontSize: 14, color: '#64748b', fontWeight: 600 }}>VNĐ/m2</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 800, marginBottom: 4 }}>TRẠNG THÁI</div>
              <span style={statusBadgeStyle}><i className="bi bi-check-circle"></i> {selectedRecord.status || 'Hoạt động'}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={cardStyle}>
            <div style={rdStyleDisplayAlignItemsGap3}>
              <i className="bi bi-file-earmark-pdf" style={{ color: '#dc2626' }}></i> Quyết định đính kèm
            </div>
            {priceDocuments.length === 0 ? (
              <div style={{ color: '#94a3b8', fontSize: 13 }}>Chưa có file quyết định đính kèm.</div>
            ) : (
              priceDocuments.map((doc) => {
                const name = doc.fileName || doc.file_name || 'Quyết định';
                const url = doc.fileUrl || doc.file_url;
                const fileType = doc.fileType || doc.file_type || '';
                return (
                  <div
                    key={doc.documentId || name}
                    style={rdStyleDisplayJustifyContentAlignItems}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <i className="bi bi-paperclip" style={{ color: '#3b82f6' }}></i>
                      <span style={{ fontWeight: 600, color: '#1e293b', fontSize: 13 }}>{name}</span>
                    </div>
                    {url && (
                      <div style={{ display: 'flex', gap: 12, color: '#64748b', fontSize: 16 }}>
                        <button
                          type="button"
                          onClick={() => onPreviewAttachment({ name, url, fileType })}
                          title="Xem trước trên web"
                          aria-label="Xem trước trên web"
                          style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}
                        >
                          <i className="bi bi-eye" />
                        </button>
                        <button
                          type="button"
                          onClick={() => downloadFileFromUrl(url, name)}
                          title="Tải xuống"
                          aria-label="Tải xuống"
                          style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}
                        >
                          <i className="bi bi-download" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <div style={cardStyle}>
            <div style={rdStyleDisplayAlignItemsGap}>
              <i className="bi bi-graph-up-arrow" style={{ color: '#dc2626' }}></i> Lịch sử điều chỉnh giá
            </div>

            {historyLoading ? (
              <div style={{ padding: '24px 0', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Đang tải lịch sử...</div>
            ) : priceHistory.length === 0 ? (
              <div style={{ padding: '24px 0', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                Chưa có lịch sử điều chỉnh giá cho vị trí này.
              </div>
            ) : (
              <div style={{ position: 'relative', paddingLeft: 10 }}>
                {priceHistory.length > 1 && (
                  <div style={{ position: 'absolute', top: 10, bottom: 10, left: 16, width: 2, backgroundColor: '#e2e8f0' }}></div>
                )}
                {priceHistory.map((item, index) => {
                  const isLatest = index === 0;
                  const price = Number(item.unitPrice ?? 0);
                  return (
                    <div
                      key={item.priceId ?? `${item.appliedFrom}-${index}`}
                      style={{
                        display: 'flex',
                        gap: 20,
                        marginBottom: index < priceHistory.length - 1 ? 40 : 0,
                        position: 'relative',
                      }}
                    >
                      <div
                        style={timelineDotStyle(isLatest)}
                      ></div>
                      <div
                        style={{
                          backgroundColor: isLatest ? '#fff' : '#f8fafc',
                          border: isLatest ? '1px solid #fecaca' : '1px solid #e2e8f0',
                          borderRadius: 12,
                          padding: 16,
                          flex: 1,
                          boxShadow: isLatest ? '0 4px 6px rgba(220,38,38,0.05)' : 'none',
                        }}
                      >
                        <div style={{ fontSize: 16, fontWeight: 800, color: isLatest ? '#dc2626' : '#64748b' }}>
                          {price.toLocaleString('vi-VN')}
                        </div>
                        <div style={{ fontSize: 12, color: isLatest ? '#64748b' : '#94a3b8', marginTop: 4 }}>
                          Áp dụng từ: <br />
                          {formatAppliedFrom(item.appliedFrom)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>

    <AttachmentPreviewModal file={attachmentPreview} onClose={onClosePreview} />
  </CadastralLayout>
);

export default LandPriceDetailView;
