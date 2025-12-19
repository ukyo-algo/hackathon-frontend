// src/pages/gacha_page.js
/**
 * ガチャページ
 * - ペルソナガチャを引く
 * - クーポン適用可能
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import {
  Container, Box, Typography, Button, Card, CardContent,
  CircularProgress, Alert, Fade,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Radio, RadioGroup, FormControlLabel, FormControl, FormLabel,
  Snackbar,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { useAuth } from '../contexts/auth_context';
import { colors } from '../styles/theme';
import { usePageContext } from '../components/AIChatWidget';
import CouponSelector from '../components/CouponSelector';

const BASE_GACHA_COST = 100;

const GachaPage = () => {
  const navigate = useNavigate();
  const { currentUser, refreshUser } = useAuth();
  const { setPageContext } = usePageContext();

  // 状態
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // ポイントチャージ関連
  const [chargeModalOpen, setChargeModalOpen] = useState(false);
  const [chargeAmount, setChargeAmount] = useState(1000);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [chargeLoading, setChargeLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  // クーポン関連
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [selectedCouponId, setSelectedCouponId] = useState('');

  // 計算値
  const userGachaPoints = currentUser?.gacha_points || 0;
  const selectedCoupon = availableCoupons.find(c => c.id === selectedCouponId);
  const discountPercent = selectedCoupon?.discount_percent || 0;
  const finalCost = BASE_GACHA_COST - Math.floor(BASE_GACHA_COST * discountPercent / 100);
  const canAfford = userGachaPoints >= finalCost;

  // ペルソナ一覧（ガチャで引けるキャラ）
  const [allPersonas, setAllPersonas] = useState([]);

  // クーポン一覧を取得
  useEffect(() => {
    if (!currentUser) return;

    const fetchCoupons = async () => {
      try {
        const res = await api.get('/gacha/available-coupons');
        setAvailableCoupons(res.data.coupons || []);
      } catch (err) {
        console.error('Failed to fetch coupons:', err);
      }
    };
    fetchCoupons();
  }, [currentUser]);

  // ペルソナ一覧を取得
  useEffect(() => {
    const fetchPersonas = async () => {
      try {
        const res = await api.get('/personas');
        setAllPersonas(res.data || []);
      } catch (err) {
        console.error('Failed to fetch personas:', err);
      }
    };
    fetchPersonas();
  }, []);

  // ページコンテキスト: 初回ロード時のみ
  useEffect(() => {
    // ペルソナ情報をサマリ化（LLM向け）
    const personaSummary = allPersonas.slice(0, 10).map(p => ({
      name: p.name,
      rarity: p.rarity,
      rarity_name: p.rarity_name,
      description: p.description,
    }));

    setPageContext({
      page_type: 'gacha',
      user_gacha_points: userGachaPoints,
      gacha_cost: finalCost,
      can_afford: canAfford,
      has_result: false,
      available_personas: personaSummary,
      total_persona_count: allPersonas.length,
    });
    return () => setPageContext(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allPersonas]);

  // ページコンテキスト: ガチャ結果確定時のみLLMにガイダンスを依頼
  // 初回ロードでは汎用メッセージを避けるため、結果が出るまでコンテキストを送信しない
  useEffect(() => {
    if (result) {
      // ガチャ結果が出た時だけコンテキストを送信
      // バックエンドのPageContextスキーマに合わせたフラット形式で送信
      setPageContext({
        page_type: 'gacha_result',
        user_gacha_points: userGachaPoints,
        // 引いたキャラの情報（フラット形式）
        result_persona_name: result.persona?.name,
        result_rarity: result.persona?.rarity,
        result_rarity_name: result.persona?.rarity_name,
        result_is_new: result.is_new || false,
        result_stack_count: result.stack_count || 1,
        fragments_earned: result.fragments_earned || 0,
        // 追加情報はadditional_infoに
        additional_info: {
          '引いたキャラの説明': result.persona?.description,
          'スキル名': result.persona?.skill_name,
          'スキル効果': result.persona?.skill_effect,
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  const handleDrawGacha = async () => {
    if (!canAfford) {
      // ポイント不足時はチャージモーダルを開く
      setChargeModalOpen(true);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const params = selectedCouponId ? { coupon_id: selectedCouponId } : {};
      const response = await api.post('/gacha/draw', null, { params });

      // 演出用の待機
      await new Promise(resolve => setTimeout(resolve, 1000));

      setResult(response.data);

      // クーポン使用後は一覧から削除
      if (selectedCouponId) {
        setAvailableCoupons(prev => prev.filter(c => c.id !== selectedCouponId));
        setSelectedCouponId('');
      }

      await refreshUser();
    } catch (err) {
      console.error('Gacha failed:', err);
      setError(err.response?.data?.detail || 'ガチャの実行に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  // チャージ処理
  const handleCharge = async () => {
    try {
      setChargeLoading(true);
      setError(null);

      await api.post('/gacha/charge', {
        amount: chargeAmount,
        payment_method: paymentMethod
      });

      await refreshUser();
      setSuccessMessage(`${chargeAmount}ptをチャージしました！`);
      setChargeModalOpen(false);

      // 成功メッセージを3秒後に消す
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Charge failed:', err);
      setError('チャージに失敗しました。');
    } finally {
      setChargeLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4, textAlign: 'center' }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{
        fontFamily: '"VT323", monospace',
        fontSize: '2.5rem',
      }}>
        ペルソナガチャ
      </Typography>

      {/* ポイント情報 */}
      {/* ポイント情報エリア */}
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mb: 1 }}>
        <PointDisplay
          points={userGachaPoints}
          baseCost={BASE_GACHA_COST}
          finalCost={finalCost}
          discountPercent={discountPercent}
        />
        <Button
          variant="outlined"
          startIcon={<AddCircleIcon />}
          onClick={() => setChargeModalOpen(true)}
          sx={{ fontFamily: '"VT323", monospace', fontWeight: 'bold' }}
        >
          チャージ
        </Button>
      </Box>
      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage(null)}
        message={successMessage}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>

      {/* クーポン選択 */}
      {availableCoupons.length > 0 && !result && (
        <Box sx={{ mb: 3 }}>
          <CouponSelector
            coupons={availableCoupons}
            selectedCouponId={selectedCouponId}
            onSelect={setSelectedCouponId}
            couponType="gacha"
          />
        </Box>
      )}

      {/* メインエリア */}
      <Box sx={{ my: 4 }}>
        {!result && !loading && (
          <GachaButton
            onClick={handleDrawGacha}
            canAfford={canAfford}
            cost={finalCost}
          />
        )}

        {loading && <LoadingSpinner />}
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        {result && (
          <GachaResult
            result={result}
            onRetry={() => setResult(null)}
            canAfford={canAfford}
            baseCost={BASE_GACHA_COST}
            onNavigate={() => navigate('/mypage')}
          />
        )}
      </Box>


      {/* チャージモーダル */}
      <Dialog open={chargeModalOpen} onClose={() => setChargeModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontFamily: '"VT323", monospace', textAlign: 'center' }}>
          ポイントチャージ
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <Typography variant="subtitle2" gutterBottom>チャージ金額</Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
              {[1000, 3000, 5000].map((amount) => (
                <Button
                  key={amount}
                  variant={chargeAmount === amount ? "contained" : "outlined"}
                  onClick={() => setChargeAmount(amount)}
                  sx={{ flex: 1, fontFamily: '"VT323", monospace' }}
                >
                  {amount}pt
                </Button>
              ))}
            </Box>

            <Typography variant="subtitle2" gutterBottom>決済方法</Typography>
            <FormControl component="fieldset">
              <RadioGroup
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <FormControlLabel value="credit_card" control={<Radio />} label="クレジットカード" />
                <FormControlLabel value="bank_transfer" control={<Radio />} label="銀行振込" />
                <FormControlLabel value="cod" control={<Radio />} label="代金引換" />
              </RadioGroup>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: 'center' }}>
          <Button onClick={() => setChargeModalOpen(false)} disabled={chargeLoading}>キャンセル</Button>
          <Button
            onClick={handleCharge}
            variant="contained"
            disabled={chargeLoading}
            sx={{ fontFamily: '"VT323", monospace', fontWeight: 'bold' }}
          >
            {chargeLoading ? '処理中...' : `購入する (¥${chargeAmount.toLocaleString()})`}
          </Button>
        </DialogActions>
      </Dialog>
    </Container >
  );
};

