import React from 'react';
import api from '../api/axios';
import { Box, Card, CardContent, Typography, Button, Stack, Chip, CircularProgress, Alert } from '@mui/material';

const statusLabel = (s) => {
  switch (s) {
    case 'pending_shipment': return '発送待ち';
    case 'in_transit': return '到着待ち';
    case 'completed': return '取引完了';
    default: return s || '不明';
  }
  // hogehoge
};

const HeaderShipmentPanel = () => {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [sellerPending, setSellerPending] = React.useState([]);
  const [buyerInTransit, setBuyerInTransit] = React.useState([]);
  const [recentShipped, setRecentShipped] = React.useState([]);
  const [recentCompleted, setRecentCompleted] = React.useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [sp, bi, rs, rc] = await Promise.all([
        api.get('/transactions', { params: { role: 'seller', status: 'pending_shipment', limit: 5 } }),
        api.get('/transactions', { params: { role: 'buyer', status: 'in_transit', limit: 5 } }),
        api.get('/transactions', { params: { role: 'seller', status: 'in_transit', limit: 3 } }),
        api.get('/transactions', { params: { role: 'buyer', status: 'completed', limit: 3 } }),
      ]);
      setSellerPending(sp.data || []);
      setBuyerInTransit(bi.data || []);
      setRecentShipped(rs.data || []);
      setRecentCompleted(rc.data || []);
    } catch (e) {
      console.error('Header shipment fetch error:', e);
      setError('配送状況の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { fetchData(); }, []);

  const handleShip = async (transaction_id) => {
    try {
      await api.post(`/transactions/${transaction_id}/ship`);
      fetchData();
    } catch (e) {
      console.error('Ship action failed:', e);
      setError('発送処理に失敗しました');
    }
  };

  const handleComplete = async (transaction_id) => {
    try {
      await api.post(`/transactions/${transaction_id}/complete`);
      fetchData();
    } catch (e) {
      console.error('Complete action failed:', e);
      setError('受取処理に失敗しました');
    }
  };

  const renderRow = (tx, action) => (
    <Box key={tx.transaction_id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 0.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {tx.item?.image_url && (
          <Box component="img" src={tx.item.image_url} alt={tx.item.name} sx={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 1 }} />
        )}
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>{tx.item?.name || '商品'}</Typography>
          <Typography variant="caption" color="text.secondary">¥{tx.price?.toLocaleString('ja-JP')}</Typography>
        </Box>
      </Box>
      <Stack direction="row" spacing={1} alignItems="center">
        <Chip label={statusLabel(tx.status)} size="small" />
        {action}
      </Stack>
    </Box>
  );

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
      {(loading) && (
        <Box sx={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center' }}><CircularProgress size={24} /></Box>
      )}
      {error && (
        <Box sx={{ gridColumn: '1 / -1' }}><Alert severity="error">{error}</Alert></Box>
      )}

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>発送待ち</Typography>
          {sellerPending.length === 0 ? (
            <Typography variant="body2" color="text.secondary">現在、発送待ちはありません。</Typography>
          ) : (
            <Stack spacing={0.5}>
              {sellerPending.map(tx => renderRow(tx, (
                <Button size="small" variant="contained" onClick={() => handleShip(tx.transaction_id)}>発送しました</Button>
              )))}
            </Stack>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>到着待ち</Typography>
          {buyerInTransit.length === 0 ? (
            <Typography variant="body2" color="text.secondary">現在、到着待ちはありません。</Typography>
          ) : (
            <Stack spacing={0.5}>
              {buyerInTransit.map(tx => renderRow(tx, (
                <Button size="small" variant="outlined" onClick={() => handleComplete(tx.transaction_id)}>受け取りました</Button>
              )))}
            </Stack>
          )}
        </CardContent>
      </Card>

      <Card sx={{ gridColumn: '1 / -1' }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>最近の配送状況</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 1 }}>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>最近の発送済み</Typography>
              {recentShipped.length === 0 ? (
                <Typography variant="body2" color="text.secondary">最近の発送はありません。</Typography>
              ) : (
                <Stack spacing={0.5}>
                  {recentShipped.map(tx => renderRow(tx, null))}
                </Stack>
              )}
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>最近の取引完了</Typography>
              {recentCompleted.length === 0 ? (
                <Typography variant="body2" color="text.secondary">最近の完了はありません。</Typography>
              ) : (
                <Stack spacing={0.5}>
                  {recentCompleted.map(tx => renderRow(tx, null))}
                </Stack>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default HeaderShipmentPanel;
