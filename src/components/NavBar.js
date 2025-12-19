// src/components/NavBar.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box, TextField, InputAdornment, Badge, IconButton,
  Popover, List, ListItem, ListItemText, Typography, Divider, Button
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
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
      const interval = setInterval(fetchNotifications, 30000); // 30秒ごと
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  // 通知クリック
  const handleNotificationClick = async (notification) => {
    // 既読にする
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
    // ページ遷移
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

  const notificationOpen = Boolean(notificationAnchor);

  return (
    <Box sx={navBarStyles.container}>
      {/* 上部: ロゴ・検索 */}
      <Box sx={navBarStyles.topSection}>
        {/* ロゴ（ホームへ） */}
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
          <IconButton
            onClick={(e) => setNotificationAnchor(e.currentTarget)}
            sx={{ color: colors.textSecondary }}
          >
            <Badge badgeContent={unreadCount} color="error" max={99}>
              <NotificationsIcon />
            </Badge>
          </IconButton>
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

        {/* コイン残高表示 */}
        {currentUser && (
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            backgroundColor: colors.backgroundAlt,
            border: `1px solid ${colors.border}`,
            borderRadius: 1,
            px: 1.5,
            py: 0.5,
          }}>
            <Box sx={{ fontSize: '1.2rem' }}>🎫</Box>
            <Box sx={{
              fontFamily: '"VT323", monospace',
              fontSize: '1.2rem',
              color: colors.warning,
              textShadow: `0 0 8px ${colors.warning}40`,
            }}>
              {(currentUser.gacha_points || 0).toLocaleString()}
            </Box>
          </Box>
        )}
        {currentUser && (
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            padding: '4px 8px',
            borderRadius: '8px',
            background: 'rgba(128, 0, 255, 0.15)',
            border: '1px solid rgba(128, 0, 255, 0.3)',
          }}>
            <Box sx={{ fontSize: '1rem' }}>💎</Box>
            <Box sx={{
              fontFamily: '"VT323", monospace',
              fontSize: '1rem',
              color: '#c080ff',
              textShadow: `0 0 8px rgba(128, 0, 255, 0.4)`,
            }}>
              {(currentUser.memory_fragments || 0).toLocaleString()}
            </Box>
          </Box>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }} />
      </Box>

      {/* 下部: 主要ページ遷移ボタン群 */}
      {currentUser ? (
        <Box sx={navBarStyles.navButtons}>
          {/* 基本ナビゲーション */}
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Box component="button" sx={buttonStyles.primary}>ホーム</Box>
          </Link>
          <Link to="/mypage" style={{ textDecoration: 'none' }}>
            <Box component="button" sx={buttonStyles.outlined}>マイページ</Box>
          </Link>

          {/* 出品・取引 */}
          <Link to="/items/create" style={{ textDecoration: 'none' }}>
            <Box component="button" sx={buttonStyles.success}>出品</Box>
          </Link>
          <Link to="/seller" style={{ textDecoration: 'none' }}>
            <Box component="button" sx={buttonStyles.outlined}>売品の状況</Box>
          </Link>
          <Link to="/buyer" style={{ textDecoration: 'none' }}>
            <Box component="button" sx={buttonStyles.outlined}>購入物の状況</Box>
          </Link>

          {/* エンタメ・キャラ */}
          <Link to="/gacha" style={{ textDecoration: 'none' }}>
            <Box component="button" sx={buttonStyles.secondary}>ガチャ</Box>
          </Link>
          <Link to="/mission" style={{ textDecoration: 'none' }}>
            <Box component="button" sx={buttonStyles.outlined}>🎯ミッション</Box>
          </Link>
          <Link to="/persona-selection" style={{ textDecoration: 'none' }}>
            <Box component="button" sx={buttonStyles.outlined}>キャラ変更</Box>
          </Link>

          {/* システム */}
          <Box component="button" onClick={logout} sx={buttonStyles.neutral}>ログアウト</Box>
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
    </Box>
  );
};

export default NavBar;

