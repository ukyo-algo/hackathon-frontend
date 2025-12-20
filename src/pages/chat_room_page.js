// src/pages/chat_room_page.js
// リアルタイムチャットルームページ（AI返信アシスト機能付き）

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
import { usePageContext } from '../components/AIChatWidget';

// デモユーザー用のデフォルトアバター
const DEFAULT_AVATARS = [
    '/avatars/model1.png',
    '/avatars/model2.png',
    '/avatars/model3.png',
    '/avatars/model4.png',
    '/avatars/model5.png',
];

const ChatRoomPage = () => {
    const { conversationId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { setPageContext } = usePageContext();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [otherUser, setOtherUser] = useState(null);
    const [itemInfo, setItemInfo] = useState(null);
    const [relationship, setRelationship] = useState(null);
    const messagesEndRef = useRef(null);

    // ユーザーのアバターURLを取得（ペルソナ優先）
    const getUserAvatar = useCallback((senderId, senderIconUrl) => {
        if (senderId === currentUser?.id) {
            // 自分のメッセージ: ペルソナのアバター優先
            if (currentUser?.current_persona?.avatar_url) {
                return currentUser.current_persona.avatar_url;
            }
            // デモユーザーの場合はランダムなアバター
            if (!currentUser?.icon_url) {
                const index = (currentUser?.id || 0) % DEFAULT_AVATARS.length;
                return DEFAULT_AVATARS[index];
            }
            return currentUser.icon_url;
        }
        // 相手のメッセージ
        return senderIconUrl || DEFAULT_AVATARS[0];
    }, [currentUser]);

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

    // ページコンテキストを設定（AI返信アシスト用）
    useEffect(() => {
        if (messages.length > 0 && otherUser) {
            // 直近のメッセージ履歴を整形
            const recentMessages = messages.slice(-10).map(msg => ({
                sender: msg.sender_id === currentUser?.id ? '自分' : otherUser.username,
                content: msg.content,
                time: new Date(msg.created_at).toLocaleString('ja-JP'),
            }));

            // 関係情報のサマリーを作成
            let relationshipSummary = '';
            if (relationship) {
                const parts = [];
                if (relationship.purchases?.from_other?.length > 0) {
                    parts.push(`自分は${otherUser.username}から${relationship.purchases.from_other.length}件購入済み`);
                }
                if (relationship.purchases?.to_other?.length > 0) {
                    parts.push(`${otherUser.username}は自分から${relationship.purchases.to_other.length}件購入済み`);
                }
                if (relationship.likes?.i_liked_their_items > 0) {
                    parts.push(`自分は相手の商品に${relationship.likes.i_liked_their_items}いいね`);
                }
                if (relationship.likes?.they_liked_my_items > 0) {
                    parts.push(`相手は自分の商品に${relationship.likes.they_liked_my_items}いいね`);
                }
                if (parts.length > 0) {
                    relationshipSummary = `【二人の関係】${parts.join('、')}。`;
                }
            }

            setPageContext({
                page_type: 'direct_message',
                dm_context: {
                    conversation_with: otherUser.username,
                    item_name: itemInfo?.name || null,
                    recent_messages: recentMessages,
                    relationship: relationship,
                    instruction: `ユーザーは「${otherUser.username}」とダイレクトメッセージ中です。${relationshipSummary}` +
                        `「代わりに返事して」「返信を考えて」などと言われたら、` +
                        `直近の会話の流れと二人の取引・いいね履歴を踏まえて適切な返信文を提案してください。` +
                        `例えば過去に取引があれば「先日はありがとうございました」など関係性を活かした返信を。` +
                        `提案する時は「【返信案】」で始めてください。`,
                },
            });
        }

        return () => setPageContext(null);
    }, [messages, otherUser, itemInfo, currentUser, relationship, setPageContext]);

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
                if (conv.item_id && conv.item_name) {
                    setItemInfo({ id: conv.item_id, name: conv.item_name });
                }
            }

            // 関係情報（購入・いいね・コメント）を取得
            try {
                const relResponse = await apiClient.get(`/messages/conversations/${conversationId}/relationship`);
                setRelationship(relResponse.data.relationship);
            } catch (e) {
                console.log('Relationship info not available:', e);
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
            sender_icon_url: currentUser?.current_persona?.avatar_url || currentUser.icon_url,
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

    // AI返信提案をメッセージ入力欄に設定する関数（グローバルに公開）
    useEffect(() => {
        window.setSuggestedReply = (text) => {
            // 「【返信案】」を除去して設定
            const cleanText = text.replace(/^【返信案】\s*/, '').trim();
            setInput(cleanText);
        };
        return () => {
            delete window.setSuggestedReply;
        };
    }, []);

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
                height: 'calc(100vh - 64px)',
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
                            src={otherUser.icon_url || DEFAULT_AVATARS[0]}
                            sx={{ width: 40, height: 40, border: `2px solid ${colors.primary}` }}
                        >
                            {otherUser.username?.charAt(0)}
                        </Avatar>
                        <Box>
                            <Typography sx={{ color: colors.primary, fontWeight: 'bold' }}>
                                {otherUser.username}
                            </Typography>
                            {itemInfo && (
                                <Typography variant="caption" sx={{ color: '#888' }}>
                                    📦 {itemInfo.name}
                                </Typography>
                            )}
                        </Box>
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
                        <Typography variant="caption" sx={{ color: '#555', mt: 1, display: 'block' }}>
                            💡 AIに「代わりに返事して」と頼むこともできます
                        </Typography>
                    </Box>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.sender_id === currentUser.id;
                        const avatarUrl = getUserAvatar(msg.sender_id, msg.sender_icon_url);
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
                                        src={avatarUrl}
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
                                {isMe && (
                                    <Avatar
                                        src={avatarUrl}
                                        sx={{ width: 32, height: 32 }}
                                    >
                                        {currentUser.username?.charAt(0)}
                                    </Avatar>
                                )}
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
