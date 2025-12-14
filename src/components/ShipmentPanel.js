// src/components/ShipmentPanel.js
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SHIPMENT_PANEL, API_BASE_URL } from '../config';

const ShipmentPanel = ({ currentUser }) => {
  const [sellerPending, setSellerPending] = useState([]); // 出品者視点: 発送待ち
  const [buyerPending, setBuyerPending] = useState([]);   // 購入者視点: 発送待ち(購入直後)
  const [sellerTransit, setSellerTransit] = useState([]); // 出品者視点: 発送済み(配送中)
  const [buyerTransit, setBuyerTransit] = useState([]);   // 購入者視点: 発送済み(配送中)
  const [recentCompleted, setRecentCompleted] = useState([]); // 到着済み(購入者視点の完了)
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  const refreshLists = async () => {
    if (!currentUser) return;
    const headers = { 'X-Firebase-Uid': currentUser.uid };
    try {
      setLoading(true);
      const [sp, bp, stSeller, stBuyer, rc] = await Promise.all([
        fetch(`${API_BASE_URL}/api/v1/transactions?role=seller&status=pending_shipment&limit=${SHIPMENT_PANEL.LIMIT_SELLER_PENDING}`, { headers }),
        fetch(`${API_BASE_URL}/api/v1/transactions?role=buyer&status=pending_shipment&limit=${SHIPMENT_PANEL.LIMIT_BUYER_TRANSIT}`, { headers }),
        fetch(`${API_BASE_URL}/api/v1/transactions?role=seller&status=in_transit&limit=${SHIPMENT_PANEL.LIMIT_RECENT_SHIPPED}`, { headers }),
        fetch(`${API_BASE_URL}/api/v1/transactions?role=buyer&status=in_transit&limit=${SHIPMENT_PANEL.LIMIT_BUYER_TRANSIT}`, { headers }),
        fetch(`${API_BASE_URL}/api/v1/transactions?role=buyer&status=completed&limit=${SHIPMENT_PANEL.LIMIT_RECENT_COMPLETED}`, { headers })
      ]);
      if (sp.ok) setSellerPending(await sp.json());
      if (bp.ok) setBuyerPending(await bp.json());
      if (stSeller.ok) setSellerTransit(await stSeller.json());
      if (stBuyer.ok) setBuyerTransit(await stBuyer.json());
      if (rc.ok) setRecentCompleted(await rc.json());
    } catch (e) {
      console.error('ShipmentPanel fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refreshLists(); }, [currentUser]);
  // 購入完了イベント（Routerのstate）でも再取得
  useEffect(() => {
    const state = location?.state;
    console.log('Location state changed:', state);
    if (state?.event === 'PURCHASE_COMPLETED') {
      refreshLists();
    }
  }, [location]);

  const handleShip = async (transactionId) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/transactions/${transactionId}/ship`, {
        method: 'POST',
        headers: { 'X-Firebase-Uid': currentUser.uid }
      });
      if (res.ok) {
        // 反映のため再取得（発送タイミングのhook）
        await refreshLists();
      }
    } catch (e) {
      console.error('Ship action error:', e);
    }
  };

  const handleComplete = async (transactionId) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/transactions/${transactionId}/complete`, {
        method: 'POST',
        headers: { 'X-Firebase-Uid': currentUser.uid }
      });
      if (res.ok) {
        // 反映のため再取得（到着タイミングのhook）
        await refreshLists();
      }
    } catch (e) {
      console.error('Complete action error:', e);
    }
  };

  const renderRow = (t, actionLabel, onAction) => (
    <div key={t.transaction_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <img src={(t.item && t.item.image_url) || 'https://via.placeholder.com/48'} alt={t.item?.name || 'item'} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4 }} />
        <Link to={`/items/${t.item?.item_id || ''}`} style={{ textDecoration: 'none', color: '#333', maxWidth: 280, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {t.item?.name || '商品'}
        </Link>
        <span style={{ color: '#e91e63', fontWeight: 'bold' }}>¥{(t.item?.price || 0).toLocaleString()}</span>
      </div>
      {onAction && (
        <button onClick={() => onAction(t.transaction_id)} style={{ padding: '6px 10px', border: 'none', borderRadius: 4, cursor: 'pointer', backgroundColor: '#1976d2', color: '#fff', fontWeight: 'bold' }}>
          {actionLabel}
        </button>
      )}
    </div>
  );

  // 表示の流れを「発送待ち→発送済み→到着済み」に統一
  const shippedCombined = [...sellerTransit, ...buyerTransit];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SHIPMENT_PANEL.GRID_COLUMNS}, 1fr)`, gap: `${SHIPMENT_PANEL.GRID_GAP}px`, marginTop: '8px' }}>
      {/* 発送待ち */}
      <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12 }}>
        <h3 style={{ marginTop: 0 }}>発送待ち</h3>
        {loading && <p>読み込み中...</p>}
        {!loading && sellerPending.length === 0 && buyerPending.length === 0 && <p>現在、発送待ちはありません。</p>}
        {/* 出品者側（アクションあり） */}
        {!loading && sellerPending.map(t => renderRow(t, '発送しました', handleShip))}
        {/* 購入者側（アクションなし） */}
        {!loading && buyerPending.map(t => renderRow(t))}
      </div>
      {/* 発送済み（配送中） */}
      <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12 }}>
        <h3 style={{ marginTop: 0 }}>発送済み（配送中）</h3>
        {loading && <p>読み込み中...</p>}
        {!loading && shippedCombined.length === 0 && <p>現在、配送中の取引はありません。</p>}
        {/* 出品者・購入者双方を表示。購入者側には受け取りアクション */}
        {!loading && shippedCombined.map(t => renderRow(t, t.role === 'buyer' ? '受け取りました' : undefined, t.role === 'buyer' ? handleComplete : undefined))}
      </div>
      {/* 到着済み（完了） */}
      <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12 }}>
        <h3 style={{ marginTop: 0 }}>到着済み（取引完了）</h3>
        {loading && <p>読み込み中...</p>}
        {!loading && recentCompleted.length === 0 && <p>最近の完了履歴はありません。</p>}
        {!loading && recentCompleted.map(t => renderRow(t))}
      </div>
    </div>
  );
};

export default ShipmentPanel;
