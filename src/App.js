// src/App.js

import React from 'react';
// ↓↓↓ 3つのコンポーネントを react-router-dom からインポート
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// ↓↓↓ これから作成する HomePage をインポート
import HomePage from './pages/HomePage';
// import ItemDetailPage from './pages/ItemDetailPage'; // (これは将来作成)

function App() {
  return (
    // <BrowserRouter> でアプリ全体を囲みます
    <BrowserRouter>
      <div>
        <h1>Flea Market App</h1>
        
        {/* <Routes> の中で、URLのルールを定義します */}
        <Routes>
          {/* URLが "/" (トップページ) の時は HomePage コンポーネントを表示 */}
          <Route path="/" element={<HomePage />} />
          
          {/* (将来追加) URLが "/items/商品ID" の時は ItemDetailPage を表示 */}
          {/* <Route path="/items/:itemId" element={<ItemDetailPage />} /> */}
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;