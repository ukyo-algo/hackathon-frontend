// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/auth_context';

import Homepage from './pages/Homepage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/Loginpage';

// ナビゲーションバーコンポーネント
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