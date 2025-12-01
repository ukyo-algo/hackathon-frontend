// src/pages/item_detail_page.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/auth_context';

const ItemDetailPage = () => {
  const { itemId } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [buying, setBuying] = useState(false);
  const [recommendations, setRecommendations] = useState([]);

  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL;

  // 商品データの取得
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

  // レコメンド商品の取得
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await fetch(`${API_URL}/api/v1/items/${itemId}/recommend`);
        if (response.ok) {
          const data = await response.json();
          setRecommendations(data);
        }
      } catch (err) {
        console.error("Failed to fetch recommendations:", err);
      }
    };

    if (itemId) {
      fetchRecommendations();
    }
  }, [itemId, API_URL]);

  // 購入ボタンが押されたときの処理
  const handleBuy = async () => {
    if (!currentUser) {
      alert("購入するにはログインが必要です");
      navigate('/login');
      return;
    }

    if (!window.confirm(`「${item.name}」を購入しますか？`)) {
      return;
    }

    try {
      setBuying(true);
      
      // 購入APIを叩く
      const response = await fetch(`${API_URL}/api/v1/items/${itemId}/buy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 自分のUIDをヘッダーに乗せる
          'X-Firebase-Uid': currentUser.uid,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || '購入に失敗しました');
      }

      alert("購入が完了しました！🎉");
      
      // 画面をリロードして最新の状態（SOLD表示）にする
      window.location.reload();

    } catch (err) {
      alert(err.message);
    } finally {
      setBuying(false);
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>読み込み中...</div>;
  if (error) return <div style={{ padding: '20px', color: 'red' }}>エラー: {error}</div>;
  if (!item) return <div style={{ padding: '20px' }}>商品が見つかりません</div>;

  // ボタンの出し分けロジック
  const isSold = item.status === 'sold';
  const isMyItem = currentUser && item.seller.firebase_uid === currentUser.uid;

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
        
        {/* 画像エリア: SOLDの場合はラベルを表示 */}
        <div style={{ position: 'relative' }}>
          <img 
            src={item.image_url || "https://via.placeholder.com/400x300?text=No+Image"} 
            alt={item.name} 
            style={{ width: '100%', height: '300px', objectFit: 'cover', opacity: isSold ? 0.5 : 1 }} 
          />
          {isSold && (
            <div style={{
              position: 'absolute', top: '0', left: '0', width: '100%', height: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backgroundColor: 'rgba(0,0,0,0.5)', color: 'white', fontSize: '3rem', fontWeight: 'bold',
              transform: 'rotate(-15deg)'
            }}>
              SOLD
            </div>
          )}
        </div>
        
        <div style={{ padding: '20px' }}>
          <h1 style={{ fontSize: '24px', marginBottom: '10px' }}>{item.name}</h1>
          <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#e91e63', marginBottom: '20px' }}>
            ¥{item.price.toLocaleString()}
          </p>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
            <tbody>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <th style={{ textAlign: 'left', padding: '8px', color: '#666' }}>出品者</th>
                <td style={{ padding: '8px' }}>{item.seller.username} {isMyItem && "(あなた)"}</td>
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

          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '10px' }}>商品の説明</h3>
            <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', color: '#333' }}>
              {item.description || '説明はありません。'}
            </p>
          </div>

          {/* 購入ボタンエリア */}
          {isSold ? (
             <button disabled style={{ width: '100%', padding: '15px', backgroundColor: '#ccc', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '18px', fontWeight: 'bold', cursor: 'not-allowed' }}>
               売り切れました
             </button>
          ) : isMyItem ? (
            <button disabled style={{ width: '100%', padding: '15px', backgroundColor: '#aaa', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '18px', fontWeight: 'bold', cursor: 'not-allowed' }}>
              自分で出品した商品です
            </button>
          ) : (
            <button 
              onClick={handleBuy}
              disabled={buying}
              style={{ 
                width: '100%', 
                padding: '15px', 
                backgroundColor: buying ? '#ccc' : '#e91e63', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                fontSize: '18px', 
                fontWeight: 'bold',
                cursor: buying ? 'wait' : 'pointer' 
              }}
            >
              {buying ? '処理中...' : '購入する'}
            </button>
          )}

          <hr style={{ margin: '40px 0', border: 'none', borderTop: '1px solid #eee' }} />

          {/* レコメンド表示エリア */}
          <div>
            <h3 style={{ fontSize: '18px', marginBottom: '15px' }}>こちらもおすすめ</h3>
            {recommendations.length === 0 ? (
              <p style={{ color: '#999' }}>おすすめ商品はまだありません。</p>
            ) : (
              <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '10px' }}>
                {recommendations.map((recItem) => (
                  <div key={recItem.item_id} style={{ minWidth: '120px', width: '120px', border: '1px solid #eee', borderRadius: '8px', padding: '8px', flexShrink: 0 }}>
                    <Link to={`/items/${recItem.item_id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <img 
                        src={recItem.image_url || "https://via.placeholder.com/150"} 
                        alt={recItem.name} 
                        style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '4px', marginBottom: '5px' }} 
                      />
                      <p style={{ fontSize: '14px', margin: '0 0 5px', height: '40px', overflow: 'hidden' }}>{recItem.name}</p>
                      <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#e91e63', margin: 0 }}>¥{recItem.price.toLocaleString()}</p>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ItemDetailPage;