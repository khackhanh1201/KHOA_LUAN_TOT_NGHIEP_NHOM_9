import React from 'react';
import { formatVND, formatDateVN } from './paymentManagementUtils';
import { DetailField } from './PaymentDetailParts';
import {
  fsOverlayStyle, fsHeaderStyle, fsBodyStyle, sectionCardStyle, sectionTitleStyle,
  grid3Style, grayBoxStyle, formulaBoxStyle, totalBoxStyle, btnPrimaryRed,
  successBadge, overdueBadge,
} from './paymentManagementStyles';

const rdStyleMarginTopPaddingBackground = {
                      marginTop: 12,
                      padding: '10px 14px',
                      background: '#fff',
                      border: '1px solid #fecdd3',
                      borderRadius: 6,
                      fontSize: 12,
                      color: '#9f1239',
                      lineHeight: 1.6,
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 8,
                    };

const PaymentDetailPanel = ({ payment, loading, onClose }) => {
  const isPaid = ['PAID', 'SUCCESS'].includes(payment.paymentStatusRaw);
  const statusBadge = isPaid ? successBadge : overdueBadge;

  return (
    <div style={fsOverlayStyle}>
      {/* HEADER + ACTION BAR (đồng bộ TaxProcessing) */}
      <div style={{ ...fsHeaderStyle, flexDirection: 'column', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
          <button type="button" onClick={onClose}
            aria-label="Quay lại"
            style={{ background: 'none', border: 'none', fontSize: 20, color: '#64748b', cursor: 'pointer' }}
          >←</button>
          <div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#1e293b' }}>Chi tiết hồ sơ thanh toán</h3>
            <small style={{ color: '#64748b' }}>
              Mã giao dịch: <span style={{ color: '#a30d11', fontWeight: 700 }}>{payment.transactionCode || payment.id}</span>
            </small>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, width: '100%', borderTop: '1px solid #e2e8f0', paddingTop: 12, paddingBottom: 4 }}>
          <button type="button" style={btnPrimaryRed}><i className="bi bi-download"></i> Xuất hồ sơ</button>
          <button type="button" style={btnPrimaryRed}><i className="bi bi-clock-history"></i> Lịch sử</button>
        </div>
      </div>

      {/* BODY */}
      <div style={fsBodyStyle}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {loading ? (
            <div style={{ ...sectionCardStyle, textAlign: 'center', padding: 40 }}>
              <div className="spinner-border text-danger" />
              <div style={{ marginTop: 8, color: '#64748b', fontSize: 13 }}>Đang tải chi tiết…</div>
            </div>
          ) : (
            <>
              {/* THÔNG TIN NGƯỜI NỘP */}
              <div style={sectionCardStyle}>
                <div style={sectionTitleStyle}>
                  <i className="bi bi-person" style={{ color: '#3b82f6' }}></i>
                  <span>Thông tin người nộp</span>
                  <span style={{ marginLeft: 'auto', ...statusBadge }}>{payment.status}</span>
                </div>
                <div style={grid3Style}>
                  <DetailField label="HỌ VÀ TÊN" value={payment.name || '—'} strong />
                  <DetailField label="MÃ GIAO DỊCH" value={payment.transactionCode || payment.mst || '—'} strong />
                  <DetailField label="SỐ CCCD" value={payment.cccdNumber || '—'} strong />
                  <DetailField label="SĐT" value={payment.phoneNumber || '—'} strong />
                  <DetailField label="ĐỐI TƯỢNG MIỄN THUẾ" value={payment.exemptSubject || 'Không'} color="#ea580c" strong />
                  <div style={{ gridColumn: 'span 2' }}>
                    <DetailField label="ĐỊA CHỈ LIÊN HỆ" value={payment.address || '—'} strong />
                  </div>
                </div>
              </div>

              {/* THÔNG TIN TÀI SẢN */}
              <div style={sectionCardStyle}>
                <div style={sectionTitleStyle}>
                  <i className="bi bi-geo-alt" style={{ color: '#ef4444' }}></i>
                  <span>Thông tin tài sản</span>
                </div>
                <div style={grid3Style}>
                  <div style={grayBoxStyle}><DetailField label="LOẠI HỒ SƠ" value={payment.recordCategory || '—'} strong /></div>
                  <div style={grayBoxStyle}><DetailField label="VỊ TRÍ TÀI SẢN" value={payment.landAddress || '—'} strong /></div>
                  <div style={grayBoxStyle}><DetailField label="DIỆN TÍCH" value={payment.area || '—'} strong /></div>
                  <div style={grayBoxStyle}><DetailField label="LOẠI ĐẤT" value={payment.landType || '—'} strong /></div>
                  <div style={grayBoxStyle}><DetailField label="HẠN NỘP" value={formatDateVN(payment.dueDate)} strong /></div>
                  <div style={grayBoxStyle}><DetailField label="MÃ HỒ SƠ" value={payment.recordId ? `HS-${payment.recordId}` : '—'} strong /></div>
                </div>
              </div>

              {/* THÔNG TIN TÀI CHÍNH */}
              <div style={sectionCardStyle}>
                <div style={sectionTitleStyle}>
                  <i className="bi bi-currency-dollar" style={{ color: '#f59e0b' }}></i>
                  <span>Thông tin tài chính</span>
                </div>

                {/* 3 chỉ số chính */}
                <div style={grid3Style}>
                  <div style={grayBoxStyle}>
                    <DetailField label="TIỀN GỐC" value={formatVND(payment.base)} strong />
                  </div>
                  <div style={grayBoxStyle}>
                    <DetailField
                      label="TIỀN PHẠT CHẬM NỘP"
                      value={formatVND(payment.penalty)}
                      color={payment.penalty > 0 ? '#dc2626' : '#1e293b'}
                      strong
                    />
                  </div>
                  <div style={grayBoxStyle}>
                    <DetailField
                      label="SỐ NGÀY QUÁ HẠN"
                      value={payment.overdueDays > 0 ? `${payment.overdueDays.toLocaleString('vi-VN')} ngày` : 'Chưa quá hạn'}
                      color={payment.overdueDays > 0 ? '#dc2626' : '#16a34a'}
                      strong
                    />
                  </div>
                </div>

                {/* Box giải thích công thức tính phạt */}
                <div style={formulaBoxStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <i className="bi bi-calculator" style={{ color: '#a30d11', fontSize: 16 }}></i>
                    <span style={{ fontSize: 12, fontWeight: 800, color: '#a30d11', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Cách tính tiền phạt chậm nộp
                    </span>
                  </div>

                  <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.7, marginBottom: 10 }}>
                    <b>Công thức:</b> Tiền phạt = Tiền gốc × 0,03%/ngày × Số ngày quá hạn
                  </div>

                  {payment.overdueDays > 0 ? (
                    <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.7, fontVariantNumeric: 'tabular-nums' }}>
                      <b>Áp dụng:</b> {formatVND(payment.base)} × 0,03% × {payment.overdueDays.toLocaleString('vi-VN')} ngày = {' '}
                      <span style={{ color: '#dc2626', fontWeight: 800 }}>{formatVND(payment.penalty)}</span>
                    </div>
                  ) : (
                    <div style={{ fontSize: 13, color: '#16a34a', lineHeight: 1.7 }}>
                      <i className="bi bi-check-circle-fill" style={{ marginRight: 6 }}></i>
                      Hồ sơ chưa quá hạn — không phát sinh phạt.
                    </div>
                  )}

                  {payment.penalty > payment.base && payment.base > 0 && (
                    <div style={rdStyleMarginTopPaddingBackground}>
                      <i className="bi bi-exclamation-triangle-fill" style={{ color: '#dc2626', marginTop: 2 }}></i>
                      <span>
                        <b>Cảnh báo:</b> Tiền phạt đã vượt tiền gốc. Khoản nợ thuế đã quá hạn lâu, đề nghị liên hệ trực tiếp cơ quan thuế để được hỗ trợ.
                      </span>
                    </div>
                  )}

                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 10, fontStyle: 'italic', lineHeight: 1.6 }}>
                    * Số ngày quá hạn tính từ 00:00:00 của ngày liền kề sau hạn nộp đến ngày hiện tại.<br />
                    * Mức 0,03%/ngày áp dụng theo Luật Quản lý thuế 2019 (Điều 59).
                  </div>
                </div>

                {/* Box tổng tiền — nhấn đỏ */}
                <div style={totalBoxStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 800, color: '#a30d11', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Tổng tiền phải nộp
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                        Tiền gốc + Tiền phạt = {formatVND(payment.base)} + {formatVND(payment.penalty)}
                      </div>
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 900, color: '#a30d11', fontVariantNumeric: 'tabular-nums' }}>
                      {formatVND(payment.total)}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentDetailPanel;
