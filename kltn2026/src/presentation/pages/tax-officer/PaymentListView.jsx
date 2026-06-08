import React from 'react';
import { FOCUS_VISIBLE_CLASS } from '../../theme/designTokens';
import {
  advBtnTrigger, advPopover, advTitle, advFieldGroup,
  advFieldLabel, advFieldInput, advFooter, advBtnReset, advBtnClose,
} from './_designTokens';
import { LIST_TABS, formatVND, formatDateVN, getStatusBadgeStyle } from './paymentManagementUtils';
import {
  btnPrimaryRed, tabContainer, tabActive, tabInactive,
  tableContainerStyle, tabsWrapperStyle, tableHeaderRow, tableRow,
  thStyle, tdCellStyle, amountCellStyle,
} from './paymentManagementStyles';

const PaymentListView = ({
  activeTab,
  searchQuery,
  showAdvanced,
  advFilters,
  displayError,
  loading,
  payments,
  loadingRecon,
  dispatch,
  onReconcile,
  onViewDetail,
  onDownloadReceipt,
}) => (
          <div style={{ animation: 'fadeIn 0.3s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#1e293b', letterSpacing: '-0.01em' }}>Quản lý thanh toán</h2>
                <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: 14 }}>Theo dõi, đối soát và xử lý các giao dịch nộp thuế.</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>
                <button type="button" style={btnPrimaryRed}
                  onClick={onReconcile}
                  disabled={loadingRecon}
                >
                  <i className="bi bi-arrow-repeat"></i> Đối soát thanh toán
                </button>

                <div style={{ display: 'flex', gap: 12, alignItems: 'center', position: 'relative' }}>
                  <div style={{ position: 'relative', width: 320 }}>
                    <i className="bi bi-search" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                      type="text"
                      aria-label="Tìm theo mã hóa đơn, MST, tên người nộp"
                      placeholder="Tìm theo Mã hóa đơn, MST, Tên người nộp..."
                      value={searchQuery}
                      onChange={(e) => dispatch({ type: 'patch', payload: { searchQuery: e.target.value } })}
                      className={FOCUS_VISIBLE_CLASS}
                      style={{
                        width: '100%',
                        padding: '10px 12px 10px 36px',
                        borderRadius: 8,
                        border: '1px solid #e2e8f0',
                        fontSize: 13,
                        background: '#fff',
                        color: '#1e293b',
                      }}
                    />
                  </div>

                  <button type="button" style={advBtnTrigger} onClick={() => dispatch({ type: 'patch', payload: { showAdvanced: !showAdvanced } })}>
                    <i className="bi bi-sliders" /> Tìm kiếm nâng cao
                  </button>

                  {showAdvanced && (
                    <div style={advPopover}>
                      <h4 style={advTitle}>Tìm kiếm nâng cao</h4>
                      <div style={advFieldGroup}>
                        <label htmlFor="payment-adv-transaction" style={advFieldLabel}>Mã giao dịch</label>
                        <input id="payment-adv-transaction" type="text" placeholder="Nhập mã giao dịch..." style={advFieldInput} value={advFilters.transactionCode} onChange={e => dispatch({ type: 'patch', payload: { advFilters: { ...advFilters, transactionCode: e.target.value } } })} />
                      </div>
                      <div style={advFieldGroup}>
                        <label htmlFor="payment-adv-mst" style={advFieldLabel}>Đối tượng (MST)</label>
                        <input id="payment-adv-mst" type="text" placeholder="Nhập MST hoặc tên..." style={advFieldInput} value={advFilters.mst} onChange={e => dispatch({ type: 'patch', payload: { advFilters: { ...advFilters, mst: e.target.value } } })} />
                      </div>
                      <div style={{...advFieldGroup, marginBottom: 0}}>
                        <label htmlFor="payment-adv-status" style={advFieldLabel}>Trạng thái</label>
                        <select id="payment-adv-status" style={advFieldInput} value={advFilters.status} onChange={e => dispatch({ type: 'patch', payload: { advFilters: { ...advFilters, status: e.target.value } } })}>
                          <option value="Tất cả">Tất cả</option>
                          <option value="Chờ thanh toán">Chờ thanh toán</option>
                          <option value="Đã nộp">Đã nộp</option>
                          <option value="Đang đối soát">Đang đối soát</option>
                          <option value="Cần thẩm định">Cần thẩm định</option>
                          <option value="Thất bại">Thất bại</option>
                          <option value="Miễn/Giảm">Miễn/Giảm</option>
                        </select>
                      </div>
                      <div style={advFooter}>
                        <button type="button" style={advBtnReset} onClick={() => dispatch({ type: 'resetFilters' })}>Xóa bộ lọc</button>
                        <button type="button" style={advBtnClose} onClick={() => dispatch({ type: 'patch', payload: { showAdvanced: false } })}>Đóng</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Table Container (đồng bộ TaxProcessing) */}
            <div style={tableContainerStyle}>
              <div style={tabsWrapperStyle}>
                <div style={{ ...tabContainer, flexWrap: 'wrap' }}>
                  {LIST_TABS.map(tab => (
                    <button type="button" key={tab}
                      onClick={() => dispatch({ type: 'patch', payload: { activeTab: tab } })}
                      style={activeTab === tab ? tabActive : tabInactive}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {displayError ? (
                <p style={{ color: '#dc2626', textAlign: 'center', background: '#fee2e2', padding: 16, margin: 16, borderRadius: 8, fontSize: 14 }}>{displayError}</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                  <thead>
                    <tr style={tableHeaderRow}>
                      <th style={{ ...thStyle, width: '12%' }}>Mã giao dịch</th>
                      <th style={{ ...thStyle, width: '20%' }}>Đối tượng (MST)</th>
                      <th style={{ ...thStyle, textAlign: 'right' }}>Tiền gốc</th>
                      <th style={{ ...thStyle, textAlign: 'right' }}>Tiền phạt</th>
                      <th style={{ ...thStyle, textAlign: 'right' }}>Tổng cộng</th>
                      <th style={{ ...thStyle, width: '12%' }}>Ngày hết hạn</th>
                      <th style={{ ...thStyle, textAlign: 'center' }}>Trạng thái</th>
                      <th style={{ ...thStyle, textAlign: 'center' }}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan="8" style={{ textAlign: 'center', padding: '48px' }}>
                        <output className="spinner-border text-danger" aria-live="polite" />
                        <div style={{ marginTop: 8, color: '#64748b', fontSize: 13 }}>Đang tải dữ liệu…</div>
                      </td></tr>
                    ) : (payments ?? []).length === 0 ? (
                      <tr><td colSpan="8" style={{ textAlign: 'center', padding: '48px', color: '#94a3b8', fontSize: 14 }}>
                        Không có dữ liệu giao dịch nào.
                      </td></tr>
                    ) : (
                      (payments ?? []).map((item, index) => {
                        const penaltyExceedsBase = item.penalty > item.base && item.base > 0;
                        return (
                        <tr key={item.payId || index} style={tableRow}>
                          <td style={tdCellStyle}><span style={{ fontWeight: 700, color: '#a30d11' }}>{item.invoiceCode}</span></td>
                          <td style={tdCellStyle}>
                            <div style={{ fontWeight: 600, color: '#1e293b' }}>{item.name}</div>
                            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>MST: {item.mst}</div>
                            {item.isAnnual && (
                              <div style={{ fontSize: 11, color: '#0369a1', marginTop: 4 }}>
                                Thuế hằng năm{item.installmentLabel ? ` · ${item.installmentLabel}` : ''}
                              </div>
                            )}
                          </td>
                          <td style={amountCellStyle}>{formatVND(item.base)}</td>
                          <td style={{ ...amountCellStyle, color: item.penalty > 0 ? '#dc2626' : '#94a3b8' }}>
                            {item.penalty > 0 ? (
                              <span
                                title={`Phạt chậm nộp ${item.overdueDays.toLocaleString('vi-VN')} ngày · ${formatVND(item.base)} × 0,03%/ngày × ${item.overdueDays.toLocaleString('vi-VN')} = ${formatVND(item.penalty)}`}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'help' }}
                              >
                                {formatVND(item.penalty)}
                                <i className="bi bi-info-circle" style={{ fontSize: 12 }} />
                                {penaltyExceedsBase && (
                                  <span title="Phạt vượt tiền gốc — vui lòng liên hệ cơ quan thuế" style={{ fontSize: 12, fontWeight: 800, color: '#dc2626', background: '#fee2e2', padding: '2px 6px', borderRadius: 6 }}>⚠</span>
                                )}
                              </span>
                            ) : (
                              <span>0 đ</span>
                            )}
                          </td>
                          <td style={{ ...amountCellStyle, fontWeight: 700, color: '#a30d11' }}>{formatVND(item.total)}</td>
                          <td style={{ ...tdCellStyle, whiteSpace: 'nowrap' }}>
                            <div style={{ color: item.overdueDays > 0 ? '#dc2626' : '#64748b', fontWeight: item.overdueDays > 0 ? 600 : 500 }}>
                              {formatDateVN(item.dueDate)}
                            </div>
                            {item.overdueDays > 0 && (
                              <div style={{ fontSize: 12, color: '#dc2626', marginTop: 2, fontWeight: 700 }}>
                                Quá hạn {item.overdueDays.toLocaleString('vi-VN')} ngày
                              </div>
                            )}
                          </td>
                          <td style={{ ...tdCellStyle, textAlign: 'center' }}>
                            <span style={getStatusBadgeStyle(item.paymentStatusRaw)}>
                              {item.status}
                            </span>
                          </td>
                          <td style={{ ...tdCellStyle, textAlign: 'center' }}>
                            <div style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
                              <button type="button" onClick={() => onViewDetail(item)}
                                aria-label="Xem chi tiết"
                                title="Xem chi tiết"
                                style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 18, cursor: 'pointer', padding: '6px 8px', borderRadius: 6 }}
                              >
                                <i className="bi bi-eye" />
                              </button>
                              {['PAID', 'SUCCESS'].includes(item.paymentStatusRaw) && (
                                <button type="button" onClick={() => onDownloadReceipt(item.payId)}
                                  aria-label="Tải biên lai"
                                  title="Tải biên lai"
                                  style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 18, cursor: 'pointer', padding: '6px 8px', borderRadius: 6 }}
                                >
                                  <i className="bi bi-file-earmark-text" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
);

export default PaymentListView;
