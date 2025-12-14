// src/pages/shipments_page.js
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/auth_context';
import { API_BASE_URL } from '../config';
import { Link } from 'react-router-dom';
import ProgressSteps from '../components/ProgressSteps';

const ShipmentsPage = () => {
  const { currentUser } = useAuth();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      if (!currentUser) return;
      try {
        setLoading(true);
        const headers = { 'X-Firebase-Uid': currentUser.uid };
        const res = await fetch(`${API_BASE_URL}/api/v1/transactions?role=seller&status=pending_shipment&limit=50`, { headers });
        if (res.ok) setList(await res.json());
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [currentUser]);

  if (!currentUser) return <div style={{padding: 20}}>ログインしてください</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>発送待ち</h2>
      {loading ? <p>読み込み中...</p> : (
        list.length === 0 ? <p>現在、発送待ちはありません。</p> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {list.map(t => (
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
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default ShipmentsPage;
