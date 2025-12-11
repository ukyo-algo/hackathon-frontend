import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';

const PersonaSelectionPage = () => {
  const navigate = useNavigate();
  const [allPersonas, setAllPersonas] = useState([]);
  const [ownedPersonas, setOwnedPersonas] = useState([]);
  const [currentPersonaId, setCurrentPersonaId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 現在のユーザー情報を取得して current_persona_id を得る
        const userRes = await api.get('/users/me');
        setCurrentPersonaId(userRes.data.current_persona_id);

        // 全ペルソナ一覧を取得
        const allRes = await api.get('/users/personas');
        setAllPersonas(allRes.data);

        // 所有しているペルソナ一覧を取得
        const ownedRes = await api.get('/users/me/personas');
        setOwnedPersonas(ownedRes.data);
      } catch (err) {
        console.error('Error fetching data:', err);
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
      // ペルソナを変更するAPI呼び出し
      await api.put(`/users/me/persona?persona_id=${personaId}`);
      
      // 状態を更新
      setCurrentPersonaId(personaId);
    } catch (err) {
      console.error('Error updating persona:', err);
      setError('ペルソナの変更に失敗しました。');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button variant="contained" onClick={() => navigate('/mypage')} sx={{ mt: 2 }}>
          マイページに戻る
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          ペルソナ選択
        </Typography>
        <Button variant="outlined" onClick={() => navigate('/mypage')}>
          マイページに戻る
        </Button>
      </Box>

      <Grid container spacing={3}>
        {allPersonas.map((persona) => {
          const isOwned = ownedPersonas.some(p => p.id === persona.id);
          const isSelected = persona.id === currentPersonaId;
          
          return (
            <Grid item xs={12} sm={6} md={4} key={persona.id}>
              <Card
                sx={{
                  cursor: isOwned ? 'pointer' : 'not-allowed',
                  border: isSelected ? '3px solid #4caf50' : '1px solid #e0e0e0',
                  position: 'relative',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  opacity: isOwned ? 1 : 0.6,
                  filter: isOwned ? 'none' : 'grayscale(100%)',
                  '&:hover': {
                    transform: isOwned ? 'scale(1.02)' : 'none',
                    boxShadow: isOwned ? 6 : 1,
                  },
                }}
                onClick={() => isOwned && handlePersonaSelect(persona.id)}
              >
                {isSelected && (
                  <Chip
                    icon={<CheckCircleIcon />}
                    label="選択中"
                    color="success"
                    sx={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      zIndex: 1,
                      fontWeight: 'bold',
                    }}
                  />
                )}
                {!isOwned && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      bgcolor: 'rgba(0,0,0,0.1)',
                      zIndex: 2,
                    }}
                  >
                    <LockIcon sx={{ fontSize: 60, color: '#757575' }} />
                  </Box>
                )}
                <CardMedia
                  component="img"
                  height="200"
                  // アバターがない場合のフォールバック画像パスは適宜調整してください
                  image={persona.avatar_url || '/avatars/default.png'} 
                  alt={persona.name}
                  sx={{ 
                    objectFit: 'contain', 
                    bgcolor: '#f5f5f5',
                    p: 2,
                    imageRendering: 'pixelated'
                  }}
                />
                <CardContent>
                  <Typography gutterBottom variant="h6" component="div" align="center" fontWeight="bold">
                    {persona.name}
                  </Typography>
                  {!isOwned && (
                    <Typography variant="body2" color="text.secondary" align="center">
                      未所持
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
      
      {updating && (
         <Box sx={{ 
           position: 'fixed', 
           top: 0, left: 0, right: 0, bottom: 0, 
           bgcolor: 'rgba(255,255,255,0.7)', 
           zIndex: 9999,
           display: 'flex',
           justifyContent: 'center',
           alignItems: 'center'
         }}>
            <CircularProgress />
         </Box>
      )}
    </Container>
  );
};

export default PersonaSelectionPage;
