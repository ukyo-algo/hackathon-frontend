import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import { AuthProvider } from './contexts/auth_context';
import { DEBUG } from './config';

// NavBarはコンポーネントへ分離しました
import NavBar from './components/NavBar';


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