// src/pages/item_detail_page.js

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/auth_context';
import { API_BASE_URL, SORT_OPTIONS } from '../config';
import { commentStyles } from '../styles/commonStyles';
import { usePageContext } from '../components/AIChatWidget';
import { buildItemContext } from '../hooks/useLLMAgent';
import { ProductGrid } from '../components/HomepageComponents';
import {
  Box, Container, Grid, Card, CardMedia, Button, Typography,
  TextField, IconButton, Paper, Avatar, Rating,
  Alert, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
  List, ListItem, ListItemAvatar, ListItemText, Divider, CardContent,
  ToggleButtonGroup, ToggleButton
} from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import SendIcon from '@mui/icons-material/Send';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import MailIcon from '@mui/icons-material/Mail';

const ItemDetailPage = () => {
  const { itemId } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [buying, setBuying] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [buyConfirmOpen, setBuyConfirmOpen] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [recSortOrder, setRecSortOrder] = useState('newest');


  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { setPageContext } = usePageContext();

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/v1/items/${itemId}`);
        if (!response.ok) throw new Error('商品の取得に失敗しました');
        const data = await response.json();
        setItem(data);
        setLikeCount(data.like_count || 0);

        // ページコンテキストを設定（LLMに商品情報を伝える）
        setPageContext({
          page_type: 'item_detail',
          current_item: buildItemContext(data, data.like_count || 0, data.comments || [])
        });

        // 類似商品を取得
        try {
          const recResponse = await fetch(`${API_BASE_URL}/api/v1/items/${itemId}/recommend`);
          if (recResponse.ok) {
            const recData = await recResponse.json();
            setRecommendations(recData || []);
          }
        } catch (recErr) {
          console.error('Failed to fetch recommendations:', recErr);
        }
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchItem();

    // クリーンアップ時にコンテキストをクリア
    return () => setPageContext(null);
  }, [itemId, setPageContext]);

  // おすすめのソート
  const sortedRecommendations = useMemo(() => {
    const items = [...recommendations];
    switch (recSortOrder) {
      case 'price_low':
        return items.sort((a, b) => (a.price || 0) - (b.price || 0));
      case 'price_high':
        return items.sort((a, b) => (b.price || 0) - (a.price || 0));
      case 'newest':
      default:
        return items; // APIから返された順序を維持
    }
  }, [recommendations, recSortOrder]);


  const handleLike = async () => {
    if (!currentUser) return navigate('/login');
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    try {
      await fetch(`${API_BASE_URL}/api/v1/items/${itemId}/like`, {
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
      const response = await fetch(`${API_BASE_URL}/api/v1/items/${itemId}/comments`, {
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
    <Container maxWidth="md" sx={{ py: 3 }}>

      {/* ★エリア1: 商品画像（固定サイズ、縦配置） */}
      <Box sx={{
        position: 'relative',
        width: '100%',
        height: '400px',  // 固定高さ
        bgcolor: '#1c2128',
        borderRadius: 2,
        overflow: 'hidden',
        mb: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <CardMedia
          component="img"
          image={item.image_url || "/placeholder.png"}
          alt={item.name}
          sx={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            opacity: isSold ? 0.5 : 1
          }}
        />
        {isSold && (
          <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)' }}>
            <Typography variant="h2" sx={{ color: 'white', fontWeight: 'bold', transform: 'rotate(-15deg)' }}>SOLD</Typography>
          </Box>
        )}
      </Box>

      {/* ★エリア2: 商品情報（画像の下） */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2, overflowWrap: 'anywhere' }}>{item.name}</Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Tooltip
            title={
              item.seller?.rating_count > 0
                ? `★${(item.seller?.average_rating || 0).toFixed(1)} (${item.seller?.rating_count || 0}件の評価)`
                : '評価はまだありません'
            }
            arrow
          >
            <Avatar
              alt={item.seller?.username}
              src={item.seller?.icon_url}
              sx={{
                width: 40,
                height: 40,
                cursor: !isMyItem ? 'pointer' : 'default',
                '&:hover': !isMyItem ? { boxShadow: '0 0 0 2px #00ff88' } : {},
              }}
              onClick={() => {
                if (!isMyItem && item.seller?.id) {
                  navigate(`/messages?userId=${item.seller.id}&itemId=${itemId}`);
                }
              }}
            />
          </Tooltip>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{item.seller?.username || '不明なユーザー'}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Rating value={item.seller?.average_rating || 0} readOnly size="small" precision={0.1} />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                ({item.seller?.rating_count || 0})
              </Typography>
            </Box>
          </Box>
          {/* 出品者にメッセージボタン（自分の商品でない場合のみ） */}
          {!isMyItem && item.seller?.id && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<MailIcon />}
              onClick={() => navigate(`/messages?userId=${item.seller.id}&itemId=${itemId}`)}
              sx={{
                borderColor: '#00ff88',
                color: '#00ff88',
                '&:hover': { borderColor: '#00cc66', backgroundColor: 'rgba(0, 255, 136, 0.1)' },
              }}
            >
              出品者に連絡
            </Button>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#00ff88' }}>¥{item.price?.toLocaleString() || '0'}</Typography>
          <Button startIcon={isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />} onClick={handleLike} color={isLiked ? "error" : "inherit"} size="large">{likeCount}</Button>
        </Box>

        <Paper sx={{ p: 2, mb: 3, backgroundColor: '#1a1a2e', borderRadius: 2, border: '1px solid #333' }} variant="outlined">
          <Grid container spacing={2}>
            <Grid item xs={4}><Typography variant="caption" sx={{ color: '#9ca3af' }}>カテゴリ</Typography></Grid>
            <Grid item xs={8}><Typography variant="body2" sx={{ color: '#fff' }}>{item.category}</Typography></Grid>
            <Grid item xs={4}><Typography variant="caption" sx={{ color: '#9ca3af' }}>状態</Typography></Grid>
            <Grid item xs={8}><Typography variant="body2" sx={{ color: '#fff' }}>{item.condition}</Typography></Grid>
            <Grid item xs={4}><Typography variant="caption" sx={{ color: '#9ca3af' }}>発送予定</Typography></Grid>
            <Grid item xs={8}><Typography variant="body2" sx={{ color: '#fff' }}>{item.shipping_days || '1-2日'}</Typography></Grid>
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
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#fff' }}>商品説明</Typography>
          <Paper variant="outlined" sx={{ p: 2, minHeight: '100px', bgcolor: '#1a1a2e', border: '1px solid #333' }}>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', color: '#e5e7eb', lineHeight: 1.6, overflowWrap: 'anywhere' }}>{item.description}</Typography>
          </Paper>
        </Box>
      </Box>


      {/* ★エリア3: コメントセクション */}
      <Paper
        elevation={3}
        sx={commentStyles.container}
      >
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
          コメント ({item.comment_count || 0})
        </Typography>

        {/* コメントリスト（スクロールエリア） */}
        <Box sx={commentStyles.scrollArea}>
          {(!item.comments || item.comments.length === 0) ? (
            <Box sx={commentStyles.emptyState}>
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
                          <Typography variant="caption" sx={{ color: '#8b949e' }}>
                            {comment.created_at ? new Date(comment.created_at).toLocaleDateString() : ''}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Typography
                          component="div"
                          variant="body2"
                          sx={{
                            color: '#e6edf3',
                            whiteSpace: 'pre-wrap',
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

        <Box component="form" onSubmit={handleCommentSubmit} sx={commentStyles.inputForm}>
          <TextField
            fullWidth
            multiline
            maxRows={2}
            placeholder="コメントを入力..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            variant="outlined"
            size="small"
            sx={{ bgcolor: '#161b22', '& .MuiOutlinedInput-root': { color: '#e6edf3' } }}
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


      {/* ★エリア4: 類似商品おすすめ */}
      {recommendations.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              📦 関連商品
            </Typography>
            <ToggleButtonGroup
              value={recSortOrder}
              exclusive
              onChange={(e, newValue) => newValue && setRecSortOrder(newValue)}
              size="small"
            >
              {SORT_OPTIONS.map(opt => (
                <ToggleButton key={opt.value} value={opt.value} sx={{ fontSize: '0.75rem', px: 1.5 }}>
                  {opt.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>
          <ProductGrid items={sortedRecommendations} loading={false} />
        </Box>
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