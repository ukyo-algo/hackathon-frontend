// src/pages/messages_page.js
// メッセージ一覧ページ（受信トレイ）

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Avatar,
    Badge,
    Paper,
    CircularProgress,
    Divider,
} from '@mui/material';
import MailIcon from '@mui/icons-material/Mail';
import { useAuth } from '../contexts/auth_context';
import apiClient from '../api/apiClient';
import { colors } from '../styles/theme';
import { useWebSocket } from '../hooks/useWebSocket';

const MessagesPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { currentUser } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);

    // URLパラメータから新規会話の相手を取得
    const targetUserId = searchParams.get('userId');
    const targetItemId = searchParams.get('itemId');

    // WebSocketでリアルタイム更新
    const handleWebSocketMessage = useCallback((data) => {
        if (data.type === 'new_message') {
            // 会話リストを再読み込み
            fetchConversations();
        }
    }, []);

    useWebSocket(handleWebSocketMessage);

    const fetchConversations = async () => {
        try {
            const response = await apiClient.get('/messages/conversations');
            setConversations(response.data);
        } catch (error) {
            console.error('Failed to fetch conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConversations();
    }, []);

    // 新規会話の開始（URLパラメータがある場合）
    useEffect(() => {
        const startNewConversation = async () => {
            if (!targetUserId) return;

            try {
                const params = new URLSearchParams();
                params.append('other_user_id', targetUserId);
                if (targetItemId) {
                    params.append('item_id', targetItemId);
                }

                const response = await apiClient.post(`/messages/conversations/start?${params.toString()}`);
                navigate(`/messages/${response.data.conversation_id}`, { replace: true });
            } catch (error) {
                console.error('Failed to start conversation:', error);
            }
        };

        startNewConversation();
    }, [targetUserId, targetItemId, navigate]);

    const formatTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) return '今';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}分前`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}時間前`;
        if (diff < 604800000) return `${Math.floor(diff / 86400000)}日前`;
        return date.toLocaleDateString('ja-JP');
    };

    if (!currentUser) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Typography color="error">ログインが必要です</Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <MailIcon sx={{ color: colors.primary, fontSize: 28 }} />
                <Typography variant="h5" sx={{ color: colors.primary, fontWeight: 'bold' }}>
                    メッセージ
                </Typography>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress sx={{ color: colors.primary }} />
                </Box>
            ) : conversations.length === 0 ? (
                <Paper
                    sx={{
                        p: 4,
                        textAlign: 'center',
                        backgroundColor: '#1a1a1a',
                        border: `1px solid ${colors.primary}`,
                    }}
                >
                    <Typography sx={{ color: '#888' }}>
                        まだメッセージはありません
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
                        商品ページから出品者に連絡してみましょう
                    </Typography>
                </Paper>
            ) : (
                <Paper
                    sx={{
                        backgroundColor: '#1a1a1a',
                        border: `1px solid ${colors.primary}`,
                        overflow: 'hidden',
                    }}
                >
                    <List sx={{ p: 0 }}>
                        {conversations.map((conv, index) => (
                            <React.Fragment key={conv.id}>
                                {index > 0 && <Divider sx={{ borderColor: '#333' }} />}
                                <ListItem
                                    button
                                    onClick={() => navigate(`/messages/${conv.id}`)}
                                    sx={{
                                        py: 2,
                                        '&:hover': {
                                            backgroundColor: 'rgba(0, 255, 0, 0.05)',
                                        },
                                    }}
                                >
                                    <ListItemAvatar>
                                        <Badge
                                            badgeContent={conv.unread_count}
                                            color="error"
                                            invisible={conv.unread_count === 0}
                                        >
                                            <Avatar
                                                src={conv.other_user_icon_url}
                                                sx={{
                                                    width: 50,
                                                    height: 50,
                                                    border: `2px solid ${colors.primary}`,
                                                }}
                                            >
                                                {conv.other_user_username?.charAt(0)}
                                            </Avatar>
                                        </Badge>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography
                                                    sx={{
                                                        color: colors.primary,
                                                        fontWeight: conv.unread_count > 0 ? 'bold' : 'normal',
                                                    }}
                                                >
                                                    {conv.other_user_username}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: '#666' }}>
                                                    {formatTime(conv.last_message_at)}
                                                </Typography>
                                            </Box>
                                        }
                                        secondary={
                                            <Box>
                                                {conv.item_name && (
                                                    <Typography
                                                        variant="caption"
                                                        sx={{ color: '#888', display: 'block' }}
                                                    >
                                                        📦 {conv.item_name}
                                                    </Typography>
                                                )}
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        color: conv.unread_count > 0 ? '#fff' : '#888',
                                                        fontWeight: conv.unread_count > 0 ? 'bold' : 'normal',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                    }}
                                                >
                                                    {conv.last_message || 'メッセージを開始'}
                                                </Typography>
                                            </Box>
                                        }
                                        sx={{ ml: 1 }}
                                    />
                                </ListItem>
                            </React.Fragment>
                        ))}
                    </List>
                </Paper>
            )}
        </Container>
    );
};

export default MessagesPage;
