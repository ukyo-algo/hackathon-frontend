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
  
  // ↓↓↓ 追加: エンゲージメント機能用のState
  const [commentText, setCommentText] = useState("");
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false); // 注: 本当はバックエンドから「自分がいいねしたか」を取得する必要がありますが、今回は簡易的に管理
  const [activeTab, setActiveTab] = useState('description'); // 'description' or 'comments'
  // ↑↑↑

  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL;

  // 商品データの取得
  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        // コメントと出品者情報を含めて取得
        const response = await fetch(`${API_URL}/api/v1/items/${itemId}`);
        if (!response.ok) throw new Error('商品の取得に失敗しました');
        
        const data = await response.json();
        setItem(data);
        setLikeCount(data.like_count || 0);
        
        // 簡易チェック: すでにいいね済みかを判定したい場合、バックエンドの改修が必要ですが、
        // 今回は「画面を開いたときは未いいね」スタートの簡易実装とします。
        
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
        if (response.ok) setRecommendations(await response.json());
      } catch (err) {
        console.error("Failed to fetch recommendations:", err);
      }
    };
    if (itemId) fetchRecommendations();
  }, [itemId, API_URL]);

  // いいねボタンの処理
  const handleLike = async () => {
    if (!currentUser) return navigate('/login');

    // 楽観的UI更新（APIを待たずに見た目を変える）
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);

    try {
      await fetch(`${API_URL}/api/v1/items/${itemId}/like`, {
        method: 'POST',
        headers: { 'X-Firebase-Uid': currentUser.uid },
      });
    } catch (err) {
      console.error("Like failed", err);
      // 失敗したら元に戻す
      setIsLiked(!isLiked);
      setLikeCount(prev => isLiked ? prev + 1 : prev - 1);
    }
  };

  // コメント投稿処理
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return navigate('/login');
    if (!commentText.trim()) return;

    try {
      const response = await fetch(`${API_URL}/api/v1/items/${itemId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Firebase-Uid': currentUser.uid,
        },
        body: JSON.stringify({ content: commentText }),
      });

      if (response.ok) {
        const newComment = await response.json();
        // 新しいコメントをリストの先頭に追加
        setItem(prev => ({
          ...prev,
          comments: [newComment, ...(prev.comments || [])]
        }));
        setCommentText("");
      }
    } catch (err) {
      alert("コメントの投稿に失敗しました");
    }
  };

  // 購入処理
  const handleBuy = async () => {
    if (!currentUser) {
      alert("購入するにはログインが必要です");
      navigate('/login');
      return;
    }
    if (!window.confirm(`「${item.name}」を購入しますか？`)) return;

    try {
      setBuying(true);
      const response = await fetch(`${API_URL}/api/v1/items/${itemId}/buy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Firebase-Uid': currentUser.uid,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || '購入に失敗しました');
      }
      alert("購入が完了しました！🎉");
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

  const isSold = item.status === 'sold';
  const isMyItem = currentUser && item.seller.firebase_uid === currentUser.uid;

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      
      {/* 商品画像 & SOLD表示 */}
      <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ddd' }}>
        <img 
          src={item.image_url || "https://via.placeholder.com/400x300"} 
          alt={item.name} 
          style={{ width: '100%', height: '300px', objectFit: 'cover', opacity: isSold ? 0.5 : 1 }} 
        />
        {isSold && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', color: 'white', fontSize: '3rem', fontWeight: 'bold', transform: 'rotate(-15deg)' }}>
            SOLD
          </div>
        )}
      </div>

      {/* 商品タイトル・価格・いいね */}
      <div style={{ padding: '20px 0' }}>
        <h1 style={{ fontSize: '24px', margin: '0 0 10px' }}>{item.name}</h1>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#e91e63', margin: 0 }}>
            ¥{item.price.toLocaleString()}
          </p>
          
          {/* いいねボタン */}
          <button 
            onClick={handleLike}
            style={{ 
              background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '18px',
              color: isLiked ? '#e91e63' : '#666'
            }}
          >
            {isLiked ? '❤️' : '🤍'} {likeCount}
          </button>
        </div>

        {/* タブ切り替え */}
        <div style={{ display: 'flex', borderBottom: '1px solid #ddd', marginBottom: '20px' }}>
          <button 
            onClick={() => setActiveTab('description')}
            style={{ flex: 1, padding: '10px', background: 'none', border: 'none', borderBottom: activeTab === 'description' ? '3px solid #e91e63' : 'none', fontWeight: activeTab === 'description' ? 'bold' : 'normal', cursor: 'pointer' }}
          >
            商品説明
          </button>
          <button 
            onClick={() => setActiveTab('comments')}
            style={{ flex: 1, padding: '10px', background: 'none', border: 'none', borderBottom: activeTab === 'comments' ? '3px solid #e91e63' : 'none', fontWeight: activeTab === 'comments' ? 'bold' : 'normal', cursor: 'pointer' }}
          >
            コメント ({item.comments ? item.comments.length : 0})
          </button>
        </div>

        {/* タブの中身 */}
        {activeTab === 'description' ? (
          <div>
            <table style={{ width: '100%', marginBottom: '20px', borderCollapse: 'collapse' }}>
              <tbody>
                <tr><th style={{textAlign:'left', color:'#666', padding:'8px'}}>出品者</th><td>{item.seller.username}</td></tr>
                <tr><th style={{textAlign:'left', color:'#666', padding:'8px'}}>カテゴリ</th><td>{item.category}</td></tr>
                <tr><th style={{textAlign:'left', color:'#666', padding:'8px'}}>状態</th><td>{item.condition}</td></tr>
              </tbody>
            </table>
            <p style={{ lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{item.description}</p>
          </div>
        ) : (
          <div>
            {/* コメントリスト */}
            <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '20px', background: '#f9f9f9', padding: '10px', borderRadius: '8px' }}>
              {(!item.comments || item.comments.length === 0) ? (
                <p style={{ color: '#999', textAlign: 'center' }}>コメントはまだありません。</p>
              ) : (
                item.comments.map(comment => (
                  <div key={comment.comment_id} style={{ marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                      <div style={{ width: '30px', height: '30px', background: '#ddd', borderRadius: '50%', display:'flex', alignItems:'center', justifyContent:'center' }}>👤</div>
                      <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{comment.user.username}</span>
                      <span style={{ fontSize: '12px', color: '#999' }}>{new Date(comment.created_at).toLocaleDateString()}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '15px' }}>{comment.content}</p>
                  </div>
                ))
              )}
            </div>

            {/* コメント投稿フォーム */}
            <form onSubmit={handleCommentSubmit} style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="text" 
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="コメントを入力..." 
                style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
              <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                送信
              </button>
            </form>
          </div>
        )}

        <div style={{ height: '30px' }}></div>

        {/* 購入ボタン */}
        {isSold ? (
            <button disabled style={{ width: '100%', padding: '15px', backgroundColor: '#ccc', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '18px', fontWeight: 'bold' }}>売り切れました</button>
        ) : isMyItem ? (
          <button disabled style={{ width: '100%', padding: '15px', backgroundColor: '#aaa', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '18px', fontWeight: 'bold' }}>自分で出品した商品です</button>
        ) : (
          <button onClick={handleBuy} disabled={buying} style={{ width: '100%', padding: '15px', backgroundColor: '#e91e63', color: 'white', border: 'none', borderRadius: '4px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }}>
            {buying ? '処理中...' : '購入する'}
          </button>
        )}
      </div>

      <hr style={{ margin: '40px 0', borderTop: '1px solid #eee' }} />

      {/* レコメンド表示 */}
      <div>
        <h3 style={{ fontSize: '18px', marginBottom: '15px' }}>こちらもおすすめ</h3>
        {recommendations.length > 0 && (
          <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '10px' }}>
            {recommendations.map(rec => (
              <div key={rec.item_id} style={{ minWidth: '120px', width: '120px', border: '1px solid #eee', borderRadius: '8px', padding: '8px' }}>
                <Link to={`/items/${rec.item_id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <img src={rec.image_url} alt={rec.name} style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '4px' }} />
                  <p style={{ fontSize: '14px', height: '40px', overflow: 'hidden' }}>{rec.name}</p>
                  <p style={{ color: '#e91e63', fontWeight: 'bold' }}>¥{rec.price.toLocaleString()}</p>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemDetailPage;