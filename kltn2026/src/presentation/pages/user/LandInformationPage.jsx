import React, { useState, useMemo } from 'react';
import LandTaxLayout from '../../components/LandTaxLayout';
import { useUserInfo } from '../../../hooks/useUserInfo';
import { useAsyncMountLoadWithReload } from '../../../hooks/useAsyncMountLoad';
import { getCurrentUser, getToken } from '../../../usecases/authService';
import LandPageHeader from './landInformation/LandPageHeader';
import LandParcelsTable from './landInformation/LandParcelsTable';
import LandCertificateModal from './landInformation/LandCertificateModal';
import LandAdvancedSearchPanel from './landInformation/LandAdvancedSearchPanel';
import { loadMyParcels, decodeJwt } from './landInformation/landInfoUtils';

const LandInformationPage = () => {
  const userRaw = getCurrentUser() || {};
  const token = getToken() || userRaw?.token || userRaw?.data?.token || '';
  const jwtPayload = decodeJwt(token);
  const cccdNumber = jwtPayload?.cccdNumber || jwtPayload?.sub || userRaw?.cccdNumber || userRaw?.data?.cccdNumber || '';
  const { user } = useUserInfo();

  const { data: parcels = [], error: loadError, isLoading: loading } = useAsyncMountLoadWithReload(loadMyParcels);
  const error = loadError?.message || '';

  const [search, setSearch] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [advFilters, setAdvFilters] = useState({
    gcnBookNumber: '',
    parcelNumber: '',
    mapSheetNumber: '',
    landTypeId: '',
    address: '',
  });
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    let result = [...parcels];
    const q = search.toLowerCase();

    if (search) {
      result = result.filter((p) =>
        (p.parcelNumber || '').toLowerCase().includes(q) ||
        (p.address || '').toLowerCase().includes(q) ||
        (p.gcnBookNumber || '').toLowerCase().includes(q)
      );
    }

    if (advFilters.gcnBookNumber) {
      result = result.filter((p) => (p.gcnBookNumber || '').toLowerCase().includes(advFilters.gcnBookNumber.toLowerCase()));
    }
    if (advFilters.parcelNumber) {
      result = result.filter((p) => (p.parcelNumber || '').toLowerCase().includes(advFilters.parcelNumber.toLowerCase()));
    }
    if (advFilters.mapSheetNumber) {
      result = result.filter((p) => (p.mapSheetNumber || '').toLowerCase().includes(advFilters.mapSheetNumber.toLowerCase()));
    }
    if (advFilters.landTypeId) {
      result = result.filter((p) => p.landTypeId === advFilters.landTypeId);
    }
    if (advFilters.address) {
      result = result.filter((p) => (p.address || '').toLowerCase().includes(advFilters.address.toLowerCase()));
    }

    return result;
  }, [search, advFilters, parcels]);

  const resetFilters = () => {
    setAdvFilters({ gcnBookNumber: '', parcelNumber: '', mapSheetNumber: '', landTypeId: '', address: '' });
    setSearch('');
    setShowAdvanced(false);
  };

  return (
    <LandTaxLayout user={user}>
      <LandPageHeader
        search={search}
        onSearchChange={setSearch}
        onOpenAdvanced={() => setShowAdvanced(true)}
      />

      {error && <div className="alert alert-danger">{error}</div>}

      <LandParcelsTable loading={loading} filtered={filtered} onSelectParcel={setSelected} />

      {selected && (
        <LandCertificateModal
          selected={selected}
          user={user}
          cccdNumber={cccdNumber}
          onClose={() => setSelected(null)}
        />
      )}

      {showAdvanced && (
        <LandAdvancedSearchPanel
          advFilters={advFilters}
          onFilterChange={(patch) => setAdvFilters({ ...advFilters, ...patch })}
          onReset={resetFilters}
          onClose={() => setShowAdvanced(false)}
        />
      )}
    </LandTaxLayout>
  );
};

export default LandInformationPage;
