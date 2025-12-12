// src/pages/homepage.js

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Grid, Card, CardContent, CardMedia, CardActions, Button, 
  Typography, Box, Skeleton, Alert, Select, MenuItem, FormControl
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import {
  API_BASE_URL,
  API_ENDPOINTS,
  CATEGORIES,
  SORT_OPTIONS,
  PAGINATION,
  COLORS,
  MESSAGES,
  PLACEHOLDER_IMAGE
} from '../config';

const Homepage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('newest');

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

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  // ソート関数
  const sortItems = (itemsToSort) => {
    const sorted = [...itemsToSort];
    switch(sortBy) {
      case 'price_low':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price_high':
        return sorted.sort((a, b) => b.price - a.price);
      case 'newest':
      default:
        return sorted;
    }
  };

  // カテゴリごとにグループ化
  const itemsByCategory = {};
  CATEGORIES.forEach(cat => {
    itemsByCategory[cat] = sortItems(
      items.filter(item => item.category === cat)
    );
  });

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
              <Button color="inherit" sx={{ color: '#ff0099' }}>
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