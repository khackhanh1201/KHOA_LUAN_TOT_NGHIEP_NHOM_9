import React, { useEffect, useCallback, useReducer } from 'react';
import CadastralLayout from '../../components/CadastralLayout';
import { useUserInfo } from '../../../hooks/useUserInfo';
import { useAppDialog } from '../../components/dialog/DialogContext';
import { cadastralApi } from '../../../infrastructure/api/cadastralApi';
import { buildWardLabelMap, formatWardLabel as formatWardLabelBase } from '../../../utils/areaLabels';
import {
  statsReducer,
  pageReducer,
  PAGE_INITIAL_STATE,
  buildFallbackFileName,
  computeChartData,
} from './cadastralReportUtils';
import {
  btnRedStyle,
  filterBarStyle,
  selectInputStyle,
} from './cadastralReportStyles';
import CadastralReportCharts from './CadastralReportCharts';
import CadastralReportDetailsTable from './CadastralReportDetailsTable';
import CadastralExportModal from './CadastralExportModal';

const CadastralReportStats = () => {
  const { user } = useUserInfo();
  const { showAlert } = useAppDialog();

  const [{ stats, error, status }, dispatchStats] = useReducer(statsReducer, {
    stats: null,
    error: null,
    status: 'loading',
  });
  const loading = status === 'loading';
  const [pageState, dispatchPage] = useReducer(pageReducer, PAGE_INITIAL_STATE);
  const {
    wardOptions,
    wardLabelMap,
    filters,
    isExportModalOpen,
    exporting,
    exportForm,
  } = pageState;
  const patchPage = (payload) => dispatchPage({ type: 'patch', payload });

  useEffect(() => {
    cadastralApi
      .getAreas()
      .then((areas) => {
        const codes = [
          ...new Set(areas.flatMap((a) => (a.wardCode ? [a.wardCode] : []))),
        ];
        dispatchPage({
          type: 'setWardData',
          wardLabelMap: buildWardLabelMap(areas),
          wardOptions: codes.sort(),
        });
      })
      .catch(() => {
        dispatchPage({
          type: 'setWardData',
          wardLabelMap: buildWardLabelMap([]),
          wardOptions: [],
        });
      });
  }, []);

  const formatWardLabel = (code) => formatWardLabelBase(code, wardLabelMap);

  const fetchData = useCallback(async (nextFilters) => {
    dispatchStats({ type: 'reset' });
    try {
      const data = await cadastralApi.getCadastralStatistics({
        period: nextFilters.period,
        area: nextFilters.area,
        reportType: nextFilters.reportType,
      });
      dispatchStats({ type: 'success', stats: data });
    } catch (err) {
      console.error('Lỗi fetch báo cáo địa chính:', err);
      dispatchStats({
        type: 'error',
        message: 'Không thể tải dữ liệu. Vui lòng thử lại sau.',
      });
    }
  }, []);

  useEffect(() => {
    fetchData(filters);
  }, [fetchData, filters]);

  const handleFilterChange = (key, value) => {
    patchPage({ filters: { ...filters, [key]: value } });
  };

  const handleExportFormChange = (key, value) => {
    dispatchPage({ type: 'patchExportForm', payload: { [key]: value } });
  };

  const handleExportFromModal = async () => {
    const name = exportForm.reportName?.trim();
    if (!name) {
      await showAlert({ title: 'Thiếu thông tin', message: 'Vui lòng nhập tên báo cáo (sẽ dùng làm tên tệp).', variant: 'warning' });
      return;
    }

    patchPage({ exporting: true });
    try {
      const { blob, fileName } = await cadastralApi.exportCadastralReport({
        reportName: name,
        period: exportForm.period,
        area: exportForm.area,
        reportType: exportForm.reportType,
        fallbackFileName: buildFallbackFileName(name),
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      dispatchPage({ type: 'closeExportModal' });
      await showAlert({ title: 'Thành công', message: 'Đã tải báo cáo Excel.', variant: 'success' });
    } catch (err) {
      console.error('Lỗi xuất báo cáo:', err);
      await showAlert({ title: 'Lỗi', message: 'Xuất báo cáo thất bại. Vui lòng thử lại.', variant: 'error' });
    } finally {
      patchPage({ exporting: false });
    }
  };

  const chartData = stats ? computeChartData(stats) : null;

  return (
    <CadastralLayout user={user}>
      <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '30px 40px', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h2 style={{ margin: 0, fontWeight: 800, color: '#1e293b' }}>Báo cáo Thống kê Địa chính</h2>
            <p style={{ color: '#64748b', marginTop: 4, fontSize: 14 }}>
              Tổng hợp số liệu về quản lý đất đai, cấp GCN và giải quyết khiếu nại
            </p>
          </div>
          <button type="button" style={btnRedStyle} onClick={() => dispatchPage({ type: 'openExportModal' })}>
            <i className="bi bi-download"></i> Xuất báo cáo
          </button>
        </div>

        <div style={{ marginBottom: 24 }}>
          <h4 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: '#1e293b' }}>Lọc thống kê theo yêu cầu</h4>
          <div style={filterBarStyle}>
            <select style={selectInputStyle} value={filters.reportType} onChange={(e) => handleFilterChange('reportType', e.target.value)}>
              <option value="all">Báo cáo tổng hợp</option>
              <option value="gcn">Báo cáo cấp GCN</option>
              <option value="complaint">Báo cáo khiếu nại</option>
            </select>

            <select style={selectInputStyle} value={filters.period} onChange={(e) => handleFilterChange('period', e.target.value)}>
              <option value="thisMonth">Tháng này</option>
              <option value="thisQuarter">Quý này</option>
              <option value="thisYear">Năm nay</option>
              <option value="all">Toàn bộ thời gian</option>
            </select>

            <select style={selectInputStyle} value={filters.area} onChange={(e) => handleFilterChange('area', e.target.value)}>
              <option value="all">Tất cả khu vực</option>
              {wardOptions.map((code) => (
                <option key={code} value={code}>{formatWardLabel(code)}</option>
              ))}
            </select>
          </div>
          <p style={{ margin: '10px 0 0', fontSize: 12, color: '#64748b' }}>
            Số liệu và danh sách chi tiết tự động cập nhật khi thay đổi bộ lọc. Dùng nút &quot;Xuất báo cáo&quot; để tải file Excel theo cấu hình riêng.
          </p>
        </div>

        {error && (
          <div style={{ color: '#b91c1c', padding: 16, background: '#fee2e2', borderRadius: 8, marginBottom: 20 }}>{error}</div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>Đang tải dữ liệu biểu đồ...</div>
        ) : stats && chartData && (
          <CadastralReportCharts stats={stats} chartData={chartData} />
        )}

        <CadastralReportDetailsTable loading={loading} stats={stats} />

        <CadastralExportModal
          isOpen={isExportModalOpen}
          exporting={exporting}
          exportForm={exportForm}
          wardOptions={wardOptions}
          formatWardLabel={formatWardLabel}
          onClose={() => !exporting && dispatchPage({ type: 'closeExportModal' })}
          onExportFormChange={handleExportFormChange}
          onExport={handleExportFromModal}
        />
      </div>
    </CadastralLayout>
  );
};

export default CadastralReportStats;
