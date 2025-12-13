// src/pages/item_detail_page.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/auth_context';
import {
  Box, Container, Grid, Card, CardContent, CardMedia, Button, Typography,
  TextField, IconButton, Tabs, Tab, Paper, Avatar, Chip, Rating,
  Alert, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
  List, ListItem, ListItemAvatar, ListItemText, Divider
} from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import SendIcon from '@mui/icons-material/Send';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

const ItemDetailPage = () => {
  const { itemId } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [buying, setBuying] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [buyConfirmOpen, setBuyConfirmOpen] = useState(false);

  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL;

  // 商品データの取得
  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/v1/items/${itemId}`);
        if (!response.ok) throw new Error('商品の取得に失敗しました');
        
        const data = await response.json();
        setItem(data);
        setLikeCount(data.like_count || 0);
        
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [itemId, API_URL]);

  // レコメンド商品の取得
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await fetch(`${API_URL}/api/v1/items/${itemId}/recommend`);
        if (response.ok) setRecommendations(await response.json());
      } catch (err) {
        console.error("Failed to fetch recommendations:", err);
      }
    };
    if (itemId) fetchRecommendations();
  }, [itemId, API_URL]);

  // いいねボタンの処理
  const handleLike = async () => {
    if (!currentUser) return navigate('/login');

    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);

    try {
      await fetch(`${API_URL}/api/v1/items/${itemId}/like`, {
        method: 'POST',
        headers: { 'X-Firebase-Uid': currentUser.uid },
      });
    } catch (err) {
      console.error("Like failed", err);
      setIsLiked(!isLiked);
      setLikeCount(prev => isLiked ? prev + 1 : prev - 1);
    }
  };

  // コメント投稿処理
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return navigate('/login');
    if (!commentText.trim()) return;

    try {
      const response = await fetch(`${API_URL}/api/v1/items/${itemId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Firebase-Uid': currentUser.uid,
        },
        body: JSON.stringify({ content: commentText }),
      });

      if (response.ok) {
        const newComment = await response.json();
        setItem(prev => ({
          ...prev,
          comments: [newComment, ...(prev.comments || [])]
        }));
        setCommentText("");
      }
    } catch (err) {
      alert("コメントの投稿に失敗しました");
    }
  };

  // 購入処理
  const handleBuy = async () => {
    if (!currentUser) {
      alert("購入するにはログインが必要です");
      navigate('/login');
      return;
    }
    setBuyConfirmOpen(true);
  };

  const confirmBuy = async () => {
    setBuyConfirmOpen(false);
    try {
      setBuying(true);
      const response = await fetch(`${API_URL}/api/v1/items/${itemId}/buy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Firebase-Uid': currentUser.uid,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || '購入に失敗しました');
      }
      alert("購入が完了しました！🎉");
      window.location.reload();
    } catch (err) {
      alert(err.message);
    } finally {
      setBuying(false);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>;
  if (!item) return <Alert severity="warning" sx={{ m: 2 }}>商品が見つかりません</Alert>;

  const isSold = item.status === 'sold';
  const isMyItem = currentUser && item.seller.firebase_uid === currentUser.uid;

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Grid container spacing={4}>
        {/* 左側: 商品画像 */}
        <Grid item xs={12} md={6}>
          <Box sx={{ position: 'relative' }}>
            <CardMedia
              component="img"
              image={item.image_url || "/placeholder.png"}
              alt={item.name}
              sx={{
                borderRadius: 2,
                objectFit: 'cover',
                height: 400,
                opacity: isSold ? 0.5 : 1
              }}
            />
            {isSold && (
              <Box sx={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0,0,0,0.3)',
                borderRadius: 2
              }}>
                <Typography variant="h2" sx={{ color: 'white', fontWeight: 'bold', transform: 'rotate(-15deg)' }}>
                  SOLD
                </Typography>
              </Box>
            )}
          </Box>
        </Grid>

        {/* 右側: 商品情報 */}
        <Grid item xs={12} md={6}>
          {/* 商品タイトル */}
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
            {item.name}
          </Typography>

          {/* 出品者情報 */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Avatar alt={item.seller.username} sx={{ width: 40, height: 40 }} />
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                {item.seller.username}
              </Typography>
              <Rating value={item.seller.rating || 0} readOnly size="small" />
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* 価格とアクション */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#d32f2f' }}>
              ¥{item.price?.toLocaleString() || '0'}
            </Typography>
            <Button
              startIcon={isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              onClick={handleLike}
              color={isLiked ? "error" : "inherit"}
            >
              {likeCount}
            </Button>
          </Box>

          {/* 商品情報テーブル */}
          <Paper sx={{ p: 2, mb: 3, backgroundColor: '#f5f5f5' }}>
            <Grid container spacing={2}>
              <Grid item xs={6}><Typography variant="caption" sx={{ color: '#666' }}>カテゴリ</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2">{item.category}</Typography></Grid>
              <Grid item xs={6}><Typography variant="caption" sx={{ color: '#666' }}>状態</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2">{item.condition}</Typography></Grid>
              <Grid item xs={6}><Typography variant="caption" sx={{ color: '#666' }}>発送予定</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2">{item.shipping_days || '1-2日'}</Typography></Grid>
            </Grid>
          </Paper>

          {/* 購入ボタン */}
          {isSold ? (
            <Button fullWidth disabled variant="contained" sx={{ mb: 2 }}>
              売り切れました
            </Button>
          ) : isMyItem ? (
            <Button fullWidth disabled variant="contained" sx={{ mb: 2 }}>
              自分で出品した商品です
            </Button>
          ) : (
            <Button
              fullWidth
              variant="contained"
              startIcon={<ShoppingCartIcon />}
              onClick={handleBuy}
              disabled={buying}
              sx={{ mb: 2, py: 1.5 }}
            >
              {buying ? '処理中...' : '購入する'}
            </Button>
          )}

          {/* 商品説明 */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
              商品説明
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', color: '#666' }}>
              {item.description}
            </Typography>
          </Box>
        </Grid>

        {/* コメントセクション */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              コメント ({item.comment_count || 0})
            </Typography>

            {/* コメントリスト */}
            {(!item.comments || item.comments.length === 0) ? (
              <Alert severity="info">コメントはまだありません</Alert>
            ) : (
              <List sx={{ maxHeight: 400, overflowY: 'auto', mb: 3 }}>
                {item.comments.map((comment, idx) => (
                  <React.Fragment key={comment.comment_id}>
                    <ListItem alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar alt={comment.user.username} />
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                              {comment.user.username}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#999' }}>
                              {new Date(comment.created_at).toLocaleDateString()}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Typography variant="body2" sx={{ mt: 1, color: '#333' }}>
                            {comment.content}
                          </Typography>
                        }
                      />
                    </ListItem>
                    {idx < item.comments.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            )}

            {/* コメント投稿フォーム */}
            <Box component="form" onSubmit={handleCommentSubmit} sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                multiline
                maxRows={2}
                placeholder="コメントを入力..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                variant="outlined"
                size="small"
              />
              <IconButton type="submit" disabled={!commentText.trim()} color="primary">
                <SendIcon />
              </IconButton>
            </Box>
          </Paper>
        </Grid>

        {/* おすすめ商品 */}
        {recommendations.length > 0 && (
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              こちらもおすすめ
            </Typography>
            <Grid container spacing={2}>
              {recommendations.map(rec => (
                <Grid item xs={12} sm={6} md={3} key={rec.item_id}>
                  <Card
                    component={Link}
                    to={`/items/${rec.item_id}`}
                    sx={{ textDecoration: 'none', color: 'inherit', height: '100%', transition: 'all 0.3s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 2 } }}
                  >
                    <CardMedia
                      component="img"
                      height="150"
                      image={rec.image_url}
                      alt={rec.name}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {rec.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#d32f2f', fontWeight: 'bold', mt: 1 }}>
                        ¥{rec.price?.toLocaleString() || '0'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
        )}
      </Grid>

      {/* 購入確認ダイアログ */}
      <Dialog open={buyConfirmOpen} onClose={() => setBuyConfirmOpen(false)}>
        <DialogTitle>購入確認</DialogTitle>
        <DialogContent>
          <Typography>「{item?.name}」を ¥{item?.price?.toLocaleString()} で購入しますか？</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBuyConfirmOpen(false)}>キャンセル</Button>
          <Button onClick={confirmBuy} variant="contained">購入する</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ItemDetailPage;