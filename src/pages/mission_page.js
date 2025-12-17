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
    const [claiming, setClaiming] = useState(false);
    const [message, setMessage] = useState(null);

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
        } catch (err) {
            console.error('Error fetching missions:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleClaimCoupon = async () => {
        try {
            setClaiming(true);
            const res = await api.post('/mission/daily-coupon/claim');
            setMessage({
                type: res.data.success ? 'success' : 'info',
                text: res.data.message,
            });
            if (res.data.success) {
                await fetchData();
                await refreshUser();
            }
        } catch (err) {
            console.error('Error claiming coupon:', err);
            setMessage({
                type: 'error',
                text: err.response?.data?.detail || 'クーポン取得に失敗しました',
            });
        } finally {
            setClaiming(false);
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

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                <CircularProgress />
            </Box>
        );
    }

    const dailyMission = missions.find(m => m.id === 'daily_coupon');

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            {/* ヘッダー */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
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

            {/* デイリーミッション */}
            <Typography variant="h6" sx={{ mb: 2, color: colors.textPrimary }}>
                📅 デイリーミッション
            </Typography>

            {dailyMission && (
                <Card sx={{
                    mb: 4,
                    background: dailyMission.completed
                        ? 'rgba(0, 200, 0, 0.1)'
                        : 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(59, 130, 246, 0.2))',
                    border: `2px solid ${dailyMission.completed ? '#4caf50' : '#8b5cf6'}`,
                }}>
                    <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Box>
                                <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    🎫 {dailyMission.name}
                                    {dailyMission.completed && (
                                        <Chip label="完了" size="small" color="success" />
                                    )}
                                </Typography>
                                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                                    {dailyMission.description}
                                </Typography>
                                {dailyMission.reward_preview && !dailyMission.completed && (
                                    <Typography variant="body2" sx={{ mt: 1, color: '#8b5cf6' }}>
                                        報酬: {dailyMission.reward_preview.type === 'shipping_discount' ? '送料' : 'ガチャ'}
                                        {dailyMission.reward_preview.discount_percent}%OFF
                                        （{dailyMission.reward_preview.hours}時間有効）
                                    </Typography>
                                )}
                            </Box>
                            {!dailyMission.completed && (
                                <Button
                                    variant="contained"
                                    onClick={handleClaimCoupon}
                                    disabled={claiming}
                                    sx={{
                                        backgroundColor: '#8b5cf6',
                                        fontWeight: 'bold',
                                        px: 3,
                                        '&:hover': { backgroundColor: '#7c3aed' },
                                    }}
                                >
                                    {claiming ? <CircularProgress size={24} /> : '受け取る'}
                                </Button>
                            )}
                        </Box>
                    </CardContent>
                </Card>
            )}

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
