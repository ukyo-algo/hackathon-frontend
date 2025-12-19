// src/components/NavBar.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box, TextField, InputAdornment, Badge, IconButton, Tooltip,
  Popover, List, ListItem, ListItemText, Typography, Divider, Button,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AddIcon from '@mui/icons-material/Add';
import { useAuth } from '../contexts/auth_context';
import { buttonStyles, navBarStyles } from '../styles/commonStyles';
import { colors } from '../styles/theme';
import api from '../api/axios';

const NavBar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // 通知関連
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationAnchor, setNotificationAnchor] = useState(null);

  // 課金ダイアログ
  const [purchaseDialog, setPurchaseDialog] = useState({ open: false, type: null });

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  // 通知を取得
  const fetchNotifications = async () => {
    if (!currentUser) return;
    try {
      const res = await api.get('/notifications?include_read=true&limit=10');
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unread_count || 0);
    } catch (e) {
      console.error('Failed to fetch notifications:', e);
    }
  };

  // 定期的に通知を取得
  useEffect(() => {
    if (currentUser) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  // 通知クリック
  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      try {
        await api.post(`/notifications/${notification.id}/read`);
        setUnreadCount(prev => Math.max(0, prev - 1));
        setNotifications(prev =>
          prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
        );
      } catch (e) {
        console.error('Failed to mark as read:', e);
      }
    }
    if (notification.link) {
      navigate(notification.link);
    }
    setNotificationAnchor(null);
  };

  // 全て既読
  const handleMarkAllRead = async () => {
    try {
      await api.post('/notifications/read-all');
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (e) {
      console.error('Failed to mark all as read:', e);
    }
  };

  // 課金ダイアログを開く
  const openPurchaseDialog = (type) => {
    setPurchaseDialog({ open: true, type, step: 'select', selectedAmount: null, selectedPrice: null });
  };

  // 課金ダイアログを閉じる
  const closePurchaseDialog = () => {
    setPurchaseDialog({ open: false, type: null, step: 'select', selectedAmount: null, selectedPrice: null });
  };

  // 金額を選択
  const selectAmount = (amount, price) => {
    setPurchaseDialog(prev => ({ ...prev, step: 'confirm', selectedAmount: amount, selectedPrice: price }));
  };

  // 選択画面に戻る
  const goBackToSelect = () => {
    setPurchaseDialog(prev => ({ ...prev, step: 'select', selectedAmount: null, selectedPrice: null }));
  };

  // 課金処理
  const handlePurchase = async () => {
    try {
      const amount = Number(purchaseDialog.selectedAmount);
      console.log('[Purchase] Type:', purchaseDialog.type, 'Amount:', amount);

      if (purchaseDialog.type === 'gacha') {
        // ガチャポイントチャージ
        const res = await api.post('/gacha/charge', { amount });
        console.log('[Purchase] Gacha charge response:', res.data);
      } else if (purchaseDialog.type === 'subscription') {
        // 月額パス購入
        const res = await api.post('/users/me/subscribe', { months: amount || 1 });
        console.log('[Purchase] Subscription response:', res.data);
        alert(res.data.message || '月額パスを購入しました！');
      } else {
        // 記憶のかけらチャージ
        const res = await api.post('/users/me/add-fragments', { amount });
        console.log('[Purchase] Fragments add response:', res.data);
      }
      // ユーザー情報を更新してポイント残高を反映
      window.location.reload();
    } catch (err) {
      console.error('Purchase failed:', err.response?.data || err.message || err);
      alert(`購入処理に失敗しました: ${err.response?.data?.detail || err.message || 'もう一度お試しください'}`);
    }
    closePurchaseDialog();
  };

  const notificationOpen = Boolean(notificationAnchor);

  return (
    <Box sx={navBarStyles.container}>
      {/* 上部: ロゴ・検索・ステータス */}
      <Box sx={navBarStyles.topSection}>
        {/* ロゴ */}
        <Tooltip title="ホームに戻る" arrow>
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Box sx={{
              ...navBarStyles.logo,
              fontFamily: '"VT323", monospace',
              fontSize: '2rem',
              color: colors.primary,
              textShadow: `0 0 10px ${colors.primary}`,
              letterSpacing: '0.05em',
            }}>
              el<span style={{ color: colors.secondary }}>;</span>ma
            </Box>
          </Link>
        </Tooltip>

        {/* 検索バー */}
        <form onSubmit={handleSearch} style={navBarStyles.searchForm}>
          <TextField
            placeholder="何をお探しですか？"
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <SearchIcon
                    sx={{ cursor: 'pointer', color: colors.textTertiary }}
                    onClick={() => {
                      if (searchQuery.trim()) {
                        navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
                        setSearchQuery('');
                      }
                    }}
                  />
                </InputAdornment>
              )
            }}
            sx={navBarStyles.searchInput}
          />
        </form>

        {/* 通知ベル */}
        {currentUser && (
          <Tooltip title="通知" arrow>
            <IconButton
              onClick={(e) => setNotificationAnchor(e.currentTarget)}
              sx={{ color: colors.textSecondary }}
            >
              <Badge badgeContent={unreadCount} color="error" max={99}>
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>
        )}

        {/* 通知ドロップダウン */}
        <Popover
          open={notificationOpen}
          anchorEl={notificationAnchor}
          onClose={() => setNotificationAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Box sx={{ width: 320, maxHeight: 400, overflow: 'auto' }}>
            <Box sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>通知</Typography>
              {unreadCount > 0 && (
                <Button size="small" onClick={handleMarkAllRead}>全て既読</Button>
              )}
            </Box>
            {notifications.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center', color: colors.textTertiary }}>
                通知はありません
              </Box>
            ) : (
              <List dense sx={{ p: 0 }}>
                {notifications.map((n) => (
                  <ListItem
                    key={n.id}
                    button
                    onClick={() => handleNotificationClick(n)}
                    sx={{
                      backgroundColor: n.is_read ? 'transparent' : 'rgba(0, 255, 136, 0.1)',
                      '&:hover': { backgroundColor: 'rgba(255,255,255,0.05)' },
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography variant="body2" sx={{ fontWeight: n.is_read ? 'normal' : 'bold' }}>
                          {n.title}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" sx={{ color: colors.textTertiary }}>
                          {n.message}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </Popover>

        {/* ステータス表示エリア */}
        {currentUser && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* ガチャポイント */}
            <Tooltip title="ガチャを回すためのポイント。クリックして購入！" arrow>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                backgroundColor: colors.backgroundAlt,
                border: `1px solid ${colors.border}`,
                borderRadius: 1,
                px: 1,
                py: 0.5,
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': { borderColor: colors.warning, boxShadow: `0 0 8px ${colors.warning}40` },
              }} onClick={() => openPurchaseDialog('gacha')}>
                <Box sx={{ fontSize: '1rem' }}>🎫</Box>
                <Box sx={{
                  fontFamily: '"VT323", monospace',
                  fontSize: '1rem',
                  color: colors.warning,
                }}>
                  {(currentUser.gacha_points || 0).toLocaleString()}
                </Box>
                <AddIcon sx={{ fontSize: '0.8rem', color: colors.warning }} />
              </Box>
            </Tooltip>

            {/* 記憶のかけら */}
            <Tooltip title="キャラのレベルアップに使用。クリックして購入！" arrow>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                padding: '4px 8px',
                borderRadius: '8px',
                background: 'rgba(128, 0, 255, 0.15)',
                border: '1px solid rgba(128, 0, 255, 0.3)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': { borderColor: '#c080ff', boxShadow: '0 0 8px rgba(128, 0, 255, 0.4)' },
              }} onClick={() => openPurchaseDialog('fragments')}>
                <Box sx={{ fontSize: '0.9rem' }}>💎</Box>
                <Box sx={{
                  fontFamily: '"VT323", monospace',
                  fontSize: '0.9rem',
                  color: '#c080ff',
                }}>
                  {(currentUser.memory_fragments || 0).toLocaleString()}
                </Box>
                <AddIcon sx={{ fontSize: '0.8rem', color: '#c080ff' }} />
              </Box>
            </Tooltip>

            {/* 月額パス */}
            <Tooltip title={currentUser.subscription_tier === 'monthly' ? 'デュアルペルソナ有効！' : '月額パスを購入してデュアルペルソナを解放！'} arrow>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                padding: '4px 8px',
                borderRadius: '8px',
                background: currentUser.subscription_tier === 'monthly' ? 'rgba(255, 215, 0, 0.2)' : 'rgba(100, 100, 100, 0.15)',
                border: currentUser.subscription_tier === 'monthly' ? '1px solid rgba(255, 215, 0, 0.5)' : '1px solid rgba(100, 100, 100, 0.3)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': { borderColor: '#ffd700', boxShadow: '0 0 8px rgba(255, 215, 0, 0.4)' },
              }} onClick={() => openPurchaseDialog('subscription')}>
                <Box sx={{ fontSize: '0.9rem' }}>{currentUser.subscription_tier === 'monthly' ? '👑' : '🔒'}</Box>
                <Box sx={{
                  fontFamily: '"VT323", monospace',
                  fontSize: '0.8rem',
                  color: currentUser.subscription_tier === 'monthly' ? '#ffd700' : '#888',
                }}>
                  {currentUser.subscription_tier === 'monthly' ? 'PREMIUM' : 'PASS'}
                </Box>
              </Box>
            </Tooltip>
          </Box>
        )}
      </Box>

      {/* 下部: 主要ページ遷移ボタン群 */}
      {currentUser ? (
        <Box sx={navBarStyles.navButtons}>
          <Tooltip title="商品一覧・おすすめを見る" arrow>
            <Link to="/" style={{ textDecoration: 'none' }}>
              <Box component="button" sx={buttonStyles.primary}>🏠 ホーム</Box>
            </Link>
          </Tooltip>
          <Tooltip title="プロフィール・所持キャラ確認" arrow>
            <Link to="/mypage" style={{ textDecoration: 'none' }}>
              <Box component="button" sx={buttonStyles.outlined}>👤 マイページ</Box>
            </Link>
          </Tooltip>
          <Tooltip title="商品を出品する" arrow>
            <Link to="/items/create" style={{ textDecoration: 'none' }}>
              <Box component="button" sx={buttonStyles.success}>📦 出品</Box>
            </Link>
          </Tooltip>
          <Tooltip title="出品した商品の状況確認" arrow>
            <Link to="/seller" style={{ textDecoration: 'none' }}>
              <Box component="button" sx={buttonStyles.outlined}>📤 売品状況</Box>
            </Link>
          </Tooltip>
          <Tooltip title="購入した商品の状況確認" arrow>
            <Link to="/buyer" style={{ textDecoration: 'none' }}>
              <Box component="button" sx={buttonStyles.outlined}>📥 購入状況</Box>
            </Link>
          </Tooltip>
          <Tooltip title="キャラクターを引こう！" arrow>
            <Link to="/gacha" style={{ textDecoration: 'none' }}>
              <Box component="button" sx={buttonStyles.secondary}>🎰 ガチャ</Box>
            </Link>
          </Tooltip>
          <Tooltip title="デイリーミッションでポイント獲得" arrow>
            <Link to="/mission" style={{ textDecoration: 'none' }}>
              <Box component="button" sx={buttonStyles.outlined}>🎯 ミッション</Box>
            </Link>
          </Tooltip>
          <Tooltip title="会話するキャラクターを変更" arrow>
            <Link to="/persona-selection" style={{ textDecoration: 'none' }}>
              <Box component="button" sx={buttonStyles.outlined}>🔄 キャラ変更</Box>
            </Link>
          </Tooltip>
          <Tooltip title="ログアウトする" arrow>
            <Box component="button" onClick={logout} sx={buttonStyles.neutral}>🚪 ログアウト</Box>
          </Tooltip>
        </Box>
      ) : (
        <Box sx={navBarStyles.navButtons}>
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <Box component="button" sx={buttonStyles.primary}>ログイン</Box>
          </Link>
          <Link to="/register" style={{ textDecoration: 'none' }}>
            <Box component="button" sx={buttonStyles.outlined}>会員登録</Box>
          </Link>
        </Box>
      )}

      {/* 課金ダイアログ */}
      <Dialog open={purchaseDialog.open} onClose={closePurchaseDialog} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
          {purchaseDialog.type === 'gacha' ? '🎫 ガチャポイント購入' : purchaseDialog.type === 'subscription' ? '👑 月額パス購入' : '💎 記憶のかけら購入'}
        </DialogTitle>
        <DialogContent>
          {purchaseDialog.step === 'select' ? (
            <>
              <Typography variant="body2" sx={{ mb: 2, color: colors.textSecondary }}>
                {purchaseDialog.type === 'gacha'
                  ? 'ガチャを回してキャラクターをゲットしよう！'
                  : purchaseDialog.type === 'subscription'
                    ? 'デュアルペルソナ機能を解放！2体のキャラと会話できます。'
                    : 'キャラクターをレベルアップさせよう！'}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {purchaseDialog.type === 'gacha' ? (
                  <>
                    <Button variant="outlined" onClick={() => selectAmount(100, 120)} sx={{ justifyContent: 'space-between' }}>
                      <span>100ポイント</span><span style={{ color: '#ffc107' }}>¥120</span>
                    </Button>
                    <Button variant="outlined" onClick={() => selectAmount(500, 550)} sx={{ justifyContent: 'space-between' }}>
                      <span>500ポイント</span><span style={{ color: '#ffc107' }}>¥550</span>
                    </Button>
                    <Button variant="outlined" onClick={() => selectAmount(1000, 1000)} sx={{ justifyContent: 'space-between' }}>
                      <span>1,000ポイント</span><span style={{ color: '#ffc107' }}>¥1,000</span>
                    </Button>
                    <Button variant="contained" color="warning" onClick={() => selectAmount(5000, 4800)} sx={{ justifyContent: 'space-between' }}>
                      <span>5,000ポイント</span><span>¥4,800</span>
                    </Button>
                  </>
                ) : purchaseDialog.type === 'subscription' ? (
                  <>
                    <Button variant="outlined" onClick={() => selectAmount(1, 500)} sx={{ justifyContent: 'space-between' }}>
                      <span>1ヶ月</span><span style={{ color: '#ffd700' }}>¥500</span>
                    </Button>
                    <Button variant="outlined" onClick={() => selectAmount(3, 1400)} sx={{ justifyContent: 'space-between' }}>
                      <span>3ヶ月</span><span style={{ color: '#ffd700' }}>¥1,400（お得！）</span>
                    </Button>
                    <Button variant="contained" sx={{ justifyContent: 'space-between', bgcolor: '#ffd700', color: '#000', '&:hover': { bgcolor: '#e6c200' } }} onClick={() => selectAmount(12, 5000)}>
                      <span>12ヶ月</span><span>¥5,000（超お得！）</span>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outlined" onClick={() => selectAmount(10, 120)} sx={{ justifyContent: 'space-between' }}>
                      <span>10個</span><span style={{ color: '#c080ff' }}>¥120</span>
                    </Button>
                    <Button variant="outlined" onClick={() => selectAmount(50, 550)} sx={{ justifyContent: 'space-between' }}>
                      <span>50個</span><span style={{ color: '#c080ff' }}>¥550</span>
                    </Button>
                    <Button variant="outlined" onClick={() => selectAmount(100, 1000)} sx={{ justifyContent: 'space-between' }}>
                      <span>100個</span><span style={{ color: '#c080ff' }}>¥1,000</span>
                    </Button>
                    <Button variant="contained" sx={{ justifyContent: 'space-between', bgcolor: '#8000ff', '&:hover': { bgcolor: '#6000cc' } }} onClick={() => selectAmount(500, 4800)}>
                      <span>500個</span><span>¥4,800</span>
                    </Button>
                  </>
                )}
              </Box>
            </>
          ) : (
            /* 確認画面 */
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                購入内容の確認
              </Typography>
              <Box sx={{
                bgcolor: colors.backgroundAlt,
                borderRadius: 2,
                p: 3,
                mb: 3,
                border: `1px solid ${colors.border}`
              }}>
                <Typography variant="h4" sx={{
                  fontWeight: 'bold',
                  color: purchaseDialog.type === 'gacha' ? '#ffc107' : purchaseDialog.type === 'subscription' ? '#ffd700' : '#c080ff',
                  mb: 1
                }}>
                  {purchaseDialog.type === 'gacha' ? '🎫' : purchaseDialog.type === 'subscription' ? '👑' : '💎'} {purchaseDialog.selectedAmount?.toLocaleString()}{purchaseDialog.type === 'gacha' ? 'ポイント' : purchaseDialog.type === 'subscription' ? 'ヶ月' : '個'}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#00ff88' }}>
                  ¥{purchaseDialog.selectedPrice?.toLocaleString()}
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#888' }}>
                  💳 クレジットカード決済のみ対応
                </Typography>
              </Box>
              <Button
                variant="contained"
                color="success"
                size="large"
                fullWidth
                onClick={handlePurchase}
                sx={{
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  mb: 1
                }}
              >
                支払いを確定する
              </Button>
              <Button
                variant="text"
                onClick={goBackToSelect}
                sx={{ color: colors.textSecondary }}
              >
                ← 金額を選び直す
              </Button>
            </Box>
          )}
        </DialogContent>
        {purchaseDialog.step === 'select' && (
          <DialogActions>
            <Button onClick={closePurchaseDialog}>閉じる</Button>
          </DialogActions>
        )}
      </Dialog>
    </Box>
  );
};

export default NavBar;

