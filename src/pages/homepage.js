// src/pages/homepage.js

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box, Alert, Select, MenuItem, FormControl, Tabs, Tab, LinearProgress, Typography
} from '@mui/material';
import {
  API_BASE_URL,
  API_ENDPOINTS,
  CATEGORIES,
  SORT_OPTIONS,
  PAGINATION,
  COLORS,
  MESSAGES,
  RECOMMEND_COOLDOWN_MINUTES
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
import MissionBanner from '../components/MissionBanner';
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

  // クールダウンゲージ用（次回おすすめまでの残り時間）
  const [cooldownProgress, setCooldownProgress] = useState(0);
  const [cooldownRemaining, setCooldownRemaining] = useState('');

  // クールダウンゲージを更新するタイマー（ログインユーザー専用）
  useEffect(() => {
    // ログインしていない場合はタイマーを動かさない
    if (!currentUser) {
      setCooldownProgress(0);
      setCooldownRemaining('');
      return;
    }

    // ユーザー固有のストレージキー
    const STORAGE_KEY = `lastRecommendAt_${currentUser.uid}`;

    const updateCooldown = () => {
      const lastAt = localStorage.getItem(STORAGE_KEY);
      if (!lastAt) {
        setCooldownProgress(100);
        setCooldownRemaining('準備完了！');
        return;
      }

      const elapsedMs = Date.now() - new Date(lastAt).getTime();
      const cooldownMs = RECOMMEND_COOLDOWN_MINUTES * 60 * 1000;
      const remainingMs = Math.max(0, cooldownMs - elapsedMs);
      const progress = Math.min(100, (elapsedMs / cooldownMs) * 100);

      setCooldownProgress(progress);

      if (remainingMs <= 0) {
        setCooldownRemaining('準備完了！');
      } else {
        const mins = Math.floor(remainingMs / 60000);
        const secs = Math.floor((remainingMs % 60000) / 1000);
        setCooldownRemaining(`${mins}分${secs}秒`);
      }
    };

    // 初回更新
    updateCooldown();

    // 1秒ごとに更新
    const timer = setInterval(updateCooldown, 1000);
    return () => clearInterval(timer);
  }, [currentUser]);

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

      } catch (err) {
        setError(MESSAGES.ERROR.ITEMS_LOAD_FAILED);
        console.error('Error fetching items:', err);
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, []);

  // ★ カテゴリに応じてページコンテキストを更新（LLMに正しい商品情報を伝える）
  useEffect(() => {
    // おすすめタブの場合はおすすめ商品を、それ以外は全商品を渡す
    const visibleItems = selectedCategory === 'recommended'
      ? recommendedItems
      : items;

    setPageContext({
      page_type: selectedCategory === 'recommended' ? 'recommend_page' : 'homepage',
      current_category: selectedCategory,
      visible_items: visibleItems.slice(0, 10).map(item => ({
        item_id: item.item_id,
        name: item.name,
        price: item.price,
        category: item.category,
        like_count: item.like_count || 0
      })),
      user_gacha_points: currentUser?.gacha_points || 0,
    });

    // クリーンアップ時にコンテキストをクリア
    return () => setPageContext(null);
  }, [selectedCategory, items, recommendedItems, currentUser, setPageContext]);


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
          // 履歴を商品形式に変換（直近4件のみ）
          const items = data.slice(0, 4).map(rec => ({
            item_id: rec.item_id,
            name: rec.name,
            price: rec.price,
            image_url: rec.image_url,
            status: rec.status || 'on_sale',
          }));
          // 理由マップを作成（ペルソナ名も含む）
          const reasons = {};
          data.slice(0, 4).forEach(rec => {
            if (rec.reason) {
              reasons[rec.item_id] = {
                text: rec.reason,
                persona_name: rec.persona_name || null,
                persona_avatar_url: rec.persona_avatar_url || null
              };
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
          title="🎉 過去と未来をつなぐフリマアプリ"
          subtitle="AIと一緒に、あなただけの宝物を探そう"
          gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        />
      )}

      {/* ミッションバナー */}
      <MissionBanner />

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

          {/* クールダウンゲージ（次回AIおすすめまで）- ログイン時のみ表示 */}
          {currentUser && (
            <Box sx={{
              mb: 3,
              p: 2,
              backgroundColor: '#1a1a2e',
              borderRadius: 2,
              border: `1px solid ${cooldownProgress >= 100 ? COLORS.PRIMARY : '#444'}`
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography sx={{
                  fontSize: '0.85rem',
                  color: cooldownProgress >= 100 ? COLORS.PRIMARY : '#aaa',
                  fontFamily: '"VT323", monospace'
                }}>
                  🤖 次のAIおすすめまで
                </Typography>
                <Typography sx={{
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  color: cooldownProgress >= 100 ? COLORS.PRIMARY : '#fff',
                  fontFamily: '"VT323", monospace'
                }}>
                  {cooldownRemaining}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={cooldownProgress}
                sx={{
                  height: 8,
                  borderRadius: 1,
                  backgroundColor: '#333',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: cooldownProgress >= 100 ? COLORS.PRIMARY : '#4ade80',
                    transition: 'transform 0.5s ease',
                  }
                }}
              />
            </Box>
          )}

          {recommendLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <Alert severity="info">AIがおすすめを考えています...</Alert>
            </Box>
          ) : recommendedItems.length > 0 ? (
            <ProductGrid
              items={recommendedItems}
              loading={false}
              skeletonCount={4}
              reasons={recommendReasons}
            />
          ) : (
            <ProductGrid
              items={sortItems(items, sortBy).slice(0, PAGINATION.ITEMS_PER_ROW)}
              loading={loading}
              skeletonCount={PAGINATION.ITEMS_PER_ROW}
            />
          )}
        </Box>
      ) : (
        // 全表示モード：シンプルに全商品をソートして表示
        <Box>
          <ProductGrid
            items={sortItems(items, sortBy)}
            loading={loading}
            skeletonCount={12}
          />
          {!loading && items.length === 0 && (
            <Alert severity="info">{MESSAGES.EMPTY_STATE.NO_ITEMS}</Alert>
          )}
        </Box>
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
