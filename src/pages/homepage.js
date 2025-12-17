// src/pages/homepage.js

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box, Alert, Select, MenuItem, FormControl, Tabs, Tab
} from '@mui/material';
import {
  API_BASE_URL,
  API_ENDPOINTS,
  CATEGORIES,
  SORT_OPTIONS,
  PAGINATION,
  COLORS,
  MESSAGES
} from '../config';
import {
  sortItems,
  groupByCategory,
  getNewestItems,
  applyFilters
} from '../utils/itemFilters';
import {
  SECTION_TYPES,
  getEnabledSections
} from '../utils/homepageConfig';
import {
  ProductGrid,
  SectionHeader,
  HeroBanner
} from '../components/HomepageComponents';
import RecommendPage from '../components/recommend_page';
import { useAuth } from '../contexts/auth_context';
import { usePageContext } from '../components/AIChatWidget';
import { buildItemContext } from '../hooks/useLLMAgent';

const Homepage = () => {
  const { currentUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('newest');
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || 'recommended');
  const [recommendOpen, setRecommendOpen] = useState(false);
  // ポップアップが閉じた後に履歴を再取得するためのフラグ
  const [recommendNeedsRefresh, setRecommendNeedsRefresh] = useState(false);

  // おすすめタブ用
  const [recommendedItems, setRecommendedItems] = useState([]);
  const [recommendReasons, setRecommendReasons] = useState({});
  const [recommendLoading, setRecommendLoading] = useState(false);

  const { setPageContext } = usePageContext();

  useEffect(() => {
    const loadItems = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ITEMS}`);

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setItems(data);

        // ★ ページコンテキストを設定（LLMに表示中の商品情報を伝える）
        setPageContext({
          page_type: 'homepage',
          visible_items: data.slice(0, 10).map(item => ({
            item_id: item.item_id,
            name: item.name,
            price: item.price,
            category: item.category,
            like_count: item.like_count || 0
          }))
        });

      } catch (err) {
        setError(MESSAGES.ERROR.ITEMS_LOAD_FAILED);
        console.error('Error fetching items:', err);
      } finally {
        setLoading(false);
      }
    };

    loadItems();

    // クリーンアップ時にコンテキストをクリア
    return () => setPageContext(null);
  }, [setPageContext]);


  // ホームページ表示時に、ログイン完了 or 1時間経過ならレコメンドをポップアップ
  useEffect(() => {
    // ここでは表示制御のみ。RecommendPage内で最終表示時刻や報酬処理を行う
    if (!currentUser) return;
    setRecommendOpen(true);
  }, [currentUser]);

  // おすすめタブ選択時 or ポップアップ閉じた後にDB履歴を取得
  useEffect(() => {
    // ポップアップが開いている間は履歴を取得しない
    if (recommendOpen) return;
    if (selectedCategory !== 'recommended' || !currentUser) return;
    // 初回表示時はポップアップが閉じてから取得
    if (!recommendNeedsRefresh && recommendedItems.length === 0) return;

    const fetchRecommendHistory = async () => {
      setRecommendLoading(true);
      try {
        // DB履歴を取得（理由付き）
        const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.RECOMMEND}/history?limit=20`, {
          method: 'GET',
          headers: {
            'X-Firebase-Uid': currentUser.uid,
          },
        });
        if (res.ok) {
          const data = await res.json();
          // 履歴を商品形式に変換
          const items = data.map(rec => ({
            item_id: rec.item_id,
            name: rec.name,
            price: rec.price,
            image_url: rec.image_url,
          }));
          // 理由マップを作成
          const reasons = {};
          data.forEach(rec => {
            if (rec.reason) {
              reasons[rec.item_id] = rec.reason;
            }
          });
          setRecommendedItems(items);
          setRecommendReasons(reasons);
        }
      } catch (e) {
        console.error('recommend history fetch failed:', e);
      } finally {
        setRecommendLoading(false);
        setRecommendNeedsRefresh(false);
      }
    };
    fetchRecommendHistory();
  }, [selectedCategory, currentUser, recommendOpen, recommendNeedsRefresh]);

  const handleCloseRecommend = useCallback(() => {
    setRecommendOpen(false);
    // ポップアップが閉じたら履歴を再取得
    setRecommendNeedsRefresh(true);
  }, []);
  const handleNavigateItem = useCallback((item) => {
    // ここで商品詳細へ遷移などを実装（既存のルーターに合わせてください）
    window.location.href = `/items/${item.id}`;
  }, []);

  // URLパラメータが変更されたらカテゴリを更新
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  // カテゴリ変更ハンドラー
  const handleCategoryChange = (event, newValue) => {
    setSelectedCategory(newValue);
    if (newValue === 'recommended') {
      setSearchParams({ category: 'recommended' });
    } else if (newValue === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ category: newValue });
    }
  };

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  // フィルター＆ソート済み商品を取得
  const filteredItems = applyFilters(items, {
    category: selectedCategory !== 'all' && selectedCategory !== 'recommended' ? selectedCategory : null,
    sortBy: sortBy
  });

  const itemsByCategory = groupByCategory(items, CATEGORIES);
  const sections = getEnabledSections();

  // セクション別のデータ取得
  const getSectionItems = (section) => {
    switch (section.type) {
      case SECTION_TYPES.NEWEST:
        return getNewestItems(items, section.config.count);

      case SECTION_TYPES.CATEGORY:
        return null; // カテゴリセクションは特別処理

      case SECTION_TYPES.RECOMMENDED:
        // 今後LLM APIと連携
        return [];

      default:
        return [];
    }
  };

  return (
    <Box>
      {recommendOpen && (
        <RecommendPage onClose={handleCloseRecommend} onNavigateItem={handleNavigateItem} />
      )}
      {/* ヒーローバナー */}
      {sections.find(s => s.type === 'hero') && (
        <HeroBanner
          title="🎉 新しい出会いを見つけよう"
          subtitle="あなたの「欲しい」がここにある"
          gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        />
      )}

      {/* カテゴリタブ */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={selectedCategory}
          onChange={handleCategoryChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 'bold'
            },
            '& .Mui-selected': {
              color: COLORS.PRIMARY
            }
          }}
        >
          <Tab label="おすすめ" value="recommended" />
          <Tab label="すべて" value="all" />
          {CATEGORIES.map(cat => (
            <Tab key={cat} label={cat} value={cat} />
          ))}
        </Tabs>
      </Box>

      {/* ソートコントロール */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'flex-end' }}>
        <FormControl sx={{ minWidth: 150 }}>
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            size="small"
          >
            {SORT_OPTIONS.map(opt => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* 商品表示 */}
      {selectedCategory !== 'all' && selectedCategory !== 'recommended' ? (
        // 単一カテゴリ表示
        <Box>
          <SectionHeader title={`📦 ${selectedCategory}`} showSeeAll={false} />
          <ProductGrid
            items={filteredItems}
            loading={loading}
            skeletonCount={8}
          />
          {!loading && filteredItems.length === 0 && (
            <Alert severity="info">このカテゴリには商品がありません</Alert>
          )}
        </Box>
      ) : selectedCategory === 'recommended' ? (
        // おすすめタブ（LLMレコメンド + 吹き出し理由）
        <Box>
          <SectionHeader title="✨ おすすめ" showSeeAll={false} />
          {recommendLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <Alert severity="info">AIがおすすめを考えています...</Alert>
            </Box>
          ) : recommendedItems.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {recommendedItems.map((item) => (
                <Box
                  key={item.item_id}
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: 2,
                    alignItems: 'flex-start',
                    cursor: 'pointer',
                    '&:hover': { transform: 'translateX(4px)', transition: 'transform 0.2s' }
                  }}
                  onClick={() => window.location.href = `/items/${item.item_id}`}
                >
                  {/* 商品カード（左側） */}
                  <Box sx={{
                    width: '180px',
                    minWidth: '180px',
                    border: '1px solid #ddd',
                    borderRadius: 2,
                    overflow: 'hidden',
                    background: '#fff',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}>
                    <Box sx={{ width: '180px', height: '180px', overflow: 'hidden' }}>
                      <img
                        src={item.image_url || '/placeholder.png'}
                        alt={item.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </Box>
                    <Box sx={{ p: 1 }}>
                      <Box sx={{ fontSize: '13px', fontWeight: 'bold', mb: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</Box>
                      <Box sx={{ fontSize: '14px', color: COLORS.PRIMARY, fontWeight: 'bold' }}>¥{item.price?.toLocaleString()}</Box>
                    </Box>
                  </Box>
                  {/* 吹き出し（右側・横向き） */}
                  {recommendReasons[item.item_id] && (
                    <Box sx={{
                      position: 'relative',
                      flex: 1,
                      maxWidth: '400px',
                      p: 2,
                      background: '#fff8e1',
                      borderRadius: 2,
                      fontSize: '13px',
                      color: '#333',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                      alignSelf: 'center',
                      // 左向きの三角形
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        left: '-8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: 0,
                        height: 0,
                        borderTop: '8px solid transparent',
                        borderBottom: '8px solid transparent',
                        borderRight: '8px solid #fff8e1',
                      }
                    }}>
                      💬 {recommendReasons[item.item_id]}
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          ) : (
            <ProductGrid
              items={sortItems(items, sortBy).slice(0, PAGINATION.ITEMS_PER_ROW)}
              loading={loading}
              skeletonCount={PAGINATION.ITEMS_PER_ROW}
            />
          )}
        </Box>
      ) : (
        // 全表示モード：セクションベース
        <>
          {sections.map(section => {
            if (section.type === 'hero') return null;

            if (section.type === SECTION_TYPES.NEWEST) {
              const newestItems = getSectionItems(section);
              if (newestItems.length === 0) return null;

              return (
                <Box key={section.id} sx={{ mb: 6 }}>
                  <SectionHeader
                    title={section.title}
                    showSeeAll={section.config.showSeeAll}
                  />
                  <ProductGrid
                    items={newestItems.slice(0, PAGINATION.ITEMS_PER_ROW)}
                    loading={loading}
                    skeletonCount={PAGINATION.ITEMS_PER_ROW}
                  />
                </Box>
              );
            }

            if (section.type === SECTION_TYPES.CATEGORY) {
              return CATEGORIES.map(category => {
                const categoryItems = sortItems(itemsByCategory[category], sortBy);

                if (categoryItems.length === 0) return null;

                return (
                  <Box key={category} sx={{ mb: 6 }}>
                    <SectionHeader
                      title={`📦 ${category}`}
                      onSeeAll={() => handleCategoryChange(null, category)}
                      showSeeAll={section.config.showSeeAll}
                    />
                    <ProductGrid
                      items={categoryItems.slice(0, PAGINATION.ITEMS_PER_ROW)}
                      loading={loading}
                      skeletonCount={PAGINATION.ITEMS_PER_ROW}
                    />
                  </Box>
                );
              });
            }

            return null;
          })}
        </>
      )}

      {/* 商品がない場合 */}
      {!loading && items.length === 0 && selectedCategory === 'all' && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Alert severity="info">{MESSAGES.EMPTY_STATE.NO_ITEMS}</Alert>
        </Box>
      )}
    </Box>
  );
};

export default Homepage;
