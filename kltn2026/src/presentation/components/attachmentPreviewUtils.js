export async function fetchPdfBlobUrl(url) {
  const response = await fetch(url, { mode: 'cors', credentials: 'omit' });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const blob = await response.blob();
  const pdfBlob = blob.type === 'application/pdf'
    ? blob
    : new Blob([blob], { type: 'application/pdf' });
  return window.URL.createObjectURL(pdfBlob);
}
