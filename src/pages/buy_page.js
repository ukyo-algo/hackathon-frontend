// src/pages/buy_page.js

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth_context';
import { Box, Container, Grid, Paper, Typography, RadioGroup, FormControlLabel, Radio, TextField, Divider, Button, Alert } from '@mui/material';
import { API_BASE_URL } from '../config';
import { usePageContext } from '../components/AIChatWidget';

const BuyPage = () => {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { setPageContext } = usePageContext();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [deliveryOption, setDeliveryOption] = useState('standard'); // 'standard' | 'express'

  const [address, setAddress] = useState({
    name: '',
    postalCode: '',
    prefecture: '',
    city: '',
    addressLine: '',
    phone: ''
  });
  const [addressError, setAddressError] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // ページコンテキストを設定
  useEffect(() => {
    if (item) {
      setPageContext({
        page: 'buy_confirmation',
        item_id: itemId,
        item_name: item.name,
        item_price: item.price,
        payment_method: paymentMethod,
        delivery_option: deliveryOption,
      });
    }
    return () => setPageContext(null);
  }, [item, itemId, paymentMethod, deliveryOption, setPageContext]);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        // 商品詳細取得
        const itemRes = await fetch(`${API_BASE_URL}/api/v1/items/${itemId}`);
        if (!itemRes.ok) throw new Error('商品情報の取得に失敗しました');
        const itemData = await itemRes.json();
        setItem(itemData);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [itemId, currentUser, navigate]);

  const shippingFee = useMemo(() => (deliveryOption === 'express' ? 900 : 500), [deliveryOption]);
  const totalPrice = useMemo(() => (Number(item?.price || 0) + shippingFee), [item, shippingFee]);
  const estimatedDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + (deliveryOption === 'express' ? 1 : 3));
    return d.toLocaleDateString();
  }, [deliveryOption]);

  const validate = () => {
    const errs = {};
    if (!address.name) errs.name = '氏名は必須です';
    if (!/^\d{3}-?\d{4}$/.test(address.postalCode || '')) errs.postalCode = '郵便番号の形式が不正です';
    if (!address.prefecture) errs.prefecture = '都道府県は必須です';
    if (!address.city) errs.city = '市区町村は必須です';
    if (!address.addressLine) errs.addressLine = '番地・建物は必須です';
    if (!/^\d{10,11}$/.test(address.phone || '')) errs.phone = '電話番号の形式が不正です';
    setAddressError(errs);
    return Object.keys(errs).length === 0;
  };

  const handleConfirm = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    if (!validate()) return;

    try {
      setSubmitting(true);
      const res = await fetch(`${API_BASE_URL}/api/v1/items/${itemId}/buy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Firebase-Uid': currentUser.uid,
        },
        body: JSON.stringify({ paymentMethod, deliveryOption, address })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || '購入に失敗しました');
      }
      console.log('Purchase successful');
      console.log('購入商品情報:', item);
      navigate('/', { state: { purchaseMessage: '購入完了したよ！', event: 'PURCHASE_COMPLETED' } });
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>読み込み中...</Box>;
  if (error) return <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>;
  if (!item) return <Alert severity="warning" sx={{ m: 2 }}>商品が見つかりません</Alert>;

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>購入手続き</Typography>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>商品</Typography>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography>{item.name}</Typography>
          <Typography sx={{ fontWeight: 'bold', color: 'error.main' }}>¥{Number(item.price || 0).toLocaleString()}</Typography>
        </Box>
      </Paper>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>決済方法</Typography>
            <RadioGroup value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
              <FormControlLabel value="credit_card" control={<Radio />} label="クレジットカード" />
              <FormControlLabel value="bank_transfer" control={<Radio />} label="銀行振込" />
              <FormControlLabel value="cod" control={<Radio />} label="代金引換" />
            </RadioGroup>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>配送オプション</Typography>
            <RadioGroup value={deliveryOption} onChange={(e) => setDeliveryOption(e.target.value)}>
              <FormControlLabel value="standard" control={<Radio />} label={`通常配送（¥${shippingFee === 500 ? 500 : 500}） 推定到着: ${estimatedDate}`} />
              <FormControlLabel value="express" control={<Radio />} label={`速達（¥${shippingFee === 900 ? 900 : 900}） 推定到着: ${estimatedDate}`} />
            </RadioGroup>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ p: 2, mt: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>お届け先住所</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="氏名" value={address.name} onChange={(e) => setAddress({ ...address, name: e.target.value })} error={!!addressError.name} helperText={addressError.name} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="郵便番号" value={address.postalCode} onChange={(e) => setAddress({ ...address, postalCode: e.target.value })} error={!!addressError.postalCode} helperText={addressError.postalCode} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="都道府県" value={address.prefecture} onChange={(e) => setAddress({ ...address, prefecture: e.target.value })} error={!!addressError.prefecture} helperText={addressError.prefecture} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="市区町村" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} error={!!addressError.city} helperText={addressError.city} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="番地・建物" value={address.addressLine} onChange={(e) => setAddress({ ...address, addressLine: e.target.value })} error={!!addressError.addressLine} helperText={addressError.addressLine} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="電話番号" value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} error={!!addressError.phone} helperText={addressError.phone} />
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2, mt: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>注文概要</Typography>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography>商品価格</Typography>
          <Typography>¥{Number(item.price || 0).toLocaleString()}</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography>送料</Typography>
          <Typography>¥{shippingFee.toLocaleString()}</Typography>
        </Box>
        <Divider sx={{ my: 1 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography sx={{ fontWeight: 'bold' }}>合計</Typography>
          <Typography sx={{ fontWeight: 'bold', color: 'error.main' }}>¥{totalPrice.toLocaleString()}</Typography>
        </Box>
        <Button variant="contained" color="primary" fullWidth sx={{ mt: 2, py: 1.5, fontWeight: 'bold' }} onClick={handleConfirm} disabled={submitting}>
          {submitting ? '処理中...' : '購入を確定'}
        </Button>
      </Paper>
    </Container>
  );
};

export default BuyPage;
