// src/pages/my_page.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { COLORS, PLACEHOLDER_IMAGE, CARD } from '../config';
import { useAuth } from '../contexts/auth_context';

const MyPage = () => {
  // タブの状態: 'selling', 'bought', 'likes', 'comments' の4種類に増えました
  const [activeTab, setActiveTab] = useState('selling');
  
  const [sellingItems, setSellingItems] = useState([]);
  const [boughtItems, setBoughtItems] = useState([]);
  const [likedItems, setLikedItems] = useState([]);       // 追加: いいねした商品
  const [commentedItems, setCommentedItems] = useState([]); // 追加: コメントした商品
  
  const [loading, setLoading] = useState(true);
  
  const { currentUser } = useAuth();
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (!currentUser) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const headers = { 'X-Firebase-Uid': currentUser.uid };
        
        // 1. 出品した商品
        const sellingRes = await fetch(`${API_URL}/api/v1/users/me/items`, { headers });
        if (sellingRes.ok) setSellingItems(await sellingRes.json());

        // 2. 購入した商品
        const boughtRes = await fetch(`${API_URL}/api/v1/users/me/transactions`, { headers });
        if (boughtRes.ok) setBoughtItems(await boughtRes.json());

        // 3. いいねした商品 (新規追加)
        const likedRes = await fetch(`${API_URL}/api/v1/users/me/likes`, { headers });
        if (likedRes.ok) setLikedItems(await likedRes.json());

        // 4. コメントした商品 (新規追加)
        const commentedRes = await fetch(`${API_URL}/api/v1/users/me/comments`, { headers });
        if (commentedRes.ok) setCommentedItems(await commentedRes.json());

      } catch (error) {
        console.error("Error fetching my page data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser, API_URL]);

  if (!currentUser) return <div style={{padding: '20px'}}>ログインしてください</div>;
  if (loading) return <div style={{padding: '20px'}}>読み込み中...</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      {/* ユーザー情報ヘッダー */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#eee', marginRight: '15px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'30px' }}>
            👤
          </div>
          <div>
            <h2 style={{ margin: 0 }}>{currentUser.email.split('@')[0]}</h2>
            <p style={{ margin: 0, color: '#666' }}>{currentUser.email}</p>
          </div>
        </div>
          <Link to="/persona-selection" style={{ textDecoration: 'none' }}>
            <button style={{
              padding: '8px 16px',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}>
              キャラ変更
            </button>
          </Link>
      </div>

      {/* タブ切り替えボタン */}
      {/* 配送状況パネル（ヘッダー直下）は削除されました */}

      {/* タブ切り替えボタン */}
      <div style={{ display: 'flex', borderBottom: '1px solid #ddd', marginBottom: '20px', overflowX: 'auto' }}>
        <TabButton label="出品した商品" isActive={activeTab === 'selling'} onClick={() => setActiveTab('selling')} />
        <TabButton label="購入した商品" isActive={activeTab === 'bought'} onClick={() => setActiveTab('bought')} />
        <TabButton label="いいね一覧" isActive={activeTab === 'likes'} onClick={() => setActiveTab('likes')} />
        <TabButton label="コメント履歴" isActive={activeTab === 'comments'} onClick={() => setActiveTab('comments')} />
      </div>

      {/* リスト表示エリア */}
      <div className="item-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        
        {/* 1. 出品した商品 */}
        {activeTab === 'selling' && (
          sellingItems.length === 0 ? <p>出品した商品はまだありません。</p> :
          sellingItems.map(item => <ItemCard key={item.item_id} item={item} />)
        )}

        {/* 2. 購入した商品 (これだけデータ構造が違うので注意: itemは transaction.item に入っている) */}
        {activeTab === 'bought' && (
          boughtItems.length === 0 ? <p>購入した商品はまだありません。</p> :
          boughtItems.map(transaction => <ItemCard key={transaction.transaction_id} item={transaction.item} isSold={true} />)
        )}

        {/* 3. いいねした商品 */}
        {activeTab === 'likes' && (
          likedItems.length === 0 ? <p>いいねした商品はまだありません。</p> :
          likedItems.map(item => <ItemCard key={item.item_id} item={item} />)
        )}

        {/* 4. コメントした商品 */}
        {activeTab === 'comments' && (
          commentedItems.length === 0 ? <p>コメントした商品はまだありません。</p> :
          commentedItems.map(item => <ItemCard key={item.item_id} item={item} />)
        )}

      </div>
    </div>
  );
};

// タブボタンのコンポーネント (見た目をスッキリさせるため)
const TabButton = ({ label, isActive, onClick }) => (
  <button 
    onClick={onClick}
    style={{ 
      padding: '10px 20px', 
      border: 'none', 
      background: 'none', 
      borderBottom: isActive ? '3px solid #e91e63' : 'none',
      fontWeight: isActive ? 'bold' : 'normal',
      cursor: 'pointer',
      whiteSpace: 'nowrap'
    }}
  >
    {label}
  </button>
);

// アイテムカードコンポーネント
const ItemCard = ({ item, isSold }) => {
  if (!item) return null; // データ欠損対策
  return (
    <div style={{ border: `1px solid ${CARD.BORDER}`, padding: '10px', width: `${CARD.WIDTH}px`, borderRadius: `${CARD.RADIUS}px` }}>
      <Link to={`/items/${item.item_id}`} style={{ textDecoration: 'none', color: 'black' }}>
        <div style={{ position: 'relative' }}>
          <img 
            src={item.image_url || PLACEHOLDER_IMAGE} 
            alt={item.name} 
            style={{ width: '100%', height: `${CARD.IMAGE_HEIGHT}px`, objectFit: 'cover', borderRadius: '4px' }} 
          />
          {(isSold || item.status === 'sold') && (
             <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: CARD.OVERLAY_BG, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>SOLD</div>
          )}
        </div>
        <h3 style={{ fontSize: '16px', margin: '10px 0 5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</h3>
        <p style={{ margin: 0, color: COLORS.PRIMARY, fontWeight: 'bold' }}>¥{item.price.toLocaleString()}</p>
      </Link>
    </div>
  );
};

export default MyPage;