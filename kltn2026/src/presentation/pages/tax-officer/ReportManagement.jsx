import React, { useState, useMemo } from 'react';
import TaxOfficerLayout from '../../components/TaxOfficerLayout';
import { useUserInfo } from '../../../hooks/useUserInfo';
import { useAsyncMountLoadWithReload } from '../../../hooks/useAsyncMountLoad';
import ReportOverviewView from './ReportOverviewView';
import ReportCreateFormView from './ReportCreateFormView';
import {
  getStreetName,
  loadReportManagementData,
  computeReportStats,
  computeRevenueChart,
} from './reportManagementUtils';
import { EMPTY_ARRAY } from '../../../utils/emptyArray';

const defaultFilters = {
  title: '',
  startDate: '',
  endDate: '',
  street: 'Tất cả',
  taxType: 'Tất cả',
};

const ReportManagement = () => {
  const { user } = useUserInfo();
  const { data, error: loadError, isLoading: loading } = useAsyncMountLoadWithReload(loadReportManagementData);

  const payments = data?.payments ?? EMPTY_ARRAY;
  const records = data?.records ?? EMPTY_ARRAY;
  const revenueData = data?.revenueData ?? EMPTY_ARRAY;

  const [view, setView] = useState('overview');
  const [filters, setFilters] = useState(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters);

  const handleClearFilters = () => {
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
  };

  const handleApplyFilters = () => {
    setAppliedFilters({ ...filters });
    setView('overview');
  };

  const reportStats = useMemo(
    () => computeReportStats(payments, records, appliedFilters),
    [payments, records, appliedFilters]
  );

  const chartData = useMemo(() => computeRevenueChart(revenueData), [revenueData]);

  const availableStreets = useMemo(
    () => ['Tất cả', ...new Set(records.map((r) => getStreetName(r.landAddress || r.address)))].filter(Boolean),
    [records]
  );

  const availableTaxTypes = useMemo(
    () => ['Tất cả', ...new Set(records.map((r) => r.taxType))].filter(Boolean),
    [records]
  );

  const hasActiveFilters =
    appliedFilters.street !== 'Tất cả' ||
    appliedFilters.taxType !== 'Tất cả' ||
    appliedFilters.startDate ||
    appliedFilters.endDate;

  if (loading) {
    return (
      <TaxOfficerLayout user={user}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16 }}>
          <output className="spinner-border text-danger" aria-live="polite" style={{ width: '3rem', height: '3rem', color: '#a30d11' }}>
            <span className="visually-hidden">Loading...</span>
          </output>
          <div style={{ color: '#64748b', fontWeight: 600, fontSize: 15 }}>Đang tải dữ liệu báo cáo thống kê...</div>
        </div>
      </TaxOfficerLayout>
    );
  }

  if (loadError) {
    return (
      <TaxOfficerLayout user={user}>
        <div style={{ padding: 24, color: '#dc2626' }}>Không thể tải dữ liệu báo cáo thống kê</div>
      </TaxOfficerLayout>
    );
  }

  return (
    <TaxOfficerLayout user={user}>
      {view === 'overview' ? (
        <ReportOverviewView
          appliedFilters={appliedFilters}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={handleClearFilters}
          onCreateReport={() => setView('create')}
          stats={reportStats.stats}
          donut={reportStats.donut}
          revenueData={revenueData}
          chartData={chartData}
          streetDataList={reportStats.streetDataList}
          top5Streets={reportStats.top5Streets}
          maxPaidStreetVal={reportStats.maxPaidStreetVal}
          barTicks={reportStats.barTicks}
        />
      ) : (
        <ReportCreateFormView
          filters={filters}
          setFilters={setFilters}
          availableStreets={availableStreets}
          availableTaxTypes={availableTaxTypes}
          onBack={() => setView('overview')}
          onApply={handleApplyFilters}
        />
      )}
    </TaxOfficerLayout>
  );
};

export default ReportManagement;
