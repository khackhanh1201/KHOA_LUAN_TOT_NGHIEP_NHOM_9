import React, { useReducer, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import LandTaxLayout from '../../components/LandTaxLayout';
import { useUserInfo } from '../../../hooks/useUserInfo';
import { colors, getPillTabStyle } from '../../theme/designTokens';
import {
  TABS,
  INITIAL_SEARCH_STATE,
  searchPageReducer,
  saveRecentSearch,
  loadRecentSearches,
  runSearchForTab,
  filterResultsByTab,
  dedupeResults,
} from './search/searchPageUtils';
import { SearchInputBar, SearchTabBar, SearchResultsPanel, RecentSearchesPanel } from './search/SearchPageParts';

const SearchPage = () => {
  const navigate = useNavigate();
  const { user } = useUserInfo();
  const [state, dispatch] = useReducer(searchPageReducer, INITIAL_SEARCH_STATE);
  const { keyword, activeTab, allResults, results, loading, error, hasSearched, recentList } = state;

  const filterByTab = useCallback((items, tab) => filterResultsByTab(items, tab), []);

  const handleSearch = async (overrideKeyword, overrideTab) => {
    const q = (overrideKeyword ?? keyword).trim();
    const tab = overrideTab ?? activeTab;
    if (!q) {
      dispatch({ type: 'PATCH', payload: { error: 'Vui lòng nhập từ khóa tìm kiếm' } });
      return;
    }
    const searchPatch = { loading: true, error: '', hasSearched: true };
    if (overrideKeyword != null) searchPatch.keyword = overrideKeyword;
    if (overrideTab != null) searchPatch.activeTab = overrideTab;
    dispatch({ type: 'PATCH', payload: searchPatch });
    try {
      const merged = await runSearchForTab(tab, q);
      saveRecentSearch(q, tab);
      dispatch({
        type: 'PATCH',
        payload: {
          allResults: merged,
          results: filterByTab(merged, tab),
          recentList: loadRecentSearches(),
          error: merged.length === 0
            ? tab === 'all' ? 'Không tìm thấy kết quả phù hợp trên các danh mục.'
              : `Không có kết quả trong mục "${TABS.find((t) => t.key === tab)?.label}".`
            : '',
        },
      });
    } catch (err) {
      console.error(err);
      dispatch({ type: 'PATCH', payload: { allResults: [], results: [], error: 'Không thể tra cứu. Vui lòng kiểm tra đăng nhập và backend.' } });
    } finally {
      dispatch({ type: 'PATCH', payload: { loading: false } });
    }
  };

  const handleTabChange = async (tabKey) => {
    dispatch({ type: 'PATCH', payload: { activeTab: tabKey } });
    if (!hasSearched || !keyword.trim()) return;
    const filtered = filterByTab(allResults, tabKey);
    if (filtered.length > 0 || tabKey === 'all') {
      dispatch({ type: 'PATCH', payload: { results: filtered, error: '' } });
      return;
    }
    dispatch({ type: 'PATCH', payload: { loading: true, error: '' } });
    try {
      const fresh = await runSearchForTab(tabKey, keyword.trim());
      const merged = dedupeResults([...allResults, ...fresh]);
      dispatch({
        type: 'PATCH',
        payload: {
          allResults: merged, results: fresh,
          error: fresh.length === 0 ? `Không có kết quả trong mục "${TABS.find((t) => t.key === tabKey)?.label}".` : '',
        },
      });
    } catch (err) {
      console.error(err);
      dispatch({ type: 'PATCH', payload: { error: 'Không thể tải dữ liệu cho danh mục này.' } });
    } finally {
      dispatch({ type: 'PATCH', payload: { loading: false } });
    }
  };

  const handleRefresh = async () => {
    const q = keyword.trim();
    if (!q || !hasSearched) return;
    dispatch({ type: 'PATCH', payload: { loading: true, error: '' } });
    try {
      if (activeTab === 'all') {
        const merged = await runSearchForTab('all', q);
        dispatch({ type: 'PATCH', payload: { allResults: merged, results: merged, error: merged.length === 0 ? 'Không tìm thấy kết quả phù hợp trên các danh mục.' : '' } });
      } else {
        const fresh = await runSearchForTab(activeTab, q);
        const merged = dedupeResults([...allResults.filter((r) => r.type !== activeTab), ...fresh]);
        dispatch({
          type: 'PATCH',
          payload: {
            allResults: merged, results: fresh,
            error: fresh.length === 0 ? `Không có kết quả trong mục "${TABS.find((t) => t.key === activeTab)?.label}".` : '',
          },
        });
      }
    } catch (err) {
      console.error(err);
      dispatch({ type: 'PATCH', payload: { error: 'Không thể làm mới. Vui lòng thử lại sau.' } });
    } finally {
      dispatch({ type: 'PATCH', payload: { loading: false } });
    }
  };

  const resultCountLabel = useMemo(() => {
    if (!hasSearched || loading) return null;
    const tabLabel = TABS.find((t) => t.key === activeTab)?.label ?? '';
    return activeTab === 'all' ? `${results.length} kết quả` : `${results.length} kết quả · ${tabLabel}`;
  }, [hasSearched, loading, results.length, activeTab]);

  return (
    <LandTaxLayout user={user}>
      <div className="container py-4" style={{ maxWidth: '900px' }}>
        <div className="mb-4">
          <h3 className="fw-bold">Tra cứu tổng hợp</h3>
          <p className="text-muted">Tìm kiếm thông tin toàn hệ thống: đất đai, thuế, hồ sơ, thanh toán, khiếu nại...</p>
        </div>

        <SearchInputBar
          keyword={keyword}
          activeTab={activeTab}
          loading={loading}
          hasSearched={hasSearched}
          onKeywordChange={(v) => dispatch({ type: 'PATCH', payload: { keyword: v } })}
          onSearch={handleSearch}
          onRefresh={handleRefresh}
        />

        <SearchTabBar activeTab={activeTab} onTabChange={handleTabChange} getPillTabStyle={getPillTabStyle} />

        <SearchResultsPanel
          hasSearched={hasSearched}
          loading={loading}
          results={results}
          keyword={keyword}
          error={error}
          resultCountLabel={resultCountLabel}
          onRefresh={handleRefresh}
          onNewSearch={() => dispatch({ type: 'NEW_SEARCH' })}
          onNavigate={navigate}
        />

        {!hasSearched && <RecentSearchesPanel recentList={recentList} onSearch={handleSearch} />}

        <div className="text-center mt-5 text-muted small">
          Hệ thống Quản lý Thuế & Đất đai<br />Tích hợp cơ sở dữ liệu quốc gia
        </div>
      </div>
    </LandTaxLayout>
  );
};

export default SearchPage;
