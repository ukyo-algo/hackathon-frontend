// src/pages/item_create_page.js
/**
 * 出品ページ
 * el;ma テーマ - レトロゲーム風UI + AI出品サポート
 */

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../firebase_config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../contexts/auth_context';
import { usePageContext } from '../components/AIChatWidget';
import {
  Box, Container, Typography, TextField, Button, Paper,
  Alert, CircularProgress, FormControl, InputLabel, Select,
  MenuItem, FormControlLabel, Checkbox, Avatar
} from '@mui/material';
import { AddPhotoAlternate, Sell, AutoAwesome } from '@mui/icons-material';
import { colors } from '../styles/theme';

const API_URL = process.env.REACT_APP_API_URL;

const CATEGORIES = ["ファッション", "家電・スマホ・カメラ", "靴", "PC周辺機器", "ホビー・楽器", "本", "その他"];
const CONDITIONS = ["新品、未使用", "未使用に近い", "目立った傷や汚れなし", "やや傷や汚れあり", "傷や汚れあり", "全体的に状態が悪い"];

const ItemCreatePage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('');
  const [instantBuy, setInstantBuy] = useState(true);

  // フォームの値をstateで管理
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [brand, setBrand] = useState('');

  // AI関連
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiComment, setAiComment] = useState(null);
  const [aiData, setAiData] = useState(null);
  const [showAiButton, setShowAiButton] = useState(false);

  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { setPageContext } = usePageContext();

  // ページコンテキストを設定
  useEffect(() => {
    setPageContext({
      page_type: 'item_create',
      has_image: !!imagePreview,
      form_data: {
        name: name || null,
        category: category || null,
        condition: condition || null,
        price: price ? parseInt(price, 10) : null,
      }
    });
    return () => setPageContext(null);
  }, [setPageContext, imagePreview, name, category, condition, price]);

  // AIからの説明文更新イベントを受け取る
  useEffect(() => {
    const handleAiDescription = (event) => {
      if (event.detail?.description) {
        setDescription(event.detail.description);
      }
      if (event.detail?.name) {
        setName(event.detail.name);
      }
      if (event.detail?.category) {
        const matchedCategory = CATEGORIES.find(c =>
          c.includes(event.detail.category) || event.detail.category.includes(c)
        );
        if (matchedCategory) setCategory(matchedCategory);
      }
    };
    window.addEventListener('ai-update-listing', handleAiDescription);
    return () => window.removeEventListener('ai-update-listing', handleAiDescription);
  }, []);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setShowAiButton(true);
      setAiComment(null);
      setAiData(null);

      // Base64に変換
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // AIに画像を解析してもらう
  const handleAiAnalyze = async () => {
    if (!imageBase64 || !currentUser) return;

    try {
      setAiAnalyzing(true);
      setError(null);

      const response = await fetch(`${API_URL}/api/v1/chat/analyze-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Firebase-Uid': currentUser.uid,
        },
        body: JSON.stringify({
          image_base64: imageBase64,
          prompt: 'この商品を出品したいです。商品情報を教えてください。',
        }),
      });

      if (!response.ok) {
        throw new Error('AI解析に失敗しました');
      }

      const data = await response.json();
      setAiData(data);
      setAiComment(data.message);

      // フォームに自動入力
      if (data.name) setName(data.name);
      if (data.description) setDescription(data.description);
      if (data.suggested_price) setPrice(String(data.suggested_price));
      if (data.category) {
        // カテゴリをマッチング
        const matchedCategory = CATEGORIES.find(c =>
          c.includes(data.category) || data.category.includes(c)
        );
        if (matchedCategory) setCategory(matchedCategory);
      }
      if (data.condition) {
        // 状態をマッチング
        const matchedCondition = CONDITIONS.find(c =>
          c.includes(data.condition) || data.condition.includes(c)
        );
        if (matchedCondition) setCondition(matchedCondition);
      }

    } catch (err) {
      console.error('AI analysis error:', err);
      setError(err.message);
    } finally {
      setAiAnalyzing(false);
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
        name: name,
        description: description || null,
        price: parseInt(price, 10),
        image_url: downloadURL,
        is_instant_buy_ok: instantBuy,
        category: category,
        brand: brand || null,
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

        {/* AIアシスタント */}
        {showAiButton && (
          <Box sx={{ mb: 3 }}>
            {aiComment && (
              <Box sx={{
                p: 2,
                mb: 2,
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                borderRadius: 2,
                border: `1px solid ${colors.primary}`,
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Avatar sx={{ width: 24, height: 24, bgcolor: colors.primary }}>
                    <AutoAwesome sx={{ fontSize: 14 }} />
                  </Avatar>
                  <Typography variant="caption" sx={{ color: colors.primary, fontWeight: 'bold' }}>
                    AIアシスタント
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: colors.textPrimary }}>
                  {aiComment}
                </Typography>
              </Box>
            )}

            {!aiData && (
              <Button
                variant="outlined"
                fullWidth
                onClick={handleAiAnalyze}
                disabled={aiAnalyzing}
                startIcon={aiAnalyzing ? <CircularProgress size={16} /> : <AutoAwesome />}
                sx={{
                  borderColor: colors.primary,
                  color: colors.primary,
                  fontFamily: '"VT323", monospace',
                  fontSize: '1.1rem',
                  '&:hover': { borderColor: colors.primaryDark, backgroundColor: 'rgba(0,255,136,0.1)' },
                }}
              >
                {aiAnalyzing ? 'AIが解析中...' : '✨ AIに出品情報をお願いする'}
              </Button>
            )}

            {aiData && (
              <Alert severity="success" sx={{ backgroundColor: 'rgba(0,255,136,0.1)', border: `1px solid ${colors.primary}` }}>
                AIが商品情報を入力しました！内容を確認して必要に応じて修正してください。
              </Alert>
            )}
          </Box>
        )}

        {/* 商品名 */}
        <TextField
          value={name}
          onChange={(e) => setName(e.target.value)}
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
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
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
          value={price}
          onChange={(e) => setPrice(e.target.value)}
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
          value={description}
          onChange={(e) => setDescription(e.target.value)}
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