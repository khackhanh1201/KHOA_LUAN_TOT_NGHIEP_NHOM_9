import React from 'react';
import { useUserInfo } from '../../../hooks/useUserInfo';
import { useAppDialog } from '../../components/dialog/DialogContext';
import { useLandRegistryPage } from './useLandRegistryPage';
import LandRegistryListView from './LandRegistryListView';
import LandRegistryDetailView from './LandRegistryDetailView';
import LandRegistryPushModal from './LandRegistryPushModal';

const LandRegistry = () => {
  const { user } = useUserInfo();
  const { showAlert, showConfirm } = useAppDialog();
  const page = useLandRegistryPage({ user, showAlert, showConfirm });
  const {
    state,
    patch,
    landRecords,
    isAdmin,
    excelFileInputRef,
    gcnPrintRef,
    display,
    getLandTypeName,
    getAreaLabel,
    clearExcelSelection,
    closePushModal,
    handleEditFormChange,
    handleStartEdit,
    handleCancelEdit,
    handleDownloadGcnPdf,
    handleViewDetail,
    handleExcelFileSelect,
    handleConfirmExcelImport,
    handleDownloadTemplate,
    handleManualSubmit,
    handleUpdateSubmit,
    handleInputChange,
    handleDelete,
  } = page;

  const {
    view,
    loading,
    error,
    searchQuery,
    selectedRecord,
    showPushDataModal,
    pushDataMethod,
    uploading,
    selectedExcelFile,
    showGcnPreview,
    downloadingGcnPdf,
    isEditing,
    saving,
    editForm,
    landTypes,
    areas,
    manualForm,
  } = state;

  if (view === 'detail' && selectedRecord) {
    const form = isEditing ? editForm : selectedRecord;
    return (
      <LandRegistryDetailView
        user={user}
        record={selectedRecord}
        form={form}
        isEditing={isEditing}
        saving={saving}
        isAdmin={isAdmin}
        showGcnPreview={showGcnPreview}
        downloadingGcnPdf={downloadingGcnPdf}
        gcnPrintRef={gcnPrintRef}
        getLandTypeName={getLandTypeName}
        getAreaLabel={getAreaLabel}
        display={display}
        landTypes={landTypes}
        areas={areas}
        onBack={() => patch({ view: 'list', isEditing: false })}
        onStartEdit={handleStartEdit}
        onCancelEdit={handleCancelEdit}
        onUpdateSubmit={handleUpdateSubmit}
        onDelete={handleDelete}
        onShowGcnPreview={() => patch({ showGcnPreview: true })}
        onCloseGcnPreview={() => patch({ showGcnPreview: false })}
        onDownloadGcnPdf={handleDownloadGcnPdf}
        onEditFormChange={handleEditFormChange}
      />
    );
  }

  return (
    <>
      <LandRegistryListView
        user={user}
        searchQuery={searchQuery}
        loading={loading}
        error={error}
        landRecords={landRecords}
        isAdmin={isAdmin}
        getLandTypeName={getLandTypeName}
        onSearchChange={(value) => patch({ searchQuery: value })}
        onOpenPushModal={() => patch({ showPushDataModal: true })}
        onViewDetail={handleViewDetail}
        onDelete={handleDelete}
      />

      <LandRegistryPushModal
        show={showPushDataModal}
        pushDataMethod={pushDataMethod}
        uploading={uploading}
        selectedExcelFile={selectedExcelFile}
        manualForm={manualForm}
        landTypes={landTypes}
        areas={areas}
        excelFileInputRef={excelFileInputRef}
        getAreaLabel={getAreaLabel}
        onClose={closePushModal}
        onBackToMethodSelect={() => {
          patch({ pushDataMethod: null });
          clearExcelSelection();
        }}
        onSelectMethod={(method) => patch({ pushDataMethod: method })}
        onDownloadTemplate={handleDownloadTemplate}
        onExcelFileSelect={handleExcelFileSelect}
        onClearExcelSelection={clearExcelSelection}
        onConfirmExcelImport={handleConfirmExcelImport}
        onManualSubmit={handleManualSubmit}
        onManualFormChange={handleInputChange}
      />
    </>
  );
};

export default LandRegistry;
