// src/pages/Homepage.js

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // 詳細ページへのリンクを使うため

const API_URL = process.env.REACT_APP_API_URL;

const Homepage = () => {
  // 1. データを保持するための「状態(state)」を定義
  const [items, setItems] = useState([]); // 商品データ (最初は空の配列)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 2. ページが読み込まれた時に「商品一覧API」を叩く
  useEffect(() => {
    const loadItems = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // getItems APIを呼び出す
        const response = await fetch(`${API_URL}/api/v1/items`); 
        
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setItems(data); // 取得した商品データ（配列）をstateに保存
      
      } catch (err) {
        setError('商品の読み込みに失敗しました。');
        console.error("Error fetching items:", err);
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, []); // [] なので、ページ表示時に1回だけ実行

  // 3. 画面に表示する内容
  if (loading) {
    return <div>読み込み中...</div>;
  }
  if (error) {
    return <div>エラー: {error}</div>;
  }

  return (
    <div>
      <h2>商品一覧</h2>
      <div className="item-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        {items.map((item) => (
          <div key={item.item_id} className="item-card" style={{ border: '1px solid #ccc', padding: '10px', width: '200px' }}>
            
            {/* ★★★ ルーティングの設定 ★★★
                Linkタグで、クリックしたら詳細ページに飛ぶようにする
                URL: /items/item.item_id 
            */}
            <Link to={`/items/${item.item_id}`} style={{ textDecoration: 'none', color: 'black' }}>
              <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
              <h3>{item.name}</h3>
              <p>{item.price} 円</p>
              <p>出品者: {item.seller.username}</p>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Homepage;