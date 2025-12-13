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
export const ProductCard = ({ item, width = 400, height = 340 }) => {
  return (
    <Card
      sx={{
        width: `${width}px`,
        minWidth: `${width}px`,
        maxWidth: `${width}px`,
        height: `${height}px`,
        minHeight: `${height}px`,
        maxHeight: `${height}px`,
        boxSizing: 'border-box',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        p: 0, // 余白をゼロに
      }}
      component={Link}
      to={`/items/${item.item_id}`}
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <CardMedia
        component="img"
        sx={{
          width: '100%',
          maxWidth: '100%',
          display: 'block',
          height: `${height * 0.55}px`,
          maxHeight: `${height * 0.55}px`,
          objectFit: 'contain', // 縦横比維持で内側に収める
          overflow: 'hidden',
          backgroundColor: COLORS.BACKGROUND,
          borderRadius: 0
        }}
        image={item.image_url || PLACEHOLDER_IMAGE}
        alt={item.name}
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
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: `repeat(2, ${CARD_WIDTH}px)`,
        justifyContent: 'center',
        gap: `${GAP}px`,
        width: '100%',
        boxSizing: 'border-box'
      }}
    >
      {loading
        ? Array.from({ length: skeletonCount }).map((_, idx) => (
            <Box
              key={idx}
              sx={{
                width: `${CARD_WIDTH}px`,
                height: `${CARD_HEIGHT}px`,
                boxSizing: 'border-box',
                overflow: 'hidden'
              }}
            >
              <SkeletonCard />
            </Box>
          ))
        : items.map((item) => (
            <Box
              key={item.item_id}
              sx={{
                width: `${CARD_WIDTH}px`,
                height: `${CARD_HEIGHT}px`,
                boxSizing: 'border-box',
                overflow: 'hidden'
              }}
            >
              <ProductCard item={item} width={CARD_WIDTH} height={CARD_HEIGHT} />
            </Box>
          ))}
    </Box>
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
        borderRadius: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        marginBottom: 4,
        cursor: 'pointer',
        transition: 'all 0.3s ease',
      }}
    >
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
    </Box>
  );
};
