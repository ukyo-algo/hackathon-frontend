// src/components/NavBar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Box, TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useAuth } from '../contexts/auth_context';
import { COLORS } from '../config';

const NavBar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  return (
    <Box sx={{ backgroundColor: '#fff', borderBottom: `1px solid ${COLORS.BORDER}` }}>
      {/* 上部: ロゴ・検索 */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1 }}>
        {/* ロゴ（ホームへ） */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Box sx={{ fontSize: '24px', fontWeight: 'bold', color: COLORS.PRIMARY }}>
            🏪 FleaMarket
          </Box>
        </Link>

        {/* 検索バー */}
        <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: '400px', marginLeft: '20px' }}>
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
                    sx={{ cursor: 'pointer', color: COLORS.TEXT_TERTIARY }}
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
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '4px',
                backgroundColor: COLORS.BACKGROUND
              }
            }}
          />
        </form>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }} />
      </Box>

      {/* 下部: 主要ページ遷移ボタン群 */}
      {currentUser ? (
        <Box sx={{ display: 'flex', gap: 2, px: 2, py: 1, borderTop: `1px solid ${COLORS.BORDER}`, justifyContent: 'flex-start' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Box component="button" sx={{ backgroundColor: 'white', color: COLORS.PRIMARY, border: `1px solid ${COLORS.PRIMARY}`, px: 2, py: 1, borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', '&:hover': { backgroundColor: COLORS.BACKGROUND } }}>ホーム</Box>
          </Link>
          <Link to="/items/create" style={{ textDecoration: 'none' }}>
            <Box component="button" sx={{ backgroundColor: COLORS.PRIMARY, color: 'white', border: 'none', px: 2, py: 1, borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', '&:hover': { backgroundColor: COLORS.PRIMARY_DARK } }}>出品</Box>
          </Link>
          <Link to="/mypage" style={{ textDecoration: 'none' }}>
            <Box component="button" sx={{ backgroundColor: 'white', color: COLORS.PRIMARY, border: `1px solid ${COLORS.PRIMARY}`, px: 2, py: 1, borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', '&:hover': { backgroundColor: COLORS.BACKGROUND } }}>マイページ</Box>
          </Link>
          <Link to="/persona-selection" style={{ textDecoration: 'none' }}>
            <Box component="button" sx={{ backgroundColor: 'white', color: COLORS.SECONDARY, border: `1px solid ${COLORS.SECONDARY}`, px: 2, py: 1, borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', '&:hover': { backgroundColor: COLORS.BACKGROUND } }}>キャラを変更する</Box>
          </Link>
          <Link to="/gacha" style={{ textDecoration: 'none' }}>
            <Box component="button" sx={{ backgroundColor: 'white', color: COLORS.SUCCESS, border: `1px solid ${COLORS.SUCCESS}`, px: 2, py: 1, borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', '&:hover': { backgroundColor: COLORS.BACKGROUND } }}>ガチャを引く</Box>
          </Link>
          {/* 取引関連ショートカット */}
          <Link to="/seller" style={{ textDecoration: 'none' }}>
            <Box component="button" sx={{ backgroundColor: 'white', color: COLORS.SUCCESS, border: `1px solid ${COLORS.SUCCESS}`, px: 2, py: 1, borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', '&:hover': { backgroundColor: COLORS.BACKGROUND } }}>売品の状況</Box>
          </Link>
          <Link to="/buyer" style={{ textDecoration: 'none' }}>
            <Box component="button" sx={{ backgroundColor: 'white', color: COLORS.WARNING, border: `1px solid ${COLORS.WARNING}`, px: 2, py: 1, borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', '&:hover': { backgroundColor: COLORS.BACKGROUND } }}>購入物の状況</Box>
          </Link>
          <Box component="button" onClick={logout} sx={{ backgroundColor: 'white', color: COLORS.TEXT_SECONDARY, border: `1px solid ${COLORS.BORDER}`, px: 2, py: 1, borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', '&:hover': { backgroundColor: COLORS.BACKGROUND } }}>ログアウト</Box>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', gap: 2, px: 2, py: 1, borderTop: `1px solid ${COLORS.BORDER}`, justifyContent: 'flex-start' }}>
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <Box component="button" sx={{ backgroundColor: COLORS.PRIMARY, color: 'white', border: 'none', px: 2, py: 1, borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', '&:hover': { backgroundColor: COLORS.PRIMARY_DARK } }}>ログイン</Box>
          </Link>
          <Link to="/register" style={{ textDecoration: 'none' }}>
            <Box component="button" sx={{ backgroundColor: 'white', color: COLORS.PRIMARY, border: `1px solid ${COLORS.PRIMARY}`, px: 2, py: 1, borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', '&:hover': { backgroundColor: COLORS.BACKGROUND } }}>会員登録</Box>
          </Link>
        </Box>
      )}
    </Box>
  );
};

export default NavBar;
