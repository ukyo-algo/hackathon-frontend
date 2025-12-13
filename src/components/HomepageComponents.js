/**
 * Homepage用コンポーネント
 * 商品表示の再利用可能なコンポーネント群
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  Grid, Card, CardContent, CardMedia, CardActions, Button,
  Typography, Box, Skeleton
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { COLORS, PLACEHOLDER_IMAGE } from '../config';

/**
 * 商品カードコンポーネント
 * @param {Object} item - 商品データ
 */
export const ProductCard = ({ item }) => {
  // 画像URLのデバッグログ
  console.log('ProductCard image_url:', item.image_url, 'for item:', item.name);
  
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

/**
 * スケルトンカード（ローディング表示用）
 */
export const SkeletonCard = () => {
  return (
    <Card sx={{ height: '100%' }}>
      <Skeleton variant="rectangular" height={200} />
      <CardContent>
        <Skeleton width="80%" sx={{ mb: 1 }} />
        <Skeleton width="60%" />
      </CardContent>
    </Card>
  );
};

/**
 * セクションヘッダー
 * @param {string} title - タイトル
 * @param {Function} onSeeAll - 「すべて見る」クリック時のハンドラー
 * @param {boolean} showSeeAll - 「すべて見る」ボタン表示フラグ
 */
export const SectionHeader = ({ title, onSeeAll, showSeeAll = true }) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
        {title}
      </Typography>
      {showSeeAll && onSeeAll && (
        <Button
          color="inherit"
          sx={{ color: COLORS.PRIMARY }}
          onClick={onSeeAll}
        >
          すべて見る →
        </Button>
      )}
    </Box>
  );
};

/**
 * 商品グリッド
 * @param {Array} items - 商品配列
 * @param {boolean} loading - ローディング状態
 * @param {number} skeletonCount - スケルトン表示数
 */
export const ProductGrid = ({ items, loading, skeletonCount = 4 }) => {
  return (
    <Grid container spacing={2}>
      {loading ? (
        Array.from({ length: skeletonCount }).map((_, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <SkeletonCard />
          </Grid>
        ))
      ) : (
        items.map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item.item_id}>
            <ProductCard item={item} />
          </Grid>
        ))
      )}
    </Grid>
  );
};

/**
 * ヒーローバナー
 * @param {string} title - タイトル
 * @param {string} subtitle - サブタイトル
 * @param {string} gradient - グラデーション背景
 */
export const HeroBanner = ({ title, subtitle, gradient }) => {
  return (
    <Box
      sx={{
        height: '300px',
        background: gradient,
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
          {title}
        </Typography>
        <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)' }}>
          {subtitle}
        </Typography>
      </Box>
    </Box>
  );
};
