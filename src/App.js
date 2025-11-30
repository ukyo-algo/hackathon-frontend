// src/App.js (修正後のコード)

import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
// ↓ contextsも小文字にリネームしたことを想定し、パスを修正
import { AuthProvider, useAuth } from './contexts/auth_context';

import Homepage from './pages/Homepage';
// ↓↓↓ 修正: 実際のファイル名に合わせてパスをすべて小文字にする
import RegisterPage from './pages/register_page';
import LoginPage from './pages/login_page';

const NavBar = () => {
// ... (この部分は変更なし)
  const { currentUser, logout } = useAuth();
  
  return (
    <nav style={{ padding: '10px', borderBottom: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <Link to="/" style={{ marginRight: '10px', textDecoration: 'none', fontWeight: 'bold' }}>FleaMarket</Link>
      </div>
      <div>
        {currentUser ? (
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
        <NavBar />
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