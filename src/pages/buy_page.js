// src/pages/buy_page.js
/**
 * 購入確認ページ
 * - 商品購入手続き
 * - 送料クーポン適用可能
 */

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth_context';
import {
  Box, Container, Grid, Paper, Typography, RadioGroup, FormControlLabel, Radio,
  TextField, Divider, Button, Alert, Chip,
} from '@mui/material';
import { API_BASE_URL } from '../config';
import { usePageContext } from '../components/AIChatWidget';
import api from '../api/axios';
import CouponSelector from '../components/CouponSelector';

const SHIPPING_FEES = { standard: 500, express: 900 };

const BuyPage = () => {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { setPageContext } = usePageContext();

  // 商品データ
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // フォーム状態
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [deliveryOption, setDeliveryOption] = useState('standard');
  const [address, setAddress] = useState({
    name: '', postalCode: '', prefecture: '', city: '', addressLine: '', phone: ''
  });
  const [addressError, setAddressError] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // クーポン関連
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [selectedCouponId, setSelectedCouponId] = useState('');

  // 計算値
  const baseShippingFee = SHIPPING_FEES[deliveryOption];
  const selectedCoupon = availableCoupons.find(c => c.id === selectedCouponId);
  const shippingDiscountPercent = selectedCoupon?.discount_percent || 0;
  const shippingDiscount = Math.floor(baseShippingFee * shippingDiscountPercent / 100);
  const finalShippingFee = baseShippingFee - shippingDiscount;
  const totalPrice = (Number(item?.price || 0) + finalShippingFee);

  const estimatedDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + (deliveryOption === 'express' ? 1 : 3));
    return d.toLocaleDateString();
  }, [deliveryOption]);

  // ページコンテキスト
  useEffect(() => {
    if (item) {
      setPageContext({
        page: 'buy_confirmation',
        item_id: itemId,
        item_name: item.name,
        item_price: item.price,
        payment_method: paymentMethod,
        delivery_option: deliveryOption,
        // クーポン情報
        available_coupons_count: availableCoupons.length,
        selected_coupon: selectedCoupon ? {
          discount_percent: selectedCoupon.discount_percent,
          type: selectedCoupon.coupon_type,
        } : null,
        // 料金情報
        base_shipping_fee: baseShippingFee,
        shipping_discount: shippingDiscount,
        final_shipping_fee: finalShippingFee,
        total_price: totalPrice,
      });
    }
    return () => setPageContext(null);
  }, [item, itemId, paymentMethod, deliveryOption, availableCoupons, selectedCoupon, baseShippingFee, shippingDiscount, finalShippingFee, totalPrice, setPageContext]);

  // データ取得
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId, currentUser]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [itemRes, couponsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/v1/items/${itemId}`),
        api.get(`/items/${itemId}/available-coupons`),
      ]);

      if (!itemRes.ok) throw new Error('商品情報の取得に失敗しました');

      setItem(await itemRes.json());
      setAvailableCoupons(couponsRes.data.coupons || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

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
    if (!currentUser) return navigate('/login');
    if (!validate()) return;

    try {
      setSubmitting(true);

      const url = selectedCouponId
        ? `${API_BASE_URL}/api/v1/items/${itemId}/buy?coupon_id=${selectedCouponId}`
        : `${API_BASE_URL}/api/v1/items/${itemId}/buy`;

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Firebase-Uid': currentUser.uid },
        body: JSON.stringify({ paymentMethod, deliveryOption, address })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || '購入に失敗しました');
      }

      navigate('/', { state: { purchaseMessage: '購入完了したよ！', event: 'PURCHASE_COMPLETED' } });
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const updateAddress = (field, value) => setAddress(prev => ({ ...prev, [field]: value }));

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>読み込み中...</Box>;
  if (error) return <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>;
  if (!item) return <Alert severity="warning" sx={{ m: 2 }}>商品が見つかりません</Alert>;

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>購入手続き</Typography>

      {/* 商品情報 */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>商品</Typography>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography>{item.name}</Typography>
          <Typography sx={{ fontWeight: 'bold', color: 'error.main' }}>
            ¥{Number(item.price || 0).toLocaleString()}
          </Typography>
        </Box>
      </Paper>

      {/* 決済・配送オプション */}
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
              <FormControlLabel value="standard" control={<Radio />} label={`通常配送（¥500） 推定到着: ${estimatedDate}`} />
              <FormControlLabel value="express" control={<Radio />} label={`速達（¥900） 推定到着: ${estimatedDate}`} />
            </RadioGroup>
          </Paper>
        </Grid>
      </Grid>

      {/* クーポン選択 */}
      {availableCoupons.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <CouponSelector
            coupons={availableCoupons}
            selectedCouponId={selectedCouponId}
            onSelect={setSelectedCouponId}
            couponType="shipping"
          />
        </Box>
      )}

      {/* 住所入力 */}
      <Paper sx={{ p: 2, mt: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>お届け先住所</Typography>
        <Grid container spacing={2}>
          {[
            { field: 'name', label: '氏名', md: 6 },
            { field: 'postalCode', label: '郵便番号', md: 6 },
            { field: 'prefecture', label: '都道府県', md: 4 },
            { field: 'city', label: '市区町村', md: 4 },
            { field: 'addressLine', label: '番地・建物', md: 4 },
            { field: 'phone', label: '電話番号', md: 6 },
          ].map(({ field, label, md }) => (
            <Grid item xs={12} md={md} key={field}>
              <TextField
                fullWidth
                label={label}
                value={address[field]}
                onChange={(e) => updateAddress(field, e.target.value)}
                error={!!addressError[field]}
                helperText={addressError[field]}
              />
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* 注文概要 */}
      <Paper sx={{ p: 2, mt: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>注文概要</Typography>
        <Divider sx={{ mb: 2 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography>商品価格</Typography>
          <Typography>¥{Number(item.price || 0).toLocaleString()}</Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography>送料</Typography>
          {shippingDiscountPercent > 0 ? (
            <Box sx={{ textAlign: 'right' }}>
              <Typography sx={{ textDecoration: 'line-through', color: 'text.secondary', fontSize: '0.9rem' }}>
                ¥{baseShippingFee.toLocaleString()}
              </Typography>
              <Typography sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                ¥{finalShippingFee.toLocaleString()}
                <Chip
                  label={`${shippingDiscountPercent}%OFF`}
                  size="small"
                  sx={{ ml: 1, backgroundColor: '#ffc107', color: '#000', height: 20, fontSize: '0.7rem' }}
                />
              </Typography>
            </Box>
          ) : (
            <Typography>¥{finalShippingFee.toLocaleString()}</Typography>
          )}
        </Box>

        <Divider sx={{ my: 1 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography sx={{ fontWeight: 'bold' }}>合計</Typography>
          <Typography sx={{ fontWeight: 'bold', color: 'error.main' }}>
            ¥{totalPrice.toLocaleString()}
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2, py: 1.5, fontWeight: 'bold' }}
          onClick={handleConfirm}
          disabled={submitting}
        >
          {submitting ? '処理中...' : '購入を確定'}
        </Button>
      </Paper>
    </Container>
  );
};

export default BuyPage;
