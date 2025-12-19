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
import { usePageContext } from '../components/AIChatWidget';

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
  const [ownedPersonaLevels, setOwnedPersonaLevels] = useState({});  // persona_id -> level
  const [levelUpError, setLevelUpError] = useState(null);  // レベルアップ専用エラー（ページを壊さない）
  const { refreshUser, currentUser } = useAuth();
  const { setPageContext } = usePageContext();

  // 詳細モーダルの状態
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedDetailPersona, setSelectedDetailPersona] = useState(null);

  // 現在のペルソナ名を取得
  const currentPersonaName = allPersonas.find(p => p.id === currentPersonaId)?.name || null;

  // ページコンテキストを設定（詳細なキャラ情報）
  useEffect(() => {
    setPageContext({
      page_type: 'persona_selection',
      total_personas: allPersonas.length,
      owned_personas_count: ownedPersonas.length,
      locked_personas_count: allPersonas.length - ownedPersonas.length,
      current_persona_id: currentPersonaId,
      current_persona_name: currentPersonaName,
      // メモリーフラグメント（レベルアップに使用）
      memory_fragments: currentUser?.memory_fragments || 0,
      // 詳細モーダル表示中のキャラ
      viewing_persona: selectedDetailPersona ? {
        name: selectedDetailPersona.name,
        rarity: selectedDetailPersona.rarity,
        is_owned: ownedPersonas.some(p => p.id === selectedDetailPersona.id),
        is_current: selectedDetailPersona.id === currentPersonaId,
        level: ownedPersonaLevels[selectedDetailPersona.id] || 1,
      } : null,
      modal_open: detailOpen,
    });
    return () => setPageContext(null);
  }, [allPersonas.length, ownedPersonas, currentPersonaId, currentPersonaName, selectedDetailPersona, detailOpen, currentUser, ownedPersonaLevels, setPageContext]);

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

        // レベル情報を取得（単純化のためデフォルトを1とする）
        const levels = {};
        ownedRes.data.forEach(p => { levels[p.id] = p.level || 1; });
        setOwnedPersonaLevels(levels);
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

      // ペルソナ選択をLLMに通知
      setPageContext({
        page_type: 'persona_selection',
        additional_info: {
          selected_persona_name: persona.name,
          selected_persona_id: persona.id,
          selected_rarity: persona.rarity_name,
        }
      });
    } catch (err) {
      console.error('Error updating persona:', err);
      setError('ペルソナの変更に失敗しました。');
    } finally {
      setUpdating(false);
    }
  };

  // レベルアップハンドラ
  const handleLevelUp = async (personaId) => {
    try {
      setUpdating(true);
      const res = await api.post(`/users/me/personas/${personaId}/levelup`);
      if (res.data.success) {
        // レベルを更新
        setOwnedPersonaLevels(prev => ({
          ...prev,
          [personaId]: res.data.new_level,
        }));
        await refreshUser();

        // レベルアップをLLMに通知
        const leveledPersona = allPersonas.find(p => p.id === personaId);
        setPageContext({
          page_type: 'levelup',
          additional_info: {
            leveled_persona_name: leveledPersona?.name || '不明',
            leveled_persona_id: personaId,
            new_level: res.data.new_level,
          }
        });
      }
    } catch (err) {
      console.error('Error leveling up:', err);
      const msg = err.response?.data?.detail || 'レベルアップに失敗しました';
      setLevelUpError(msg);
      // 3秒後にエラーを消す
      setTimeout(() => setLevelUpError(null), 3000);
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
                        <LockIcon sx={{ fontSize: 40, color: '#8b949e' }} />
                      </Box>
                    )}
                    <Box
                      sx={{
                        width: '100%',
                        aspectRatio: '1 / 1',
                        position: 'relative',
                        bgcolor: '#1c2128',
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
                          background: '#161b22',
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
                    {isOwned && (
                      <Chip
                        label={`Lv.${ownedPersonaLevels[persona.id] || 1}`}
                        size="small"
                        sx={{
                          bgcolor: 'rgba(100, 200, 255, 0.3)',
                          color: '#64c8ff',
                          fontWeight: 'bold',
                          fontSize: '10px',
                          height: '18px',
                        }}
                      />
                    )}
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
          bgcolor: 'rgba(0,0,0,0.8)',
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
        level={selectedDetailPersona ? ownedPersonaLevels[selectedDetailPersona.id] || 1 : 1}
        onLevelUp={handleLevelUp}
        memoryFragments={currentUser?.memory_fragments || 0}
      />
    </Container>
  );
};

export default PersonaSelectionPage;