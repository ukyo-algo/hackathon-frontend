// src/pages/homepage.js

import React, { useState, useEffect } from 'react';
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
  filterByCategory,
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

const Homepage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('newest');
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || 'all');

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

  // URLパラメータが変更されたらカテゴリを更新
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  // カテゴリ変更ハンドラー
  const handleCategoryChange = (event, newValue) => {
    setSelectedCategory(newValue);
    if (newValue === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ category: newValue });
    }
  };

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  // フィルター＆ソート済み商品を取得
  const getFilteredItems = () => {
    return applyFilters(items, {
      category: selectedCategory !== 'all' ? selectedCategory : null,
      sortBy: sortBy
    });
  };

  const filteredItems = getFilteredItems();
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
      {/* ヒーローバナー */}
      <Box
        sx={{
          height: '300px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          marginBottom: 4,
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: 4
          }
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 2 }}>
            🎉 新しい出会いを見つけよう
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)' }}>
            あなたの「欲しい」がここにある
          </Typography>
        </Box>
      </Box>

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

      {/* 商品表示：カテゴリ選択時は単一グリッド、全表示時はセクション分け */}
      {selectedCategory !== 'all' ? (
        // 単一カテゴリ表示
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
            📦 {selectedCategory}
          </Typography>
          <Grid container spacing={2}>
            {loading ? (
              Array.from({ length: 8 }).map((_, idx) => (
                <Grid item xs={12} sm={6} md={3} key={idx}>
                  <Card sx={{ height: '100%' }}>
                    <Skeleton variant="rectangular" height={200} />
                    <CardContent>
                      <Skeleton width="80%" sx={{ mb: 1 }} />
                      <Skeleton width="60%" />
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <Grid item xs={12} sm={6} md={3} key={item.item_id}>
                  <ProductCard item={item} />
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Alert severity="info">このカテゴリには商品がありません</Alert>
              </Grid>
            )}
          </Grid>
        </Box>
      ) : (
        // 全カテゴリ表示（セクション分け）
        <>
      {/* カテゴリごとのセクション */}
      {CATEGORIES.map(category => {
        const categoryItems = itemsByCategory[category];
        
        if (categoryItems.length === 0) return null;

        return (
          <Box key={category} sx={{ mb: 6 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                📦 {category}
              </Typography>
              <Button 
                color="inherit" 
                sx={{ color: COLORS.PRIMARY }}
                onClick={() => handleCategoryChange(null, category)}
              >
                すべて見る →
              </Button>
            </Box>

            <Grid container spacing={2}>
              {loading ? (
                Array.from({ length: PAGINATION.ITEMS_PER_ROW }).map((_, idx) => (
                  <Grid item xs={12} sm={6} md={3} key={idx}>
                    <Card sx={{ height: '100%' }}>
                      <Skeleton variant="rectangular" height={200} />
                      <CardContent>
                        <Skeleton width="80%" sx={{ mb: 1 }} />
                        <Skeleton width="60%" />
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              ) : (
                categoryItems.slice(0, PAGINATION.ITEMS_PER_ROW).map((item) => (
                  <Grid item xs={12} sm={6} md={3} key={item.item_id}>
                    <ProductCard item={item} />
                  </Grid>
                ))
              )}
            </Grid>
          </Box>
        );
      })}
        </>
      )}

      {/* 商品がない場合 */}
      {!loading && items.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" sx={{ color: COLORS.TEXT_TERTIARY, mb: 2 }}>
            {MESSAGES.EMPTY_STATE.NO_ITEMS}
          </Typography>
          <Button variant="contained" href="/" sx={{ mt: 2 }}>
            戻る
          </Button>
        </Box>
      )}
    </Box>
  );
};

// 商品カードコンポーネント
/**
 * @param {Object} item - 商品データ
 */
const ProductCard = ({ item }) => {
  return (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex', 
        flexDirection: 'column',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 3
        }
      }}
      component={Link}
      to={`/items/${item.item_id}`}
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      {/* 商品画像 */}
      <CardMedia
        component="img"
        height={200}
        image={item.image_url || PLACEHOLDER_IMAGE}
        alt={item.name}
        sx={{ 
          objectFit: 'cover',
          backgroundColor: COLORS.BACKGROUND
        }}
      />

      {/* 商品情報 */}
      <CardContent sx={{ flex: 1 }}>
        {/* 商品名 */}
        <Typography 
          variant="subtitle2" 
          sx={{ 
            fontWeight: '600',
            mb: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            minHeight: '40px'
          }}
        >
          {item.name}
        </Typography>

        {/* 価格 */}
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: COLORS.PRIMARY }}>
            ¥{item.price?.toLocaleString() || '0'}
          </Typography>
        </Box>

        {/* 出品者 */}
        <Typography variant="caption" sx={{ color: COLORS.TEXT_TERTIARY, display: 'block', mb: 1 }}>
          {item.seller?.username || '不明'}
        </Typography>
      </CardContent>

      {/* アクションボタン */}
      <CardActions sx={{ pt: 0 }}>
        <Button 
          size="small" 
          startIcon={<ShoppingCartIcon />}
          variant="contained"
          sx={{ 
            flex: 1, 
            backgroundColor: COLORS.PRIMARY, 
            '&:hover': { backgroundColor: COLORS.PRIMARY_DARK } 
          }}
        >
          購入
        </Button>
      </CardActions>
    </Card>
  );
};

export default Homepage;