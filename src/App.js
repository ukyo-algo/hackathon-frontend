// hackathon-frontend/src/App.js

import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/auth_context';

// ★ ファイル名のエラー回避のため、パスを小文字に統一します（これが正しいファイル名と仮定）
import Homepage from './pages/homepage'; 
import RegisterPage from './pages/register_page';
import LoginPage from './pages/login_page';
import ItemCreatePage from './pages/item_create_page';
import ItemDetailPage from './pages/item_detail_page';
import MyPage from './pages/my_page';
import PersonaSelectionPage from './pages/persona_selection_page';
// ★ LLM機能を追加
import AIChatWidget from './components/AIChatWidget'; 

console.log("現在のAPI_URL設定値:", process.env.REACT_APP_API_URL);


// ★★★ NavBar コンポーネント定義の完全版（未定義エラー回避） ★★★
const NavBar = () => {
    // 認証情報を使用
    const { currentUser, logout } = useAuth();
    
    return (
        <nav style={{ padding: '10px 20px', background: '#f8f8f8', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '15px' }}>
                {/* ロゴやホームリンク */}
                <Link to="/" style={{ fontWeight: 'bold' }}>FleaMarketApp</Link>
                {/* ログインユーザーのみ出品可能 */}
                {currentUser && <Link to="/items/create">出品</Link>}
            </div>
            <div>
                {currentUser ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        {/* ユーザー名表示 */}
                        <Link to="/mypage" style={{ textDecoration: 'none', color: '#333' }}>
                            ようこそ、{currentUser.username}さん
                        </Link>
                        {/* ログアウトボタン */}
                        <button onClick={logout} style={{ marginLeft: '10px', padding: '5px 10px', cursor: 'pointer' }}>ログアウト</button>
                    </div>
                ) : (
                    <>
                        {/* ログイン/新規登録リンク */}
                        <Link to="/login">ログイン</Link> / <Link to="/register">新規登録</Link>
                    </>
                )}
            </div>
        </nav>
    );
};
// ★★★ NavBar コンポーネント定義の終わり ★★★


function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                {/* 1. ナビゲーションバー */}
                <NavBar /> 
                
                {/* 2. メインコンテンツ領域 */}
                <div style={{ padding: '20px' }}>
                    <Routes>
                        <Route path="/" element={<Homepage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/items/create" element={<ItemCreatePage />} />
                        <Route path="/items/:itemId" element={<ItemDetailPage />} />
                        <Route path="/mypage" element={<MyPage />} />
                        <Route path="/persona-selection" element={<PersonaSelectionPage />} />
                    </Routes>
                </div>
                
                {/* 3. AIチャットウィジェット (全ページ共通の固定表示) */}
                <AIChatWidget />
                
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;