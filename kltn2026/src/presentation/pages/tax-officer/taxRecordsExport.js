import { exportHtmlStringToPdf } from '../../../utils/exportHtmlToPdf';

export async function exportTaxOfficerRecord({ selectedRecord, exportFormat, dispatch, showAlert }) {
    if (!selectedRecord) return;
    
    let fileContent = "";
    let mimeType = "";
    let fileExtension = "";

    if (exportFormat === 'DOC') {
      mimeType = "application/msword";
      fileExtension = "doc";
      fileContent = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta charset="utf-8">
          <title>Thông báo nghĩa vụ tài chính</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .title { text-align: center; color: #a30d11; font-weight: bold; font-size: 18px; margin-bottom: 20px; }
            .section { margin-bottom: 20px; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px; font-weight: bold; color: #1e293b; }
            .table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .table td { padding: 8px; font-size: 13px; }
            .amount-box { background: #fff1f2; padding: 15px; text-align: center; border-radius: 8px; color: #a30d11; font-weight: bold; border: 1px solid #fecdd3; }
          </style>
        </head>
        <body>
          <div class='header'>
            <p><b>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</b></p>
            <p>Độc lập - Tự do - Hạnh phúc</p>
            <hr/>
          </div>
          <div class='title'>THÔNG BÁO NGHĨA VỤ TÀI CHÍNH ĐẤT ĐAI</div>
          <p style='text-align: center;'>Mã hồ sơ: T-${new Date().getFullYear()}-${String(selectedRecord.recordId).padStart(3, '0')}</p>
          
          <div class='section'>I. THÔNG TIN NGƯỜI NỘP</div>
          <table class='table'>
            <tr><td style='width: 150px;'>Họ và tên:</td><td><b>${selectedRecord.fullName || '—'}</b></td></tr>
            <tr><td>Số CCCD/CMND:</td><td><b>${selectedRecord.senderCccd || '—'}</b></td></tr>
            <tr><td>Địa chỉ thường trú:</td><td>${selectedRecord.address || '—'}</td></tr>
          </table>

          <div class='section'>II. THÔNG TIN THỬA ĐẤT VÀ NGHĨA VỤ THUẾ</div>
          <table class='table'>
            <tr><td style='width: 150px;'>Thửa đất số:</td><td><b>${selectedRecord.landParcelNumber || '—'}</b></td></tr>
            <tr><td>Tờ bản đồ số:</td><td><b>${selectedRecord.mapSheetNumber || '—'}</b></td></tr>
            <tr><td>Diện tích thửa đất:</td><td><b>${selectedRecord.area || '—'} m²</b></td></tr>
            <tr><td>Loại đất sử dụng:</td><td><b>${selectedRecord.landType || '—'}</b></td></tr>
            <tr><td>Địa chỉ thửa đất:</td><td>${selectedRecord.landAddress || selectedRecord.address || '—'}</td></tr>
          </table>

          <div class='section'>III. CHI TIẾT NGHĨA VỤ TÀI CHÍNH</div>
          <table class='table'>
            <tr><td style='width: 150px;'>Loại thuế/lệ phí:</td><td><b>${selectedRecord.taxType || 'Thuế sử dụng đất'}</b></td></tr>
          </table>
          <div class='amount-box'>
            <p style='margin: 0; font-size: 12px;'>TỔNG SỐ TIỀN PHẢI NỘP</p>
            <h2 style='margin: 8px 0 0; font-size: 22px;'>${selectedRecord.calculatedTaxAmount ? Number(selectedRecord.calculatedTaxAmount).toLocaleString('vi-VN') + 'đ' : '0đ'}</h2>
          </div>

          <table style='width: 100%; margin-top: 40px; border: none;'>
            <tr>
              <td style='width: 50%; text-align: center; font-size: 12px; color: #94a3b8;'>
                * Ngày tạo: ${new Date().toLocaleDateString('vi-VN')}
              </td>
              <td style='width: 50%; text-align: center;'>
                <p><b>CƠ QUAN THUẾ</b></p>
                <p style='font-size: 12px;'>(Ký và ghi rõ họ tên)</p>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `;
    } else {
      mimeType = "application/pdf";
      fileExtension = "pdf";
      fileContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Thông báo nghĩa vụ tài chính</title>
          <style>
            @media print {
              body { margin: 0; padding: 20px; font-family: 'Arial', sans-serif; color: #333; }
            }
            body { font-family: 'Arial', sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; line-height: 1.5; color: #333; }
            .header-title { text-align: center; font-weight: bold; font-size: 13px; text-transform: uppercase; margin-bottom: 2px; }
            .header-subtitle { text-align: center; font-size: 12px; color: #666; margin-bottom: 25px; }
            .title { text-align: center; color: #a30d11; font-weight: 800; font-size: 20px; margin-top: 20px; margin-bottom: 5px; }
            .subtitle { text-align: center; font-size: 12px; color: #666; margin-bottom: 30px; }
            .section-header { font-weight: bold; font-size: 14px; margin-top: 25px; margin-bottom: 12px; border-bottom: 2px solid #a30d11; padding-bottom: 5px; color: #a30d11; }
            .info-grid { display: grid; grid-template-columns: 150px 1fr; gap: 8px 15px; margin-bottom: 15px; }
            .label { font-size: 13px; color: #666; }
            .value { font-size: 13px; font-weight: 600; color: #111; }
            .amount-card { background-color: #fff1f2; border: 1px dashed #fecdd3; padding: 20px; border-radius: 8px; text-align: center; margin-top: 25px; }
            .amount-title { font-size: 12px; font-weight: bold; color: #a30d11; margin: 0; text-transform: uppercase; }
            .amount-value { font-size: 24px; font-weight: 900; color: #a30d11; margin-top: 8px; margin-bottom: 0; }
            .footer-grid { display: grid; grid-template-columns: 1fr 1fr; margin-top: 40px; font-size: 12px; }
            .signature { text-align: center; }
            .signature-title { font-weight: bold; margin-bottom: 50px; }
          </style>
        </head>
        <body onload="window.print()">
          <div class="header-title">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
          <div class="header-subtitle">Độc lập - Tự do - Hạnh phúc</div>
          <hr style="border: 0.5px solid #ccc;"/>
          
          <div class="title">THÔNG BÁO NGHĨA VỤ TÀI CHÍNH</div>
          <div class="subtitle">Mã hồ sơ: T-${new Date().getFullYear()}-${String(selectedRecord.recordId).padStart(3, '0')}</div>

          <div class="section-header">THÔNG TIN NGƯỜI NỘP</div>
          <div class="info-grid">
            <div class="label">Họ và tên:</div>
            <div class="value">${selectedRecord.fullName || '—'}</div>
            <div class="label">Số CCCD/CMND:</div>
            <div class="value">${selectedRecord.senderCccd || '—'}</div>
            <div class="label">Địa chỉ thường trú:</div>
            <div class="value">${selectedRecord.address || '—'}</div>
          </div>

          <div class="section-header">THÔNG TIN THỬA ĐẤT</div>
          <div class="info-grid">
            <div class="label">Thửa đất số:</div>
            <div class="value">${selectedRecord.landParcelNumber || '—'}</div>
            <div class="label">Tờ bản đồ số:</div>
            <div class="value">${selectedRecord.mapSheetNumber || '—'}</div>
            <div class="label">Diện tích:</div>
            <div class="value">${selectedRecord.area || '—'} m²</div>
            <div class="label">Loại đất:</div>
            <div class="value">${selectedRecord.landType || '—'}</div>
            <div class="label">Địa chỉ thửa đất:</div>
            <div class="value">${selectedRecord.landAddress || selectedRecord.address || '—'}</div>
          </div>

          <div class="section-header">CHI TIẾT NGHĨA VỤ TÀI CHÍNH</div>
          <div class="info-grid">
            <div class="label">Loại thuế/lệ phí:</div>
            <div class="value">${selectedRecord.taxType || 'Thuế sử dụng đất'}</div>
          </div>

          <div class="amount-card">
            <div class="amount-title">Tổng số tiền phải nộp</div>
            <div class="amount-value">${selectedRecord.calculatedTaxAmount ? Number(selectedRecord.calculatedTaxAmount).toLocaleString('vi-VN') + 'đ' : '0đ'}</div>
          </div>

          <div class="footer-grid">
            <div style="color: #666; display: flex; align-items: flex-end;">
              * Ngày tạo: ${new Date().toLocaleDateString('vi-VN')}
            </div>
            <div class="signature">
              <div class="signature-title">CƠ QUAN THUẾ</div>
              <div style="color: #888; font-size: 12px;">(Ký và ghi rõ họ tên)</div>
            </div>
          </div>
        </body>
        </html>
      `;
    }

    if (exportFormat === 'PDF') {
      try {
        await exportHtmlStringToPdf(
          fileContent,
          `thong_bao_thue_HS-${selectedRecord.recordId}.pdf`
        );
        dispatch({ type: 'closeExportModals' });
      } catch (err) {
        console.error('Export PDF error:', err);
        await showAlert({
          title: 'Lỗi',
          message: 'Không thể tạo file PDF. Vui lòng thử lại.',
          variant: 'error',
        });
      }
      return;
    }

    const blob = new Blob([fileContent], { type: `${mimeType};charset=utf-8` });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `thong_bao_thue_HS-${selectedRecord.recordId}.${fileExtension}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    dispatch({ type: 'closeExportModals' });
}
