import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Box, Grid, Card, CardMedia, CardContent, Typography, Container, CircularProgress, Alert, Stack } from '@mui/material';
import { FavoriteBorder, ChatBubbleOutline } from '@mui/icons-material';
import axios from 'axios';
import {
  API_BASE_URL,
  API_ENDPOINTS,
  COLORS,
  MESSAGES,
  PLACEHOLDER_IMAGE
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
                console.log('🔍 Search request:', { query, url: `${API_BASE_URL}${API_ENDPOINTS.SEARCH}` });
                const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.SEARCH}`, {
                    params: { query }
                }); // search endpointからデータを取得
                console.log('✅ Search response:', response.data);
                // バックエンドは直接配列を返すので、そのまま使用
                const items = Array.isArray(response.data) ? response.data : (response.data.items || []);
                setResults(items);
            } catch (err) {
                console.error('❌ Search error:', err);
                console.error('Error details:', err.response?.data);
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

            {/* ローディング */}
            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress />
                </Box>
            )}

            {/* エラー表示 */}
            {error && (
                <Alert severity="error" sx={{ mb: 4 }}>
                    {error}
                </Alert>
            )}

            {/* 結果がない場合 */}
            {!loading && !error && results.length === 0 && (
                <Alert severity="info">
                    {MESSAGES.EMPTY_STATE.NO_SEARCH_RESULTS}
                </Alert>
            )}

            {/* 検索結果グリッド */}
            {!loading && !error && results.length > 0 && (
                <Grid container spacing={2}>
                    {results.map((item) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={item.item_id}>
                            <Link to={`/items/${item.item_id}`} style={{ textDecoration: 'none' }}>
                                <Card sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    cursor: 'pointer',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                                    }
                                }}>
                                    {/* 画像 */}
                                    {item.image_url ? (
                                        <CardMedia
                                            component="img"
                                            height="180"
                                            image={item.image_url}
                                            alt={item.name}
                                            sx={{ objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <Box sx={{
                                            height: '180px',
                                            backgroundColor: COLORS.BACKGROUND,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <Typography color="textSecondary">画像なし</Typography>
                                        </Box>
                                    )}

                                    {/* 商品情報 */}
                                    <CardContent sx={{ flex: 1 }}>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                mb: 1,
                                                color: '#333'
                                            }}
                                        >
                                            {item.name}
                                        </Typography>

                                        {/* カテゴリ */}
                                        <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 1 }}>
                                            {item.category || 'その他'}
                                        </Typography>

                                        {/* 価格とステータス */}
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
                                                        color: COLORS.TEXT_TERTIARY,
                                                        borderRadius: '4px'
                                                    }}
                                                >
                                                    売却済み
                                                </Typography>
                                            )}
                                        </Box>

                                        {/* いいね数・コメント数 */}
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
