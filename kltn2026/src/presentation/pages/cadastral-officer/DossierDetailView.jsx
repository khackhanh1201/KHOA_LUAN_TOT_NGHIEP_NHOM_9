import React from 'react';
import CadastralLayout from '../../components/CadastralLayout';
import AttachmentPreviewModal from '../../components/AttachmentPreviewModal';
import { formatOwnerList } from '../../../utils/cadastralCompare';
import {
  display,
  mapStatusLabel,
  formatLongDate,
  canReceiveRecord,
} from './dossierUtils';
import {
  ReceiptPreviewPaper,
  SectionHeader,
  InfoItem,
  InfoItemBox,
  FileItem,
  TimelineItem,
} from './DossierSubcomponents';
import {
  containerStyle,
  detailHeaderCardStyle,
  detailActionBarStyle,
  btnPrimaryRed,
  btnBackStyle,
  cardStyle,
  grid4Col,
  grid3Col,
  compareBannerStyle,
  compareOkBannerStyle,
  modalOverlayStyle,
  modalContentStyle,
  modalHeaderBorderedStyle,
  closeBtnDarkStyle,
} from './dossierStyles';

const formatDateLocal = (dateStr) => dateStr ? new Date(dateStr).toLocaleDateString('vi-VN') : '—';
const formatArea = (num) => num ? `${num}m²` : '—';

