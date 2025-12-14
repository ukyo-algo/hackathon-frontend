import React from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Box, Container, TextField, InputAdornment } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/auth_context';
import SearchIcon from '@mui/icons-material/Search';
import {
  COLORS,
  NAV_CATEGORIES,
  CATEGORIES,
  SIDEBAR,
  DEBUG
} from './config';

// Pages
import Homepage from './pages/homepage'; 
import RegisterPage from './pages/register_page';
import LoginPage from './pages/login_page';
import ItemCreatePage from './pages/item_create_page';
import ItemDetailPage from './pages/item_detail_page';
import MyPage from './pages/my_page';
import PersonaSelectionPage from './pages/persona_selection_page';
import GachaPage from './pages/gacha_page';
import SearchResults from './pages/SearchResults';
import ShipmentsPage from './pages/shipments_page';
import DeliveriesPage from './pages/deliveries_page';
import RecentShipmentsPage from './pages/recent_shipments_page';

// Components
import AIChatWidgetSlide from './components/AIChatWidgetSlide';

if (DEBUG) {
  console.log('🚀 FleaMarket Frontend started in development mode');
}


// ========== NavBar コンポーネント ==========
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
            {/* 上部: ロゴ・検索・ログイン */}
            <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                px: 2,
                py: 1,
            }}>
                {/* ロゴ */}
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
                                    <SearchIcon sx={{ cursor: 'pointer', color: COLORS.TEXT_TERTIARY }} />
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

                {/* ログイン・出品ボタン（右上は何も表示しない） */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }} />
            </Box>

            {/* 下部: 主要ページ遷移ボタン群（ログイン時は出品・マイページ・キャラ変更・ガチャ・ログアウト、未ログイン時はログイン・会員登録） */}
            {currentUser ? (
                <Box sx={{ display: 'flex', gap: 2, px: 2, py: 1, borderTop: `1px solid ${COLORS.BORDER}`, justifyContent: 'flex-start' }}>
                    <Link to="/items/create" style={{ textDecoration: 'none' }}>
                        <Box component="button" sx={{ backgroundColor: COLORS.PRIMARY, color: 'white', border: 'none', px: 2, py: 1, borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', '&:hover': { backgroundColor: COLORS.PRIMARY_DARK } }}>出品</Box>
                    </Link>
                    <Link to="/persona-selection" style={{ textDecoration: 'none' }}>
                        <Box component="button" sx={{ backgroundColor: 'white', color: COLORS.SECONDARY, border: `1px solid ${COLORS.SECONDARY}`, px: 2, py: 1, borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', '&:hover': { backgroundColor: COLORS.BACKGROUND } }}>キャラを変更する</Box>
                    </Link>
                    <Link to="/gacha" style={{ textDecoration: 'none' }}>
                        <Box component="button" sx={{ backgroundColor: 'white', color: COLORS.SUCCESS, border: `1px solid ${COLORS.SUCCESS}`, px: 2, py: 1, borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', '&:hover': { backgroundColor: COLORS.BACKGROUND } }}>ガチャを引く</Box>
                    </Link>
                    {/* 取引関連のショートカット */}
                    <Link to="/shipments" style={{ textDecoration: 'none' }}>
                        <Box component="button" sx={{ backgroundColor: 'white', color: COLORS.SUCCESS, border: `1px solid ${COLORS.SUCCESS}`, px: 2, py: 1, borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', '&:hover': { backgroundColor: COLORS.BACKGROUND } }}>発送待ち</Box>
                    </Link>
                    <Link to="/deliveries" style={{ textDecoration: 'none' }}>
                        <Box component="button" sx={{ backgroundColor: 'white', color: COLORS.WARNING, border: `1px solid ${COLORS.WARNING}`, px: 2, py: 1, borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', '&:hover': { backgroundColor: COLORS.BACKGROUND } }}>到着待ち</Box>
                    </Link>
                    <Link to="/recent-shipments" style={{ textDecoration: 'none' }}>
                        <Box component="button" sx={{ backgroundColor: 'white', color: COLORS.TEXT_TERTIARY, border: `1px solid ${COLORS.BORDER}`, px: 2, py: 1, borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', '&:hover': { backgroundColor: COLORS.BACKGROUND } }}>最近の配達状況</Box>
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
// ========== NavBar コンポーネント終わり ==========


function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                    {/* ナビゲーションバー */}
                    <NavBar /> 
                    
                    {/* メインコンテンツとサイドバー */}
                    <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                        {/* メインコンテンツ領域 */}
                        <Box sx={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                            <Container maxWidth="lg">
                                <Routes>
                                    <Route path="/" element={<Homepage />} />
                                    <Route path="/register" element={<RegisterPage />} />
                                    <Route path="/login" element={<LoginPage />} />
                                    <Route path="/items/create" element={<ItemCreatePage />} />
                                    <Route path="/items/:itemId" element={<ItemDetailPage />} />
                                    <Route path="/mypage" element={<MyPage />} />
                                    <Route path="/persona-selection" element={<PersonaSelectionPage />} />
                                    <Route path="/gacha" element={<GachaPage />} />
                                    <Route path="/search" element={<SearchResults />} />
                                    <Route path="/shipments" element={<ShipmentsPage />} />
                                    <Route path="/deliveries" element={<DeliveriesPage />} />
                                    <Route path="/recent-shipments" element={<RecentShipmentsPage />} />
                                </Routes>
                            </Container>
                        </Box>
                        
                        {/* 右端に重ねて表示するAIチャットウィジェット */}
                        <AIChatWidgetSlide />
                    </Box>
                </Box>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;