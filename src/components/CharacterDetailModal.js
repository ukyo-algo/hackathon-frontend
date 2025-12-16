
import React from 'react';
import {
    Box,
    Dialog,
    Typography,
    IconButton,
    Button,
    Chip,
    Grid,
    Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import StarIcon from '@mui/icons-material/Star';
import { COLORS } from '../config';

const CharacterDetailModal = ({ open, onClose, character, onSetPartner }) => {
    if (!character) return null;

    // レアリティに応じた色
    const getRarityColor = (rarity) => {
        switch (rarity) {
            case 5: return '#FFD700'; // Gold/Ultra Rare
            case 4: return '#9C27B0'; // Purple/High Rare
            case 3: return '#FF5722'; // Orange/Super Rare
            case 2: return '#2196F3'; // Blue/Rare
            case 1:
            default: return '#9E9E9E'; // Grey/Normal
        }
    };

    const rarityColor = getRarityColor(character.rarity);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    overflow: 'hidden',
                    backgroundImage: 'linear-gradient(to bottom, #f5f5f5, #ffffff)',
                    border: '1px solid #ccc',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
                }
            }}
        >
            {/* 閉じるボタン */}
            <IconButton
                onClick={onClose}
                sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    color: '#fff',
                    zIndex: 10,
                    background: 'rgba(0,0,0,0.3)',
                    '&:hover': { background: 'rgba(0,0,0,0.5)' }
                }}
            >
                <CloseIcon />
            </IconButton>

            {/* ヘッダーエリア（画像 + 背景） */}
            <Box sx={{
                position: 'relative',
                height: '240px',
                background: `linear-gradient(135deg, ${character.theme_color} 0%, #000 100%)`,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden'
            }}>
                {/* レアリティバッジ */}
                <Box sx={{
                    position: 'absolute',
                    top: 16,
                    left: 16,
                    background: 'rgba(0,0,0,0.6)',
                    color: rarityColor,
                    padding: '4px 12px',
                    borderRadius: 4,
                    fontWeight: 'bold',
                    border: `1px solid ${rarityColor}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5
                }}>
                    <StarIcon fontSize="small" /> {character.rarity_name || 'Normal'}
                </Box>

                {/* キャラクター画像 */}
                <Box
                    component="img"
                    src={character.avatar_url || '/avatars/default.png'}
                    sx={{
                        height: '200px',
                        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))',
                        transition: 'transform 0.3s ease',
                        '&:hover': { transform: 'scale(1.05)' }
                    }}
                />

                {/* 背景エフェクト（パーティクル風） */}
                <Box sx={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                    opacity: 0.3,
                    pointerEvents: 'none'
                }} />
            </Box>

            {/* 詳細情報エリア */}
            <Box sx={{ p: 3 }}>
                {/* 名前とMBTI */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: '900', color: '#333' }}>
                        {character.name}
                    </Typography>
                    {character.mbti && (
                        <Chip
                            label={character.mbti}
                            size="small"
                            sx={{ background: '#e0e0e0', fontWeight: 'bold' }}
                        />
                    )}
                </Box>

                {/* 情報セクション */}
                <Grid container spacing={2}>
                    {/* Profile */}
                    <Grid item xs={12}>
                        <Box sx={{ background: '#fafafa', p: 2, borderRadius: 2, border: '1px solid #eee' }}>
                            <Typography variant="subtitle2" sx={{ color: '#666', mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <AutoAwesomeIcon fontSize="small" /> Profile
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                                <b>Origin:</b> {character.origin}
                            </Typography>
                            <Typography variant="body2">
                                {character.description}
                            </Typography>
                        </Box>
                    </Grid>

                    {/* Deep Dive */}
                    <Grid item xs={12}>
                        <Box sx={{ background: '#fff0f5', p: 2, borderRadius: 2, border: '1px solid #fce4ec' }}>
                            <Typography variant="subtitle2" sx={{ color: '#d81b60', mb: 1 }}>
                                💔 Tragedy & Obsession
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                                <b>Tragedy:</b> {character.tragedy}
                            </Typography>
                            <Typography variant="body2">
                                <b>Obsession:</b> {character.obsession}
                            </Typography>
                        </Box>
                    </Grid>

                    {/* Skill */}
                    {character.skill_name && (
                        <Grid item xs={12}>
                            <Box sx={{
                                background: `linear-gradient(90deg, #fff 0%, ${character.theme_color}11 100%)`,
                                p: 2,
                                borderRadius: 2,
                                borderLeft: `4px solid ${character.theme_color}`
                            }}>
                                <Typography variant="subtitle2" sx={{ color: character.theme_color, mb: 0.5, fontWeight: 'bold' }}>
                                    ★ SKILL: {character.skill_name}
                                </Typography>
                                <Typography variant="body2">
                                    {character.skill_effect}
                                </Typography>
                            </Box>
                        </Grid>
                    )}
                </Grid>

                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                    <Button
                        variant="contained"
                        fullWidth
                        onClick={() => onSetPartner(character)}
                        sx={{
                            background: COLORS.PRIMARY,
                            color: '#fff',
                            fontWeight: 'bold',
                            py: 1.5,
                            borderRadius: 2,
                            boxShadow: '0 4px 6px rgba(255,107,0,0.3)',
                            textTransform: 'none',
                            fontSize: '1rem'
                        }}
                    >
                        パートナーにする
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={onClose}
                        sx={{ borderRadius: 2, fontWeight: 'bold', color: '#666', borderColor: '#ccc' }}
                    >
                        閉じる
                    </Button>
                </Box>
            </Box>
        </Dialog>
    );
};

export default CharacterDetailModal;
