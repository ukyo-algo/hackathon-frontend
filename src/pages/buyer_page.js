// src/pages/buyer_page.js
/**
 * 購入者ページ - 購入物の配送状況確認
 * el;ma テーマ - レトロゲーム風UI
 */

import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/auth_context';
import { API_BASE_URL } from '../config';
import { Link } from 'react-router-dom';
import ProgressSteps from '../components/ProgressSteps';
import { usePageContext } from '../components/AIChatWidget';
import {
  Box, Container, Typography, Button, Card, CardContent,
  CircularProgress, Chip, Avatar, Dialog, DialogTitle, DialogContent,
  DialogActions, Rating as MuiRating, TextField
} from '@mui/material';
import { ShoppingBag, Star } from '@mui/icons-material';
import { colors } from '../styles/theme';

const BuyerPage = () => {
  const { currentUser } = useAuth();
  const { setPageContext } = usePageContext();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  // 評価ダイアログ用
  const [ratingDialog, setRatingDialog] = useState({ open: false, transactionId: null, itemName: '' });
  const [selectedRating, setSelectedRating] = useState(5);
  const [ratingComment, setRatingComment] = useState('');

  useEffect(() => {
    const pendingItems = list.filter(t => t.status === 'pending_shipment');
    const inTransitItems = list.filter(t => t.status === 'in_transit');
    setPageContext({
      page_type: 'buyer_deliveries',
      pending_shipment_count: pendingItems.length,
      in_transit_count: inTransitItems.length,
      total_count: list.length,
      no_deliveries: list.length === 0,
      has_receivable: inTransitItems.length > 0,
      pending_items: pendingItems.slice(0, 3).map(t => t.item?.name || 'unknown'),
      in_transit_items: inTransitItems.slice(0, 3).map(t => t.item?.name || 'unknown'),
      is_loading: loading,
    });
    return () => setPageContext(null);
  }, [list, loading, setPageContext]);

  const fetchData = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const headers = { 'X-Firebase-Uid': currentUser.uid };
      const [resPending, resTransit] = await Promise.all([
        fetch(`${API_BASE_URL}/api/v1/transactions?role=buyer&status=pending_shipment&limit=50`, { headers }),
        fetch(`${API_BASE_URL}/api/v1/transactions?role=buyer&status=in_transit&limit=50`, { headers })
      ]);

      let combined = [];
      if (resPending.ok) combined = [...combined, ...(await resPending.json())];
      if (resTransit.ok) combined = [...combined, ...(await resTransit.json())];
      setList(combined);
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const timer = setInterval(fetchData, 60000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const openRatingDialog = (transactionId, itemName) => {
    setRatingDialog({ open: true, transactionId, itemName });
    setSelectedRating(5);
    setRatingComment('');
  };

  const closeRatingDialog = () => {
    setRatingDialog({ open: false, transactionId: null, itemName: '' });
  };

  const handleComplete = async () => {
    try {
      const { transactionId } = ratingDialog;
      const params = new URLSearchParams();
      params.set('rating', selectedRating);
      if (ratingComment.trim()) {
        params.set('comment', ratingComment.trim());
      }
      const res = await fetch(
        `${API_BASE_URL}/api/v1/transactions/${transactionId}/complete?${params.toString()}`,
        {
          method: 'POST',
          headers: { 'X-Firebase-Uid': currentUser.uid }
        }
      );
      if (res.ok) {
        fetchData();
        closeRatingDialog();
      }
    } catch (e) {
      console.error('Complete action error:', e);
    }
  };

  if (!currentUser) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <Typography color="textSecondary">ログインしてください</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* ヘッダー */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{
          fontFamily: '"VT323", monospace',
          color: colors.textPrimary,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}>
          <ShoppingBag sx={{ color: colors.secondary }} /> 購入物の状況
        </Typography>
        {lastUpdated && (
          <Typography variant="caption" sx={{ color: colors.textTertiary }}>
            最終更新: {lastUpdated.toLocaleString()}
          </Typography>
        )}
      </Box>

      {/* ローディング */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress sx={{ color: colors.secondary }} />
        </Box>
      ) : list.length === 0 ? (
        <Card sx={{ background: colors.backgroundAlt, border: `1px solid ${colors.border}` }}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="textSecondary">現在、到着待ちはありません。</Typography>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {list.map(t => (
            <TransactionCard
              key={t.transaction_id}
              transaction={t}
              onComplete={() => openRatingDialog(t.transaction_id, t.item?.name || '商品')}
            />
          ))}
        </Box>
      )}

      {/* 評価ダイアログ */}
      <Dialog open={ratingDialog.open} onClose={closeRatingDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{
          fontFamily: '"VT323", monospace',
          fontSize: '1.5rem',
          color: colors.textPrimary,
          background: colors.backgroundAlt
        }}>
          <Star sx={{ color: '#ffd700', mr: 1, verticalAlign: 'bottom' }} />
          出品者を評価
        </DialogTitle>
        <DialogContent sx={{ background: colors.background, pt: 3 }}>
          <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 2 }}>
            「{ratingDialog.itemName}」のお取引はいかがでしたか？
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <MuiRating
              value={selectedRating}
              onChange={(e, value) => setSelectedRating(value || 5)}
              size="large"
              sx={{
                '& .MuiRating-iconFilled': { color: '#ffd700' },
                '& .MuiRating-iconEmpty': { color: colors.border },
              }}
            />
          </Box>
          <Typography variant="body2" sx={{ textAlign: 'center', color: colors.textTertiary, mb: 2 }}>
            {selectedRating === 1 && '残念でした 😞'}
            {selectedRating === 2 && 'あまり良くなかった'}
            {selectedRating === 3 && '普通でした'}
            {selectedRating === 4 && '良かった！'}
            {selectedRating === 5 && 'とても良かった！ 🎉'}
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={2}
            placeholder="コメントを入力（任意）"
            value={ratingComment}
            onChange={(e) => setRatingComment(e.target.value)}
            inputProps={{ maxLength: 200 }}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: colors.textPrimary,
                '& fieldset': { borderColor: colors.border },
                '&:hover fieldset': { borderColor: colors.secondary },
              },
              '& .MuiInputBase-input::placeholder': { color: colors.textTertiary },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ background: colors.backgroundAlt, p: 2 }}>
          <Button onClick={closeRatingDialog} sx={{ color: colors.textSecondary }}>
            キャンセル
          </Button>
          <Button
            onClick={handleComplete}
            variant="contained"
            sx={{
              backgroundColor: colors.secondary,
              '&:hover': { backgroundColor: colors.secondaryDark || '#d84315' }
            }}
          >
            受け取り完了
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

