export const downloadReceiptPdf = async (element, recordId) => {
  const html2pdf = (await import('html2pdf.js')).default;
  const w = element.scrollWidth;
  const h = element.scrollHeight;
  await html2pdf()
    .set({
      margin: [10, 10, 10, 10],
      filename: `PhieuTiepNhan_HS-${String(recordId).padStart(6, '0')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        width: w,
        height: h,
        windowWidth: w,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
    })
    .from(element)
    .save();
};

export const downloadGcnPdf = async (element, selectedRecord) => {
  const html2pdf = (await import('html2pdf.js')).default;
  const parcelId = selectedRecord?.landParcelId ?? 'unknown';
  const gcnNo = selectedRecord?.gcnBookNumber || selectedRecord?.certificateNumber || parcelId;
  const safeGcn = String(gcnNo).replace(/[\\/:*?"<>|]/g, '_').trim() || parcelId;
  const w = element.scrollWidth;
  const h = element.scrollHeight;
  await html2pdf()
    .set({
      margin: [12, 12, 12, 12],
      filename: `GCN_TD-${parcelId}_${safeGcn}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        width: w,
        height: h,
        windowWidth: w,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
    })
    .from(element)
    .save();
};
