import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Box, Grid, Card, CardContent, Typography, Container, CircularProgress, Alert, Stack } from '@mui/material';
import { FavoriteBorder, ChatBubbleOutline } from '@mui/icons-material';
import axios from 'axios';
import {
  API_BASE_URL,
  API_ENDPOINTS,
  COLORS,
  MESSAGES,
} from '../config';

const SearchResults = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const [results, setResults] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

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
            {/* タイトル */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                    「{query}」の検索結果
                </Typography>
                {!loading && !error && (
                    <Typography variant="body2" color="textSecondary">
                        {results.length}件の商品が見つかりました
                    </Typography>
                )}
            </Box>

            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress />
                </Box>
            )}

            {error && (
                <Alert severity="error" sx={{ mb: 4 }}>
                    {error}
                </Alert>
            )}

            {!loading && !error && results.length === 0 && (
                <Alert severity="info">
                    {MESSAGES.EMPTY_STATE.NO_SEARCH_RESULTS}
                </Alert>
            )}

            {/* 検索結果グリッド */}
            {!loading && !error && results.length > 0 && (
                <Grid container spacing={2}>
                    {results.map((item) => (
                        // ★自動レスポンシブ設定 (スマホ1列/タブレット2-3列/PC4列)
                        <Grid item xs={12} sm={6} md={4} lg={3} key={item.item_id}>
                            <Link 
                                to={`/items/${item.item_id}`} 
                                style={{ 
                                    textDecoration: 'none',
                                    display: 'block',    
                                    width: '100%',       
                                    height: '100%'       
                                }}
                            >
                                <Card sx={{
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'transform 0.2s',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: 4
                                    }
                                }}>
                                    {/* ★画像エリア (Safari/Chrome対策済み) */}
                                    <Box sx={{
                                        width: '100%',
                                        height: '180px',    // 高さを固定
                                        position: 'relative',
                                        bgcolor: COLORS.BACKGROUND,
                                        overflow: 'hidden'
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
                                                    objectFit: 'cover', // 枠を埋める
                                                }}
                                            />
                                        ) : (
                                            <Box sx={{
                                                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}>
                                                <Typography variant="caption" color="textSecondary">画像なし</Typography>
                                            </Box>
                                        )}
                                    </Box>

                                    {/* 商品情報 */}
                                    <CardContent sx={{ 
                                        flex: 1, 
                                        display: 'flex', 
                                        flexDirection: 'column',
                                        p: 2 
                                    }}>
                                        <Box sx={{ minHeight: '3em', mb: 1 }}>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    color: '#333',
                                                    lineHeight: '1.5em',
                                                    maxHeight: '3em',
                                                    wordBreak: 'break-word',
                                                }}
                                            >
                                                {item.name}
                                            </Typography>
                                        </Box>

                                        {/* 下部固定エリア */}
                                        <Box sx={{ mt: 'auto' }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                                <Typography variant="h6" sx={{ color: COLORS.PRIMARY, fontWeight: 'bold' }}>
                                                    ¥{item.price?.toLocaleString('ja-JP')}
                                                </Typography>
                                                
                                                {item.status === 'sold' && (
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            px: 1,
                                                            py: 0.5,
                                                            backgroundColor: '#ddd',
                                                            borderRadius: '4px'
                                                        }}
                                                    >
                                                        売却済み
                                                    </Typography>
                                                )}
                                            </Box>

                                            <Stack direction="row" spacing={2} alignItems="center">
                                                <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                                                    <FavoriteBorder sx={{ fontSize: 16, mr: 0.5 }} />
                                                    <Typography variant="caption">
                                                        {item.like_count || 0}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                                                    <ChatBubbleOutline sx={{ fontSize: 16, mr: 0.5 }} />
                                                    <Typography variant="caption">
                                                        {item.comment_count || 0}
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Link>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Container>
    );
};

export default SearchResults;