// サブコンポーネント
const PointDisplay = ({ points, baseCost, finalCost, discountPercent }) => (
  <Box sx={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
    mb: 2,
    p: 2,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 2,
    border: `1px solid ${colors.border}`,
  }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography sx={{ fontSize: '1.5rem' }}>🎫</Typography>
      <Typography sx={{ fontFamily: '"VT323", monospace', fontSize: '1.5rem', color: colors.warning }}>
        {points.toLocaleString()}
      </Typography>
    </Box>
    <Typography sx={{ color: colors.textSecondary }}>|</Typography>
    <Box sx={{ textAlign: 'left' }}>
      {discountPercent > 0 ? (
        <>
          <Typography sx={{
            fontFamily: '"VT323", monospace',
            color: colors.textSecondary,
            textDecoration: 'line-through',
            fontSize: '0.9rem',
          }}>
            1回 = {baseCost}pt
          </Typography>
          <Typography sx={{ fontFamily: '"VT323", monospace', color: '#4caf50', fontWeight: 'bold' }}>
            🎟️ {discountPercent}%OFF → {finalCost}pt
          </Typography>
        </>
      ) : (
        <Typography sx={{ fontFamily: '"VT323", monospace', color: colors.textSecondary }}>
          1回 = {baseCost}pt
        </Typography>
      )}
    </Box>
  </Box>
);

