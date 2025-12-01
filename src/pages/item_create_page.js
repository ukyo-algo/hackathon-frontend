// src/pages/item_create_page.js

import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../firebase_config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
// ↓↓↓ 1. 追加: useAuth をインポート
import { useAuth } from '../contexts/auth_context';

const CATEGORIES = ["ファッション", "家電・スマホ・カメラ", "靴", "PC周辺機器", "その他"];
const CONDITIONS = ["新品、未使用", "未使用に近い", "目立った傷や汚れなし", "やや傷や汚れあり", "傷や汚れあり", "全体的に状態が悪い"];

const ItemCreatePage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const navigate = useNavigate();
  // ↓↓↓ 2. 追加: currentUser を取得
  const { currentUser } = useAuth();
  
  const nameRef = useRef();
  const descriptionRef = useRef();
  const priceRef = useRef();
  const instantBuyRef = useRef();
  const categoryRef = useRef();
  const brandRef = useRef();
  const conditionRef = useRef();
  
  const API_URL = process.env.REACT_APP_API_URL;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ログインチェック（念のため）
    if (!currentUser) {
      setError("ログインが必要です。");
      return;
    }

    if (!imageFile) {
      setError("商品画像は必須です。");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const storageRef = ref(storage, `items/${Date.now()}_${imageFile.name}`);
      await uploadBytes(storageRef, imageFile);
      const downloadURL = await getDownloadURL(storageRef);

      const itemData = {
        name: nameRef.current.value,
        description: descriptionRef.current.value || null,
        price: parseInt(priceRef.current.value, 10),
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

      const response = await fetch(`${API_URL}/api/v1/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // ↓↓↓ 3. 追加: ヘッダーにUIDをセットする
          'X-Firebase-Uid': currentUser.uid,
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
        
        <label style={{ display: 'flex', alignItems