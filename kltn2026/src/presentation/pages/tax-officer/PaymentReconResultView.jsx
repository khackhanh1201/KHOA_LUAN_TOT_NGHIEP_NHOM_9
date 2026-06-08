import React from 'react';
import { RECON_TABS, formatVND } from './paymentManagementUtils';
import {
  btnBack, statsGrid, statCard, cardReconResult, miniTabs, miniTab, miniTabActive,
  reconTable, tdCellStyle, capsuleBadgeSuccess, capsuleBadgeError, btnActionRed, btnExitRecon,
} from './paymentManagementStyles';

const StatCard = ({ label, value, color, textColor }) => (
  <div style={{ ...statCard, background: color }}>
    <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 700 }}>{label}</div>
    <div style={{ fontSize: 32, fontWeight: 800, color: textColor || '#1e293b' }}>{value}</div>
  </div>
);

const PaymentReconResultView = ({
  reconResult,
  reconTab,
  filteredRows,
  dispatch,
  onOpenError,
  onExit,
}) => (
          <div style={{ animation: 'fadeIn 0.3s' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button type="button" onClick={() => dispatch({ type: 'patch', payload: { view: 'list' } })} style={btnBack} aria-label="Quay lại"><i className="bi bi-arrow-left"></i></button>
                <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#1e293b', letterSpacing: '-0.01em' }}>Đối soát thanh toán</h2>
              </div>
            </div>

            {/* Stats Cards */}
            <div style={statsGrid}>
              <StatCard label="TỔNG HỒ SƠ" value={reconResult ? reconResult.length : "0"} color="#f8fafc" />
              <StatCard label="KHỚP HOÀN TOÀN" value={reconResult ? reconResult.filter(i => i.status === 'MATCHED').length : "0"} color="#f0fdf4" textColor="#16a34a" />
              <StatCard label="SAI LỆCH/NGHI NGỜ" value={reconResult ? reconResult.filter(i => i.status !== 'MATCHED').length : "0"} color="#fef2f2" textColor="#dc2626" />
            </div>

            {/* Bảng Kết quả đối soát */}
            <div style={cardReconResult}>
              <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1e293b' }}>Kết quả đối soát</h4>
                  <p style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>Hệ thống tự động đối soát tín hiệu PayOS với cơ sở dữ liệu thuế.</p>
                </div>
                
                <div style={miniTabs}>
                  {RECON_TABS.map((tab) => (
                    <button type="button" key={tab} 
                      style={reconTab === tab ? miniTabActive : miniTab}
                      onClick={() => dispatch({ type: 'patch', payload: { reconTab: tab } })}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <table style={reconTable}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>
                    <th style={{ padding: '16px 20px', fontSize: 12, color: '#94a3b8', fontWeight: 700, textAlign: 'left', width: '6%' }}>STT</th>
                    <th style={{ padding: '16px 20px', fontSize: 12, color: '#94a3b8', fontWeight: 700, textAlign: 'left', width: '28%' }}>TÍN HIỆU PAYOS (WEBHOOK)</th>
                    <th style={{ padding: '16px 20px', fontSize: 12, color: '#94a3b8', fontWeight: 700, textAlign: 'left', width: '28%' }}>THÔNG TIN HỆ THỐNG (DATABASE)</th>
                    <th style={{ padding: '16px 20px', fontSize: 12, color: '#94a3b8', fontWeight: 700, textAlign: 'left', width: '24%' }}>TRẠNG THÁI ĐỐI SOÁT</th>
                    <th style={{ padding: '16px 20px', fontSize: 12, color: '#94a3b8', fontWeight: 700, textAlign: 'center', width: '14%' }}>HÀNH ĐỘNG</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((item, index) => (
                    <tr key={item.payId || item.logId || index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ ...tdCellStyle, color: '#64748b' }}>{index + 1}</td>
                      
                      <td style={{ padding: '16px 20px', verticalAlign: 'middle' }}>
                        {item.hasPayosSignal ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 13 }}>Mã: {item.invoiceCode || item.orderCode}</div>
                            <div style={{ color: '#dc2626', fontWeight: 700, fontSize: 14 }}>{formatVND(item.payosAmount)}</div>
                            <div style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic' }}>{item.payosDescription || 'Tín hiệu PayOS'}</div>
                          </div>
                        ) : (
                          <div style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: 13 }}>(Không tìm thấy tín hiệu webhook PayOS)</div>
                        )}
                      </td>

                      <td style={{ padding: '16px 20px', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 13 }}>MST: {item.mst}</div>
                          <div style={{ color: '#2563eb', fontWeight: 700, fontSize: 14 }}>{formatVND(item.systemTotal)}</div>
                          <div style={{ 
                            fontSize: 12, 
                            fontWeight: 700, 
                            color: item.systemStatus === 'TRỄ HẠN' ? '#ea580c' : '#94a3b8' 
                          }}>
                            TRẠNG THÁI: {item.systemStatus || 'BÌNH THƯỜNG'}
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '16px 20px', verticalAlign: 'middle' }}>
                        {item.status === 'MATCHED' ? (
                          <div style={capsuleBadgeSuccess}>
                            <i className="bi bi-check-circle-fill" style={{ fontSize: 12 }}></i>
                            <span>{item.reconciliationLabel || 'KHỚP 100%'}</span>
                          </div>
                        ) : (
                          <div style={capsuleBadgeError}>
                            <i className="bi bi-exclamation-triangle-fill" style={{ fontSize: 12 }}></i>
                            <span>{item.reconciliationLabel || 'LỆCH ĐỐI SOÁT'}</span>
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '16px 20px', textAlign: 'center', verticalAlign: 'middle' }}>
                        {item.status === 'MATCHED' ? (
                          <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 700 }}>Đã khớp</span>
                        ) : (
                          <button type="button" style={btnActionRed} onClick={() => onOpenError(item)}>Xử lý lỗi</button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredRows.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontSize: 14 }}>
                        Không có dữ liệu đối soát phù hợp.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #f1f5f9' }}>
                 <button type="button" style={btnExitRecon} onClick={onExit}>Thoát đối soát</button>
              </div>
            </div>
          </div>
);

export default PaymentReconResultView;
