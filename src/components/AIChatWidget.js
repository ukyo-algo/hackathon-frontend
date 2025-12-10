// hackathon-frontend/src/components/AIChatWidget.js

import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, Fab, Paper, TextField, IconButton, Typography, 
  Avatar, List, ListItem, CircularProgress, Fade 
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import SmartToyIcon from '@mui/icons-material/SmartToy'; // デフォルトアイコン
import { useAuth } from '../contexts/auth_context'; // AuthContextのパスに合わせて調整
import apiClient from '../api/axios'; // axiosの設定ファイル

const AIChatWidget = () => {
  const { currentUser } = useAuth(); // 現在のユーザー情報（所持ポイントやキャラIDなど）
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // 吹き出し用（最初は挨拶を表示）
  const [showBubble, setShowBubble] = useState(true);
  const [bubbleText, setBubbleText] = useState("何かお探しですか？");

  // スクロール用
  const messagesEndRef = useRef(null);

  // キャラクター情報の取得 (Contextに含まれていなければAPIで取得してもOK)
  // ここでは仮にcurrentUserの中にキャラ情報があると仮定、なければデフォルト
  const persona = currentUser?.current_persona || {
    name: "ドット絵の青年",
    avatar_url: "/public/avatars/model1.png",
    theme_color: "#1976d2"
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setShowBubble(false); // チャットを開いたら吹き出しは消す
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // メッセージ送信処理
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // バックエンドのチャットAPIを叩く
      const res = await apiClient.post('/chat', { message: userMessage.content });
      
      const aiMessage = { 
        role: 'ai', 
        content: res.data.reply,
        persona: res.data.persona 
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { role: 'ai', content: "すみません、通信エラーです..." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
      
      {/* 1. 吹き出し (Greeting Bubble) */}
      <Fade in={showBubble && !isOpen}>
        <Paper 
          elevation={3} 
          sx={{ 
            mb: 2, p: 1.5, borderRadius: 2, 
            bgcolor: 'white', position: 'relative', maxWidth: 200,
            cursor: 'pointer'
          }}
          onClick={toggleChat}
        >
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            {bubbleText}
          </Typography>
          {/* 吹き出しの三角形 */}
          <Box sx={{
            position: 'absolute', bottom: -10, right: 24,
            width: 0, height: 0,
            borderLeft: '10px solid transparent',
            borderRight: '10px solid transparent',
            borderTop: '10px solid white'
          }} />
        </Paper>
      </Fade>

      {/* 2. チャットウィンドウ (展開時) */}
      <Fade in={isOpen} unmountOnExit>
        <Paper 
          elevation={6}
          sx={{ 
            width: 320, height: 450, mb: 2, 
            display: 'flex', flexDirection: 'column', 
            borderRadius: 3, overflow: 'hidden',
            border: `2px solid ${persona.theme_color || '#1976d2'}`
          }}
        >
          {/* ヘッダー */}
          <Box sx={{ p: 1.5, bgcolor: persona.theme_color || '#1976d2', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar src={persona.avatar_url} sx={{ width: 32, height: 32, bgcolor: 'white' }}>
                <SmartToyIcon color="primary" /> 
              </Avatar>
              <Typography variant="subtitle2">{persona.name}</Typography>
            </Box>
            <IconButton size="small" onClick={toggleChat} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* メッセージリスト */}
          <Box sx={{ flex: 1, p: 2, overflowY: 'auto', bgcolor: '#f5f5f5' }}>
            {messages.length === 0 && (
              <Typography variant="caption" sx={{ color: 'gray', textAlign: 'center', display: 'block', mt: 4 }}>
                {persona.name}とお話ししてみましょう！
              </Typography>
            )}
            
            <List>
              {messages.map((msg, index) => (
                <ListItem key={index} sx={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', px: 0 }}>
                  <Paper sx={{ 
                    p: 1.5, 
                    maxWidth: '80%', 
                    borderRadius: 2,
                    bgcolor: msg.role === 'user' ? (persona.theme_color || '#1976d2') : 'white',
                    color: msg.role === 'user' ? 'white' : 'text.primary'
                  }}>
                    <Typography variant="body2">{msg.content}</Typography>
                  </Paper>
                </ListItem>
              ))}
              {isLoading && (
                <ListItem sx={{ justifyContent: 'flex-start', px: 0 }}>
                   <CircularProgress size={20} />
                </ListItem>
              )}
              <div ref={messagesEndRef} />
            </List>
          </Box>

          {/* 入力エリア */}
          <Box sx={{ p: 1, bgcolor: 'white', borderTop: '1px solid #ddd', display: 'flex' }}>
            <TextField 
              fullWidth size="small" placeholder="メッセージを入力..." variant="outlined"
              value={input} onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 20 } }}
            />
            <IconButton color="primary" onClick={handleSend} disabled={!input.trim() || isLoading}>
              <SendIcon />
            </IconButton>
          </Box>
        </Paper>
      </Fade>

      {/* 3. FAB (アバターボタン) */}
      <Fab 
        color="primary" aria-label="chat" 
        onClick={toggleChat}
        sx={{ 
          width: 64, height: 64, 
          bgcolor: persona.theme_color || '#1976d2',
          border: '3px solid white',
          boxShadow: 4
        }}
      >
        {isOpen ? <CloseIcon /> : (
          <Avatar 
            src={persona.avatar_url} 
            sx={{ width: 56, height: 56 }} 
            alt={persona.name}
          >
             {/* 画像がない場合のフォールバック */}
             <SmartToyIcon /> 
          </Avatar>
        )}
      </Fab>
    </Box>
  );
};

export default AIChatWidget;