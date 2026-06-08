/**
 * Tải file từ URL (Cloudinary hoặc API local).
 * Trình duyệt không hỗ trợ thuộc tính download cho cross-origin — cần fetch blob
 * hoặc dùng transformation fl_attachment của Cloudinary.
 */
function toCloudinaryAttachmentUrl(url) {
  if (!url || typeof url !== 'string') return url;
  if (!url.includes('cloudinary.com')) return url;
  if (url.includes('/upload/fl_attachment/')) return url;
  return url.replace('/upload/', '/upload/fl_attachment/');
}

export async function downloadFileFromUrl(url, filename = 'tai-lieu') {
  if (!url) return;

  const safeName = filename || 'tai-lieu';
  const fetchUrl = toCloudinaryAttachmentUrl(url);

  try {
    const response = await fetch(fetchUrl, { mode: 'cors' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = safeName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(blobUrl);
  } catch (err) {
    console.warn('downloadFileFromUrl fallback:', err);
    const link = document.createElement('a');
    link.href = fetchUrl;
    link.download = safeName;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
}
