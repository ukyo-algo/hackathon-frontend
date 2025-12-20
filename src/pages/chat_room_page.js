// src/pages/chat_room_page.js
// リアルタイムチャットルームページ

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Box,
    Typography,
    TextField,
    IconButton,
    Avatar,
    Paper,
    CircularProgress,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { useAuth } from '../contexts/auth_context';
import apiClient from '../api/axios';
import { colors } from '../styles/theme';
import { useWebSocket } from '../hooks/useWebSocket';

const ChatRoomPage = () => {
    const { conversationId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [otherUser, setOtherUser] = useState(null);
    const messagesEndRef = useRef(null);

    // WebSocketでリアルタイム受信
    const handleWebSocketMessage = useCallback((data) => {
        if (data.type === 'new_message' && data.conversation_id === parseInt(conversationId)) {
            setMessages(prev => [...prev, data.message]);
            // 既読にする
            markAsRead();
        }
    }, [conversationId]);

    useWebSocket(handleWebSocketMessage);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchMessages = async () => {
        try {
            const response = await apiClient.get(`/messages/conversations/${conversationId}/messages`);
            setMessages(response.data);

            // 会話情報から相手ユーザーを取得
            const convResponse = await apiClient.get('/messages/conversations');
            const conv = convResponse.data.find(c => c.id === parseInt(conversationId));
            if (conv) {
                setOtherUser({
                    id: conv.other_user_id,
                    username: conv.other_user_username,
                    icon_url: conv.other_user_icon_url,
                });
            }
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async () => {
        try {
            await apiClient.post(`/messages/conversations/${conversationId}/read`);
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    useEffect(() => {
        fetchMessages();
        markAsRead();
    }, [conversationId]);

    const handleSend = async () => {
        if (!input.trim() || sending) return;

        setSending(true);
        const messageContent = input.trim();
        setInput('');

        // 楽観的更新
        const optimisticMessage = {
            id: Date.now(),
            sender_id: currentUser.id,
            sender_username: currentUser.username,
            sender_icon_url: currentUser.icon_url,
            content: messageContent,
            is_read: false,
            created_at: new Date().toISOString(),
        };
        setMessages(prev => [...prev, optimisticMessage]);

        try {
            await apiClient.post(`/messages/conversations/${conversationId}/messages`, {
                content: messageContent,
            });
        } catch (error) {
            console.error('Failed to send message:', error);
            // 楽観的更新を取り消す
            setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
            setInput(messageContent);
        } finally {
            setSending(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
    };

    if (!currentUser) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Typography color="error">ログインが必要です</Typography>
            </Container>
        );
    }

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                height: 'calc(100vh - 64px)', // NavBar分を引く
                backgroundColor: '#0a0a0a',
            }}
        >
            {/* ヘッダー */}
            <Paper
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 2,
                    backgroundColor: '#1a1a1a',
                    borderBottom: `1px solid ${colors.primary}`,
                    borderRadius: 0,
                }}
            >
                <IconButton onClick={() => navigate('/messages')} sx={{ color: colors.primary }}>
                    <ArrowBackIcon />
                </IconButton>
                {otherUser && (
                    <>
                        <Avatar
                            src={otherUser.icon_url}
                            sx={{ width: 40, height: 40, border: `2px solid ${colors.primary}` }}
                        >
                            {otherUser.username?.charAt(0)}
                        </Avatar>
                        <Typography sx={{ color: colors.primary, fontWeight: 'bold' }}>
                            {otherUser.username}
                        </Typography>
                    </>
                )}
            </Paper>

            {/* メッセージエリア */}
            <Box
                sx={{
                    flex: 1,
                    overflowY: 'auto',
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                }}
            >
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress sx={{ color: colors.primary }} />
                    </Box>
                ) : messages.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography sx={{ color: '#666' }}>
                            メッセージを送信してみましょう
                        </Typography>
                    </Box>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.sender_id === currentUser.id;
                        return (
                            <Box
                                key={msg.id}
                                sx={{
                                    display: 'flex',
                                    justifyContent: isMe ? 'flex-end' : 'flex-start',
                                    alignItems: 'flex-end',
                                    gap: 1,
                                }}
                            >
                                {!isMe && (
                                    <Avatar
                                        src={msg.sender_icon_url}
                                        sx={{ width: 32, height: 32 }}
                                    >
                                        {msg.sender_username?.charAt(0)}
                                    </Avatar>
                                )}
                                <Box sx={{ maxWidth: '70%' }}>
                                    <Paper
                                        sx={{
                                            p: 1.5,
                                            backgroundColor: isMe ? colors.primary : '#2a2a2a',
                                            color: isMe ? '#000' : colors.primary,
                                            borderRadius: 2,
                                            borderBottomRightRadius: isMe ? 0 : 2,
                                            borderBottomLeftRadius: isMe ? 2 : 0,
                                        }}
                                    >
                                        <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                                            {msg.content}
                                        </Typography>
                                    </Paper>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: isMe ? 'flex-end' : 'flex-start',
                                            alignItems: 'center',
                                            gap: 0.5,
                                            mt: 0.5,
                                        }}
                                    >
                                        <Typography variant="caption" sx={{ color: '#666' }}>
                                            {formatTime(msg.created_at)}
                                        </Typography>
                                        {isMe && msg.is_read && (
                                            <DoneAllIcon sx={{ fontSize: 14, color: colors.primary }} />
                                        )}
                                    </Box>
                                </Box>
                            </Box>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </Box>

            {/* 入力エリア */}
            <Paper
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 2,
                    backgroundColor: '#1a1a1a',
                    borderTop: `1px solid ${colors.primary}`,
                    borderRadius: 0,
                }}
            >
                <TextField
                    fullWidth
                    placeholder="メッセージを入力..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    multiline
                    maxRows={4}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            color: colors.primary,
                            backgroundColor: '#0a0a0a',
                            '& fieldset': {
                                borderColor: colors.primary,
                            },
                            '&:hover fieldset': {
                                borderColor: colors.primary,
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: colors.primary,
                            },
                        },
                    }}
                />
                <IconButton
                    onClick={handleSend}
                    disabled={!input.trim() || sending}
                    sx={{
                        backgroundColor: colors.primary,
                        color: '#000',
                        '&:hover': {
                            backgroundColor: '#00cc00',
                        },
                        '&.Mui-disabled': {
                            backgroundColor: '#333',
                            color: '#666',
                        },
                    }}
                >
                    <SendIcon />
                </IconButton>
            </Paper>
        </Box>
    );
};

export default ChatRoomPage;
