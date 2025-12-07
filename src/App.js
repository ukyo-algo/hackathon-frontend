import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/auth_context';

import Homepage from './pages/Homepage';
import RegisterPage from './pages/register_page';
import LoginPage from './pages/login_page';
import ItemCreatePage from './pages/item_create_page';
import ItemDetailPage from './pages/item_detail_page';
import MyPage from './pages/my_page';
console.log("現在のAPI_URL設定値:", process.env.REACT_APP_API_URL);


const NavBar = () => {
  const { currentUser, logout } = useAuth();
  
  return (
    <nav style={{ padding: '10px', borderBottom: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <Link to="/" style={{ marginRight: '10px', textDecoration: 'none', fontWeight: 'bold' }}>FleaMarket</Link>
      </div>
      <div>
        {currentUser ? (
          <>
            {/* ↓↓↓ 商品出品ページへのリンクを追加 ↓↓↓ */}
            <Link to="/items/create" style={{ marginRight: '10px' }}>出品</Link> 
            <Link to="/mypage" style={{ marginRight: '10px' }}>マイページ</Link>
            
            <span style={{ marginRight: '10px' }}>{currentUser.email}</span>
            <button onClick={() => logout()}>ログアウト</button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ marginRight: '10px' }}>ログイン</Link>
            <Link to="/register">登録</Link>
          </>
        )}
      </div>
    </nav>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NavBar /> {/* 子要素がないものは閉じなくて良い */}
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
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;