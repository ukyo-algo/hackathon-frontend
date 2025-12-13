import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userRes = await api.get('/users/me');
        setCurrentPersonaId(userRes.data.current_persona_id);

        const allRes = await api.get('/users/personas');
        setAllPersonas(allRes.data);

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
      await api.put(`/users/me/persona?persona_id=${personaId}`);
      await refreshUser();
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
            // ★自動レスポンシブ設定 (スマホ2列/タブレット3列/PC4列)
            <Grid item xs={6} sm={4} md={3} key={persona.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
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
                      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                      display: 'flex', justifyContent: 'center', alignItems: 'center',
                      bgcolor: 'rgba(0,0,0,0.1)',
                      zIndex: 2,
                    }}
                  >
                    <LockIcon sx={{ fontSize: 60, color: '#757575' }} />
                  </Box>
                )}

                {/* ★画像エリア (Safari/Chrome対策済み) */}
                <Box
                  sx={{
                    width: '100%',
                    height: '220px',    // 高さを固定
                    position: 'relative',
                    bgcolor: '#f5f5f5',
                    overflow: 'hidden'
                  }}
                >
                  <Box
                    component="img"
                    src={persona.avatar_url || '/avatars/default.png'}
                    alt={persona.name}
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain', // ドット絵全体を表示
                      imageRendering: 'pixelated',
                      p: 2,
                      boxSizing: 'border-box'
                    }}
                  />
                </Box>

                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Typography 
                    gutterBottom 
                    variant="h6" 
                    component="div" 
                    align="center" 
                    fontWeight="bold"
                    sx={{
                      minHeight: '2em',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
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
           position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
           bgcolor: 'rgba(255,255,255,0.7)', 
           zIndex: 9999,
           display: 'flex', justifyContent: 'center', alignItems: 'center' 
         }}>
            <CircularProgress />
         </Box>
      )}
    </Container>
  );
};

export default PersonaSelectionPage;