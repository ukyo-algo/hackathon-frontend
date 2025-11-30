// src/pages/item_detail_page.js

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const ItemDetailPage = () => {
  const { itemId } = useParams(); // URLパラメータからitemIdを取得
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/v1/items/${itemId}`);
        
        if (!response.ok) {
          throw new Error('商品の取得に失敗しました');
        }
        
        const data = await response.json();
        setItem(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [itemId, API_URL]);

  if (loading) return <div style={{ padding: '20px' }}>読み込み中...</div>;
  if (error) return <div style={{ padding: '20px', color: 'red' }}>エラー: {error}</div>;
  if (!item) return <div style={{ padding: '20px' }}>商品が見つかりません</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
        {/* 商品画像 */}
        <img 
          src={item.image_url || "https://via.placeholder.com/400x300?text=No+Image"} 
          alt={item.name} 
          style={{ width: '100%', height: '300px', objectFit: 'cover' }} 
        />
        
        <div style={{ padding: '20px' }}>
          {/* 商品名と価格 */}
          <h1 style={{ fontSize: '24px', marginBottom: '10px' }}>{item.name}</h1>
          <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#e91e63', marginBottom: '20px' }}>
            ¥{item.price.toLocaleString()}
          </p>

          {/* 詳細情報テーブル */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
            <tbody>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <th style={{ textAlign: 'left', padding: '8px', color: '#666' }}>出品者</th>
                <td style={{ padding: '8px' }}>{item.seller.username}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <th style={{ textAlign: 'left', padding: '8px', color: '#666' }}>カテゴリー</th>
                <td style={{ padding: '8px' }}>{item.category}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <th style={{ textAlign: 'left', padding: '8px', color: '#666' }}>ブランド</th>
                <td style={{ padding: '8px' }}>{item.brand || '-'}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <th style={{ textAlign: 'left', padding: '8px', color: '#666' }}>商品の状態</th>
                <td style={{ padding: '8px' }}>{item.condition}</td>
              </tr>
            </tbody>
          </table>

          {/* 商品説明 */}
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '10px' }}>商品の説明</h3>
            <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
              {item.description || '説明はありません。'}
            </p>
          </div>

          {/* 購入ボタンエリア (今は見た目だけ) */}
          <button 
            style={{ 
              width: '100%', 
              padding: '15px', 
              backgroundColor: '#e91e63', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              fontSize: '18px', 
              fontWeight: 'bold',
              cursor: 'pointer' 
            }}
            onClick={() => alert('購入機能は次回実装します！')}
          >
            購入画面に進む
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItemDetailPage;