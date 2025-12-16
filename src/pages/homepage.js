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

  const handleCloseRecommend = useCallback(() => setRecommendOpen(false), []);
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
        // おすすめタブ（ソート適用）
        <Box>
          <SectionHeader title="✨ おすすめ" showSeeAll={false} />
          <ProductGrid
            items={sortItems(items, sortBy).slice(0, PAGINATION.ITEMS_PER_ROW)}
            loading={loading}
            skeletonCount={PAGINATION.ITEMS_PER_ROW}
          />
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
