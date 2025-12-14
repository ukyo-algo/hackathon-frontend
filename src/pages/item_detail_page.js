// src/pages/item_detail_page.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/auth_context';
import {
  Box, Container, Grid, Card, CardContent, CardMedia, Button, Typography,
  TextField, IconButton, Paper, Avatar, Rating,
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
  const [buyConfirmOpen, setBuyConfirmOpen] = useState(false);

  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  // --- データ取得ロジック ---
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

  // --- イベントハンドラ ---
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
      setIsLiked(!isLiked);
      setLikeCount(prev => isLiked ? prev + 1 : prev - 1);
    }
  };

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
          comments: [newComment, ...(prev.comments || [])],
          comment_count: (prev.comment_count || 0) + 1
        }));
        setCommentText("");
      }
    } catch (err) {
      alert("コメントの投稿に失敗しました");
    }
  };

  const handleBuy = async () => {
    if (!currentUser) {
      alert("購入するにはログインが必要です");
      navigate('/login');
      return;
    }
    // 購入ページへ遷移
    navigate(`/buy/${itemId}`);
  };

  // 旧ダイアログ用confirmBuyは購入ページ遷移に置き換え
  const confirmBuy = () => {
    navigate(`/buy/${itemId}`);
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>;
  if (!item) return <Alert severity="warning" sx={{ m: 2 }}>商品が見つかりません</Alert>;

  const isSold = item.status === 'sold';
  const isMyItem = currentUser && item.seller?.firebase_uid === currentUser.uid;

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      
      {/* ★エリア1: 商品情報（Gridシステム）
        ここは「左に画像、右に文字」という配置にするためにGridを使います。
      */}
      <Grid container spacing={4} sx={{ mb: 6 }}>
        {/* 左側: 商品画像 (12分割中の6を使う = 半分) */}
        <Grid item xs={12} md={6}>
          <Box sx={{ position: 'relative', width: '100%', aspectRatio: '1/1', bgcolor: '#f0f0f0', borderRadius: 2, overflow: 'hidden' }}>
            <CardMedia
              component="img"
              image={item.image_url || "/placeholder.png"}
              alt={item.name}
              sx={{ width: '100%', height: '100%', objectFit: 'cover', opacity: isSold ? 0.5 : 1 }}
            />
            {isSold && (
              <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)' }}>
                <Typography variant="h2" sx={{ color: 'white', fontWeight: 'bold', transform: 'rotate(-15deg)' }}>SOLD</Typography>
              </Box>
            )}
          </Box>
        </Grid>

        {/* 右側: 商品情報 (12分割中の6を使う = 半分) */}
        <Grid item xs={12} md={6}>
          {/* minWidth: 0 で文字のはみ出し防止 */}
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2, overflowWrap: 'anywhere' }}>{item.name}</Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar alt={item.seller?.username} sx={{ width: 40, height: 40 }} />
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{item.seller?.username || '不明なユーザー'}</Typography>
                <Rating value={item.seller?.rating || 0} readOnly size="small" />
              </Box>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#d32f2f' }}>¥{item.price?.toLocaleString() || '0'}</Typography>
              <Button startIcon={isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />} onClick={handleLike} color={isLiked ? "error" : "inherit"} size="large">{likeCount}</Button>
            </Box>
            
            <Paper sx={{ p: 2, mb: 3, backgroundColor: '#f9f9f9', borderRadius: 2 }} variant="outlined">
              <Grid container spacing={2}>
                <Grid item xs={4}><Typography variant="caption" sx={{ color: '#666' }}>カテゴリ</Typography></Grid>
                <Grid item xs={8}><Typography variant="body2">{item.category}</Typography></Grid>
                <Grid item xs={4}><Typography variant="caption" sx={{ color: '#666' }}>状態</Typography></Grid>
                <Grid item xs={8}><Typography variant="body2">{item.condition}</Typography></Grid>
                <Grid item xs={4}><Typography variant="caption" sx={{ color: '#666' }}>発送予定</Typography></Grid>
                <Grid item xs={8}><Typography variant="body2">{item.shipping_days || '1-2日'}</Typography></Grid>
              </Grid>
            </Paper>

            {isSold ? (
              <Button fullWidth disabled variant="contained" size="large" sx={{ mb: 2, py: 1.5, bgcolor: '#ccc' }}>売り切れました</Button>
            ) : isMyItem ? (
              <Button fullWidth disabled variant="contained" size="large" sx={{ mb: 2, py: 1.5 }}>自分で出品した商品です</Button>
            ) : (
              <Button fullWidth variant="contained" color="primary" startIcon={<ShoppingCartIcon />} onClick={handleBuy} disabled={buying} sx={{ mb: 2, py: 1.5, fontWeight: 'bold', fontSize: '1.1rem' }}>{buying ? '処理中...' : '購入手続きへ'}</Button>
            )}

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>商品説明</Typography>
              <Paper variant="outlined" sx={{ p: 2, minHeight: '100px', bgcolor: '#fff' }}>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', color: '#333', lineHeight: 1.6, overflowWrap: 'anywhere' }}>{item.description}</Typography>
              </Paper>
            </Box>
          </Box>
        </Grid>
      </Grid> 
      {/* ★ここでGrid終了！ここからはGridの影響を受けません */}


      {/* ★エリア2: コメントセクション（黒板エリア）
        Gridの外に出したので、親のContainerの幅（最大幅）いっぱいに固定されます。
        これで文字数によるレイアウト崩れは100%起きません。
      */}
      <Paper 
        elevation={3}
        sx={{ 
          width: '100%',        // 横幅いっぱい（固定）
          height: '500px',      // 高さ500px（固定）
          p: 3, 
          mb: 6,
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          bgcolor: '#fff',
          border: '1px solid #e0e0e0'
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
          コメント ({item.comment_count || 0})
        </Typography>

        {/* コメントリスト（スクロールエリア） */}
        <Box sx={{ 
          flexGrow: 1, 
          overflowY: 'auto', 
          mb: 2,
          border: '1px solid #eee',
          borderRadius: 1,
          p: 2,
          width: '100%' 
        }}>
          {(!item.comments || item.comments.length === 0) ? (
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
               <Typography variant="body1" fontWeight="bold">コメントはまだありません</Typography>
               <Typography variant="caption">最初のコメントを投稿してみましょう！</Typography>
            </Box>
          ) : (
            <List sx={{ width: '100%', p: 0 }}>
              {item.comments.map((comment, idx) => (
                <React.Fragment key={comment.comment_id || idx}>
                  <ListItem alignItems="flex-start" sx={{ px: 0, width: '100%' }}>
                    <ListItemAvatar>
                      <Avatar alt={comment.user?.username} src={comment.user?.avatar_url} />
                    </ListItemAvatar>
                    
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                            {comment.user?.username || 'ユーザー'}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#999' }}>
                            {comment.created_at ? new Date(comment.created_at).toLocaleDateString() : ''}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Typography 
                          component="div" 
                          variant="body2" 
                          sx={{ 
                            color: '#333', 
                            whiteSpace: 'pre-wrap', 
                            // ★黒板からはみ出さないための鉄壁設定
                            overflowWrap: 'anywhere', 
                            wordBreak: 'break-all',
                            width: '100%'
                          }}
                        >
                          {comment.content}
                        </Typography>
                      }
                      sx={{ m: 0, width: '100%' }}
                    />
                  </ListItem>
                  {idx < item.comments.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>

        {/* 投稿フォーム */}
        <Box component="form" onSubmit={handleCommentSubmit} sx={{ display: 'flex', gap: 1, alignItems: 'center', pt: 2, borderTop: '1px solid #eee', width: '100%' }}>
          <TextField
            fullWidth
            multiline
            maxRows={2}
            placeholder="コメントを入力..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            variant="outlined"
            size="small"
            sx={{ bgcolor: '#fff' }}
          />
          <IconButton 
            type="submit" 
            disabled={!commentText.trim()} 
            color="primary"
            sx={{ bgcolor: commentText.trim() ? 'primary.main' : '#eee', color: commentText.trim() ? '#fff' : '#aaa', '&:hover': { bgcolor: 'primary.dark' }, flexShrink: 0 }}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Paper>

      {/* ★エリア3: おすすめ商品
        ここからまたGridシステムを使います。
      */}
      {recommendations.length > 0 && (
        <>
          <Box sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>こちらもおすすめ</Typography>
          </Box>
          <Grid container spacing={2}>
            {recommendations.map(rec => (
              <Grid item xs={6} sm={4} md={3} key={rec.item_id}>
                <Card component={Link} to={`/items/${rec.item_id}`} sx={{ textDecoration: 'none', color: 'inherit', height: '100%', display: 'flex', flexDirection: 'column', transition: 'all 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 } }}>
                  <CardMedia component="img" height="150" image={rec.image_url} alt={rec.name} sx={{ objectFit: 'cover' }} />
                  <CardContent sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: 1.4, mb: 1 }}>{rec.name}</Typography>
                    <Typography variant="body2" sx={{ color: '#d32f2f', fontWeight: 'bold' }}>¥{rec.price?.toLocaleString() || '0'}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* ダイアログ */}
      <Dialog open={buyConfirmOpen} onClose={() => setBuyConfirmOpen(false)}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>購入確認</DialogTitle>
        <DialogContent>
          <Typography>「{item?.name}」を <Box component="span" sx={{ fontWeight: 'bold', color: 'error.main' }}>¥{item?.price?.toLocaleString()}</Box> で購入しますか？</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setBuyConfirmOpen(false)} color="inherit">キャンセル</Button>
          <Button onClick={confirmBuy} variant="contained" color="primary" disabled={buying} autoFocus>{buying ? '処理中...' : '購入する'}</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ItemDetailPage;