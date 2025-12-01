// src/pages/item_create_page.js

import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
// ↓↓↓ 追加: Firebase Storage関連のインポート
import { storage } from '../firebase_config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
// ↑↑↑

const CATEGORIES = ["ファッション", "家電・スマホ・カメラ", "靴", "PC周辺機器", "その他"];
const CONDITIONS = ["新品、未使用", "未使用に近い", "目立った傷や汚れなし", "やや傷や汚れあり", "傷や汚れあり", "全体的に状態が悪い"];

const ItemCreatePage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // ↓↓↓ 追加: 画像プレビュー用のState
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  // ↑↑↑

  const navigate = useNavigate();
  
  const nameRef = useRef();
  const descriptionRef = useRef();
  const priceRef = useRef();
  const instantBuyRef = useRef();
  const categoryRef = useRef();
  const brandRef = useRef();
  const conditionRef = useRef();
  
  // imageUrlRef はもう使いません（アップロード後にURLを取得するため）

  const API_URL = process.env.REACT_APP_API_URL;

  // ↓↓↓ 画像ファイルが選択されたときの処理
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // プレビュー表示用にローカルURLを生成
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!imageFile) {
      setError("商品画像は必須です。");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 1. 画像をFirebase Storageにアップロード
      // ファイル名: items/{現在時刻}_{ファイル名} で一意にする
      const storageRef = ref(storage, `items/${Date.now()}_${imageFile.name}`);
      await uploadBytes(storageRef, imageFile);
      
      // 2. アップロードした画像のURLを取得
      const downloadURL = await getDownloadURL(storageRef);

      // 3. バックエンドAPIに送信するデータを作成
      const itemData = {
        name: nameRef.current.value,
        description: descriptionRef.current.value || null,
        price: parseInt(priceRef.current.value, 10),
        // ↓↓↓ 取得したFirebaseのURLをセット
        image_url: downloadURL, 
        is_instant_buy_ok: instantBuyRef.current.checked,
        category: categoryRef.current.value,
        brand: brandRef.current.value || null,
        condition: conditionRef.current.value,
      };
      
      if (!itemData.category || !itemData.condition) {
          setError("カテゴリと商品の状態は必須です。");
          setLoading(false);
          return;
      }

      // 4. バックエンドAPIを叩く
      const response = await fetch(`${API_URL}/api/v1/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`出品に失敗しました: ${errorData.detail || response.statusText}`);
      }

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
        
        {/* ↓↓↓ 画像アップロードエリア ↓↓↓ */}
        <div>
          <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>商品画像 *</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageChange} 
            required 
            style={{ padding: '10px' }} 
          />
          {imagePreview && (
            <div style={{ marginTop: '10px' }}>
              <img src={imagePreview} alt="プレビュー" style={{ width: '100%', maxHeight: '200px', objectFit: 'contain' }} />
            </div>
          )}
        </div>
        {/* ↑↑↑ 画像アップロードエリア ↑↑↑ */}

        <input type="text" ref={nameRef} placeholder="商品名 *" required style={{ padding: '10px' }} />
        
        <select ref={categoryRef} required style={{ padding: '10px' }}>
          <option value="">-- カテゴリを選択 * --</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <input type="text" ref={brandRef} placeholder="ブランド名 (任意)" style={{ padding: '10px' }} />

        <select ref={conditionRef} required style={{ padding: '10px' }}>
          <option value="">-- 商品の状態を選択 * --</option>
          {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        
        <input type="number" ref={priceRef} placeholder="価格 (円) *" required min="100" style={{ padding: '10px' }} />

        <textarea ref={descriptionRef} placeholder="商品の説明 (任意)" rows="4" style={{ padding: '10px' }} />
        
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input type="checkbox" ref={instantBuyRef} defaultChecked />
          クイックモード対応 (即購入OK)
        </label>
        
        <button type="submit" disabled={loading} style={{ padding: '10px', backgroundColor: loading ? '#ccc' : '#007bff', color: 'white', border: 'none', cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? '出品中...' : '出品する'}
        </button>
        
        <p style={{ fontSize: '0.8em', color: '#666' }}>* は必須項目です。</p>
      </form>
    </div>
  );
};

export default ItemCreatePage;