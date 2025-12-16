import React, { useEffect, useMemo, useState } from 'react';
import { Box, Typography, IconButton, CircularProgress } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '../contexts/auth_context';
import { API_BASE_URL, API_ENDPOINTS, RECOMMEND_COOLDOWN_MINUTES } from '../config';

const STORAGE_KEYS = {
  LAST_RECOMMEND_AT: 'lastRecommendAt',
  LAST_LOGIN_UID: 'lastLoginUid',
};

function minutesSince(iso) {
  if (!iso) return Infinity;
  const past = new Date(iso).getTime();
  const now = Date.now();
  return (now - past) / 1000 / 60;
}

export default function RecommendPage({ onClose, onNavigateItem }) {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [persona, setPersona] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [hoveredId, setHoveredId] = useState(null);
  const [previewPos, setPreviewPos] = useState({ x: 0, y: 0 });


  // Hooksは必ずトップレベルで呼ぶ
  const canShow = useMemo(() => {
    if (!currentUser) return false;
    // 条件: (直近レコメンドから1時間経過) or (ログインが新規)
    const lastAt = localStorage.getItem(STORAGE_KEYS.LAST_RECOMMEND_AT);
    const lastUid = localStorage.getItem(STORAGE_KEYS.LAST_LOGIN_UID);
    const isNewLogin = currentUser?.uid && currentUser.uid !== lastUid;
    const elapsed = minutesSince(lastAt);
    return isNewLogin || elapsed >= RECOMMEND_COOLDOWN_MINUTES;
  }, [currentUser]);

  useEffect(() => {
    // currentUserがいない場合は何もしない
    if (!currentUser) return;
    if (!canShow) return;
    const fetchRecommend = async () => {
      try {
        setLoading(true);
        setError('');

        // 1) おすすめ取得（keywordなし=historyモードが自然）
        const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.RECOMMEND}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Firebase-Uid': currentUser.uid,
          },
          body: JSON.stringify({ user_id: currentUser.uid, mode: 'history', keyword: null }),
        });
        if (!res.ok) throw new Error('recommend fetch failed');
        const data = await res.json();
        setItems(data.items || []);
        setPersona(data.persona || null);
        setMessage(data.persona_question || '気に入ったものがあれば教えてください！');

        // 2) 見た報酬（seeing_recommend）を申請
        try {
          await fetch(`${API_BASE_URL}${API_ENDPOINTS.REWARD_SEEING_RECOMMEND}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Firebase-Uid': currentUser.uid,
            },
            body: JSON.stringify({ user_id: currentUser.uid }),
          });
        } catch (e) {
          // 報酬はベストエフォート
          console.warn('reward claim skipped:', e);
        }

        // 3) 表示タイムスタンプ更新
        localStorage.setItem(STORAGE_KEYS.LAST_RECOMMEND_AT, new Date().toISOString());
        localStorage.setItem(STORAGE_KEYS.LAST_LOGIN_UID, currentUser.uid);
      } catch (e) {
        console.error(e);
        setError('おすすめの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommend();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canShow, currentUser]);

  if (!currentUser || !canShow) return null;

  const handleClose = () => {
    if (onClose) onClose();
  };

  const handleClickItem = (item) => {
    if (onNavigateItem) onNavigateItem(item);
    onClose && onClose();
  };


  return (
    <Box sx={styles.overlay}>
      <Box sx={styles.container}>
        <Box sx={styles.header}>
          <Typography sx={styles.title}>
            {persona?.name || 'AIアシスタント'}
          </Typography>
          <IconButton size="small" onClick={handleClose} sx={styles.close}>
            <CloseIcon htmlColor="#fff" />
          </IconButton>
        </Box>

        <Box sx={styles.body}>
          {loading ? (
            <Box sx={styles.center}>
              <CircularProgress size={28} sx={{ color: '#fff' }} />
              <Typography sx={{ color: '#fff', mt: 1 }}>考え中…</Typography>
            </Box>
          ) : error ? (
            <Typography sx={{ color: '#ff6b6b' }}>{error}</Typography>
          ) : (
            <>
              <Typography sx={styles.message}>{message}</Typography>
              <Box sx={styles.grid2x2}>
                {items.slice(0, 4).map((it, idx) => (
                  <Box
                    key={it.id}
                    sx={styles.item2x2}
                    onClick={() => {
                      if (it.id) {
                        if (onNavigateItem) onNavigateItem(it);
                        else window.location.href = `/items/${it.id}`;
                        if (onClose) onClose();
                      }
                    }}
                    onMouseEnter={e => {
                      setHoveredId(it.id);
                      const rect = e.currentTarget.getBoundingClientRect();
                      setPreviewPos({ x: rect.right + 8, y: rect.top });
                    }}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    <Box sx={styles.thumbWrapper2x2}>
                      <img src={it.image_url || '/placeholder.png'} alt={it.title || it.name} style={styles.thumb2x2} />
                    </Box>
                    <Typography sx={styles.itemTitle}>{it.title || it.name}</Typography>
                    {typeof it.price !== 'undefined' && (
                      <Typography sx={styles.itemPrice}>¥{it.price}</Typography>
                    )}
                  </Box>
                ))}
                {/* ミニプレビュー */}
                {hoveredId && (
                  <Box
                    sx={{
                      position: 'fixed',
                      top: previewPos.y,
                      left: previewPos.x,
                      width: 340,
                      height: 480,
                      zIndex: 2000,
                      boxShadow: 6,
                      border: '2px solid #fff',
                      background: '#fff',
                      borderRadius: 2,
                      overflow: 'hidden',
                    }}
                  >
                    <iframe
                      src={hoveredId ? `/items/${hoveredId}` : undefined}
                      title="item-preview"
                      width="100%"
                      height="100%"
                      style={{ border: 'none' }}
                    />
                  </Box>
                )}
              </Box>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1500,
  },
  container: {
    width: 720,
    maxWidth: '90vw',
    background: '#000',
    color: '#fff',
    border: '2px solid #fff',
    boxShadow: '0 0 0 4px #000, 0 0 0 6px #fff',
    borderRadius: 2,
    padding: 2,
    fontFamily: 'monospace',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    mb: 1,
  },
  title: { color: '#6cf', fontWeight: 700 },
  close: { border: '1px solid #fff' },
  body: { borderTop: '1px solid #333', pt: 2 },
  center: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  message: { color: '#ff0', mb: 2 },
  grid2x2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gridTemplateRows: '1fr 1fr',
    gap: 32,
    padding: 24,
    maxWidth: 700,
    margin: '0 auto',
    boxSizing: 'border-box',
    justifyItems: 'center',
    alignItems: 'center',
  },
  item2x2: {
    border: '1px solid #888',
    padding: 12,
    cursor: 'pointer',
    transition: 'all .15s',
    background: '#111',
    boxSizing: 'border-box',
    width: 220,
    height: 260,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    '&:hover': {
      borderColor: '#ff0',
      boxShadow: '0 0 0 2px #ff0',
    },
  },
  thumbWrapper2x2: {
    width: 180,
    height: 180,
    aspectRatio: '1 / 1',
    overflow: 'hidden',
    mb: 1,
    background: '#111',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumb2x2: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  itemTitle: { color: '#fff', fontSize: 12, lineHeight: 1.3 },
  itemPrice: { color: '#6f6', fontSize: 12 },
  itemDesc: { color: '#ccc', fontSize: 11 },
};
