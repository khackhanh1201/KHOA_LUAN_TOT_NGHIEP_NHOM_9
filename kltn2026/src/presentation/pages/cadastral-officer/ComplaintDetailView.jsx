import React from 'react';
import CadastralLayout from '../../components/CadastralLayout';
import AttachmentPreviewModal from '../../components/AttachmentPreviewModal';
import { downloadFileFromUrl } from '../../../utils/downloadFile';
import {
  getStatusBadge,
  btnBackStyle,
  cardStyle,
  quoteBoxStyle,
  fileAttachmentStyle,
  btnOrangeStyle,
  btnGreenStyle,
  btnRedRejectStyle,
  btnSupplementStyle,
} from './complaintStyles';
import ComplaintInfoItem from './ComplaintInfoItem';

const ComplaintDetailView = ({
  user,
  complaint: c,
  attachmentPreview,
  dispatch,
  onBack,
  onAccept,
  onResolve,
  onReject,
  onUpdateNote,
  onRequestSupplement,
}) => (
  <>
    <CadastralLayout user={user}>
      <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '30px 40px', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
            <button type="button" onClick={onBack} style={btnBackStyle} aria-label="Quay lại danh sách">
              <i className="bi bi-arrow-left" />
            </button>
            <h3 style={{ margin: 0, fontWeight: 800, color: '#1e293b' }}>Chi tiết khiếu nại/phản ánh</h3>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            {c.status === 'PENDING' && (
              <>
                <button type="button" style={btnOrangeStyle} onClick={onAccept}>
                  <i className="bi bi-check-circle" /> Tiếp nhận
                </button>
                <button type="button" style={btnSupplementStyle} onClick={onRequestSupplement}>
                  <i className="bi bi-file-earmark-plus" /> Yêu cầu bổ sung
                </button>
                <button type="button" style={btnGreenStyle} onClick={onResolve}>
                  <i className="bi bi-send" /> Giải quyết ngay
                </button>
              </>
            )}
            {(c.status === 'IN_PROGRESS' || c.status === 'PROCESSING') && (
              <>
                <button type="button" style={btnSupplementStyle} onClick={onRequestSupplement}>
                  <i className="bi bi-file-earmark-plus" /> Yêu cầu bổ sung
                </button>
                <button type="button" style={btnOrangeStyle} onClick={onUpdateNote}>
                  <i className="bi bi-pencil-square" /> Cập nhật ghi chú
                </button>
                <button type="button" style={btnRedRejectStyle} onClick={onReject}>
                  <i className="bi bi-x-circle" /> Từ chối
                </button>
                <button type="button" style={btnGreenStyle} onClick={onResolve}>
                  <i className="bi bi-check-circle" /> Giải quyết
                </button>
              </>
            )}
            {c.status === 'NEED_SUPPLEMENT' && (
              <span style={{ fontSize: 13, color: '#d97706', fontWeight: 600, padding: '8px 12px', background: '#fef3c7', borderRadius: 8 }}>
                Đang chờ công dân bổ sung hồ sơ
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, color: '#3b82f6' }}>
                  <i className="bi bi-chat-left-text" /> Nội dung khiếu nại
                </div>
                <span style={getStatusBadge(c.status)}>{c.statusLabel}</span>
              </div>

              {c.contentTitle && (
                <div style={{ fontWeight: 700, color: '#1e293b', marginBottom: 12 }}>
                  {c.contentTitle}
                </div>
              )}
            <div style={quoteBoxStyle}>{c.contentBody || c.content || '—'}</div>

            {(c.supplementSections || []).length > 0 && (
              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#94a3b8', marginBottom: 12, textTransform: 'uppercase' }}>
                  NỘI DUNG BỔ SUNG CỦA CÔNG DÂN
                </div>
                {(c.supplementSections || []).map((sup) => (
                  <div
                    key={`${sup.date}-${sup.text.slice(0, 32)}`}
                    style={{
                      ...quoteBoxStyle,
                      borderLeftColor: '#2563eb',
                      background: '#eff6ff',
                      marginBottom: 12,
                    }}
                  >
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', marginBottom: 8 }}>
                      Bổ sung lúc {sup.date}
                    </div>
                    {sup.text}
                  </div>
                ))}
              </div>
            )}

            {c.responseNote && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#94a3b8', marginBottom: 8 }}>
                  {(c.status === 'NEED_SUPPLEMENT' || (c.supplementSections || []).length > 0)
                    ? 'YÊU CẦU BỔ SUNG CỦA CÁN BỘ'
                    : 'PHẢN HỒI CỦA CÁN BỘ'}
                </div>
                <div style={{
                  ...quoteBoxStyle,
                  borderLeftColor: (c.status === 'NEED_SUPPLEMENT' || (c.supplementSections || []).length > 0) ? '#d97706' : '#16a34a',
                  background: (c.status === 'NEED_SUPPLEMENT' || (c.supplementSections || []).length > 0) ? '#fffbeb' : '#f8fafc',
                }}>
                    {c.responseNote}
                  </div>
                </div>
              )}
              <div style={{ fontSize: 12, fontWeight: 800, color: '#94a3b8', margin: '20px 0 12px', textTransform: 'uppercase' }}>TÀI LIỆU ĐÍNH KÊM</div>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {(c.files || c.attachments || []).length === 0 ? (
                  <div style={{ color: '#94a3b8', fontSize: 13 }}>
                    Không có tài liệu đính kèm
                  </div>
                ) : (
                  (c.files || c.attachments || []).map((file) => (
                    <div key={typeof file === 'string' ? file : (file.id || file.url || file.name)} style={fileAttachmentStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <i className="bi bi-paperclip" style={{ color: '#3b82f6' }} />
                        <span style={{ fontWeight: 600, color: '#1e293b', fontSize: 13 }}>
                          {typeof file === 'string' ? file : file.name}
                        </span>
                      </div>
                      {file.url ? (
                        <div style={{ display: 'flex', gap: 12, color: '#64748b', fontSize: 16 }}>
                          <button
                            type="button"
                            aria-label="Xem trước trên web"
                            onClick={() => dispatch({ type: 'patch', payload: { attachmentPreview: { name: file.name, url: file.url, fileType: file.fileType } } })}
                            title="Xem trước trên web"
                            style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}
                          >
                            <i className="bi bi-eye" />
                          </button>
                          <button
                            type="button"
                            aria-label="Tải xuống"
                            onClick={() => downloadFileFromUrl(file.url, file.name || 'tai-lieu')}
                            title="Tải xuống"
                            style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}
                          >
                            <i className="bi bi-download" />
                          </button>
                        </div>
                      ) : (
                        <i className="bi bi-download" style={{ color: '#cbd5e1' }} />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, color: '#1e293b', marginBottom: 24 }}>
                <i className="bi bi-clock-history" /> Lịch sử xử lý
              </div>

              <div style={{ paddingLeft: 12 }}>
                {(c.history || []).length === 0 ? (
                  <div style={{ color: '#94a3b8', fontSize: 13 }}>Chưa có lịch sử xử lý</div>
                ) : (
                  (c.history || []).map((step, idx) => (
                    <div key={step.id || `${step.action}-${step.date}-${step.status}`} style={{ display: 'flex', gap: 16, position: 'relative', paddingBottom: idx !== c.history.length - 1 ? 24 : 0 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: step.active ? '#2563eb' : '#e2e8f0', zIndex: 2 }} />
                        {idx !== c.history.length - 1 && <div style={{ width: 2, flex: 1, backgroundColor: '#f1f5f9' }} />}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: step.active ? '#1e293b' : '#475569' }}>{step.action}</div>
                        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
                          <i className="bi bi-person" style={{ marginRight: 4 }} /> {step.user} &nbsp;&nbsp;|&nbsp;&nbsp;
                          <i className="bi bi-clock" style={{ margin: '0 4px 0 0' }} /> {step.time}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={cardStyle}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', borderBottom: '1px solid #f1f5f9', paddingBottom: 12, marginBottom: 20 }}>
                THÔNG TIN NGƯỜI KHIẾU NẠI
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <ComplaintInfoItem label="LOẠI KHIẾU NẠI" value={c.type} />
                <ComplaintInfoItem label="HỌ VÀ TÊN" value={c.name} bold />
                <ComplaintInfoItem label="MÃ CÔNG DÂN" value={c.citizenId} />
                <ComplaintInfoItem label="SỐ CCCD" value={c.cccdNumber} />
                <ComplaintInfoItem label="SỐ ĐIỆN THOẠI" value={c.phone} />
                <ComplaintInfoItem label="EMAIL" value={c.email} />
                <ComplaintInfoItem
                  label="MÃ HỒ SƠ LIÊN QUAN"
                  value={c.relatedRecordDisplay || '—'}
                />
                {c.recordCategory && (
                  <ComplaintInfoItem label="LOẠI HỒ SƠ" value={c.recordCategory} />
                )}
                <ComplaintInfoItem label="MÃ KHIẾU NẠI" value={c.complaintCode} color="#2563eb" bold />
                <ComplaintInfoItem label="NGÀY GỬI" value={c.date} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </CadastralLayout>

    <AttachmentPreviewModal
      file={attachmentPreview}
      onClose={() => dispatch({ type: 'patch', payload: { attachmentPreview: null } })}
    />
  </>
);

export default ComplaintDetailView;
