import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Alert,
  Fade
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

const GachaPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleDrawGacha = async () => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);

      // ガチャを引くAPI呼び出し
      const response = await api.post('/gacha/draw');
      
      // 少し演出のために待機（オプション）
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setResult(response.data);
    } catch (err) {
      console.error('Gacha failed:', err);
      setError('ガチャの実行に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4, textAlign: 'center' }}>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        ペルソナガチャ
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        ポイントを使って新しいペルソナをゲットしよう！<br />
        （現在はキャンペーン中で0ポイントで回せます）
      </Typography>

      <Box sx={{ my: 4 }}>
        {!result && !loading && (
          <Button
            variant="contained"
            size="large"
            color="secondary"
            startIcon={<AutoAwesomeIcon />}
            onClick={handleDrawGacha}
            sx={{ 
              fontSize: '1.5rem', 
              py: 2, 
              px: 6,
              borderRadius: 50,
              boxShadow: '0 8px 20px rgba(233, 30, 99, 0.3)'
            }}
          >
            ガチャを回す
          </Button>
        )}

        {loading && (
          <Box display="flex" flexDirection="column" alignItems="center">
            <CircularProgress size={60} color="secondary" />
            <Typography variant="h6" sx={{ mt: 2 }}>
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
            <Card sx={{ mt: 2, overflow: 'visible', border: '4px solid gold' }}>
              <Box sx={{ position: 'relative', p: 3, bgcolor: '#fff8e1' }}>
                <Typography variant="h5" color="primary" fontWeight="bold" gutterBottom>
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
                      filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.2))'
                    }}
                  />
                </Box>

                <Typography variant="h4" fontWeight="bold">
                  {result.persona.name}
                </Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    レアリティ: {'★'.repeat(result.persona.rarity)}
                    {result.persona.rarity_name ? `（${result.persona.rarity_name}）` : ''}
                  </Typography>
                
                {!result.is_new && (
                  <Typography variant="body2" sx={{ mt: 1, bgcolor: '#eee', display: 'inline-block', px: 2, py: 0.5, borderRadius: 4 }}>
                    所持数: {result.stack_count} (+1)
                  </Typography>
                )}
              </Box>
              
              <CardContent>
                <Button 
                  variant="contained" 
                  onClick={() => setResult(null)}
                  sx={{ mt: 2, minWidth: 200 }}
                >
                  もう一度回す
                </Button>
                <Box mt={2}>
                  <Button onClick={() => navigate('/mypage')}>
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
