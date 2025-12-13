import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import {
  Container, Grid, Card, CardContent, Typography, Button, Box, 
  CircularProgress, Alert, Chip, Slider, Paper
} from '@mui/material';
import { CheckCircle, Lock, GridView, ViewComfy } from '@mui/icons-material';
import { useAuth } from '../contexts/auth_context';

const PersonaSelectionPage = () => {
  const navigate = useNavigate();
  const [allPersonas, setAllPersonas] = useState([]);
  const [ownedPersonas, setOwnedPersonas] = useState([]);
  const [currentPersonaId, setCurrentPersonaId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const { refreshUser } = useAuth();

  // ★追加機能: 列数管理 (デフォルト3列)
  const [cols, setCols] = useState(3);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [userRes, allRes, ownedRes] = await Promise.all([
          api.get('/users/me'),
          api.get('/users/personas'),
          api.get('/users/me/personas')
        ]);
        setCurrentPersonaId(userRes.data.current_persona_id);
        setAllPersonas(allRes.data);
        setOwnedPersonas(ownedRes.data);
      } catch (err) {
        console.error('Error:', err);
        setError('データの取得に失敗しました。');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handlePersonaSelect = async (personaId) => {
    if (personaId === currentPersonaId) return;
    try {
      setUpdating(true);
      await api.put(`/users/me/persona?persona_id=${personaId}`);
      await refreshUser();
      setCurrentPersonaId(personaId);
    } catch (err) {
      setError('変更に失敗しました。');
    } finally {
      setUpdating(false);
    }
  };

  const gridSize = 12 / cols;

  if (loading) return <Box display="flex" justifyContent="center" minHeight="50vh" alignItems="center"><CircularProgress /></Box>;
  if (error) return <Container sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Container>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* ヘッダー & コントローラー */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4} flexWrap="wrap" gap={2}>
        <Typography variant="h4" fontWeight="bold">ペルソナ選択</Typography>
        
        <Box display="flex" gap={2} alignItems="center">
            {/* ★列数スライダー */}
            <Paper variant="outlined" sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#f9f9f9' }}>
                <GridView fontSize="small" color="action" />
                <Slider
                    value={cols}
                    onChange={(e, v) => setCols(v)}
                    step={null}
                    marks={[{ value: 2 }, { value: 3 }, { value: 4 }, { value: 6 }]}
                    min={2}
                    max={6}
                    sx={{ width: 80 }}
                />
            </Paper>
            <Button variant="outlined" onClick={() => navigate('/mypage')}>戻る</Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {allPersonas.map((persona) => {
          const isOwned = ownedPersonas.some(p => p.id === persona.id);
          const isSelected = persona.id === currentPersonaId;
          
          return (
            <Grid item xs={6} sm={gridSize} md={gridSize} key={persona.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex', flexDirection: 'column',
                  cursor: isOwned ? 'pointer' : 'not-allowed',
                  border: isSelected ? '3px solid #4caf50' : '1px solid #e0e0e0',
                  position: 'relative',
                  transition: '0.2s',
                  opacity: isOwned ? 1 : 0.6,
                  filter: isOwned ? 'none' : 'grayscale(100%)',
                  '&:hover': { transform: isOwned ? 'scale(1.02)' : 'none', boxShadow: isOwned ? 6 : 1 },
                }}
                onClick={() => isOwned && handlePersonaSelect(persona.id)}
              >
                {isSelected && (
                  <Chip icon={<CheckCircle />} label="選択中" color="success" size="small" sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }} />
                )}
                {!isOwned && (
                  <Box sx={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: 'rgba(0,0,0,0.1)', zIndex: 2 }}>
                    <Lock sx={{ fontSize: 40, color: '#757575' }} />
                  </Box>
                )}

                {/* ★画像エリア (Safari/Chrome対策済) */}
                {/* 親BOXに heightを指定し、position: relativeを設定。
                   子画像に position: absolute を設定。
                   これにより「画像自身のサイズ」がレイアウトを押し広げることがなくなります。
                */}
                <Box sx={{
                    width: '100%',
                    height: '220px', // ここで高さをガチガチに固定
                    position: 'relative',
                    bgcolor: '#f5f5f5',
                    overflow: 'hidden'
                }}>
                  <Box
                    component="img"
                    src={persona.avatar_url || '/avatars/default.png'}
                    alt={persona.name}
                    sx={{
                      position: 'absolute', // 浮遊させて親枠に従わせる
                      top: 0, left: 0,
                      width: '100%', height: '100%',
                      objectFit: 'contain', // ドット絵全体を見せる
                      imageRendering: 'pixelated',
                      p: 2,
                      boxSizing: 'border-box'
                    }}
                  />
                </Box>

                <CardContent sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80px' }}>
                  <Typography variant="subtitle1" align="center" fontWeight="bold" sx={{ lineHeight: 1.2 }}>
                    {persona.name}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
      
      {updating && (
         <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(255,255,255,0.7)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <CircularProgress />
         </Box>
      )}
    </Container>
  );
};

export default PersonaSelectionPage;