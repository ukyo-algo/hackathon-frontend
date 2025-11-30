import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/auth_context';

import Homepage from './pages/Homepage';
import RegisterPage from './pages/register_page';
import LoginPage from './pages/login_page';

const NavBar = () => {
  const { currentUser, logout } = useAuth(); // currentUser・・・ユーザー情報を持ったオブジェクト、logout・・・ログアウト関数
  
  return (
    <nav style={{ padding: '10px', borderBottom: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <Link to="/" style={{ marginRight: '10px', textDecoration: 'none', fontWeight: 'bold' }}>FleaMarket</Link>
      </div>
      <div>
        {currentUser ? ( // ユーザー情報がある場合の処理
          <>
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
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;