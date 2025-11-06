import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// やっていること
//　HTMLの中身を動的に書き換えるために，index.htmlの中にあるroot要素を取得
//  Reactのルートを作成し，
//  root.renderで描画をする．

// public/index.html の #root 要素を取得
const rootElement = document.getElementById('root'); // 今開かれているHTMLファイル内のroot要素を取得
const root = ReactDOM.createRoot(rootElement);// Reactがアクセスするルートを作成

// Appコンポーネントを描画
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);