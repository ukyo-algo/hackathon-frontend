// src/components/ShipmentPanel.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SHIPMENT_PANEL, API_BASE_URL } from '../config';

const ShipmentPanel = ({ currentUser }) => {
  const [sellerPending, setSellerPending] = useState([]); // 自分が出品者: 発送待ち
  const [buyerTransit, setBuyerTransit] = useState([]);   // 自分が購入者: 到着待ち(配送中)
  const [recentShipped, setRecentShipped] = useState([]); // 最近発送された(自分関連)
  const [recentCompleted, setRecentCompleted] = useState([]); // 最近完了(自分関連)
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    const headers = { 'X-Firebase-Uid': currentUser.uid };
    const fetchLists = async () => {
      try {
        setLoading(true);
        // 役割・ステータスで4種類取得
        const [sp, bt, rs, rc] = await Promise.all([
          fetch(`${API_BASE_URL}/api/v1/transactions?role=seller&status=pending_shipment&limit=${SHIPMENT_PANEL.LIMIT_SELLER_PENDING}`, { headers }),
          fetch(`${API_BASE_URL}/api/v1/transactions?role=buyer&status=in_transit&limit=${SHIPMENT_PANEL.LIMIT_BUYER_TRANSIT}`, { headers }),
          fetch(`${API_BASE_URL}/api/v1/transactions?role=seller&status=in_transit&limit=${SHIPMENT_PANEL.LIMIT_RECENT_SHIPPED}`, { headers }),
          fetch(`${API_BASE_URL}/api/v1/transactions?role=buyer&status=completed&limit=${SHIPMENT_PANEL.LIMIT_RECENT_COMPLETED}`, { headers })
        ]);
        if (sp.ok) setSellerPending(await sp.json());
        if (bt.ok) setBuyerTransit(await bt.json());
        if (rs.ok) setRecentShipped(await rs.json());
        if (rc.ok) setRecentCompleted(await rc.json());
      } catch (e) {
        console.error('ShipmentPanel fetch error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchLists();
  }, [currentUser]);

  const handleShip = async (transactionId) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/transactions/${transactionId}/ship`, {
        method: 'POST',
        headers: { 'X-Firebase-Uid': currentUser.uid }
      });
      if (res.ok) {
        // 反映のため再取得
        const headers = { 'X-Firebase-Uid': currentUser.uid };
        const sp = await fetch(`${API_BASE_URL}/api/v1/transactions?role=seller&status=pending_shipment&limit=${SHIPMENT_PANEL.LIMIT_SELLER_PENDING}`, { headers });
        const rs = await fetch(`${API_BASE_URL}/api/v1/transactions?role=seller&status=in_transit&limit=${SHIPMENT_PANEL.LIMIT_RECENT_SHIPPED}`, { headers });
        if (sp.ok) setSellerPending(await sp.json());
        if (rs.ok) setRecentShipped(await rs.json());
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
        // 反映のため再取得
        const headers = { 'X-Firebase-Uid': currentUser.uid };
        const bt = await fetch(`${API_BASE_URL}/api/v1/transactions?role=buyer&status=in_transit&limit=${SHIPMENT_PANEL.LIMIT_BUYER_TRANSIT}`, { headers });
        const rc = await fetch(`${API_BASE_URL}/api/v1/transactions?role=buyer&status=completed&limit=${SHIPMENT_PANEL.LIMIT_RECENT_COMPLETED}`, { headers });
        if (bt.ok) setBuyerTransit(await bt.json());
        if (rc.ok) setRecentCompleted(await rc.json());
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

  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SHIPMENT_PANEL.GRID_COLUMNS}, 1fr)`, gap: `${SHIPMENT_PANEL.GRID_GAP}px`, marginTop: '8px' }}>
      {/* 左列 */}
      <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12 }}>
        <h3 style={{ marginTop: 0 }}>発送待ち</h3>
        {loading && <p>読み込み中...</p>}
        {!loading && sellerPending.length === 0 && <p>現在、発送待ちはありません。</p>}
        {!loading && sellerPending.map(t => renderRow(t, '発送しました', handleShip))}
      </div>
      <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12 }}>
        <h3 style={{ marginTop: 0 }}>到着待ち</h3>
        {loading && <p>読み込み中...</p>}
        {!loading && buyerTransit.length === 0 && <p>現在、到着待ちはありません。</p>}
        {!loading && buyerTransit.map(t => renderRow(t, '受け取りました', handleComplete))}
      </div>
      {/* 右列下段 */}
      <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12 }}>
        <h3 style={{ marginTop: 0 }}>最近の配送状況（発送済み）</h3>
        {loading && <p>読み込み中...</p>}
        {!loading && recentShipped.length === 0 && <p>最近の配送状況はありません。</p>}
        {!loading && recentShipped.map(t => renderRow(t))}
      </div>
      <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12 }}>
        <h3 style={{ marginTop: 0 }}>最近の配送状況（取引完了）</h3>
        {loading && <p>読み込み中...</p>}
        {!loading && recentCompleted.length === 0 && <p>最近の完了履歴はありません。</p>}
        {!loading && recentCompleted.map(t => renderRow(t))}
      </div>
    </div>
  );
};

export default ShipmentPanel;
