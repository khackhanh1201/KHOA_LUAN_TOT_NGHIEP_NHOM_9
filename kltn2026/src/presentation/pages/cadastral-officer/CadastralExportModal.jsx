import React from 'react';
import {
  modalOverlayStyle,
  modalContentStyle,
  modalHeaderStyle,
  closeBtnStyle,
  labelStyle,
  inputModalStyle,
  modalFooterStyle,
  btnCancelStyle,
  btnSaveRedStyle,
} from './cadastralReportStyles';

const CadastralExportModal = ({
  isOpen,
  exporting,
  exportForm,
  wardOptions,
  formatWardLabel,
  onClose,
  onExportFormChange,
  onExport,
}) => {
  if (!isOpen) return null;

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        <div style={modalHeaderStyle}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#1e293b' }}>Xuất báo cáo thống kê</h3>
          <button type="button" onClick={onClose} style={closeBtnStyle} disabled={exporting} aria-label="Đóng">
            <i className="bi bi-x"></i>
          </button>
        </div>

        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label htmlFor="exportReportName" style={labelStyle}>Tên báo cáo (tên tệp tải về)</label>
            <input
              id="exportReportName"
              type="text"
              value={exportForm.reportName}
              onChange={(e) => onExportFormChange('reportName', e.target.value)}
              placeholder="VD: Bao_cao_cap_GCN_Q2_2026"
              style={inputModalStyle}
              disabled={exporting}
            />
          </div>

          <div>
            <label htmlFor="exportReportType" style={labelStyle}>Loại báo cáo</label>
            <select
              id="exportReportType"
              style={inputModalStyle}
              value={exportForm.reportType}
              onChange={(e) => onExportFormChange('reportType', e.target.value)}
              disabled={exporting}
            >
              <option value="all">Báo cáo tổng hợp</option>
              <option value="gcn">Báo cáo cấp GCN</option>
              <option value="complaint">Báo cáo khiếu nại</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label htmlFor="exportPeriod" style={labelStyle}>Kỳ báo cáo</label>
              <select
                id="exportPeriod"
                style={inputModalStyle}
                value={exportForm.period}
                onChange={(e) => onExportFormChange('period', e.target.value)}
                disabled={exporting}
              >
                <option value="thisMonth">Tháng này</option>
                <option value="thisQuarter">Quý này</option>
                <option value="thisYear">Năm nay</option>
                <option value="all">Toàn bộ thời gian</option>
              </select>
            </div>
            <div>
              <label htmlFor="exportArea" style={labelStyle}>Khu vực</label>
              <select
                id="exportArea"
                style={inputModalStyle}
                value={exportForm.area}
                onChange={(e) => onExportFormChange('area', e.target.value)}
                disabled={exporting}
              >
                <option value="all">Toàn huyện</option>
                {wardOptions.map((code) => (
                  <option key={code} value={code}>{formatWardLabel(code)}</option>
                ))}
              </select>
            </div>
          </div>

          <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
            File Excel gồm 3 sheet: Tổng hợp, Theo đơn vị, Chi tiết hồ sơ/khiếu nại.
          </p>
        </div>

        <div style={modalFooterStyle}>
          <button type="button" style={btnCancelStyle} onClick={onClose} disabled={exporting}>
            Hủy bỏ
          </button>
          <button type="button" style={btnSaveRedStyle} onClick={onExport} disabled={exporting}>
            <i className={`bi bi-${exporting ? 'hourglass-split' : 'download'}`}></i>
            {exporting ? 'Đang xuất...' : 'Xuất báo cáo'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CadastralExportModal;
