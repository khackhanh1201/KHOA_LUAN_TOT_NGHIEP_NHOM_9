import React from 'react';
import {
  STATUS_MAP,
  COMPLAINT_DOMAIN,
  domainFromCategory,
  parseComplaintContent,
  getSupplementRequestDisplay,
} from './complaintUtils';

const ComplaintHistoryTable = ({ listLoading, complaints }) => (
  <div className="card shadow-sm border-0 mt-4" style={{ borderRadius: '16px' }}>
    <div className="card-body p-4">
      <h5 className="fw-bold mb-3">Lịch sử khiếu nại</h5>
      {listLoading ? (
        <div className="text-center py-3">
          <div className="spinner-border spinner-border-sm text-danger" />
        </div>
      ) : complaints.length === 0 ? (
        <p className="text-muted text-center py-3" style={{ fontSize: 13 }}>Chưa có khiếu nại nào</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="table table-sm" style={{ fontSize: 13 }}>
            <thead className="table-light">
              <tr>
                <th>Mã</th>
                <th>Loại / Tiêu đề</th>
                <th>Nội dung</th>
                <th>Ngày gửi</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((c) => {
                const st = STATUS_MAP[c.status] || { label: c.status, bg: '#f3f4f6', color: '#6b7280' };
                const domain = domainFromCategory(c.recordCategory);
                const domainLabel = domain === COMPLAINT_DOMAIN.TAX ? 'Thuế' : 'Đất đai';
                const title = c.complaintTitle || parseComplaintContent(c.content).title || '—';
                const body = c.complaintBody || parseComplaintContent(c.content).body || c.content;
                const supplementDisplay = getSupplementRequestDisplay(c);

                return (
                  <tr key={c.id ?? c.complaintId}>
                    <td className="fw-semibold">KN-{String(c.id ?? c.complaintId).padStart(4, '0')}</td>
                    <td>
                      <span className="badge rounded-pill" style={{
                        background: domain === COMPLAINT_DOMAIN.TAX ? '#fee2e2' : '#dbeafe',
                        color: domain === COMPLAINT_DOMAIN.TAX ? '#a30d11' : '#1d4ed8',
                        fontSize: 12,
                      }}>
                        {domainLabel}
                      </span>
                      <div className="small text-muted mt-1">{title}</div>
                    </td>
                    <td style={{ maxWidth: 220, fontSize: 12 }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{body}</div>
                      {c.status === 'NEED_SUPPLEMENT' && supplementDisplay && (
                        <div className="text-warning small mt-1" style={{ fontWeight: 600 }}>
                          {supplementDisplay.label}: {supplementDisplay.note}
                        </div>
                      )}
                    </td>
                    <td>{c.createdAt ? new Date(c.createdAt).toLocaleDateString('vi-VN') : '—'}</td>
                    <td>
                      <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: st.bg, color: st.color }}>
                        {st.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  </div>
);

export default ComplaintHistoryTable;
