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
export const ProductCard = ({ item, height = 334 }) => {
  return (
    <Card
      sx={{
        width: '100%',
        height: `${height}px`,
        minHeight: `${height}px`,
        maxHeight: `${height}px`,
        boxSizing: 'border-box',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        p: 0,
      }}
      component={Link}
      to={item.item_id ? `/items/${item.item_id}` : '#'}
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <CardMedia
        component="img"
        sx={{
          width: '100%',
          height: '55%',
          objectFit: 'contain',
          backgroundColor: COLORS.BACKGROUND,
          borderRadius: 0,
        }}
        image={item.image_url || PLACEHOLDER_IMAGE}
        alt={item.name || ''}
      />

      {/* 商品情報 */}
      <CardContent sx={{ flex: 1, overflow: 'hidden', p: 1 }}>
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
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: COLORS.PRIMARY, mb: 1 }}>
          ¥{item.price?.toLocaleString() || '0'}
        </Typography>

        {/* 出品者 */}
        <Typography variant="caption" sx={{ color: COLORS.TEXT_TERTIARY, display: 'block', mb: 1 }}>
          {item.seller?.username || '不明'}
        </Typography>
      </CardContent>

      {/* 余計なアクションは削除して高さ揃え */}
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
  const CARD_WIDTH = 400;
  const CARD_HEIGHT = 340;
  const GAP = 16; // px
    return (
      <Grid container spacing={2} alignItems="stretch">
        {loading
          ? Array.from({ length: skeletonCount }).map((_, idx) => (
              <Grid item xs={12} sm={6} key={idx} sx={{ display: 'flex', alignItems: 'stretch' }}>
                <ProductCard item={{}} height={CARD_HEIGHT} />
              </Grid>
            ))
          : items.map((item) => (
              <Grid item xs={12} sm={6} key={item.item_id} sx={{ display: 'flex', alignItems: 'stretch' }}>
                <ProductCard item={item} height={CARD_HEIGHT} />
              </Grid>
            ))}
      </Grid>
    );
}

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
        return (
          <Card
            sx={{
              width: '100%',
              height: `${height}px`,
              minHeight: `${height}px`,
              maxHeight: `${height}px`,
              boxSizing: 'border-box',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              cursor: 'pointer',
              p: 0,
            }}
            component={Link}
            to={item.item_id ? `/items/${item.item_id}` : '#'}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <CardMedia
              component="img"
              sx={{
                width: '100%',
                height: '55%',
                objectFit: 'contain',
                backgroundColor: COLORS.BACKGROUND,
                borderRadius: 0,
              }}
              image={item.image_url || PLACEHOLDER_IMAGE}
              alt={item.name || ''}
            />
        marginBottom: 4,
