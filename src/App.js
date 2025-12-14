import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import { AuthProvider } from './contexts/auth_context';
import { DEBUG } from './config';

// NavBarはコンポーネントへ分離しました
import NavBar from './components/NavBar';
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
import ShipmentsPage from './pages/seller_page';
import DeliveriesPage from './pages/buyer_page';
// import RecentShipmentsPage from './pages/recent_shipments_page';
import BuyPage from './pages/buy_page';
// Components
import AIChatWidgetSlide from './components/AIChatWidgetSlide';


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
                                    <Route path="/seller" element={<ShipmentsPage />} />
                                    <Route path="/buyer" element={<DeliveriesPage />} />
                                    {/* <Route path="/recent-shipments" element={<RecentShipmentsPage />} /> */}
                                    <Route path="/buy/:itemId" element={<BuyPage />} />
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