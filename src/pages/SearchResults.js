// src/pages/SearchResults.js
/**
 * 検索結果ページ
 * el;ma テーマ - レトロゲーム風UI
 */

import React, { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
    Box, Grid, Card, CardContent, Typography, Container,
    CircularProgress, Alert, Chip
} from '@mui/material';
import { Favorite, ChatBubbleOutline, SearchOff } from '@mui/icons-material';
import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS, MESSAGES } from '../config';
import { usePageContext } from '../components/AIChatWidget';
import { colors } from '../styles/theme';

const SearchResults = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const [results, setResults] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const { setPageContext } = usePageContext();

    useEffect(() => {
        setPageContext({
            page_type: 'search_results',
            query: query,
            result_count: results.length,
            has_results: results.length > 0,
        });
        return () => setPageContext(null);
    }, [query, results.length, setPageContext]);

    React.useEffect(() => {
        if (!query) {
            setLoading(false);
            return;
        }

        const fetchResults = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.SEARCH}`, {
                    params: { query }
                });
                const items = Array.isArray(response.data) ? response.data : (response.data.items || []);
                setResults(items);
            } catch (err) {
                console.error('Search error:', err);
                setError(MESSAGES.ERROR.SEARCH_FAILED);
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, [query]);

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* ヘッダー */}
            <Box sx={{
                mb: 4,
                p: 3,
                background: `linear-gradient(135deg, ${colors.backgroundAlt} 0%, ${colors.paper} 100%)`,
                borderRadius: 2,
                border: `2px solid ${colors.border}`,
                position: 'relative',
                overflow: 'hidden',
            }}>
                <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 3,
                    background: `linear-gradient(90deg, ${colors.primary}, ${colors.accent})`,
                }} />

                <Typography
                    variant="h4"
                    sx={{
                        fontFamily: '"VT323", monospace',
                        fontSize: { xs: '1.8rem', sm: '2.2rem' },
                        color: colors.textPrimary,
                        mb: 1,
                    }}
                >
                    🔍 検索結果
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Chip
                        label={query}
                        sx={{
                            backgroundColor: colors.primary,
                            color: colors.background,
                            fontFamily: 'monospace',
                            fontWeight: 'bold',
                            fontSize: '1rem',
                            px: 1,
                        }}
                    />
                    {!loading && !error && (
                        <Typography
                            variant="body2"
                            sx={{ color: colors.textSecondary, fontFamily: 'monospace' }}
                        >
                            {results.length}件の商品が見つかりました
                        </Typography>
                    )}
                </Box>
            </Box>

            {/* ローディング */}
            {loading && (
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    py: 8,
                }}>
                    <CircularProgress sx={{ color: colors.primary, mb: 2 }} size={50} />
                    <Typography sx={{ fontFamily: '"VT323", monospace', color: colors.textSecondary }}>
                        検索中...
                    </Typography>
                </Box>
            )}

            {/* エラー */}
            {error && (
                <Alert
                    severity="error"
                    sx={{
                        mb: 4,
                        backgroundColor: 'rgba(255, 107, 107, 0.1)',
                        border: `1px solid ${colors.error}`,
                        fontFamily: 'monospace',
                    }}
                >
                    {error}
                </Alert>
            )}

            {/* 結果なし */}
            {!loading && !error && results.length === 0 && (
                <Box sx={{
                    textAlign: 'center',
                    py: 8,
                    px: 4,
                    background: colors.backgroundAlt,
                    borderRadius: 2,
                    border: `2px dashed ${colors.border}`,
                }}>
                    <SearchOff sx={{ fontSize: 60, color: colors.textTertiary, mb: 2 }} />
                    <Typography
                        variant="h5"
                        sx={{
                            fontFamily: '"VT323", monospace',
                            color: colors.textSecondary,
                            mb: 1,
                        }}
                    >
                        検索結果がありません
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{ color: colors.textTertiary, fontFamily: 'monospace' }}
                    >
                        別のキーワードで検索してみてください
                    </Typography>
                </Box>
            )}

            {/* 結果一覧 */}
            {!loading && !error && results.length > 0 && (
                <Grid container spacing={2}>
                    {results.map((item) => (
                        <Grid item xs={6} sm={4} md={3} key={item.item_id}>
                            <SearchResultCard item={item} />
                        </Grid>
                    ))}
                </Grid>
            )}
        </Container>
    );
};

// 商品カードコンポーネント
const SearchResultCard = ({ item }) => (
    <Link
        to={`/items/${item.item_id}`}
        style={{ textDecoration: 'none', display: 'block', height: '100%' }}
    >
        <Card sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: colors.paper,
            border: `1px solid ${colors.border}`,
            transition: 'all 0.2s ease',
            '&:hover': {
                borderColor: colors.primary,
                transform: 'translateY(-4px)',
                boxShadow: `0 8px 20px ${colors.primary}20`,
            },
        }}>
            {/* 画像 */}
            <Box sx={{
                width: '100%',
                aspectRatio: '1 / 1',
                position: 'relative',
                backgroundColor: colors.backgroundAlt,
                overflow: 'hidden',
            }}>
                {item.image_url ? (
                    <Box
                        component="img"
                        src={item.image_url}
                        alt={item.name}
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                        }}
                    />
                ) : (
                    <Box sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <Typography variant="caption" sx={{ color: colors.textTertiary, fontFamily: 'monospace' }}>
                            NO IMAGE
                        </Typography>
                    </Box>
                )}

                {/* SOLD バッジ */}
                {item.status === 'sold' && (
                    <Box sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        px: 1,
                        py: 0.5,
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        borderRadius: 1,
                        border: `1px solid ${colors.error}`,
                    }}>
                        <Typography sx={{
                            fontFamily: '"VT323", monospace',
                            fontSize: '0.8rem',
                            color: colors.error,
                        }}>
                            SOLD
                        </Typography>
                    </Box>
                )}
            </Box>

            {/* 情報 */}
            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 1.5 }}>
                {/* 商品名 */}
                <Typography
                    variant="body2"
                    sx={{
                        fontFamily: 'monospace',
                        color: colors.textPrimary,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        lineHeight: 1.4,
                        minHeight: '2.8em',
                        mb: 1,
                    }}
                >
                    {item.name}
                </Typography>

                {/* 下部 */}
                <Box sx={{ mt: 'auto' }}>
                    {/* 価格 */}
                    <Typography
                        variant="h6"
                        sx={{
                            fontFamily: '"VT323", monospace',
                            color: colors.price,
                            fontSize: '1.3rem',
                            mb: 0.5,
                        }}
                    >
                        ¥{item.price?.toLocaleString('ja-JP')}
                    </Typography>

                    {/* いいね・コメント */}
                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Favorite sx={{ fontSize: 14, color: colors.textTertiary }} />
                            <Typography variant="caption" sx={{ color: colors.textTertiary, fontFamily: 'monospace' }}>
                                {item.like_count || 0}
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <ChatBubbleOutline sx={{ fontSize: 14, color: colors.textTertiary }} />
                            <Typography variant="caption" sx={{ color: colors.textTertiary, fontFamily: 'monospace' }}>
                                {item.comment_count || 0}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    </Link>
);

export default SearchResults;