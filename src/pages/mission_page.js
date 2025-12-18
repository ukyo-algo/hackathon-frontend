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
    Chip,
    LinearProgress,
} from '@mui/material';
import { useAuth } from '../contexts/auth_context';
import { colors } from '../styles/theme';

const MissionPage = () => {
    const navigate = useNavigate();
    const { currentUser, refreshUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [missions, setMissions] = useState([]);
    const [coupons, setCoupons] = useState([]);
    const [equippedPersona, setEquippedPersona] = useState(null);
    const [claiming, setClaiming] = useState(null); // missionIdを格納
    const [message, setMessage] = useState(null);
    const [stats, setStats] = useState({ loginStreak: 0, totalLoginDays: 0 });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [missionsRes, couponsRes] = await Promise.all([
                api.get('/mission/missions'),
                api.get('/mission/coupons'),
            ]);
            setMissions(missionsRes.data.missions || []);
            setCoupons(couponsRes.data.coupons || []);
            setEquippedPersona(missionsRes.data.equipped_persona);
            setStats({
                loginStreak: missionsRes.data.login_streak || 0,
                totalLoginDays: missionsRes.data.total_login_days || 0,
            });
        } catch (err) {
            console.error('Error fetching missions:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleClaimMission = async (missionId) => {
        // ミッションIDに応じたAPIエンドポイント
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
            setMessage({
                type: res.data.success ? 'success' : 'info',
                text: res.data.message,
            });
            if (res.data.success) {
                await fetchData();
                await refreshUser();
            }
        } catch (err) {
            console.error('Error claiming mission:', err);
            setMessage({
                type: 'error',
                text: err.response?.data?.detail || 'ミッション報酬の取得に失敗しました',
            });
        } finally {
            setClaiming(null);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const formatExpiry = (expiresAt) => {
        const expires = new Date(expiresAt);
        const now = new Date();
        const diff = expires - now;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        if (hours > 0) return `残り${hours}時間${minutes}分`;
        return `残り${minutes}分`;
    };

    const getMissionIcon = (missionId) => {
        const icons = {
            'daily_login': '📅',
            'daily_coupon': '🎫',
            'first_listing': '📦',
            'first_purchase': '🛒',
            'login_streak_3': '🔥',
            'weekly_likes': '❤️',
        };
        return icons[missionId] || '🎯';
    };

    const getResetBadge = (reset) => {
        const badges = {
            'daily': { label: '毎日', color: '#4caf50' },
            'weekly': { label: '毎週', color: '#2196f3' },
            'once': { label: '一回限り', color: '#ff9800' },
        };
        return badges[reset] || { label: '', color: '#999' };
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            {/* ヘッダー */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h4" component="h1" fontWeight="bold" sx={{
                    fontFamily: '"VT323", monospace',
                    color: colors.textPrimary,
                }}>
                    🎯 ミッション
                </Typography>
                <Button variant="outlined" onClick={() => navigate('/mypage')}>
                    マイページに戻る
                </Button>
            </Box>

            {/* ログイン統計 */}
            <Box sx={{
                display: 'flex',
                gap: 2,
                mb: 3,
                p: 2,
                background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.1), rgba(255, 87, 34, 0.1))',
                borderRadius: 2,
                border: '1px solid rgba(255, 152, 0, 0.3)',
            }}>
                <Box textAlign="center">
                    <Typography variant="h5" fontWeight="bold" sx={{ color: '#ff9800' }}>
                        🔥 {stats.loginStreak}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">連続ログイン</Typography>
                </Box>
                <Box textAlign="center">
                    <Typography variant="h5" fontWeight="bold" sx={{ color: '#4caf50' }}>
                        📆 {stats.totalLoginDays}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">累計ログイン</Typography>
                </Box>
            </Box>

            {message && (
                <Alert severity={message.type} sx={{ mb: 3 }}>
                    {message.text}
                </Alert>
            )}

            {/* 装備中のペルソナ */}
            {equippedPersona && (
                <Card sx={{
                    mb: 3,
                    background: colors.backgroundAlt,
                    border: `1px solid ${colors.border}`,
                }}>
                    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                            component="img"
                            src={equippedPersona.avatar_url || '/avatars/default.png'}
                            sx={{ width: 60, height: 60, borderRadius: 2 }}
                        />
                        <Box>
                            <Typography variant="body2" color="textSecondary">
                                装備中のパートナー
                            </Typography>
                            <Typography variant="h6" fontWeight="bold">
                                {equippedPersona.name}
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>
            )}

            {/* ミッション一覧 */}
            <Typography variant="h6" sx={{ mb: 2, color: colors.textPrimary }}>
                📋 ミッション一覧
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
                {missions.map(mission => {
                    const resetBadge = getResetBadge(mission.reset);
                    const isClaimable = mission.claimable && !mission.completed;

                    return (
                        <Card
                            key={mission.id}
                            sx={{
                                background: mission.completed
                                    ? 'rgba(76, 175, 80, 0.1)'
                                    : isClaimable
                                        ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(59, 130, 246, 0.2))'
                                        : colors.backgroundAlt,
                                border: `2px solid ${mission.completed
                                        ? '#4caf50'
                                        : isClaimable
                                            ? '#8b5cf6'
                                            : colors.border
                                    }`,
                                transition: 'all 0.3s ease',
                                '&:hover': isClaimable ? {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 4px 20px rgba(139, 92, 246, 0.3)',
                                } : {},
                            }}
                        >
                            <CardContent>
                                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                    <Box flex={1}>
                                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                                            <Typography variant="h6" fontWeight="bold">
                                                {getMissionIcon(mission.id)} {mission.name}
                                            </Typography>
                                            <Chip
                                                label={resetBadge.label}
                                                size="small"
                                                sx={{
                                                    backgroundColor: resetBadge.color,
                                                    color: '#fff',
                                                    fontSize: '0.7rem',
                                                    height: 20,
                                                }}
                                            />
                                            {mission.completed && (
                                                <Chip label="達成済" size="small" color="success" />
                                            )}
                                        </Box>

                                        <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                                            {mission.description}
                                        </Typography>

                                        {/* 報酬表示 */}
                                        {mission.reward && (
                                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                                                {mission.reward.gacha_points && (
                                                    <Chip
                                                        label={`🎫 +${mission.reward.gacha_points}pt`}
                                                        size="small"
                                                        sx={{ backgroundColor: '#ffc107', color: '#000' }}
                                                    />
                                                )}
                                                {mission.reward.coupon && (
                                                    <Chip
                                                        label={`🎟️ ${mission.reward.coupon}`}
                                                        size="small"
                                                        sx={{ backgroundColor: '#e040fb', color: '#fff' }}
                                                    />
                                                )}
                                            </Box>
                                        )}

                                        {mission.reward_preview && !mission.completed && (
                                            <Typography variant="body2" sx={{ color: '#8b5cf6' }}>
                                                報酬: {mission.reward_preview.type === 'shipping_discount' ? '送料' : 'ガチャ'}
                                                {mission.reward_preview.discount_percent}%OFF
                                                （{mission.reward_preview.hours}時間有効）
                                            </Typography>
                                        )}

                                        {/* 進捗バー */}
                                        {mission.progress && !mission.completed && (
                                            <Box sx={{ mt: 1 }}>
                                                <Box display="flex" justifyContent="space-between" mb={0.5}>
                                                    <Typography variant="caption" color="textSecondary">
                                                        進捗
                                                    </Typography>
                                                    <Typography variant="caption" color="textSecondary">
                                                        {mission.progress.current} / {mission.progress.target}
                                                    </Typography>
                                                </Box>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={(mission.progress.current / mission.progress.target) * 100}
                                                    sx={{
                                                        height: 8,
                                                        borderRadius: 1,
                                                        backgroundColor: '#333',
                                                        '& .MuiLinearProgress-bar': {
                                                            backgroundColor: isClaimable ? '#4caf50' : '#8b5cf6',
                                                        }
                                                    }}
                                                />
                                            </Box>
                                        )}
                                    </Box>

                                    {/* 受け取るボタン */}
                                    <Box sx={{ ml: 2 }}>
                                        {isClaimable ? (
                                            <Button
                                                variant="contained"
                                                onClick={() => handleClaimMission(mission.id)}
                                                disabled={claiming === mission.id}
                                                sx={{
                                                    backgroundColor: '#8b5cf6',
                                                    fontWeight: 'bold',
                                                    px: 3,
                                                    animation: 'pulse 2s infinite',
                                                    '@keyframes pulse': {
                                                        '0%': { boxShadow: '0 0 0 0 rgba(139, 92, 246, 0.4)' },
                                                        '70%': { boxShadow: '0 0 0 10px rgba(139, 92, 246, 0)' },
                                                        '100%': { boxShadow: '0 0 0 0 rgba(139, 92, 246, 0)' },
                                                    },
                                                    '&:hover': { backgroundColor: '#7c3aed' },
                                                }}
                                            >
                                                {claiming === mission.id ? <CircularProgress size={24} /> : '受け取る'}
                                            </Button>
                                        ) : mission.completed ? (
                                            <Chip label="✓" color="success" sx={{ fontSize: '1.2rem' }} />
                                        ) : mission.requires_persona && !equippedPersona ? (
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={() => navigate('/persona-selection')}
                                            >
                                                ペルソナ装備
                                            </Button>
                                        ) : null}
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    );
                })}
            </Box>

            {/* 所持クーポン */}
            <Typography variant="h6" sx={{ mb: 2, color: colors.textPrimary }}>
                🎟️ 所持クーポン ({coupons.length})
            </Typography>

            {coupons.length === 0 ? (
                <Card sx={{ background: colors.backgroundAlt, border: `1px solid ${colors.border}` }}>
                    <CardContent>
                        <Typography color="textSecondary" align="center">
                            クーポンがありません
                        </Typography>
                    </CardContent>
                </Card>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {coupons.map(coupon => (
                        <Card
                            key={coupon.id}
                            sx={{
                                background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.2), rgba(255, 152, 0, 0.2))',
                                border: '2px solid #ffc107',
                            }}
                        >
                            <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                    <Typography variant="h6" fontWeight="bold" sx={{ color: '#ffc107' }}>
                                        {coupon.type === 'shipping_discount' ? '🚚 送料' : '🎰 ガチャ'}
                                        {coupon.discount_percent}%OFF
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        {formatExpiry(coupon.expires_at)}
                                    </Typography>
                                </Box>
                                <Chip
                                    label="有効"
                                    sx={{
                                        backgroundColor: '#ffc107',
                                        color: '#000',
                                        fontWeight: 'bold',
                                    }}
                                />
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            )}
        </Container>
    );
};

export default MissionPage;
