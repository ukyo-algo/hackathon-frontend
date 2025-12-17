import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Fade
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useAuth } from '../contexts/auth_context';
import { colors } from '../styles/theme';
import { usePageContext } from '../components/AIChatWidget';

const GACHA_COST = 100;

const GachaPage = () => {
  const navigate = useNavigate();
  const { currentUser, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const { setPageContext } = usePageContext();

  const userCoins = currentUser?.coins || 0;
  const canAfford = userCoins >= GACHA_COST;

  // ページコンテキストを設定
  useEffect(() => {
    setPageContext({
      page: 'gacha',
      user_coins: userCoins,
      gacha_cost: GACHA_COST,
      can_afford: canAfford,
      has_result: !!result,
      result_rarity: result?.persona?.rarity,
    });
    return () => setPageContext(null);
  }, [userCoins, canAfford, result, setPageContext]);

  const handleDrawGacha = async () => {
    if (!canAfford) {
      setError(`コインが足りません（必要: ${GACHA_COST}コイン、所持: ${userCoins}コイン）`);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResult(null);

      // ガチャを引くAPI呼び出し
      const response = await api.post('/gacha/draw');

      // 少し演出のために待機
      await new Promise(resolve => setTimeout(resolve, 1000));

      setResult(response.data);

      // ユーザー情報を更新（コイン残高を反映）
      await refreshUser();
    } catch (err) {
      console.error('Gacha failed:', err);
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError('ガチャの実行に失敗しました。');
      }
    } finally {
      setLoading(false);
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

      {/* コイン情報 */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 2,
        mb: 3,
        p: 2,
        backgroundColor: colors.backgroundAlt,
        borderRadius: 2,
        border: `1px solid ${colors.border}`,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography sx={{ fontSize: '1.5rem' }}>🪙</Typography>
          <Typography sx={{ fontFamily: '"VT323", monospace', fontSize: '1.5rem', color: colors.warning }}>
            {userCoins.toLocaleString()}
          </Typography>
        </Box>
        <Typography sx={{ color: colors.textSecondary }}>|</Typography>
        <Typography sx={{ fontFamily: '"VT323", monospace', color: colors.textSecondary }}>
          1回 = {GACHA_COST}コイン
        </Typography>
      </Box>

      <Box sx={{ my: 4 }}>
        {!result && !loading && (
          <Button
            variant="contained"
            size="large"
            disabled={!canAfford}
            startIcon={<AutoAwesomeIcon />}
            onClick={handleDrawGacha}
            sx={{
              fontSize: '1.5rem',
              py: 2,
              px: 6,
              borderRadius: 2,
              fontFamily: '"VT323", monospace',
              backgroundColor: canAfford ? colors.primary : colors.border,
              color: canAfford ? colors.background : colors.textTertiary,
              boxShadow: canAfford ? `0 0 20px ${colors.primary}40` : 'none',
              '&:hover': {
                backgroundColor: canAfford ? colors.primaryDark : colors.border,
                boxShadow: canAfford ? `0 0 30px ${colors.primary}60` : 'none',
              },
              '&:disabled': {
                backgroundColor: colors.border,
                color: colors.textTertiary,
              }
            }}
          >
            {canAfford ? 'ガチャを回す' : 'コインが足りません'}
          </Button>
        )}

        {loading && (
          <Box display="flex" flexDirection="column" alignItems="center">
            <CircularProgress size={60} sx={{ color: colors.primary }} />
            <Typography variant="h6" sx={{ mt: 2, fontFamily: '"VT323", monospace' }}>
              召喚中...
            </Typography>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {result && (
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

                <Box
                  sx={{
                    height: 300,
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    my: 2
                  }}
                >
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

                <Typography variant="h4" sx={{
                  fontWeight: 'bold',
                  fontFamily: '"VT323", monospace',
                  fontSize: '2rem',
                }}>
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
                    px: 2,
                    py: 0.5,
                    borderRadius: 1,
                    fontFamily: '"VT323", monospace',
                  }}>
                    所持数: {result.stack_count} (+1)
                  </Typography>
                )}
              </Box>

              <CardContent>
                <Button
                  variant="contained"
                  onClick={() => setResult(null)}
                  disabled={!canAfford}
                  sx={{
                    mt: 2,
                    minWidth: 200,
                    fontFamily: '"VT323", monospace',
                    fontSize: '1.2rem',
                  }}
                >
                  もう一度回す ({GACHA_COST}コイン)
                </Button>
                <Box mt={2}>
                  <Button
                    onClick={() => navigate('/mypage')}
                    sx={{ fontFamily: '"VT323", monospace' }}
                  >
                    マイページへ戻る
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Fade>
        )}
      </Box>
    </Container>
  );
};

export default GachaPage;
