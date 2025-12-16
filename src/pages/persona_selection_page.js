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
import CharacterDetailModal from '../components/CharacterDetailModal';

const RARITIES_BASE = [
  { key: 'ノーマル', label: 'ノーマル', color: '#888888', order: 1 },
  { key: 'レア', label: 'レア', color: '#00ff00', order: 2 },
  { key: 'スーパーレア', label: 'スーパーレア', color: '#00ffff', order: 3 },
  { key: 'ウルトラレア', label: 'ウルトラレア', color: '#ff00ff', order: 4 },
  { key: 'チャンピョン', label: 'チャンピョン', color: '#ffd700', order: 5 },
];

const PersonaSelectionPage = () => {
  const [sortAsc, setSortAsc] = useState(true);
  const navigate = useNavigate();
  const [allPersonas, setAllPersonas] = useState([]);
  const [ownedPersonas, setOwnedPersonas] = useState([]);
  const [currentPersonaId, setCurrentPersonaId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const { refreshUser } = useAuth();

  // 詳細モーダルの状態
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedDetailPersona, setSelectedDetailPersona] = useState(null);

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

  const handlePersonaClick = (persona) => {
    setSelectedDetailPersona(persona);
    setDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailOpen(false);
    setSelectedDetailPersona(null);
  };

  const handleSetPartner = async (persona) => {
    // 既に選択中の場合は閉じるだけ
    if (persona.id === currentPersonaId) {
      handleCloseDetail();
      return;
    }

    try {
      setUpdating(true);
      await api.put(`/users/me/persona?persona_id=${persona.id}`);
      await refreshUser();
      setCurrentPersonaId(persona.id);
      handleCloseDetail();
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
        <Box>
          <Button
            variant={sortAsc ? 'contained' : 'outlined'}
            size="small"
            sx={{ mr: 1 }}
            onClick={() => setSortAsc(true)}
          >
            レアリティ昇順
          </Button>
          <Button
            variant={!sortAsc ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setSortAsc(false)}
          >
            レアリティ降順
          </Button>
          <Button variant="outlined" onClick={() => navigate('/mypage')} sx={{ ml: 2 }}>
            マイページに戻る
          </Button>
        </Box>
      </Box>

      {(sortAsc
        ? [...RARITIES_BASE].sort((a, b) => a.order - b.order)
        : [...RARITIES_BASE].sort((a, b) => b.order - a.order)
      ).map((rarity) => {
        const filtered = allPersonas.filter(p => p.rarity_name === rarity.key);
        if (filtered.length === 0) return null;
        return (
          <Box key={rarity.key} sx={{ mb: 4 }}>
            <Typography sx={{ color: rarity.color, fontWeight: 'bold', fontSize: '18px', mb: 1 }}>
              {rarity.label}
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '16px',
                width: '100%',
                justifyItems: 'center',
                alignItems: 'center',
              }}
            >
              {filtered.map((persona) => {
                const isOwned = ownedPersonas.some(p => p.id === persona.id);
                const isSelected = persona.id === currentPersonaId;
                return (
                  <Box
                    key={persona.id}
                    sx={{
                      width: '100%',
                      maxWidth: 120,
                      background: '#111',
                      border: isSelected ? '3px solid #4caf50' : `1px solid ${rarity.color}`,
                      borderRadius: 2,
                      boxSizing: 'border-box',
                      cursor: isOwned ? 'pointer' : 'not-allowed',
                      opacity: isOwned ? 1 : 0.6,
                      filter: isOwned ? 'none' : 'grayscale(100%)',
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: isOwned ? 'scale(1.03)' : 'none',
                        boxShadow: isOwned ? 6 : 1,
                      },
                      p: 1,
                    }}
                    onClick={() => isOwned && handlePersonaClick(persona)}
                  >
                    {isSelected && (
                      <Chip
                        icon={<CheckCircleIcon />}
                        label="選択中"
                        color="success"
                        sx={{
                          position: 'absolute',
                          top: 6,
                          right: 6,
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
                        <LockIcon sx={{ fontSize: 40, color: '#757575' }} />
                      </Box>
                    )}
                    <Box
                      sx={{
                        width: '100%',
                        aspectRatio: '1 / 1',
                        position: 'relative',
                        bgcolor: '#222',
                        overflow: 'hidden',
                        mb: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Box
                        component="img"
                        src={persona.avatar_url || '/avatars/default.png'}
                        alt={persona.name}
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          imageRendering: 'pixelated',
                          background: '#eee',
                        }}
                      />
                    </Box>
                    <Typography
                      align="center"
                      fontWeight="bold"
                      sx={{
                        fontSize: '13px',
                        lineHeight: 1.2,
                        minHeight: '2em',
                        width: '100%',
                        textAlign: 'center',
                        mb: 0.5,
                        color: '#fff',
                      }}
                    >
                      {persona.name}
                    </Typography>
                    {!isOwned && (
                      <Typography variant="body2" color="text.secondary" align="center" sx={{ fontSize: '12px' }}>
                        未所持
                      </Typography>
                    )}
                  </Box>
                );
              })}
            </Box>
          </Box>
        );
      })}

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

      {/* 詳細モーダル */}
      <CharacterDetailModal
        open={detailOpen}
        onClose={handleCloseDetail}
        character={selectedDetailPersona}
        onSetPartner={handleSetPartner}
      />
    </Container>
  );
};

export default PersonaSelectionPage;