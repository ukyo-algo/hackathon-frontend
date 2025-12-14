// src/pages/recent_shipments_page.js
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/auth_context';
import { API_BASE_URL } from '../config';
import { Link } from 'react-router-dom';
import ProgressSteps from '../components/ProgressSteps';

const RecentShipmentsPage = () => {
  const { currentUser } = useAuth();
  const [shipped, setShipped] = useState([]); // 自分が出品者で配送中
  const [completed, setCompleted] = useState([]); // 自分が購入者で完了
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    if (!currentUser) return;
    let ignore = false;
    const fetchLists = async () => {
      try {
        setLoading(true);
        const headers = { 'X-Firebase-Uid': currentUser.uid };
        const rs = await fetch(`${API_BASE_URL}/api/v1/transactions?role=seller&status=in_transit&limit=20`, { headers });
        const rc = await fetch(`${API_BASE_URL}/api/v1/transactions?role=buyer&status=completed&limit=20`, { headers });
        if (!ignore) {
          if (rs.ok) setShipped(await rs.json()); else setShipped([]);
          if (rc.ok) setCompleted(await rc.json()); else setCompleted([]);
          setLastUpdated(new Date());
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetchLists();
    const timer = setInterval(fetchLists, 60000);
    return () => {
      ignore = true;
      clearInterval(timer);
    };
  }, [currentUser]);

  if (!currentUser) return <div style={{padding: 20}}>ログインしてください</div>;

  const renderRow = (t) => (
    <div key={t.transaction_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #ddd', borderRadius: 8, padding: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <img src={(t.item && t.item.image_url) || 'https://via.placeholder.com/64'} alt={t.item?.name || 'item'} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 4 }} />
        <Link to={`/items/${t.item?.item_id || ''}`} style={{ textDecoration: 'none', color: '#333', fontWeight: 'bold' }}>{t.item?.name || '商品'}</Link>
        <span style={{ color: '#e91e63', fontWeight: 'bold' }}>¥{(t.item?.price || 0).toLocaleString()}</span>
      </div>
      <div style={{ flex: 1, marginLeft: 20, marginRight: 20 }}>
        <ProgressSteps status={t.status} compact={true} />
      </div>
    </div>
  );

  return (
    <div style={{ padding: 20 }}>
      <h2>最近の配達状況</h2>
      {lastUpdated && (
        <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
          最終更新: {lastUpdated.toLocaleString()}
        </div>
      )}
      {loading ? <p>読み込み中...</p> : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <h3>売品の状況</h3>
            {shipped.length === 0 ? <p>該当なし</p> : shipped.map(renderRow)}
          </div>
          <div>
            <h3>購入物の状況</h3>
            {completed.length === 0 ? <p>該当なし</p> : completed.map(renderRow)}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentShipmentsPage;
