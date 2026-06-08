/**
 * Xác định loại file để xem trước trong web.
 * @returns {'image'|'pdf'|'document'|'spreadsheet'|'other'}
 */
export function guessAttachmentKind({ name, fileType, url } = {}) {
  const mime = String(fileType || '').toLowerCase();
  const n = String(name || '').toLowerCase();
  const u = String(url || '').toLowerCase();

  if (
    mime.startsWith('image/') ||
    /\.(png|jpe?g|gif|webp|bmp|svg)(\?|$)/i.test(n) ||
    /\.(png|jpe?g|gif|webp)(\?|$)/i.test(u)
  ) {
    return 'image';
  }
  if (mime.includes('pdf') || /\.pdf(\?|$)/i.test(n) || /\.pdf(\?|$)/i.test(u)) {
    return 'pdf';
  }
  if (
    mime.includes('word') ||
    mime.includes('document') ||
    /\.(docx?)(\?|$)/i.test(n)
  ) {
    return 'document';
  }
  if (
    mime.includes('sheet') ||
    mime.includes('excel') ||
    /\.(xlsx?|xls)(\?|$)/i.test(n)
  ) {
    return 'spreadsheet';
  }
  return 'other';
}

export const ATTACHMENT_KIND_LABELS = {
  image: 'Ảnh',
  pdf: 'PDF',
  document: 'Tài liệu Word',
  spreadsheet: 'Bảng tính Excel',
  other: 'Tệp đính kèm',
};
