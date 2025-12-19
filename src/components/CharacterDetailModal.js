// src/components/CharacterDetailModal.js
// クラロワ風キャラクター詳細モーダル

import React from 'react';
import {
    Box,
    Dialog,
    Typography,
    IconButton,
    Button,
    Grid
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import StarIcon from '@mui/icons-material/Star';
import { colors } from '../styles/theme';
import {
    RARITY_COLORS,
    SKILL_DEFINITIONS,
    LEVEL_UP_COSTS,
    getSkillEffectText,
    getLevelUpCost as getLevelUpCostFromConfig
} from '../config';

const CharacterDetailModal = ({ open, onClose, character, onSetPartner, onSetSubPartner, isSubPersona = false, hasSubscription = false, level = 1, onLevelUp, memoryFragments = 0 }) => {
    if (!character) return null;

    // スキルテキストをレンダリング（configのヘルパー関数を使用）
    const renderSkillEffect = () => {
        return getSkillEffectText(character.id, level);
    };

    // レアリティに応じた色（configから取得）
    const getRarityColor = (rarity) => {
        return RARITY_COLORS[rarity] || RARITY_COLORS[1];
    };

    // レベルアップコスト（configから取得）
    const levelUpCost = getLevelUpCostFromConfig(character.rarity, level);

    const rarityColor = getRarityColor(character.rarity);

    // クラロワ風ステータスアイテム
    const StatItem = ({ icon, label, value }) => (
        <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            py: 1,
            px: 1.5,
            backgroundColor: colors.backgroundAlt,
            borderRadius: 1,
            border: `1px solid ${colors.border}`,
        }}>
            <Box sx={{ fontSize: '1.2rem' }}>{icon}</Box>
            <Box>
                <Typography variant="caption" sx={{ color: colors.textTertiary, display: 'block', fontSize: '0.7rem' }}>
                    {label}
                </Typography>
                <Typography variant="body2" sx={{ color: colors.textPrimary, fontWeight: 'bold', fontFamily: '"VT323", monospace' }}>
                    {value || '???'}
                </Typography>
            </Box>
        </Box>
    );

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    backgroundColor: colors.paper,
                    border: `2px solid ${rarityColor}`,
                    boxShadow: `0 0 30px ${rarityColor}40`,
                    maxHeight: '90vh',
                    overflowY: 'auto',
                }
            }}
        >
            {/* ヘッダー: キャラ画像 + 基本情報 (クラロワ風) */}
            <Box sx={{
                display: 'flex',
                background: `linear-gradient(135deg, ${colors.background} 0%, ${character.theme_color}30 100%)`,
                p: 2,
                borderBottom: `1px solid ${colors.border}`,
            }}>
                {/* 左: キャラ画像 + レアリティ */}
                <Box sx={{ position: 'relative' }}>
                    {/* コスト風バッジ (レアリティ) */}
                    <Box sx={{
                        position: 'absolute',
                        top: -8,
                        left: -8,
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        backgroundColor: rarityColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        color: '#000',
                        fontSize: '1.2rem',
                        fontFamily: '"VT323", monospace',
                        boxShadow: `0 0 10px ${rarityColor}`,
                        zIndex: 2,
                    }}>
                        {character.rarity}
                    </Box>

                    {/* キャラ画像 */}
                    <Box
                        component="img"
                        src={character.avatar_url || '/avatars/model1.png'}
                        sx={{
                            width: 100,
                            height: 100,
                            objectFit: 'contain',
                            borderRadius: 2,
                            border: `2px solid ${rarityColor}`,
                            backgroundColor: colors.background,
                        }}
                    />
                </Box>

                {/* 右: 名前 + レアリティ + 説明 */}
                <Box sx={{ ml: 2, flex: 1 }}>
                    {/* レアリティラベル */}
                    <Box sx={{
                        display: 'inline-block',
                        backgroundColor: rarityColor,
                        color: '#000',
                        px: 1,
                        py: 0.25,
                        borderRadius: 0.5,
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                        fontFamily: '"VT323", monospace',
                        mb: 0.5,
                    }}>
                        ★ {character.rarity_name || 'Normal'}
                    </Box>

                    {/* 名前 */}
                    <Typography variant="h5" sx={{
                        fontWeight: 'bold',
                        color: colors.textPrimary,
                        fontFamily: '"VT323", monospace',
                        fontSize: '1.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                    }}>
                        {character.name}
                        <Box sx={{
                            bgcolor: 'rgba(100, 200, 255, 0.3)',
                            color: '#64c8ff',
                            px: 1,
                            py: 0.25,
                            borderRadius: 1,
                            fontSize: '1rem',
                            fontWeight: 'bold',
                        }}>
                            Lv.{level}
                        </Box>
                    </Typography>

                    {/* 説明文 */}
                    <Typography variant="body2" sx={{
                        color: colors.textSecondary,
                        mt: 1,
                        lineHeight: 1.4,
                    }}>
                        {character.description}
                    </Typography>
                </Box>

                {/* 閉じるボタン */}
                <IconButton
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: colors.textSecondary,
                        '&:hover': { color: colors.textPrimary }
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </Box>

            {/* ステータスグリッド (クラロワ風) */}
            <Box sx={{ p: 2 }}>
                <Grid container spacing={1}>
                    <Grid item xs={6}>
                        <StatItem icon="🎮" label="Origin" value={character.origin} />
                    </Grid>
                    <Grid item xs={6}>
                        <StatItem icon="🧠" label="MBTI" value={character.mbti} />
                    </Grid>
                    <Grid item xs={6}>
                        <StatItem icon="💔" label="Tragedy" value={character.tragedy} />
                    </Grid>
                    <Grid item xs={6}>
                        <StatItem icon="🔥" label="Obsession" value={character.obsession} />
                    </Grid>
                    {character.skill_name && (
                        <>
                            <Grid item xs={6}>
                                <StatItem icon="⚡" label="Skill" value={character.skill_name} />
                            </Grid>
                            <Grid item xs={6}>
                                <StatItem icon="✨" label="Effect" value={renderSkillEffect()} />
                            </Grid>
                        </>
                    )}
                </Grid>
            </Box>

            {/* アクションボタン */}
            <Box sx={{
                display: 'flex',
                gap: 1,
                p: 2,
                pt: 0,
            }}>
                <Button
                    variant="contained"
                    fullWidth
                    onClick={() => onSetPartner(character)}
                    sx={{
                        backgroundColor: colors.primary,
                        color: colors.background,
                        fontWeight: 'bold',
                        py: 1.5,
                        borderRadius: 1,
                        fontFamily: '"VT323", monospace',
                        fontSize: '1.2rem',
                        textTransform: 'none',
                        '&:hover': {
                            backgroundColor: colors.primary,
                            boxShadow: `0 0 20px ${colors.primary}`,
                        }
                    }}
                >
                    パートナーにする
                </Button>
                {onSetSubPartner && (
                    <Button
                        variant="contained"
                        onClick={() => onSetSubPartner(character)}
                        sx={{
                            backgroundColor: isSubPersona ? '#ffd700' : (hasSubscription ? '#ffa500' : '#666'),
                            color: isSubPersona ? '#000' : '#fff',
                            fontWeight: 'bold',
                            py: 1.5,
                            px: 2,
                            borderRadius: 1,
                            fontFamily: '"VT323", monospace',
                            fontSize: '1rem',
                            textTransform: 'none',
                            '&:hover': {
                                backgroundColor: isSubPersona ? '#e6c200' : (hasSubscription ? '#ff8c00' : '#666'),
                            }
                        }}
                    >
                        {isSubPersona ? '👑 SUB解除' : (hasSubscription ? '👑 SUBにする' : '🔒 SUB')}
                    </Button>
                )}
                {level < 10 && onLevelUp && (
                    <Button
                        variant="contained"
                        onClick={() => onLevelUp(character.id)}
                        disabled={memoryFragments < levelUpCost}
                        sx={{
                            backgroundColor: memoryFragments >= levelUpCost ? '#8b5cf6' : '#555',
                            color: '#fff',
                            fontWeight: 'bold',
                            py: 1.5,
                            px: 2,
                            borderRadius: 1,
                            fontFamily: '"VT323", monospace',
                            fontSize: '1rem',
                            textTransform: 'none',
                            '&:hover': {
                                backgroundColor: memoryFragments >= levelUpCost ? '#7c3aed' : '#555',
                            },
                            '&:disabled': {
                                color: '#999',
                            }
                        }}
                    >
                        💎 LvUP ({levelUpCost})
                    </Button>
                )}
                <Button
                    variant="outlined"
                    onClick={onClose}
                    sx={{
                        borderColor: colors.border,
                        color: colors.textSecondary,
                        fontFamily: '"VT323", monospace',
                        fontSize: '1.2rem',
                        px: 3,
                        '&:hover': {
                            borderColor: colors.textSecondary,
                        }
                    }}
                >
                    閉じる
                </Button>
            </Box>
        </Dialog>
    );
};

export default CharacterDetailModal;