const DossierDetailView = ({
  user,
  selectedDossier,
  dossierDetails: d,
  detailLoading,
  actionLoading,
  cadastralMaster,
  cadastralMismatches,
  compareDone,
  showPdfPreview,
  downloadingPdf,
  attachmentPreview,
  receiptPaperRef,
  onBack,
  onShowPdfPreview,
  onClosePdfPreview,
  onDownloadReceiptPdf,
  onReceive,
  onAttachmentPreview,
  onCloseAttachmentPreview,
  showAlert,
}) => (
  <CadastralLayout user={user}>
    <div style={containerStyle}>
      <div style={detailHeaderCardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button type="button" onClick={onBack} style={btnBackStyle} aria-label="Quay lại">
            <i className="bi bi-arrow-left"></i>
          </button>
          <div>
            <h3 style={{ margin: 0, fontWeight: 800, color: '#1e293b' }}>Chi tiết hồ sơ địa chính</h3>
            <small style={{ color: '#64748b' }}>
              Mã hồ sơ: <span style={{ color: '#a30d11', fontWeight: 700 }}>HS-{String(d?.recordId ?? selectedDossier.rawId ?? 0).padStart(6, '0')}</span>
              {' · '}
              <span style={{ fontWeight: 600 }}>{mapStatusLabel(d?.recordInfo?.currentStatus)}</span>
            </small>
          </div>
        </div>
        <div style={detailActionBarStyle}>
          <button
            type="button"
            style={btnPrimaryRed}
            disabled={detailLoading || !d}
            onClick={() => {
              if (!d) {
                showAlert({ title: 'Thông báo', message: 'Đang tải chi tiết hồ sơ, vui lòng đợi...', variant: 'info' });
                return;
              }
              onShowPdfPreview();
            }}
          >
            <i className="bi bi-file-earmark-pdf"></i> Xuất hồ sơ
          </button>
          {canReceiveRecord(d?.recordInfo?.currentStatus) ? (
            <button
              type="button"
              style={btnPrimaryRed}
              disabled={actionLoading || detailLoading || !d}
              onClick={() => onReceive(d.recordId)}
            >
              {actionLoading ? 'Đang xử lý...' : 'Tiếp nhận & xác minh'}
            </button>
          ) : (
            <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>
              {d?.recordInfo?.currentStatus === 'REJECTED'
                ? 'Hồ sơ đã bị từ chối — không thể tiếp nhận lại'
                : 'Hồ sơ đã qua bước tiếp nhận'}
            </span>
          )}
        </div>
      </div>

      {detailLoading ? (
        <div style={{ textAlign: 'center', padding: '80px', background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0' }}>
          <output className="spinner-border text-danger" aria-live="polite"></output>
          <p style={{ marginTop: 20, color: '#64748b' }}>Đang tải chi tiết hồ sơ...</p>
        </div>
      ) : !d ? (
        <div style={{ textAlign: 'center', padding: '80px', background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', color: '#dc2626' }}>
          <i className="bi bi-x-circle" style={{ fontSize: 40 }}></i>
          <p style={{ marginTop: 20 }}>Không thể tải được dữ liệu chi tiết của hồ sơ này.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={cardStyle}>
              <SectionHeader icon="file-earmark-text" title="Thông tin chung hồ sơ" />
              <div style={grid4Col}>
                <InfoItem label="MÃ HỒ SƠ" value={`HS-${String(d.recordId).padStart(5, '0')}`} bold />
                <InfoItem label="NGƯỜI NỘP HỒ SƠ" value={display(d.citizenInfo?.fullName)} bold />
                <InfoItem label="LOẠI HỒ SƠ" value={display(d.recordInfo?.recordCategory)} />
                <InfoItem label="SỐ CCCD" value={display(d.citizenInfo?.cccd)} />
                <InfoItem label="NGÀY TIẾP NHẬN" value={formatDateLocal(d.recordInfo?.submittedAt)} />
                <InfoItem label="TRẠNG THÁI HIỆN TẠI" value={mapStatusLabel(d.recordInfo?.currentStatus)} color="#3b82f6" />
                <InfoItem label="ĐỐI TƯỢNG MIỄN THUẾ" value={d.recordInfo?.taxExemption || 'Không'} color={d.recordInfo?.taxExemption ? '#10b981' : '#dc2626'} />
              </div>
            </div>

            <div style={cardStyle}>
              <SectionHeader icon="geo-alt" title="Thông tin thửa đất (đối chiếu tờ khai)" />
              {compareDone && Object.keys(cadastralMismatches).length > 0 && (
                <div style={compareBannerStyle}>
                  <i className="bi bi-exclamation-triangle-fill" />{' '}
                  {cadastralMismatches.gcnNotFound
                    ? 'Không tìm thấy thửa đất theo số GCN trên sổ địa chính.'
                    : `Phát hiện sai lệch với sổ địa chính (GCN: ${display(d.gcnBookNumber)}). Vui lòng đối chiếu trước khi chuyển tiếp.`}
                </div>
              )}
              {compareDone && Object.keys(cadastralMismatches).length === 0 && cadastralMaster && (
                <div style={compareOkBannerStyle}>
                  <i className="bi bi-check-circle-fill" /> Dữ liệu tờ khai khớp sổ địa chính.
                </div>
              )}
              <div style={grid3Col}>
                <InfoItemBox label="SỐ VÀO SỔ GCN" value={d.gcnBookNumber} />
                <InfoItemBox
                  label="THỬA ĐẤT SỐ"
                  value={d.landParcelInfo?.parcelNumber}
                  mismatch={cadastralMismatches.parcelNumber || cadastralMismatches.parcelLink}
                  masterValue={cadastralMaster?.parcelNumber}
                />
                <InfoItemBox
                  label="TỜ BẢN ĐỒ SỐ"
                  value={d.landParcelInfo?.mapSheetNumber}
                  mismatch={cadastralMismatches.mapSheetNumber || cadastralMismatches.parcelLink}
                  masterValue={cadastralMaster?.mapSheetNumber}
                />
                <InfoItemBox
                  label="DIỆN TÍCH (KÊ KHAI)"
                  value={formatArea(d.landParcelInfo?.area)}
                  mismatch={cadastralMismatches.areaSize}
                  masterValue={
                    cadastralMaster?.areaSize != null
                      ? `${cadastralMaster.areaSize}m²`
                      : null
                  }
                />
                <InfoItemBox
                  label="LOẠI ĐẤT"
                  value={d.landParcelInfo?.landType}
                  mismatch={cadastralMismatches.landTypeId}
                  masterValue={
                    cadastralMaster?.landTypeName || cadastralMaster?.usageType
                  }
                />
                <InfoItemBox label="HÌNH THỨC SỬ DỤNG" value={d.landParcelInfo?.usageType} />
                <InfoItemBox
                  label="CHỦ SỞ HỮU (HỒ SƠ)"
                  value={display(d.citizenInfo?.fullName)}
                  mismatch={cadastralMismatches.owner}
                  masterValue={formatOwnerList(cadastralMaster?.owners)}
                />
              </div>
              <div style={{ marginTop: 20 }}>
                <InfoItemBox
                  label="ĐỊA CHỈ THỬA ĐẤT"
                  value={d.landParcelInfo?.address}
                  mismatch={cadastralMismatches.address}
                  masterValue={cadastralMaster?.address}
                />
              </div>
            </div>

            <div style={cardStyle}>
              <SectionHeader icon="check-square" title="Danh mục hồ sơ đính kèm" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {d.attachments?.map((file) => (
                  <FileItem
                    key={file.id || file.url || file.name}
                    name={file.name}
                    status={file.status}
                    url={file.url}
                    fileType={file.fileType}
                    onView={onAttachmentPreview}
                  />
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={cardStyle}>
              <SectionHeader icon="clock-history" title="Lịch sử thay đổi hồ sơ" />
              <div style={{ paddingLeft: 10 }}>
                {d.history?.length > 0 ? (
                  d.history.map((item, index) => (
                    <TimelineItem key={item.id || `${item.action}-${item.date}`} item={item} active={index === d.history.length - 1} />
                  ))
                ) : (
                  <div style={{ color: '#94a3b8', fontSize: 14 }}>Chưa có lịch sử</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>

    {showPdfPreview && d && (
      <div style={modalOverlayStyle}>
        <div style={{ ...modalContentStyle, width: 'min(900px, 95vw)', height: '90vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f1f5f9' }}>
          <div style={{ ...modalHeaderBorderedStyle, backgroundColor: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <i className="bi bi-file-earmark-pdf" style={{ color: '#a30d11', fontSize: 20 }}></i>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#1e293b' }}>Xem trước phiếu tiếp nhận</h3>
            </div>
            <button type="button" onClick={onClosePdfPreview} style={closeBtnDarkStyle} aria-label="Đóng">
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: 32, display: 'flex', justifyContent: 'center' }}>
            <ReceiptPreviewPaper
              ref={receiptPaperRef}
              d={d}
              user={user}
              formatDate={formatDateLocal}
              formatLongDate={formatLongDate}
              mapStatusLabel={mapStatusLabel}
            />
          </div>

          <div style={{ padding: '16px 24px', backgroundColor: '#fff', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'center' }}>
            <button
              type="button"
              style={{ ...btnPrimaryRed, padding: '12px 32px', opacity: downloadingPdf ? 0.7 : 1 }}
              disabled={downloadingPdf}
              onClick={() => onDownloadReceiptPdf(d.recordId)}
            >
              <i className="bi bi-download"></i> {downloadingPdf ? 'Đang tải...' : 'Tải file PDF'}
            </button>
          </div>
        </div>
      </div>
    )}

    <AttachmentPreviewModal file={attachmentPreview} onClose={onCloseAttachmentPreview} />
  </CadastralLayout>
);

export default DossierDetailView;