const GachaButton = ({ onClick, canAfford, cost }) => (
  <Button
    variant="contained"
    size="large"
    disabled={!canAfford}
    startIcon={<AutoAwesomeIcon />}
    onClick={onClick}
    sx={{
      fontSize: '1.5rem',
      py: 2, px: 6,
      borderRadius: 2,
      fontFamily: '"VT323", monospace',
      backgroundColor: canAfford ? colors.primary : colors.border,
      color: canAfford ? colors.background : colors.textTertiary,
      boxShadow: canAfford ? `0 0 20px ${colors.primary}40` : 'none',
      '&:hover': {
        backgroundColor: canAfford ? colors.primaryDark : colors.border,
        boxShadow: canAfford ? `0 0 30px ${colors.primary}60` : 'none',
      },
    }}
  >
    {canAfford ? `ガチャを回す (${cost}pt)` : 'ポイント不足 (チャージ)'}
  </Button>
);

const LoadingSpinner = () => (
  <Box display="flex" flexDirection="column" alignItems="center">
    <CircularProgress size={60} sx={{ color: colors.primary }} />
    <Typography variant="h6" sx={{ mt: 2, fontFamily: '"VT323", monospace' }}>
      召喚中...
    </Typography>
  </Box>
);

const GachaResult = ({ result, onRetry, canAfford, baseCost, onNavigate }) => (
  <Fade in={true} timeout={1000}>
    <Card sx={{
      mt: 2,
      overflow: 'visible',
      border: `2px solid ${colors.warning}`,
      backgroundColor: colors.paper,
      boxShadow: `0 0 30px ${colors.warning}30`,
    }}>
      <Box sx={{ position: 'relative', p: 3 }}>
        <Typography variant="h5" sx={{
          color: colors.primary,
          fontWeight: 'bold',
          fontFamily: '"VT323", monospace',
          fontSize: '1.8rem',
          mb: 2,
        }}>
          {result.message}
        </Typography>

        <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center', my: 2 }}>
          <Box
            component="img"
            src={result.persona.avatar_url || '/avatars/default.png'}
            alt={result.persona.name}
            sx={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              imageRendering: 'pixelated',
              filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.4))'
            }}
          />
        </Box>

        <Typography variant="h4" sx={{ fontWeight: 'bold', fontFamily: '"VT323", monospace', fontSize: '2rem' }}>
          {result.persona.name}
        </Typography>
        <Typography sx={{ color: colors.warning, fontFamily: '"VT323", monospace' }}>
          {'★'.repeat(result.persona.rarity)}
          {result.persona.rarity_name ? ` ${result.persona.rarity_name}` : ''}
        </Typography>

        {!result.is_new && (
          <Typography sx={{
            mt: 1,
            backgroundColor: colors.backgroundAlt,
            display: 'inline-block',
            px: 2, py: 0.5,
            borderRadius: 1,
            fontFamily: '"VT323", monospace',
          }}>
            所持数: {result.stack_count} (+1)
          </Typography>
        )}

        {result.discount_applied > 0 && (
          <Typography sx={{ mt: 1, color: '#4caf50', fontFamily: '"VT323", monospace' }}>
            🎟️ {result.discount_applied}%OFFクーポン適用済み
          </Typography>
        )}
      </Box>

      <CardContent>
        <Button
          variant="contained"
          onClick={onRetry}
          disabled={!canAfford}
          sx={{ mt: 2, minWidth: 200, fontFamily: '"VT323", monospace', fontSize: '1.2rem' }}
        >
          もう一度回す ({baseCost}pt)
        </Button>
        <Box mt={2}>
          <Button onClick={onNavigate} sx={{ fontFamily: '"VT323", monospace' }}>
            マイページへ戻る
          </Button>
        </Box>
      </CardContent>
    </Card>
  </Fade>
);

export default GachaPage;
