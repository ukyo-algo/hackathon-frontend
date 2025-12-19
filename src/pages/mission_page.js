// src/pages/mission_page.js
/**
 * ミッションページ
 * - 全ミッションの進捗・報酬受取
 * - 所持クーポン一覧
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import {
    Container, Box, Typography, Button, Card, CardContent,
    CircularProgress, Alert, Chip, LinearProgress,
} from '@mui/material';
import { useAuth } from '../contexts/auth_context';
import { colors } from '../styles/theme';
import { usePageContext } from '../components/AIChatWidget';
import {
    getMissionIcon,
    getResetBadge,
    formatCouponExpiry,
    formatCooldownTime,
    claimMission
} from '../utils/missionUtils';

const MissionPage = () => {
    const navigate = useNavigate();
    const { refreshUser, currentUser } = useAuth();
    const { setPageContext } = usePageContext();

    // 状態
    const [loading, setLoading] = useState(true);
    const [missions, setMissions] = useState([]);
    const [coupons, setCoupons] = useState([]);
    const [equippedPersona, setEquippedPersona] = useState(null);
    const [claiming, setClaiming] = useState(null);
    const [message, setMessage] = useState(null);
    const [stats, setStats] = useState({ loginStreak: 0, totalLoginDays: 0 });

    // ページコンテキストを設定
    useEffect(() => {
        const claimableCount = missions.filter(m => m.claimable && !m.completed).length;
        const completedCount = missions.filter(m => m.completed).length;

        setPageContext({
            page_type: 'mission',
            // ミッション状況
            total_missions: missions.length,
            claimable_count: claimableCount,
            completed_count: completedCount,
            // クーポン詳細情報
            owned_coupons_count: coupons.length,
            coupons_summary: coupons.slice(0, 5).map(c => ({
                type: c.coupon_type,
                discount_percent: c.discount_percent,
                expires_at: c.expires_at,
                issued_by: c.issued_by_persona?.name || null,
            })),
            shipping_coupons: coupons.filter(c => c.coupon_type === 'shipping_discount').length,
            gacha_coupons: coupons.filter(c => c.coupon_type === 'gacha_discount').length,
            // ユーザー情報
            user_gacha_points: currentUser?.gacha_points || 0,
            login_streak: stats.loginStreak,
            total_login_days: stats.totalLoginDays,
            // ペルソナ情報
            equipped_persona: equippedPersona?.name || null,
            sub_persona: currentUser?.sub_persona?.name || null,
            // サブスク情報
            subscription_tier: currentUser?.subscription_tier || 'free',
            has_subscription: currentUser?.subscription_tier === 'monthly',
        });
        return () => setPageContext(null);
    }, [missions, coupons, currentUser, stats, equippedPersona, setPageContext]);

    useEffect(() => { fetchData(); }, []);

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
        try {
            setClaiming(missionId);
            const res = await claimMission(api, missionId);
            setMessage({
                type: res.data.success ? 'success' : 'info',
                text: res.data.message,
            });
            // 成功・失敗に関わらずデータを再取得（ボタン状態を更新）
            await Promise.all([fetchData(), refreshUser()]);
        } catch (err) {
            console.error('Error claiming mission:', err);
            setMessage({
                type: 'error',
                text: err.response?.data?.detail || 'ミッション報酬の取得に失敗しました',
            });
            // エラー時もデータを再取得
            await fetchData();
        } finally {
            setClaiming(null);
            setTimeout(() => setMessage(null), 3000);
        }
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
            <PageHeader onBack={() => navigate('/mypage')} />

            {/* ログイン統計 */}
            <LoginStatsCard stats={stats} />

            {/* メッセージ */}
            {message && <Alert severity={message.type} sx={{ mb: 3 }}>{message.text}</Alert>}

            {/* 装備中のペルソナ */}
            {equippedPersona && <EquippedPersonaCard persona={equippedPersona} />}

            {/* ミッション一覧 */}
            <Typography variant="h6" sx={{ mb: 2, color: colors.textPrimary }}>
                📋 ミッション一覧
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
                {missions.map(mission => (
                    <MissionCard
                        key={mission.id}
                        mission={mission}
                        claiming={claiming === mission.id}
                        onClaim={() => handleClaimMission(mission.id)}
                        onEquipPersona={() => navigate('/persona-selection')}
                        hasPersona={!!equippedPersona}
                    />
                ))}
            </Box>

            {/* 所持クーポン */}
            <CouponSection coupons={coupons} />
        </Container>
    );
};

// =============================================================================
// サブコンポーネント
// =============================================================================

const PageHeader = ({ onBack }) => (
    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" component="h1" fontWeight="bold" sx={{
            fontFamily: '"VT323", monospace',
            color: colors.textPrimary,
        }}>
            🎯 ミッション
        </Typography>
        <Button variant="outlined" onClick={onBack}>マイページに戻る</Button>
    </Box>
);

const LoginStatsCard = ({ stats }) => (
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
);

