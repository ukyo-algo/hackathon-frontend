// src/pages/homepage.js

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Grid, Card, CardContent, CardMedia, CardActions, Button, 
  Typography, Box, Skeleton, Alert, Chip, Rating
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

const API_URL = process.env.REACT_APP_API_URL;

const Homepage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadItems = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`${API_URL}/api/v1/items`); 
        
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setItems(data);
      
      } catch (err) {
        setError('商品の読み込みに失敗しました。');
        console.error("Error fetching items:", err);
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, []);

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      {/* ページヘッダー */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
          いらっしゃいませ！
        </Typography>
        <Typography variant="body1" sx={{ color: '#666' }}>
          {loading ? '商品を読み込み中...' : `全 ${items.length} 件の商品`}
        </Typography>
      </Box>

      {/* 商品グリッド */}
      <Grid container spacing={2}>
        {loading ? (
          // ローディングスケルトン
          Array.from({ length: 8 }).map((_, idx) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={idx}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Skeleton variant="rectangular" height={200} />
                <CardContent>
                  <Skeleton width="80%" sx={{ mb: 1 }} />
                  <Skeleton width="60%" sx={{ mb: 2 }} />
                  <Skeleton width="40%" />
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          items.map((item) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={item.item_id}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 4
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
                  image={item.image_url || '/placeholder.png'}
                  alt={item.name}
                  sx={{ 
                    objectFit: 'cover',
                    backgroundColor: '#f5f5f5'
                  }}
                />

                {/* 商品情報 */}
                <CardContent sx={{ flex: 1 }}>
                  {/* 商品名 */}
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      fontWeight: 'bold',
                      mb: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}
                  >
                    {item.name}
                  </Typography>

                  {/* 価格 */}
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#d32f2f' }}>
                      ¥{item.price?.toLocaleString() || '0'}
                    </Typography>
                  </Box>

                  {/* 出品者 */}
                  <Typography variant="caption" sx={{ color: '#999', display: 'block', mb: 1 }}>
                    出品者: {item.seller?.username || '不明'}
                  </Typography>

                  {/* 評価 */}
                  {item.rating && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Rating value={item.rating} readOnly size="small" />
                      <Typography variant="caption" sx={{ color: '#999' }}>
                        ({item.review_count || 0})
                      </Typography>
                    </Box>
                  )}
                </CardContent>

                {/* アクションボタン */}
                <CardActions sx={{ justifyContent: 'space-between', pt: 0 }}>
                  <Button 
                    size="small" 
                    startIcon={<ShoppingCartIcon />}
                    variant="contained"
                    sx={{ flex: 1 }}
                  >
                    購入
                  </Button>
                  <Button 
                    size="small" 
                    icon={<FavoriteBorderIcon />}
                    sx={{ minWidth: 'auto' }}
                  >
                    <FavoriteBorderIcon />
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* 商品がない場合 */}
      {!loading && items.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" sx={{ color: '#999', mb: 2 }}>
            商品がありません
          </Typography>
          <Button variant="contained" href="/" sx={{ mt: 2 }}>
            戻る
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default Homepage;