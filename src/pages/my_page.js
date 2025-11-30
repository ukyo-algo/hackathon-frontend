// src/pages/my_page.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/auth_context';

const MyPage = () => {
  const [activeTab, setActiveTab] = useState('selling'); // 'selling' or 'bought'
  const [sellingItems, setSellingItems] = useState([]);
  const [boughtItems, setBoughtItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { currentUser } = useAuth();
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (!currentUser) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 自分の出品商品を取得
        const sellingRes = await fetch(`${API_URL}/api/v1/users/me/items`, {
          headers: { 'X-Firebase-Uid': currentUser.uid }
        });
        if (sellingRes.ok) setSellingItems(await sellingRes.json());

        // 購入履歴を取得
        const boughtRes = await fetch(`${API_URL}/api/v1/users/me/transactions`, {
          headers: { 'X-Firebase-Uid': currentUser.uid }
        });
        if (boughtRes.ok) setBoughtItems(await boughtRes.json());

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
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
        <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#eee', marginRight: '15px' }}>
          {/* アイコンがあれば表示 */}
        </div>
        <div>
          <h2 style={{ margin: 0 }}>{currentUser.email.split('@')[0]}</h2>
          <p style={{ margin: 0, color: '#666' }}>{currentUser.email}</p>
        </div>
      </div>

      {/* タブ切り替え */}
      <div style={{ display: 'flex', borderBottom: '1px solid #ddd', marginBottom: '20px' }}>
        <button 
          onClick={() => setActiveTab('selling')}
          style={{ 
            padding: '10px 20px', 
            border: 'none', 
            background: 'none', 
            borderBottom: activeTab === 'selling' ? '3px solid #e91e63' : 'none',
            fontWeight: activeTab === 'selling' ? 'bold' : 'normal',
            cursor: 'pointer'
          }}
        >
          出品した商品
        </button>
        <button 
          onClick={() => setActiveTab('bought')}
          style={{ 
            padding: '10px 20px', 
            border: 'none', 
            background: 'none', 
            borderBottom: activeTab === 'bought' ? '3px solid #e91e63' : 'none',
            fontWeight: activeTab === 'bought' ? 'bold' : 'normal',
            cursor: 'pointer'
          }}
        >
          購入した商品
        </button>
      </div>

      {/* リスト表示 */}
      <div className="item-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        {activeTab === 'selling' ? (
          sellingItems.length === 0 ? <p>出品した商品はまだありません。</p> :
          sellingItems.map(item => (
            <ItemCard key={item.item_id} item={item} />
          ))
        ) : (
          boughtItems.length === 0 ? <p>購入した商品はまだありません。</p> :
          boughtItems.map(transaction => (
            <ItemCard key={transaction.transaction_id} item={transaction.item} isSold={true} />
          ))
        )}
      </div>
    </div>
  );
};

// 簡易アイテムカードコンポーネント
const ItemCard = ({ item, isSold }) => (
  <div style={{ border: '1px solid #ccc', padding: '10px', width: '200px', borderRadius: '8px' }}>
    <Link to={`/items/${item.item_id}`} style={{ textDecoration: 'none', color: 'black' }}>
      <div style={{ position: 'relative' }}>
        <img src={item.image_url || "https://via.placeholder.com/150"} alt={item.name} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '4px' }} />
        {(isSold || item.status === 'sold') && (
           <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>SOLD</div>
        )}
      </div>
      <h3 style={{ fontSize: '16px', margin: '10px 0 5px' }}>{item.name}</h3>
      <p style={{ margin: 0, color: '#e91e63', fontWeight: 'bold' }}>¥{item.price}</p>
    </Link>
  </div>
);

export default MyPage;