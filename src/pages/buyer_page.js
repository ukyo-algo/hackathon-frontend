// src/pages/deliveries_page.js
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/auth_context';
import { API_BASE_URL } from '../config';
import { Link } from 'react-router-dom';
import ProgressSteps from '../components/ProgressSteps';
import { usePageContext } from '../components/AIChatWidget';

const BuyerPage = () => {
  const { currentUser } = useAuth();
  const { setPageContext } = usePageContext();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  // ページコンテキストを設定
  useEffect(() => {
    const pendingCount = list.filter(t => t.status === 'pending_shipment').length;
    const inTransitCount = list.filter(t => t.status === 'in_transit').length;
    setPageContext({
      page: 'buyer_deliveries',
      pending_shipment_count: pendingCount,
      in_transit_count: inTransitCount,
      total_count: list.length,
    });
    return () => setPageContext(null);
  }, [list, setPageContext]);

  useEffect(() => {
    if (!currentUser) return;
    let ignore = false;
    const fetchList = async () => {
      try {
        setLoading(true);
        const headers = { 'X-Firebase-Uid': currentUser.uid };
        // pending_shipment と in_transit の両方を取得
        const [resPending, resTransit] = await Promise.all([
          fetch(`${API_BASE_URL}/api/v1/transactions?role=buyer&status=pending_shipment&limit=50`, { headers }),
          fetch(`${API_BASE_URL}/api/v1/transactions?role=buyer&status=in_transit&limit=50`, { headers })
        ]);

        if (!ignore) {
          let combined = [];
          if (resPending.ok) combined = [...combined, ...(await resPending.json())];
          if (resTransit.ok) combined = [...combined, ...(await resTransit.json())];

          setList(combined);
          setLastUpdated(new Date());
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetchList();
    const timer = setInterval(fetchList, 60000);
    return () => {
      ignore = true;
      clearInterval(timer);
    };
  }, [currentUser]);

  if (!currentUser) return <div style={{ padding: 20 }}>ログインしてください</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>購入物の状況</h2>

      {lastUpdated && (
        <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
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
                {/* アクションボタン: 購入者は配達中なら受け取り実行 */}
                {/* 受け取りアクションボタンUI改善 */}
                {(() => {
                  if (t.status === 'in_transit') {
                    return (
                      <button
                        onClick={async () => {
                          try {
                            const res = await fetch(`${API_BASE_URL}/api/v1/transactions/${t.transaction_id}/complete`, {
                              method: 'POST',
                              headers: { 'X-Firebase-Uid': currentUser.uid }
                            });
                            if (res.ok) {
                              // 成功時は軽く再取得
                              const headers = { 'X-Firebase-Uid': currentUser.uid };
                              const [resPending, resTransit] = await Promise.all([
                                fetch(`${API_BASE_URL}/api/v1/transactions?role=buyer&status=pending_shipment&limit=50`, { headers }),
                                fetch(`${API_BASE_URL}/api/v1/transactions?role=buyer&status=in_transit&limit=50`, { headers })
                              ]);
                              let combined = [];
                              if (resPending.ok) combined = [...combined, ...(await resPending.json())];
                              if (resTransit.ok) combined = [...combined, ...(await resTransit.json())];
                              setList(combined);
                              setLastUpdated(new Date());
                            }
                          } catch (e) {
                            console.error('Complete action error:', e);
                          }
                        }}
                        style={{ padding: '8px 12px', border: '1px solid #1976d2', borderRadius: 6, backgroundColor: '#fff', color: '#1976d2', fontWeight: 'bold', cursor: 'pointer' }}
                      >
                        受け取りました
                      </button>
                    );
                  } else if (t.status === 'completed') {
                    return (
                      <button
                        disabled
                        style={{ padding: '8px 12px', border: '1px solid #bbb', borderRadius: 6, backgroundColor: '#eee', color: '#aaa', fontWeight: 'bold', cursor: 'not-allowed' }}
                      >
                        受取済み
                      </button>
                    );
                  } else if (t.status === 'pending_shipment') {
                    // 発送前はグレーアウト
                    return (
                      <button
                        disabled
                        style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: 6, backgroundColor: '#f5f5f5', color: '#bbb', fontWeight: 'bold', cursor: 'not-allowed' }}
                      >
                        受け取りました
                      </button>
                    );
                  } else {
                    // その他（念のため）
                    return null;
                  }
                })()}
              </div>
            ))}
          </div>
        )
      )}


    </div>
  );
};

export default BuyerPage;
