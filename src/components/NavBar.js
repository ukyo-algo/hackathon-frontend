// src/components/NavBar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Box, TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useAuth } from '../contexts/auth_context';
import { buttonStyles, navBarStyles } from '../styles/commonStyles';
import { colors } from '../styles/theme';

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

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }} />
      </Box>

      {/* 下部: 主要ページ遷移ボタン群 */}
      {currentUser ? (
        <Box sx={navBarStyles.navButtons}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Box component="button" sx={buttonStyles.outlined}>ホーム</Box>
          </Link>
          <Link to="/items/create" style={{ textDecoration: 'none' }}>
            <Box component="button" sx={buttonStyles.primary}>出品</Box>
          </Link>
          <Link to="/mypage" style={{ textDecoration: 'none' }}>
            <Box component="button" sx={buttonStyles.outlined}>マイページ</Box>
          </Link>
          <Link to="/persona-selection" style={{ textDecoration: 'none' }}>
            <Box component="button" sx={buttonStyles.secondary}>キャラを変更する</Box>
          </Link>
          <Link to="/gacha" style={{ textDecoration: 'none' }}>
            <Box component="button" sx={buttonStyles.success}>ガチャを引く</Box>
          </Link>
          {/* 取引関連ショートカット */}
          <Link to="/seller" style={{ textDecoration: 'none' }}>
            <Box component="button" sx={buttonStyles.success}>売品の状況</Box>
          </Link>
          <Link to="/buyer" style={{ textDecoration: 'none' }}>
            <Box component="button" sx={buttonStyles.warning}>購入物の状況</Box>
          </Link>
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
