import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, IconButton, CircularProgress } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '../contexts/auth_context';
import { API_BASE_URL, API_ENDPOINTS, RECOMMEND_COOLDOWN_MINUTES } from '../config';
import { usePageContext } from './AIChatWidget';

const STORAGE_KEYS = {
  LAST_RECOMMEND_AT: (uid) => `lastRecommendAt_${uid}`,
  LAST_LOGIN_UID: 'lastLoginUid',
};

function minutesSince(iso) {
  if (!iso) return Infinity;
  const past = new Date(iso).getTime();
  const now = Date.now();
  return (now - past) / 1000 / 60;
}

export default function RecommendPage({ onClose, onNavigateItem }) {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [persona, setPersona] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [reasons, setReasons] = useState({});
  const { setPageContext } = usePageContext();

  // Hooksは必ずトップレベルで呼ぶ
  const canShow = useMemo(() => {
    if (!currentUser) return false;
    // 条件: (直近レコメンドから1時間経過) or (ログインが新規)
    const lastAt = localStorage.getItem(STORAGE_KEYS.LAST_RECOMMEND_AT(currentUser.uid));
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
        setReasons(data.reasons || {});

        // ★ LLMにコンテキストを設定（おすすめ商品を認識させる）
        setPageContext({
          page_type: 'recommend_page',
          visible_items: (data.items || []).slice(0, 10).map(item => ({
            item_id: item.item_id,
            name: item.name,
            price: item.price,
            category: item.category,
            like_count: item.like_count || 0,
            reason: (data.reasons || {})[item.item_id] // 推薦理由も含める
          })),
          user_gacha_points: currentUser?.gacha_points || 0,
        });

        // LLMがペルソナの口調で生成した紹介文を使用
        setMessage(data.intro_message || 'おすすめ商品をご紹介します！');

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

        // 3) 表示タイムスタンプ更新（ユーザー固有）
        localStorage.setItem(STORAGE_KEYS.LAST_RECOMMEND_AT(currentUser.uid), new Date().toISOString());
        localStorage.setItem(STORAGE_KEYS.LAST_LOGIN_UID, currentUser.uid);
      } catch (e) {
        console.error(e);
        setError('おすすめの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommend();

    // クリーンアップ
    return () => setPageContext(null);
  }, [canShow, currentUser, setPageContext]);

  if (!currentUser || !canShow) return null;

  const handleClose = () => {
    if (onClose) onClose();
  };

  const handleClickItem = (item) => {
    const itemId = item?.item_id;
    if (itemId) {
      navigate(`/items/${itemId}`);
      onClose && onClose();
    }
  };


  return (
    <Box sx={styles.overlay}>
      <Box sx={styles.container}>
        <Box sx={styles.header}>
          <Typography sx={styles.title}>
            {persona?.name || currentUser?.current_persona?.name || 'おすすめのパック'}
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
                {items.slice(0, 4).map((it, idx) => {
                  const itemId = it.item_id;
                  return (
                    <Box
                      key={itemId || idx}
                      sx={{ ...styles.item2x2, pointerEvents: 'auto' }}
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('recommend-item-clicked', itemId, it);
                        if (itemId) {
                          navigate(`/items/${itemId}`);
                          if (onClose) onClose();
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('recommend-item-keypress', itemId);
                          if (itemId) {
                            navigate(`/items/${itemId}`);
                            if (onClose) onClose();
                          }
                        }
                      }}

                    >
                      <Box sx={styles.thumbWrapper2x2}>
                        <img src={it.image_url || '/placeholder.png'} alt={it.title || it.name} style={styles.thumb2x2} />
                      </Box>
                      <Typography sx={{ ...styles.itemTitle, pointerEvents: 'none' }}>{it.title || it.name}</Typography>
                      {typeof it.price !== 'undefined' && (
                        <Typography sx={{ ...styles.itemPrice, pointerEvents: 'none' }}>¥{it.price?.toLocaleString()}</Typography>
                      )}

                      {/* 出品者表示 */}
                      <Typography variant="caption" sx={{ color: '#aaa', fontSize: '0.7rem', display: 'block' }}>
                        {it.seller?.username || '不明'}
                      </Typography>

                      {/* おすすめ理由 */}
                      {reasons[itemId] && (
                        <Box sx={{
                          mt: 1,
                          p: 1,
                          bgcolor: 'rgba(255,255,255,0.1)',
                          borderRadius: 1,
                          fontSize: '0.75rem',
                          color: '#e6edf3'
                        }}>
                          💬 {reasons[itemId]}
                        </Box>
                      )}
                    </Box>
                  );
                })}
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
    zIndex: 3000,
  },
  container: {
    width: '90vw',
    maxWidth: '520px',
    maxHeight: '90vh',
    background: '#000',
    color: '#fff',
    border: '2px solid #fff',
    boxShadow: '0 0 0 4px #000, 0 0 0 6px #fff',
    borderRadius: 8,
    padding: '12px',
    fontFamily: 'monospace',
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  title: { color: '#6cf', fontWeight: 700, fontSize: '14px' },
  close: { border: '1px solid #fff' },
  body: { borderTop: '1px solid #333', paddingTop: '12px' },
  center: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  message: { color: '#ff0', marginBottom: '12px', fontSize: '13px' },
  grid2x2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
    width: '100%',
    boxSizing: 'border-box',
  },
  item2x2: {
    border: '1px solid #555',
    padding: '8px',
    cursor: 'pointer',
    transition: 'all .15s',
    background: '#111',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    '&:hover': {
      borderColor: '#ff0',
      boxShadow: '0 0 0 2px #ff0',
    },
  },
  thumbWrapper2x2: {
    width: '100%',
    aspectRatio: '1 / 1',
    overflow: 'hidden',
    marginBottom: '8px',
    background: '#222',
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
    pointerEvents: 'none',
  },
  itemTitle: { color: '#fff', fontSize: '13px', lineHeight: 1.3, textAlign: 'center', marginTop: '4px' },
  itemPrice: { color: '#0f0', fontSize: '14px', fontWeight: 'bold' },
  itemReason: {
    position: 'relative',
    color: '#333',
    fontSize: '11px',
    lineHeight: 1.4,
    textAlign: 'center',
    marginTop: '12px',
    padding: '8px 10px',
    background: '#fff',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
    // 吹き出しの尻尾（三角形）
    '&::before': {
      content: '""',
      position: 'absolute',
      top: '-8px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: 0,
      height: 0,
      borderLeft: '8px solid transparent',
      borderRight: '8px solid transparent',
      borderBottom: '8px solid #fff',
    },
  },
  itemDesc: { color: '#ccc', fontSize: 11 },
};
