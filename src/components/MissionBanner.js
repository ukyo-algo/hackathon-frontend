// src/components/MissionBanner.js
/**
 * ホームページ用ミッションバナー
 * - 受け取り可能なミッションを表示
 * - クイック受取機能
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Chip, CircularProgress, Badge } from '@mui/material';
import api from '../api/axios';
import { useAuth } from '../contexts/auth_context';
import { getMissionIcon, claimMission } from '../utils/missionUtils';

const MissionBanner = () => {
    const navigate = useNavigate();
    const { currentUser, refreshUser } = useAuth();
    const [missions, setMissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [claiming, setClaiming] = useState(null);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        if (currentUser) fetchMissions();
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
        try {
            setClaiming(missionId);
            const res = await claimMission(api, missionId);
            setMessage({
                type: res.data.success ? 'success' : 'info',
                text: res.data.message
            });
            if (res.data.success) {
                await Promise.all([fetchMissions(), refreshUser()]);
            }
        } catch (err) {
            console.error('Error claiming:', err);
        } finally {
            setClaiming(null);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    if (!currentUser || loading) return null;

    const claimableMissions = missions.filter(m => m.claimable && !m.completed);
    const completedCount = missions.filter(m => m.completed).length;
    const hasClaimable = claimableMissions.length > 0;

    return (
        <Box
            sx={{
                mb: 3,
                p: 2,
                background: hasClaimable
                    ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(59, 130, 246, 0.15))'
                    : 'rgba(76, 175, 80, 0.1)',
                borderRadius: 2,
                border: `2px solid ${hasClaimable ? '#8b5cf6' : '#4caf50'}`,
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
            <BannerHeader claimableCount={claimableMissions.length} progress={`${completedCount}/${missions.length}`} />

            {/* メッセージ */}
            {message && <MessageBox message={message} />}

            {/* ミッション一覧 */}
            {hasClaimable ? (
                <ClaimableMissionList
                    missions={claimableMissions.slice(0, 3)}
                    claiming={claiming}
                    onClaim={handleClaim}
                    extraCount={claimableMissions.length - 3}
                />
            ) : (
                <EmptyState onNavigate={(e) => { e.stopPropagation(); navigate('/mission'); }} />
            )}
        </Box>
    );
};

// サブコンポーネント
const BannerHeader = ({ claimableCount, progress }) => (
    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="h6" fontWeight="bold" sx={{ fontFamily: '"VT323", monospace', fontSize: '1.3rem' }}>
                🎯 ミッション
            </Typography>
            {claimableCount > 0 && (
                <Badge
                    badgeContent={claimableCount}
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
        <Typography variant="caption" color="textSecondary">{progress} 達成</Typography>
    </Box>
);

const MessageBox = ({ message }) => (
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
);

const ClaimableMissionList = ({ missions, claiming, onClaim, extraCount }) => (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {missions.map(mission => (
            <MissionItem
                key={mission.id}
                mission={mission}
                claiming={claiming === mission.id}
                onClaim={(e) => onClaim(mission.id, e)}
            />
        ))}
        {extraCount > 0 && <Chip label={`+${extraCount} more`} size="small" sx={{ alignSelf: 'center' }} />}
    </Box>
);

const MissionItem = ({ mission, claiming, onClaim }) => (
    <Box
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
        <Typography sx={{ fontSize: '1.2rem' }}>{getMissionIcon(mission.id)}</Typography>
        <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight="bold" noWrap>{mission.name}</Typography>
            {mission.reward?.gacha_points && (
                <Typography variant="caption" sx={{ color: '#ffc107' }}>+{mission.reward.gacha_points}pt</Typography>
            )}
        </Box>
        <Button
            size="small"
            variant="contained"
            onClick={onClaim}
            disabled={claiming}
            sx={{
                minWidth: 60,
                backgroundColor: '#8b5cf6',
                fontSize: '0.75rem',
                py: 0.5,
                '&:hover': { backgroundColor: '#7c3aed' },
            }}
        >
            {claiming ? <CircularProgress size={16} color="inherit" /> : '受取'}
        </Button>
    </Box>
);

const EmptyState = ({ onNavigate }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" color="textSecondary">
            ✅ 現在受け取り可能なミッションはありません
        </Typography>
        <Button size="small" variant="outlined" onClick={onNavigate}>詳細を見る</Button>
    </Box>
);

export default MissionBanner;
