// src/pages/item_create_page.js

import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// ダミーデータ（選択肢用）
const CATEGORIES = ["ファッション", "家電・スマホ・カメラ", "靴", "PC周辺機器", "その他"];
const CONDITIONS = ["新品、未使用", "未使用に近い", "目立った傷や汚れなし", "やや傷や汚れあり", "傷や汚れあり", "全体的に状態が悪い"];

const ItemCreatePage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  // inputの値を保持するためのref
  const nameRef = useRef();
  const descriptionRef = useRef();
  const priceRef = useRef();
  const imageUrlRef = useRef();
  const instantBuyRef = useRef();

  // ↓↓↓ 新規追加フィールドの Ref ↓↓↓
  const categoryRef = useRef();
  const brandRef = useRef();
  const conditionRef = useRef();
  // ↑↑↑ 新規追加フィールドの Ref ↑↑↑

  const API_URL = process.env.REACT_APP_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // フォームから値を取得
    const itemData = {
      name: nameRef.current.value,
      // 空文字列の場合は null に変換 (FastAPIのスキーマに合わせる)
      description: descriptionRef.current.value || null, 
      price: parseInt(priceRef.current.value, 10),
      image_url: imageUrlRef.current.value || null,
      is_instant_buy_ok: instantBuyRef.current.checked,
      
      // ↓↓↓ 新規フィールドの値を収集 ↓↓↓
      category: categoryRef.current.value,
      brand: brandRef.current.value || null, // 空文字列の場合は null に変換
      condition: conditionRef.current.value,
      // ↑↑↑ 新規フィールドの値を収集 ↑↑↑
    };
    
    // クライアントサイドでの簡易バリデーション: categoryとconditionが選択されているか
    if (!itemData.category) {
        setError("カテゴリは必須です。");
        return;
    }
    if (!itemData.condition) {
        setError("商品の状態は必須です。");
        return;
    }

    try {
      setLoading(true);
      setError(null);

      // バックエンドAPIを叩く
      const response = await fetch(`${API_URL}/api/v1/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // ★★★ 注意: 現在はバックエンドのダミー認証を使っているため、ここではID Tokenの送信は省略
        },
        body: JSON.stringify(itemData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`出品に失敗しました: ${errorData.detail || response.statusText}`);
      }

      // 成功したらホームへ遷移
      navigate(`/`); 

    } catch (err) {
      console.error("Item creation error:", err);
      setError(err.message || "商品の出品中に予期せぬエラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>商品の出品</h2>
      {error && <p style={{ color: 'red' }}>エラー: {error}</p>}
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '400px', border: '1px solid #ddd', padding: '20px' }}>
        
        {/* 1. 商品名 */}
        <input type="text" ref={nameRef} placeholder="商品名 *" required style={{ padding: '10px' }} />
        
        {/* 2. カテゴリ (必須) */}
        <select ref={categoryRef} required style={{ padding: '10px' }}>
          <option value="">-- カテゴリを選択 * --</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        {/* 3. ブランド (任意) */}
        <input type="text" ref={brandRef} placeholder="ブランド名 (任意)" style={{ padding: '10px' }} />

        {/* 4. 商品の状態 (必須) */}
        <select ref={conditionRef} required style={{ padding: '10px' }}>
          <option value="">-- 商品の状態を選択 * --</option>
          {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        
        {/* 5. 価格 */}
        <input type="number" ref={priceRef} placeholder="価格 (円) *" required min="100" style={{ padding: '10px' }} />

        {/* 6. 商品の説明 */}
        <textarea ref={descriptionRef} placeholder="商品の説明 (任意)" rows="4" style={{ padding: '10px' }} />
        
        {/* 7. 画像URL (今回はダミーで代用) */}
        <input type="url" ref={imageUrlRef} placeholder="画像URL (今回はダミーURLを貼る)" style={{ padding: '10px' }} />

        {/* 8. クイックモード対応 */}
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input type="checkbox" ref={instantBuyRef} defaultChecked />
          クイックモード対応 (即購入OK)
        </label>
        
        {/* 9. 送信ボタン */}
        <button type="submit" disabled={loading} style={{ padding: '10px', backgroundColor: loading ? '#ccc' : '#007bff', color: 'white', border: 'none', cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? '出品中...' : '出品する'}
        </button>
        
        <p style={{ fontSize: '0.8em', color: '#666' }}>* は必須項目です。</p>
      </form>
    </div>
  );
};

export default ItemCreatePage;