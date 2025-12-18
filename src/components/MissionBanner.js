// src/components/MissionBanner.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Chip, CircularProgress, Badge } from '@mui/material';
import api from '../api/axios';
import { useAuth } from '../contexts/auth_context';

const MissionBanner = () => {
    const navigate = useNavigate();
    const { currentUser, refreshUser } = useAuth();
    const [missions, setMissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [claiming, setClaiming] = useState(null);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        if (currentUser) {
            fetchMissions();
        }
    }, [currentUser]);

    const fetchMissions = async () => {
        try {
            const res = await api.get('/mission/missions');
            setMissions(res.data.missions || []);
        } catch (err) {
            console.error('Error fetching missions:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleClaim = async (missionId, e) => {
        e.stopPropagation();

        const endpointMap = {
            'daily_login': '/mission/daily-login/claim',
            'daily_coupon': '/mission/daily-coupon/claim',
            'first_listing': '/mission/first-listing/claim',
            'first_purchase': '/mission/first-purchase/claim',
            'login_streak_3': '/mission/login-streak/claim',
            'weekly_likes': '/mission/weekly-likes/claim',
        };

        const endpoint = endpointMap[missionId];
        if (!endpoint) return;

        try {
            setClaiming(missionId);
            const res = await api.post(endpoint);
            if (res.data.success) {
                setMessage({ type: 'success', text: res.data.message });
                await fetchMissions();
                await refreshUser();
            } else {
                setMessage({ type: 'info', text: res.data.message });
            }
        } catch (err) {
            console.error('Error claiming:', err);
        } finally {
            setClaiming(null);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    if (!currentUser || loading) return null;

    // 受け取り可能なミッションをフィルタ
    const claimableMissions = missions.filter(m => m.claimable && !m.completed);
    const completedToday = missions.filter(m => m.completed).length;

    const getMissionIcon = (id) => {
        const icons = {
            'daily_login': '📅',
            'daily_coupon': '🎫',
            'first_listing': '📦',
            'first_purchase': '🛒',
            'login_streak_3': '🔥',
            'weekly_likes': '❤️',
        };
        return icons[id] || '🎯';
    };

    return (
        <Box
            sx={{
                mb: 3,
                p: 2,
                background: claimableMissions.length > 0
                    ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(59, 130, 246, 0.15))'
                    : 'rgba(76, 175, 80, 0.1)',
                borderRadius: 2,
                border: `2px solid ${claimableMissions.length > 0 ? '#8b5cf6' : '#4caf50'}`,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 20px rgba(139, 92, 246, 0.2)',
                },
            }}
            onClick={() => navigate('/mission')}
        >
            {/* ヘッダー */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Box display="flex" alignItems="center" gap={1}>
                    <Typography
                        variant="h6"
                        fontWeight="bold"
                        sx={{ fontFamily: '"VT323", monospace', fontSize: '1.3rem' }}
                    >
                        🎯 ミッション
                    </Typography>
                    {claimableMissions.length > 0 && (
                        <Badge
                            badgeContent={claimableMissions.length}
                            color="error"
                            sx={{
                                '& .MuiBadge-badge': {
                                    animation: 'pulse 1.5s infinite',
                                    '@keyframes pulse': {
                                        '0%': { transform: 'scale(1)' },
                                        '50%': { transform: 'scale(1.2)' },
                                        '100%': { transform: 'scale(1)' },
                                    },
                                },
                            }}
                        >
                            <Box sx={{ width: 8 }} />
                        </Badge>
                    )}
                </Box>
                <Typography variant="caption" color="textSecondary">
                    {completedToday}/{missions.length} 達成
                </Typography>
            </Box>

            {/* メッセージ表示 */}
            {message && (
                <Box
                    sx={{
                        mb: 1,
                        p: 1,
                        backgroundColor: message.type === 'success' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(33, 150, 243, 0.2)',
                        borderRadius: 1,
                        fontSize: '0.85rem',
                    }}
                >
                    {message.text}
                </Box>
            )}

            {/* 受け取り可能なミッション */}
            {claimableMissions.length > 0 ? (
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {claimableMissions.slice(0, 3).map(mission => (
                        <Box
                            key={mission.id}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                p: 1,
                                backgroundColor: 'rgba(139, 92, 246, 0.2)',
                                borderRadius: 1,
                                flex: '1 1 auto',
                                minWidth: 'fit-content',
                            }}
                        >
                            <Typography sx={{ fontSize: '1.2rem' }}>
                                {getMissionIcon(mission.id)}
                            </Typography>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography
                                    variant="body2"
                                    fontWeight="bold"
                                    sx={{
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    {mission.name}
                                </Typography>
                                {mission.reward?.gacha_points && (
                                    <Typography variant="caption" sx={{ color: '#ffc107' }}>
                                        +{mission.reward.gacha_points}pt
                                    </Typography>
                                )}
                            </Box>
                            <Button
                                size="small"
                                variant="contained"
                                onClick={(e) => handleClaim(mission.id, e)}
                                disabled={claiming === mission.id}
                                sx={{
                                    minWidth: 60,
                                    backgroundColor: '#8b5cf6',
                                    fontSize: '0.75rem',
                                    py: 0.5,
                                    '&:hover': { backgroundColor: '#7c3aed' },
                                }}
                            >
                                {claiming === mission.id ? (
                                    <CircularProgress size={16} color="inherit" />
                                ) : (
                                    '受取'
                                )}
                            </Button>
                        </Box>
                    ))}
                    {claimableMissions.length > 3 && (
                        <Chip
                            label={`+${claimableMissions.length - 3} more`}
                            size="small"
                            sx={{ alignSelf: 'center' }}
                        />
                    )}
                </Box>
            ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" color="textSecondary">
                        ✅ 現在受け取り可能なミッションはありません
                    </Typography>
                    <Button
                        size="small"
                        variant="outlined"
                        onClick={(e) => { e.stopPropagation(); navigate('/mission'); }}
                    >
                        詳細を見る
                    </Button>
                </Box>
            )}
        </Box>
    );
};

export default MissionBanner;
