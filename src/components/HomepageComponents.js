
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
 * @param {Object} reasons - 商品IDをキーとするおすすめ理由オブジェクト（オプショナル）
 */
export const ProductGrid = ({ items, loading, skeletonCount = 4, reasons = {} }) => {
  const CARD_WIDTH = 400;
  const CARD_HEIGHT = 334;
  const hasReasons = Object.keys(reasons).length > 0;

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 0,
        justifyContent: 'flex-start',
        width: 'fit-content',
        margin: '0 auto',
        boxSizing: 'border-box',
        p: 0,
        m: 0,
      }}
    >
      {(loading
        ? Array.from({ length: skeletonCount }).map((_, idx) => ({ item: {}, key: idx }))
        : items.map((item) => ({ item, key: item.item_id })))
        .map(({ item, key }) => (
          <Box
            key={key}
            sx={{
              width: '400px',
              minWidth: '400px',
              maxWidth: '400px',
              height: hasReasons ? 'auto' : `${CARD_HEIGHT}px`,
              boxSizing: 'border-box',
              overflow: 'hidden',
              p: 0,
              m: 0,
            }}
          >
            <ProductCard
              item={item}
              height={CARD_HEIGHT}
              width={CARD_WIDTH}
              reason={reasons[item.item_id] || null}
            />
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

// ProductCardの正しい定義
export const ProductCard = ({ item, height = 334, width = 400, reason = null }) => {
  const IMAGE_HEIGHT = Math.round(height * 0.55); // 334pxの55% ≒ 184px

  // reasonがオブジェクト形式の場合は分解、文字列の場合はそのまま使用
  const reasonText = typeof reason === 'object' ? reason?.text : reason;
  const personaName = typeof reason === 'object' ? reason?.persona_name : null;
  const personaAvatarUrl = typeof reason === 'object' ? reason?.persona_avatar_url : null;

  return (
    <Card
      sx={{
        width: `${width}px`,
        minWidth: `${width}px`,
        maxWidth: `${width}px`,
        height: reason ? 'auto' : `${height}px`,
        minHeight: reason ? 'auto' : `${height}px`,
        maxHeight: reason ? 'none' : `${height}px`,
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
          height: `${IMAGE_HEIGHT}px`,
          maxHeight: `${IMAGE_HEIGHT}px`,
          objectFit: 'contain',
          backgroundColor: COLORS.BACKGROUND,
          borderRadius: 0,
          display: 'block',
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
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: COLORS.PRIMARY, mb: 0.5 }}>
          ¥{item.price?.toLocaleString() || '0'}
        </Typography>
        {/* 出品者＋いいね・コメント */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" sx={{ color: COLORS.TEXT_TERTIARY }}>
            {item.seller?.username || '不明'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {(item.like_count > 0 || item.comment_count > 0) && (
              <>
                {item.like_count > 0 && (
                  <Typography variant="caption" sx={{ color: '#ff6b6b', display: 'flex', alignItems: 'center', gap: 0.3 }}>
                    ❤ {item.like_count}
                  </Typography>
                )}
                {item.comment_count > 0 && (
                  <Typography variant="caption" sx={{ color: '#6bcfff', display: 'flex', alignItems: 'center', gap: 0.3 }}>
                    💬 {item.comment_count}
                  </Typography>
                )}
              </>
            )}
          </Box>
        </Box>
        {/* おすすめ理由（吹き出し風） */}
        {reasonText && (
          <Box sx={{
            mt: 1,
            p: 1,
            background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
            borderRadius: 1,
            fontSize: '12px',
            color: '#333',
          }}>
            {/* ペルソナ情報（アバター + 名前） */}
            {(personaName || personaAvatarUrl) && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                {personaAvatarUrl && (
                  <Box
                    component="img"
                    src={personaAvatarUrl}
                    alt={personaName || 'AI'}
                    sx={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '1px solid #ccc',
                    }}
                  />
                )}
                {personaName && (
                  <Typography sx={{ fontSize: '10px', color: '#666', fontWeight: 'bold' }}>
                    {personaName}
                  </Typography>
                )}
              </Box>
            )}
            💬 {reasonText}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

