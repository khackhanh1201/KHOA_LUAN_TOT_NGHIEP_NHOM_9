import React from 'react';
import { colors } from '../../../theme/designTokens';
import { TABS, TYPE_META } from './searchPageUtils';

export const SearchInputBar = ({ keyword, activeTab, loading, hasSearched, onKeywordChange, onSearch, onRefresh }) => (
  <div className="input-group mb-4 shadow-sm" style={{ borderRadius: '12px', overflow: 'hidden' }}>
    <span className="input-group-text bg-white border-end-0 px-4 text-muted"><i className="bi bi-search" /></span>
    <input
      type="text"
      className="form-control form-control-lg border-start-0 py-3"
      aria-label="Tìm kiếm"
      placeholder={
        activeTab === 'land' ? 'Mã thửa, tờ bản đồ, số GCN, địa chỉ...'
          : activeTab === 'tax' || activeTab === 'payment' ? 'Năm thuế, mã thửa, số tiền, mã thanh toán...'
            : activeTab === 'declaration' ? 'Mã hồ sơ T-2026-010, loại hồ sơ, địa chỉ...'
              : activeTab === 'complaint' ? 'Tiêu đề, nội dung khiếu nại...'
                : 'Nhập từ khóa tra cứu...'
      }
      value={keyword}
      onChange={(e) => onKeywordChange(e.target.value)}
      onKeyDown={(e) => e.key === 'Enter' && onSearch()}
      style={{ fontSize: '15px', boxShadow: 'none' }}
    />
    <button type="button" className="btn px-5 fw-bold text-white" style={{ background: colors.primary, border: 'none' }}
      onClick={() => onSearch()} disabled={loading}>
      {loading ? 'Đang tìm...' : 'Tra cứu'}
    </button>
    {hasSearched && (
      <button type="button" className="btn btn-light border px-3" title="Làm mới kết quả"
        onClick={onRefresh} disabled={loading || !keyword.trim()} aria-label="Làm mới kết quả">
        {loading ? <output className="spinner-border spinner-border-sm" aria-live="polite" /> : <i className="bi bi-arrow-clockwise" />}
      </button>
    )}
  </div>
);

export const SearchTabBar = ({ activeTab, onTabChange, getPillTabStyle }) => (
  <div className="mb-4 d-flex gap-2 flex-wrap">
    {TABS.map((tab) => (
      <button key={tab.key} type="button" style={getPillTabStyle(activeTab === tab.key)} onClick={() => onTabChange(tab.key)}>
        {tab.label}
      </button>
    ))}
  </div>
);

export const SearchResultsPanel = ({
  hasSearched, loading, results, keyword, error, resultCountLabel,
  onRefresh, onNewSearch, onNavigate,
}) => {
  if (!hasSearched) return null;
  return (
    <div className="card shadow-sm border-0" style={{ borderRadius: '16px' }}>
      <div className="card-body p-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
          {resultCountLabel ? <p className="text-muted small mb-0">{resultCountLabel}</p> : <span />}
          <div className="d-flex gap-2">
            <button type="button" className="btn btn-sm fw-semibold d-inline-flex align-items-center gap-1"
              style={{ border: `1px solid ${colors.primary}`, color: colors.primary, background: '#fff' }}
              onClick={onRefresh} disabled={loading || !keyword.trim()}>
              {loading ? <output className="spinner-border spinner-border-sm" aria-live="polite" /> : <i className="bi bi-arrow-clockwise" />}
              {loading ? 'Đang làm mới...' : 'Làm mới'}
            </button>
            <button type="button" className="btn btn-sm btn-light border text-secondary fw-semibold" onClick={onNewSearch} disabled={loading}>
              Tra cứu mới
            </button>
          </div>
        </div>
        {loading ? (
          <div className="text-center py-5">
            <output className="spinner-border" style={{ color: colors.primary }} aria-live="polite" />
            <p className="mt-3 text-muted">Đang tra cứu dữ liệu...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <i className="bi bi-search fs-1 mb-3 opacity-50" />
            <p>Không tìm thấy kết quả nào phù hợp với &quot;{keyword}&quot;</p>
            {error && <p className="small text-secondary mb-0">{error}</p>}
          </div>
        ) : (
          <div className="list-group list-group-flush gap-2">
            {error && results.length > 0 && <div className="alert alert-warning py-2 small mb-3">{error}</div>}
            {results.map((item) => {
              const meta = TYPE_META[item.type] || TYPE_META.land;
              return (
                <div key={`${item.type}-${item.id}`}
                  className="list-group-item list-group-item-action d-flex flex-column flex-md-row justify-content-between align-items-md-center py-3 px-4 border rounded-3 mb-2">
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <span className="badge rounded-pill" style={{ background: colors.primarySoft, color: colors.primary }}>
                        <i className={`bi ${meta.icon} me-1`} />{meta.label}
                      </span>
                      <span className="fw-bold text-dark fs-5">{item.title}</span>
                    </div>
                    {item.lines.map((line) => (
                      <div key={line} className="text-secondary small fw-medium mt-1">{line}</div>
                    ))}
                  </div>
                  <button type="button" className="btn btn-sm fw-semibold mt-3 mt-md-0 px-3 py-2 rounded-pill"
                    style={{ border: `1px solid ${colors.primary}`, color: colors.primary, background: '#fff' }}
                    onClick={() => onNavigate(item.route || meta.route)}>
                    Xem chi tiết <i className="bi bi-arrow-right ms-1" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export const RecentSearchesPanel = ({ recentList, onSearch }) => (
  <div>
    <h6 className="fw-bold mb-3 d-flex align-items-center gap-2 text-dark">
      <i className="bi bi-clock-history" style={{ color: colors.primary }} /> Lịch sử tra cứu gần đây
    </h6>
    <div className="card shadow-sm border-0" style={{ borderRadius: '16px' }}>
      <div className="list-group list-group-flush">
        {recentList.length === 0 ? (
          <>
            <div className="list-group-item py-3 px-4 text-muted small">Chưa có lịch sử. Thử tra cứu &quot;P001&quot; hoặc địa chỉ thửa đất của bạn.</div>
            <button type="button" className="list-group-item list-group-item-action py-3 px-4 text-secondary text-start border-0"
              onClick={() => onSearch('P001', 'land')}>
              <i className="bi bi-search me-2 opacity-50" /> Tra cứu Thửa P001 - M001
            </button>
            <button type="button" className="list-group-item list-group-item-action py-3 px-4 text-secondary text-start border-0"
              onClick={() => onSearch('Điện Biên Phủ', 'land')}>
              <i className="bi bi-search me-2 opacity-50" /> Tra cứu theo địa chỉ: Điện Biên Phủ
            </button>
          </>
        ) : (
          recentList.map((entry, idx) => (
            <button key={`${entry.keyword}-${entry.tab}-${idx}`} type="button"
              className="list-group-item list-group-item-action py-3 px-4 text-secondary text-start border-0"
              onClick={() => onSearch(entry.keyword, entry.tab || 'all')}>
              <i className="bi bi-search me-2 opacity-50" />{entry.keyword}
              <span className="ms-2 badge bg-light text-muted">{TABS.find((t) => t.key === entry.tab)?.label || 'Tất cả'}</span>
            </button>
          ))
        )}
      </div>
    </div>
  </div>
);
