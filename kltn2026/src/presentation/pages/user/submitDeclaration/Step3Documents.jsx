import React from 'react';
import { interactiveDivProps } from '../../../../utils/a11y';

const Step3Documents = ({ files, onFileSelect, onRemoveFile, onBack, onContinue }) => (
  <div>
    <h5 style={{ fontWeight: 700, marginBottom: 8 }}>Tài liệu đính kèm</h5>
    <p style={{ color: '#64748b', marginBottom: 24 }}>Tải lên các giấy tờ liên quan (GCNQSDĐ, CMND/CCCD, Hợp đồng...)</p>

    <div
      {...interactiveDivProps(() => document.getElementById('fileUpload').click(), 'Tải lên tài liệu đính kèm')}
      style={{ border: '2px dashed #cbd5e1', borderRadius: 12, padding: '60px 20px', textAlign: 'center', cursor: 'pointer', background: '#f8fafc' }}
    >
      <i className="bi bi-cloud-arrow-up" style={{ fontSize: 48, color: '#a30d11' }}></i>
      <p style={{ marginTop: 12, fontWeight: 600, color: '#1e293b' }}>Nhấn để tải lên tài liệu</p>
      <p style={{ color: '#94a3b8', fontSize: 13 }}>Hoặc kéo thả file vào khu vực này</p>
      <div style={{ marginTop: 16 }}>
        <span style={{ background: '#e2e8f0', padding: '4px 12px', borderRadius: 20, fontSize: 12, marginRight: 6, color: '#475569' }}>PDF</span>
        <span style={{ background: '#e2e8f0', padding: '4px 12px', borderRadius: 20, fontSize: 12, marginRight: 6, color: '#475569' }}>JPG/PNG</span>
        <span style={{ background: '#e2e8f0', padding: '4px 12px', borderRadius: 20, fontSize: 12, color: '#475569' }}>Tối đa 20MB</span>
      </div>
    </div>
    <input type="file" id="fileUpload" multiple className="d-none" onChange={onFileSelect} aria-label="Tài liệu đính kèm" />

    {files.length > 0 && (
      <div style={{ marginTop: 20 }}>
        <strong className="text-secondary small">DANH SÁCH ĐÃ TẢI LÊN ({files.length})</strong>
        <ul style={{ marginTop: 8, padding: 0, listStyle: 'none' }}>
          {files.map((file, index) => (
            <li key={`${file.name}-${index}`} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 8, marginBottom: 8, background: '#fff' }}>
              <div className="d-flex align-items-center gap-2 text-dark fw-medium">
                <i className="bi bi-file-earmark-text text-primary"></i> {file.name}
              </div>
              <button type="button" onClick={() => onRemoveFile(index)} style={{ color: '#ef4444', background: 'none', border: 'none', fontWeight: 600 }}>Xóa</button>
            </li>
          ))}
        </ul>
      </div>
    )}

    <div style={{ display: 'flex', gap: 12, marginTop: 40 }}>
      <button type="button" onClick={onBack} style={{ flex: 1, padding: '14px', border: '1px solid #e2e8f0', borderRadius: 12, background: '#fff' }}>Quay lại</button>
      <button type="button" onClick={onContinue} style={{ flex: 1, padding: '14px', background: '#a30d11', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700 }}>Tiếp tục →</button>
    </div>
  </div>
);

export default Step3Documents;
