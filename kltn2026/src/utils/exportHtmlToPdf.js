/**
 * Chuyển chuỗi HTML thành file PDF thật (html2pdf.js).
 * Dùng iframe ẩn để giữ nguyên <head>/<style> trong HTML xuất.
 */
export async function exportHtmlStringToPdf(htmlContent, filename) {
  const iframe = document.createElement('iframe');
  iframe.style.cssText =
    'position:fixed;left:-9999px;top:0;width:800px;height:0;border:0;visibility:hidden';
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!doc) {
    document.body.removeChild(iframe);
    throw new Error('Không thể tạo khung xuất PDF');
  }

  const safeHtml = String(htmlContent || '').replace(/onload\s*=\s*["']window\.print\(\)["']/gi, '');
  doc.open();
  doc.write(safeHtml);
  doc.close();

  await new Promise((resolve) => {
    iframe.onload = resolve;
    setTimeout(resolve, 350);
  });

  try {
    const html2pdf = (await import('html2pdf.js')).default;
    const body = doc.body;
    const w = body.scrollWidth || 800;
    const h = body.scrollHeight || 1100;
    const safeName = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;

    await html2pdf()
      .set({
        margin: [10, 10, 10, 10],
        filename: safeName,
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
      .from(body)
      .save();
  } finally {
    document.body.removeChild(iframe);
  }
}
