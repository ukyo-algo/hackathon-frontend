// src/pages/deliveries_page.js
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/auth_context';
import { API_BASE_URL } from '../config';
import { Link } from 'react-router-dom';
import ProgressSteps from '../components/ProgressSteps';

const DeliveriesPage = () => {
  const { currentUser } = useAuth();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    const run = async () => {
      if (!currentUser) return;
      try {
        setLoading(true);
        const headers = { 'X-Firebase-Uid': currentUser.uid };
        const res = await fetch(`${API_BASE_URL}/api/v1/transactions?role=buyer&status=in_transit&limit=50`, { headers });
        if (res.ok) setList(await res.json());
        setLastUpdated(new Date());
      } finally {
        setLoading(false);
      }
    };
    run();
    const id = setInterval(run, 60_000);
    return () => clearInterval(id);
  }, [currentUser]);

  if (!currentUser) return <div style={{padding: 20}}>ログインしてください</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>到着待ち</h2>
      {lastUpdated && (
        <div style={{ fontSize: 12, color: '#666', marginBottom: 8, textAlign: 'right' }}>
          最終更新: {lastUpdated.toLocaleString()}
        </div>
      )}
      {loading ? <p>読み込み中...</p> : (
        list.length === 0 ? <p>現在、到着待ちはありません。</p> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {list.map(t => (
              <div key={t.transaction_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #ddd', borderRadius: 8, padding: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <img src={(t.item && t.item.image_url) || 'https://via.placeholder.com/64'} alt={t.item?.name || 'item'} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 4 }} />
                  <Link to={`/items/${t.item?.item_id || ''}`} style={{ textDecoration: 'none', color: '#333', fontWeight: 'bold' }}>{t.item?.name || '商品'}</Link>
                  <span style={{ color: '#e91e63', fontWeight: 'bold' }}>¥{(t.item?.price || 0).toLocaleString()}</span>
                </div>
                {/* 進捗インジケータ */}
                <div style={{ flex: 1, marginLeft: 20, marginRight: 20 }}>
                  <ProgressSteps status={t.status} />
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default DeliveriesPage;
