// hackathon-frontend/src/App.js

import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/auth_context';

import Homepage from './pages/homepage'; // ★ファイル名修正により、インポートパスは小文字になっている
import RegisterPage from './pages/register_page';
import LoginPage from './pages/login_page';
import ItemCreatePage from './pages/item_create_page';
import ItemDetailPage from './pages/item_detail_page';
import MyPage from './pages/my_page';
import AIChatWidget from './components/AIChatWidget'; // ★追加

console.log("現在のAPI_URL設定値:", process.env.REACT_APP_API_URL);

// ... (NavBar コンポーネントは省略) ...

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NavBar /> 
        <div style={{ padding: '20px' }}>
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/items/create" element={<ItemCreatePage />} />
            <Route path="/items/:itemId" element={<ItemDetailPage />} />
            <Route path="/mypage" element={<MyPage />} />
          </Routes>
        </div>
        
        {/* ★ここに AI Chat Widget を追加 */}
        <AIChatWidget />
        
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;