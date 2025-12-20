import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Box, Container, CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { AuthProvider } from './contexts/auth_context';
import theme from './styles/theme';
import { PageContextProvider } from './components/AIChatWidget';

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
import BuyPage from './pages/buy_page';
import MissionPage from './pages/mission_page';
import MessagesPage from './pages/messages_page';
import ChatRoomPage from './pages/chat_room_page';
// Components
import AIChatWidgetFloating from './components/AIChatWidgetFloating';



function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <BrowserRouter>
                <AuthProvider>
                    <PageContextProvider>
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
                                            <Route path="/buy/:itemId" element={<BuyPage />} />
                                            <Route path="/mission" element={<MissionPage />} />
                                            <Route path="/messages" element={<MessagesPage />} />
                                            <Route path="/messages/:conversationId" element={<ChatRoomPage />} />
                                        </Routes>
                                    </Container>
                                </Box>

                                {/* 右端に重ねて表示するAIチャットウィジェット */}
                                <AIChatWidgetFloating />
                            </Box>
                        </Box>
                    </PageContextProvider>
                </AuthProvider>
            </BrowserRouter>
        </ThemeProvider>
    );
}

export default App;