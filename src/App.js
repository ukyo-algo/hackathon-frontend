import React from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import { AuthProvider } from './contexts/auth_context';
import { DEBUG } from './config';

// NavBarはコンポーネントへ分離しました
import NavBar from './components/NavBar';
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