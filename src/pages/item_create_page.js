// src/pages/item_create_page.js
/**
 * 出品ページ
 * el;ma テーマ - レトロゲーム風UI
 */

import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../firebase_config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../contexts/auth_context';
import {
  Box, Container, Typography, TextField, Button, Paper,
  Alert, CircularProgress, FormControl, InputLabel, Select,
  MenuItem, FormControlLabel, Checkbox
} from '@mui/material';
import { AddPhotoAlternate, Sell } from '@mui/icons-material';
import { colors } from '../styles/theme';

const CATEGORIES = ["ファッション", "家電・スマホ・カメラ", "靴", "PC周辺機器", "その他"];
const CONDITIONS = ["新品、未使用", "未使用に近い", "目立った傷や汚れなし", "やや傷や汚れあり", "傷や汚れあり", "全体的に状態が悪い"];

const ItemCreatePage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('');
  const [instantBuy, setInstantBuy] = useState(true);

  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const nameRef = useRef();
  const descriptionRef = useRef();
  const priceRef = useRef();
  const brandRef = useRef();

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
        is_instant_buy_ok: instantBuy,
        category: category,
        brand: brandRef.current.value || null,
        condition: condition,
      };

      if (!category || !condition) {
        setError("カテゴリと商品の状態は必須です。");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/v1/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Firebase-Uid': currentUser.uid,
        },
        body: JSON.stringify(itemData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`出品に失敗しました: ${errorData.detail || response.statusText}`);
      }

      navigate('/');
    } catch (err) {
      console.error("Item creation error:", err);
      setError(err.message || "商品の出品中に予期せぬエラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      {/* ヘッダー */}
      <Typography variant="h4" sx={{
        fontFamily: '"VT323", monospace',
        color: colors.textPrimary,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        mb: 3,
      }}>
        <Sell sx={{ color: colors.primary }} /> 商品の出品
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3, backgroundColor: 'rgba(255,107,107,0.1)', border: `1px solid ${colors.error}` }}>
          {error}
        </Alert>
      )}

      <Paper
        component="form"
        onSubmit={handleSubmit}
        sx={{
          p: 3,
          background: colors.paper,
          border: `1px solid ${colors.border}`,
          borderRadius: 2,
        }}
      >
        {/* 画像アップロード */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ color: colors.textPrimary, mb: 1, fontWeight: 'bold' }}>
            商品画像 <span style={{ color: colors.error }}>*</span>
          </Typography>

          <Box
            component="label"
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 200,
              border: `2px dashed ${imagePreview ? colors.primary : colors.border}`,
              borderRadius: 2,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              backgroundColor: colors.backgroundAlt,
              '&:hover': { borderColor: colors.primary },
              overflow: 'hidden',
            }}
          >
            <input type="file" accept="image/*" onChange={handleImageChange} hidden />
            {imagePreview ? (
              <Box
                component="img"
                src={imagePreview}
                alt="プレビュー"
                sx={{ width: '100%', maxHeight: 300, objectFit: 'contain' }}
              />
            ) : (
              <>
                <AddPhotoAlternate sx={{ fontSize: 48, color: colors.textTertiary, mb: 1 }} />
                <Typography variant="body2" color="textSecondary">
                  クリックして画像をアップロード
                </Typography>
              </>
            )}
          </Box>
        </Box>

        {/* 商品名 */}
        <TextField
          inputRef={nameRef}
          label="商品名"
          placeholder="商品名を入力"
          required
          fullWidth
          variant="outlined"
          sx={{ mb: 2 }}
          InputProps={{ sx: { fontFamily: 'monospace', backgroundColor: colors.background } }}
        />

        {/* カテゴリ */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>カテゴリ *</InputLabel>
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            label="カテゴリ *"
            required
            sx={{ backgroundColor: colors.background }}
          >
            {CATEGORIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </Select>
        </FormControl>

        {/* ブランド */}
        <TextField
          inputRef={brandRef}
          label="ブランド名（任意）"
          placeholder="ブランド名"
          fullWidth
          variant="outlined"
          sx={{ mb: 2 }}
          InputProps={{ sx: { fontFamily: 'monospace', backgroundColor: colors.background } }}
        />

        {/* 状態 */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>商品の状態 *</InputLabel>
          <Select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            label="商品の状態 *"
            required
            sx={{ backgroundColor: colors.background }}
          >
            {CONDITIONS.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </Select>
        </FormControl>

        {/* 価格 */}
        <TextField
          inputRef={priceRef}
          type="number"
          label="価格（円）"
          placeholder="例: 3000"
          required
          fullWidth
          variant="outlined"
          inputProps={{ min: 100 }}
          sx={{ mb: 2 }}
          InputProps={{ sx: { fontFamily: 'monospace', backgroundColor: colors.background } }}
        />

        {/* 説明 */}
        <TextField
          inputRef={descriptionRef}
          label="商品の説明（任意）"
          placeholder="商品の状態や特徴など"
          multiline
          rows={4}
          fullWidth
          variant="outlined"
          sx={{ mb: 2 }}
          InputProps={{ sx: { fontFamily: 'monospace', backgroundColor: colors.background } }}
        />

        {/* クイックモード */}
        <FormControlLabel
          control={
            <Checkbox
              checked={instantBuy}
              onChange={(e) => setInstantBuy(e.target.checked)}
              sx={{ color: colors.primary, '&.Mui-checked': { color: colors.primary } }}
            />
          }
          label={
            <Typography variant="body2" sx={{ color: colors.textSecondary }}>
              クイックモード対応（即購入OK）
            </Typography>
          }
          sx={{ mb: 3 }}
        />

        {/* 送信ボタン */}
        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={loading}
          sx={{
            py: 1.5,
            fontFamily: '"VT323", monospace',
            fontSize: '1.3rem',
            backgroundColor: colors.primary,
            color: colors.background,
            '&:hover': { backgroundColor: colors.primaryDark },
            '&:disabled': { backgroundColor: colors.border },
          }}
        >
          {loading ? <CircularProgress size={24} sx={{ color: colors.background }} /> : '▶ 出品する'}
        </Button>

        {/* 注意書き */}
        <Typography variant="caption" sx={{ display: 'block', mt: 2, color: colors.textTertiary, textAlign: 'center' }}>
          <span style={{ color: colors.error }}>*</span> は必須項目です
        </Typography>
      </Paper>
    </Container>
  );
};

export default ItemCreatePage;