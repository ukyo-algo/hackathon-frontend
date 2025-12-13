import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Box, Grid, Card, CardMedia, CardContent, Typography, Container, 
  CircularProgress, Alert, Stack, Slider, FormControlLabel, Switch, Paper 
} from '@mui/material';
import { FavoriteBorder, ChatBubbleOutline, ViewComfy, ViewModule } from '@mui/icons-material';
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

    // ★追加機能: 列数（グリッド）の管理
    // デフォルトは4列 (12 / 4 = 3)
    const [cols, setCols] = useState(4); 

    useEffect(() => {
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

    // グリッドのサイズ計算 (12分割システム)
    // cols=2 -> xs=6, cols=3 -> xs=4, cols=4 -> xs=3, cols=6 -> xs=2
    const gridSize = 12 / cols;

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* ヘッダーエリア */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                        「{query}」の検索結果
                    </Typography>
                    {!loading && !error && (
                        <Typography variant="body2" color="textSecondary">
                            {results.length}件の商品が見つかりました
                        </Typography>
                    )}
                </Box>

                {/* ★列数変更コントローラー */}
                {!loading && !error && results.length > 0 && (
                    <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#f9f9f9' }}>
                        <Typography variant="caption" sx={{ whiteSpace: 'nowrap' }}>表示サイズ</Typography>
                        <ViewModule color="action" />
                        <Slider
                            value={cols}
                            onChange={(e, newVal) => setCols(newVal)}
                            step={null} // ステップ固定
                            marks={[
                                { value: 2, label: '大' },
                                { value: 3, label: '中' },
                                { value: 4, label: '小' },
                                { value: 6, label: '極小' },
                            ]}
                            min={2}
                            max={6}
                            sx={{ width: 100 }}
                        />
                        <ViewComfy color="action" />
                    </Paper>
                )}
            </Box>

            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
            )}

            {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}

            {!loading && !error && results.length === 0 && (
                <Alert severity="info">{MESSAGES.EMPTY_STATE.NO_SEARCH_RESULTS}</Alert>
            )}

            {/* 結果グリッド */}
            {!loading && !error && results.length > 0 && (
                <Grid container spacing={2}>
                    {results.map((item) => (
                        // ★ユーザー指定の列数を反映 (xsのみ指定で全サイズ強制適用)
                        <Grid item xs={6} sm={gridSize} md={gridSize} key={item.item_id}>
                            <Link 
                                to={`/items/${item.item_id}`} 
                                style={{ textDecoration: 'none', display: 'block', width: '100%', height: '100%' }}
                            >
                                <Card sx={{
                                    width: '100%', height: '100%',
                                    display: 'flex', flexDirection: 'column',
                                    transition: 'transform 0.2s',
                                    '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 }
                                }}>
                                    
                                    {/* ★画像エリア (最強の固定方法) */}
                                    <Box sx={{
                                        width: '100%',
                                        position: 'relative',
                                        // padding-topで高さを「横幅に対する比率」で確保 (例: 100% = 正方形)
                                        // ここでは少し横長に見える 75% (4:3) などを設定しても良いし、
                                        // 完全固定高さにするなら height: '180px' でも良い。今回は固定高さでいきます。
                                        height: '180px', 
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
                                                    top: 0, left: 0,
                                                    width: '100%', height: '100%',
                                                    objectFit: 'cover', // 商品写真は埋める
                                                }}
                                            />
                                        ) : (
                                            <Box sx={{ 
                                                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
                                                display: 'flex', alignItems: 'center', justifyContent: 'center' 
                                            }}>
                                                <Typography variant="caption" color="textSecondary">No Image</Typography>
                                            </Box>
                                        )}
                                    </Box>

                                    <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
                                        <Box sx={{ minHeight: '3em', mb: 1 }}>
                                            <Typography variant="body2" sx={{
                                                overflow: 'hidden', textOverflow: 'ellipsis',
                                                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                                                lineHeight: '1.5em', maxHeight: '3em', wordBreak: 'break-word'
                                            }}>
                                                {item.name}
                                            </Typography>
                                        </Box>

                                        <Box sx={{ mt: 'auto' }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                                <Typography variant="h6" sx={{ color: COLORS.PRIMARY, fontWeight: 'bold' }}>
                                                    ¥{item.price?.toLocaleString('ja-JP')}
                                                </Typography>
                                                {item.status === 'sold' && (
                                                    <Typography variant="caption" sx={{ px: 1, bgcolor: '#ddd', borderRadius: 1 }}>売却済</Typography>
                                                )}
                                            </Box>
                                            <Stack direction="row" spacing={2}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                                                    <FavoriteBorder sx={{ fontSize: 16, mr: 0.5 }} /> {item.like_count || 0}
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                                                    <ChatBubbleOutline sx={{ fontSize: 16, mr: 0.5 }} /> {item.comment_count || 0}
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