const EquippedPersonaCard = ({ persona }) => (
    <Card sx={{ mb: 3, background: colors.backgroundAlt, border: `1px solid ${colors.border}` }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
                component="img"
                src={persona.avatar_url || '/avatars/model1.png'}
                sx={{ width: 60, height: 60, borderRadius: 2 }}
            />
            <Box>
                <Typography variant="body2" color="textSecondary">装備中のパートナー</Typography>
                <Typography variant="h6" fontWeight="bold">{persona.name}</Typography>
            </Box>
        </CardContent>
    </Card>
);

const MissionCard = ({ mission, claiming, onClaim, onEquipPersona, hasPersona }) => {
    const resetBadge = getResetBadge(mission.reset);
    const isClaimable = mission.claimable && !mission.completed;

    return (
        <Card sx={{
            background: mission.completed
                ? 'rgba(76, 175, 80, 0.1)'
                : isClaimable
                    ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(59, 130, 246, 0.2))'
                    : colors.backgroundAlt,
            border: `2px solid ${mission.completed ? '#4caf50' : isClaimable ? '#8b5cf6' : colors.border}`,
            transition: 'all 0.3s ease',
            '&:hover': isClaimable ? {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 20px rgba(139, 92, 246, 0.3)',
            } : {},
        }}>
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box flex={1}>
                        {/* ミッション名 */}
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                            <Typography variant="h6" fontWeight="bold">
                                {getMissionIcon(mission.id)} {mission.name}
                            </Typography>
                            <Chip
                                label={resetBadge.label}
                                size="small"
                                sx={{ backgroundColor: resetBadge.color, color: '#fff', fontSize: '0.7rem', height: 20 }}
                            />
                            {mission.completed && <Chip label="達成済" size="small" color="success" />}
                        </Box>

                        {/* 説明 */}
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                            {mission.description}
                        </Typography>

                        {/* クールタイム表示（デイリーミッションで達成済みの場合） */}
                        {mission.completed && mission.next_available_at && (
                            <Typography variant="body2" sx={{ color: '#ff9800', mb: 1 }}>
                                ⏰ {formatCooldownTime(mission.next_available_at)}
                            </Typography>
                        )}

                        {/* 報酬 */}
                        <MissionRewards mission={mission} />

                        {/* 進捗バー */}
                        {mission.progress && !mission.completed && (
                            <ProgressBar progress={mission.progress} isClaimable={isClaimable} />
                        )}
                    </Box>

                    {/* アクションボタン */}
                    <MissionAction
                        mission={mission}
                        isClaimable={isClaimable}
                        claiming={claiming}
                        onClaim={onClaim}
                        onEquipPersona={onEquipPersona}
                        hasPersona={hasPersona}
                    />
                </Box>
            </CardContent>
        </Card>
    );
};

const MissionRewards = ({ mission }) => (
    <>
        {mission.reward && (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                {mission.reward.gacha_points && (
                    <Chip label={`🎫 +${mission.reward.gacha_points}pt`} size="small" sx={{ backgroundColor: '#ffc107', color: '#000' }} />
                )}
                {mission.reward.coupon && (
                    <Chip label={`🎟️ ${mission.reward.coupon}`} size="small" sx={{ backgroundColor: '#e040fb', color: '#fff' }} />
                )}
            </Box>
        )}
        {mission.reward_preview && !mission.completed && (
            <Typography variant="body2" sx={{ color: '#8b5cf6' }}>
                報酬: {mission.reward_preview.type === 'shipping_discount' ? '送料' : 'ガチャ'}
                {mission.reward_preview.discount_percent}%OFF（{mission.reward_preview.hours}時間有効）
            </Typography>
        )}
    </>
);

const ProgressBar = ({ progress, isClaimable }) => (
    <Box sx={{ mt: 1 }}>
        <Box display="flex" justifyContent="space-between" mb={0.5}>
            <Typography variant="caption" color="textSecondary">進捗</Typography>
            <Typography variant="caption" color="textSecondary">{progress.current} / {progress.target}</Typography>
        </Box>
        <LinearProgress
            variant="determinate"
            value={(progress.current / progress.target) * 100}
            sx={{
                height: 8,
                borderRadius: 1,
                backgroundColor: '#333',
                '& .MuiLinearProgress-bar': { backgroundColor: isClaimable ? '#4caf50' : '#8b5cf6' }
            }}
        />
    </Box>
);

const MissionAction = ({ mission, isClaimable, claiming, onClaim, onEquipPersona, hasPersona }) => (
    <Box sx={{ ml: 2 }}>
        {isClaimable ? (
            <Button
                variant="contained"
                onClick={onClaim}
                disabled={claiming}
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
                {claiming ? <CircularProgress size={24} /> : '受け取る'}
            </Button>
        ) : mission.completed ? (
            <Chip label="✓" color="success" sx={{ fontSize: '1.2rem' }} />
        ) : mission.requires_persona && !hasPersona ? (
            <Button variant="outlined" size="small" onClick={onEquipPersona}>
                ペルソナ装備
            </Button>
        ) : null}
    </Box>
);

const CouponSection = ({ coupons }) => (
    <>
        <Typography variant="h6" sx={{ mb: 2, color: colors.textPrimary }}>
            🎟️ 所持クーポン ({coupons.length})
        </Typography>

        {coupons.length === 0 ? (
            <Card sx={{ background: colors.backgroundAlt, border: `1px solid ${colors.border}` }}>
                <CardContent>
                    <Typography color="textSecondary" align="center">クーポンがありません</Typography>
                </CardContent>
            </Card>
        ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {coupons.map(coupon => (
                    <CouponCard key={coupon.id} coupon={coupon} />
                ))}
            </Box>
        )}
    </>
);

const CouponCard = ({ coupon }) => (
    <Card sx={{
        background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.2), rgba(255, 152, 0, 0.2))',
        border: '2px solid #ffc107',
    }}>
        <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
                <Typography variant="h6" fontWeight="bold" sx={{ color: '#ffc107' }}>
                    {coupon.type === 'shipping_discount' ? '🚚 送料' : '🎰 ガチャ'}
                    {coupon.discount_percent}%OFF
                </Typography>
                <Typography variant="body2" color="textSecondary">
                    {formatCouponExpiry(coupon.expires_at)}
                </Typography>
            </Box>
            <Chip label="有効" sx={{ backgroundColor: '#ffc107', color: '#000', fontWeight: 'bold' }} />
        </CardContent>
    </Card>
);

export default MissionPage;