// 取引カードコンポーネント
const TransactionCard = ({ transaction: t, onComplete }) => {
  const isInTransit = t.status === 'in_transit';
  const isPending = t.status === 'pending_shipment';

  return (
    <Card sx={{
      background: colors.paper,
      border: `1px solid ${isInTransit ? colors.secondary : colors.border}`,
      transition: 'all 0.2s ease',
      '&:hover': { borderColor: colors.secondary },
    }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        {/* 商品画像 */}
        <Avatar
          src={t.item?.image_url || 'https://via.placeholder.com/64'}
          alt={t.item?.name}
          variant="rounded"
          sx={{ width: 64, height: 64 }}
        />

        {/* 商品情報 */}
        <Box sx={{ flex: 1, minWidth: 150 }}>
          <Link to={`/items/${t.item?.item_id || ''}`} style={{ textDecoration: 'none' }}>
            <Typography variant="body1" sx={{
              color: colors.textPrimary,
              fontWeight: 'bold',
              '&:hover': { color: colors.secondary },
            }}>
              {t.item?.name || '商品'}
            </Typography>
          </Link>
          <Typography variant="h6" sx={{
            color: colors.price,
            fontFamily: '"VT323", monospace',
          }}>
            ¥{(t.item?.price || 0).toLocaleString()}
          </Typography>
        </Box>

        {/* 進捗ステップ */}
        <Box sx={{ flex: 2, minWidth: 200 }}>
          <ProgressSteps status={t.status} />
        </Box>

        {/* アクションボタン */}
        {isInTransit ? (
          <Button
            variant="outlined"
            onClick={onComplete}
            sx={{
              borderColor: colors.secondary,
              color: colors.secondary,
              fontFamily: '"VT323", monospace',
              '&:hover': {
                backgroundColor: colors.secondary,
                color: '#fff',
                borderColor: colors.secondary,
              },
            }}
          >
            受け取りました
          </Button>
        ) : isPending ? (
          <Chip
            label="発送待ち"
            size="small"
            sx={{ backgroundColor: colors.warning, color: colors.background }}
          />
        ) : (
          <Chip
            label="受取済み"
            size="small"
            sx={{ backgroundColor: colors.border, color: colors.textSecondary }}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default BuyerPage;
