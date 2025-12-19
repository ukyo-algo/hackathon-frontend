// src/pages/seller_page.js
/**
 * 出品者ページ - 売品の配送状況管理
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
  CircularProgress, Chip, Avatar
} from '@mui/material';
import { LocalShipping, Inventory } from '@mui/icons-material';
import { colors } from '../styles/theme';

const SellerPage = () => {
  const { currentUser } = useAuth();
  const { setPageContext } = usePageContext();
  const [list, setList] = useState([]);
  const [unsoldItems, setUnsoldItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    const pendingItems = list.filter(t => t.status === 'pending_shipment');
    const inTransitItems = list.filter(t => t.status === 'in_transit');
    setPageContext({
      page_type: 'seller_shipments',
      pending_shipment_count: pendingItems.length,
      in_transit_count: inTransitItems.length,
      unsold_count: unsoldItems.length,
      no_transactions: list.length === 0,
      no_unsold: unsoldItems.length === 0,
      pending_items: pendingItems.slice(0, 3).map(t => t.item?.name || 'unknown'),
      unsold_items: unsoldItems.slice(0, 3).map(i => i.name || 'unknown'),
      is_loading: loading,
    });
    return () => setPageContext(null);
  }, [list, unsoldItems, loading, setPageContext]);

  const fetchData = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const headers = { 'X-Firebase-Uid': currentUser.uid };
      const [resPending, resTransit, resMyItems] = await Promise.all([
        fetch(`${API_BASE_URL}/api/v1/transactions?role=seller&status=pending_shipment&limit=50`, { headers }),
        fetch(`${API_BASE_URL}/api/v1/transactions?role=seller&status=in_transit&limit=50`, { headers }),
        fetch(`${API_BASE_URL}/api/v1/users/me/items`, { headers })
      ]);

      let combined = [];
      if (resPending.ok) combined = [...combined, ...(await resPending.json())];
      if (resTransit.ok) combined = [...combined, ...(await resTransit.json())];
      setList(combined);

      if (resMyItems.ok) {
        const items = await resMyItems.json();
        const tradingItemIds = new Set(combined.map(t => t.item?.item_id || t.item_id || t.id));
        const unsold = (items || []).filter(item => !tradingItemIds.has(item.item_id || item.id) && item.status === 'on_sale');
        setUnsoldItems(unsold);
      }
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

  const handleShip = async (transactionId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/transactions/${transactionId}/ship`, {
        method: 'POST',
        headers: { 'X-Firebase-Uid': currentUser.uid }
      });
      if (res.ok) fetchData();
    } catch (e) {
      console.error('Ship action error:', e);
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
          <LocalShipping sx={{ color: colors.primary }} /> 売品の状況
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
          <CircularProgress sx={{ color: colors.primary }} />
        </Box>
      ) : (
        <>
          {/* 取引中リスト */}
          {list.length === 0 ? (
            <Card sx={{ mb: 4, background: colors.backgroundAlt, border: `1px solid ${colors.border}` }}>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="textSecondary">現在、取引中の売品はありません。</Typography>
              </CardContent>
            </Card>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
              {list.map(t => (
                <TransactionCard
                  key={t.transaction_id}
                  transaction={t}
                  onShip={() => handleShip(t.transaction_id)}
                  role="seller"
                />
              ))}
            </Box>
          )}

          {/* 未売品セクション */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" sx={{
              fontFamily: '"VT323", monospace',
              color: colors.textPrimary,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mb: 2,
            }}>
              <Inventory sx={{ color: colors.accent }} /> 未売品 ({unsoldItems.length})
            </Typography>

            {unsoldItems.length === 0 ? (
              <Card sx={{ background: colors.backgroundAlt, border: `1px solid ${colors.border}` }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography color="textSecondary">現在、未売品はありません。</Typography>
                </CardContent>
              </Card>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {unsoldItems.map(item => (
                  <UnsoldItemCard key={item.item_id || item.id} item={item} />
                ))}
              </Box>
            )}
          </Box>
        </>
      )}
    </Container>
  );
};

// 取引カードコンポーネント
const TransactionCard = ({ transaction: t, onShip, role }) => {
  const isPending = t.status === 'pending_shipment';
  const isShipped = t.status === 'in_transit' || t.status === 'completed';

  return (
    <Card sx={{
      background: colors.paper,
      border: `1px solid ${isPending ? colors.warning : colors.border}`,
      transition: 'all 0.2s ease',
      '&:hover': { borderColor: colors.primary },
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
              '&:hover': { color: colors.primary },
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
        {isPending ? (
          <Button
            variant="contained"
            onClick={onShip}
            sx={{
              backgroundColor: colors.primary,
              color: colors.background,
              fontFamily: '"VT323", monospace',
              '&:hover': { backgroundColor: colors.primaryDark },
            }}
          >
            発送しました
          </Button>
        ) : (
          <Chip
            label={isShipped ? '発送済み' : t.status}
            sx={{
              backgroundColor: colors.border,
              color: colors.textSecondary,
            }}
          />
        )}
      </CardContent>
    </Card>
  );
};

// 未売品カードコンポーネント
const UnsoldItemCard = ({ item }) => (
  <Card sx={{
    background: colors.paper,
    border: `1px solid ${colors.border}`,
    transition: 'all 0.2s ease',
    '&:hover': { borderColor: colors.accent },
  }}>
    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Avatar
        src={item.image_url || 'https://via.placeholder.com/64'}
        alt={item.name}
        variant="rounded"
        sx={{ width: 64, height: 64 }}
      />
      <Box sx={{ flex: 1 }}>
        <Link to={`/items/${item.item_id || item.id || ''}`} style={{ textDecoration: 'none' }}>
          <Typography variant="body1" sx={{
            color: colors.textPrimary,
            fontWeight: 'bold',
            '&:hover': { color: colors.accent },
          }}>
            {item.name || '商品'}
          </Typography>
        </Link>
        <Typography variant="h6" sx={{
          color: colors.price,
          fontFamily: '"VT323", monospace',
        }}>
          ¥{(item.price || 0).toLocaleString()}
        </Typography>
      </Box>
      <Chip
        label="出品中"
        size="small"
        sx={{ backgroundColor: colors.accent, color: colors.background }}
      />
    </CardContent>
  </Card>
);

export default SellerPage;
