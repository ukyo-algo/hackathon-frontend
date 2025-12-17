// src/pages/shipments_page.js
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/auth_context';
import { API_BASE_URL } from '../config';
import { Link } from 'react-router-dom';
import ProgressSteps from '../components/ProgressSteps';
import { usePageContext } from '../components/AIChatWidget';

const SellerPage = () => {
  const { currentUser } = useAuth();
  const { setPageContext } = usePageContext();
  const [list, setList] = useState([]);
  const [unsoldItems, setUnsoldItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  // ページコンテキストを設定
  useEffect(() => {
    const pendingCount = list.filter(t => t.status === 'pending_shipment').length;
    const inTransitCount = list.filter(t => t.status === 'in_transit').length;
    setPageContext({
      page: 'seller_shipments',
      pending_shipment_count: pendingCount,
      in_transit_count: inTransitCount,
      unsold_count: unsoldItems.length,
    });
    return () => setPageContext(null);
  }, [list, unsoldItems.length, setPageContext]);

  useEffect(() => {
    if (!currentUser) return;
    let ignore = false;
    const fetchList = async () => {
      try {
        setLoading(true);
        const headers = { 'X-Firebase-Uid': currentUser.uid };
        // pending_shipment と in_transit の両方を取得
        const [resPending, resTransit, resMyItems] = await Promise.all([
          fetch(`${API_BASE_URL}/api/v1/transactions?role=seller&status=pending_shipment&limit=50`, { headers }),
          fetch(`${API_BASE_URL}/api/v1/transactions?role=seller&status=in_transit&limit=50`, { headers })
          ,
          fetch(`${API_BASE_URL}/api/v1/users/me/items`, { headers })
        ]);

        if (!ignore) {
          let combined = [];
          if (resPending.ok) combined = [...combined, ...(await resPending.json())];
          if (resTransit.ok) combined = [...combined, ...(await resTransit.json())];

          setList(combined);
          if (resMyItems.ok) {
            const items = await resMyItems.json();
            // 取引中リストのitem_idを抽出
            const tradingItemIds = new Set(combined.map(t => t.item?.item_id || t.item_id || t.id));
            // 未売品: 取引中に含まれていないものだけ
            const unsold = (items || []).filter(item => !tradingItemIds.has(item.item_id || item.id));
            setUnsoldItems(unsold);
          }
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
      <h2>売品の状況</h2>

      {lastUpdated && (
        <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
          最終更新: {lastUpdated.toLocaleString()}
        </div>
      )}
      {loading ? <p>読み込み中...</p> : (
        list.length === 0 ? <p>現在，取引中の売品はありません。</p> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {list.map(t => (
              <div key={t.transaction_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #ddd', borderRadius: 8, padding: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <img src={(t.item && t.item.image_url) || 'https://via.placeholder.com/64'} alt={t.item?.name || 'item'} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 4 }} />
                  <Link to={`/items/${t.item?.item_id || ''}`} style={{ textDecoration: 'none', color: '#333', fontWeight: 'bold' }}>{t.item?.name || '商品'}</Link>
                  <span style={{ color: '#e91e63', fontWeight: 'bold' }}>¥{(t.item?.price || 0).toLocaleString()}</span>
                </div>
                <div style={{ flex: 1, marginLeft: 20, marginRight: 20 }}>
                  <ProgressSteps status={t.status} />
                </div>
                {/* アクションボタン: 出品者は発送待ちなら発送実行 */}
                {/* 発送アクションボタンUI改善 */}
                {(() => {
                  if (t.status === 'pending_shipment') {
                    return (
                      <button
                        onClick={async () => {
                          try {
                            const res = await fetch(`${API_BASE_URL}/api/v1/transactions/${t.transaction_id}/ship`, {
                              method: 'POST',
                              headers: { 'X-Firebase-Uid': currentUser.uid }
                            });
                            if (res.ok) {
                              // 成功時は軽く再取得
                              const headers = { 'X-Firebase-Uid': currentUser.uid };
                              const [resPending, resTransit] = await Promise.all([
                                fetch(`${API_BASE_URL}/api/v1/transactions?role=seller&status=pending_shipment&limit=50`, { headers }),
                                fetch(`${API_BASE_URL}/api/v1/transactions?role=seller&status=in_transit&limit=50`, { headers })
                              ]);
                              let combined = [];
                              if (resPending.ok) combined = [...combined, ...(await resPending.json())];
                              if (resTransit.ok) combined = [...combined, ...(await resTransit.json())];
                              setList(combined);
                              setLastUpdated(new Date());
                            }
                          } catch (e) {
                            console.error('Ship action error:', e);
                          }
                        }}
                        style={{ padding: '8px 12px', border: 'none', borderRadius: 6, backgroundColor: '#1976d2', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}
                      >
                        発送しました
                      </button>
                    );
                  } else if (t.status === 'in_transit' || t.status === 'completed') {
                    return (
                      <button
                        disabled
                        style={{ padding: '8px 12px', border: 'none', borderRadius: 6, backgroundColor: '#bbb', color: '#fff', fontWeight: 'bold', cursor: 'not-allowed' }}
                      >
                        発送済み
                      </button>
                    );
                  } else {
                    // それ以外（押せないグレーアウト）
                    return (
                      <button
                        disabled
                        style={{ padding: '8px 12px', border: 'none', borderRadius: 6, backgroundColor: '#eee', color: '#aaa', fontWeight: 'bold', cursor: 'not-allowed' }}
                      >
                        発送しました
                      </button>
                    );
                  }
                })()}
              </div>
            ))}
          </div>
        )
      )}

      {/* 未売品の一覧（参考表示） */}
      <div style={{ marginTop: 24 }}>
        <h3>未売品</h3>
        {unsoldItems.length === 0 ? (
          <p>現在、未売品はありません。</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {unsoldItems.map(item => (
              <div key={item.item_id || item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #ddd', borderRadius: 8, padding: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <img src={item.image_url || 'https://via.placeholder.com/64'} alt={item.name || 'item'} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 4 }} />
                  <Link to={`/items/${item.item_id || item.id || ''}`} style={{ textDecoration: 'none', color: '#333', fontWeight: 'bold' }}>{item.name || '商品'}</Link>
                  <span style={{ color: '#e91e63', fontWeight: 'bold' }}>¥{(item.price || 0).toLocaleString()}</span>
                </div>
                <div style={{ color: '#999', fontSize: 12 }}>ステータス: 未売</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerPage;
