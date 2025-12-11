// hackathon-frontend/src/components/AIChatWidget.js

import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, Fab, Paper, TextField, IconButton, Typography, 
  Avatar, Fade 
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { useAuth } from '../contexts/auth_context';
import apiClient from '../api/axios';

const AIChatWidget = () => {
  const { currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const [showBubble, setShowBubble] = useState(true);
  const [bubbleText, setBubbleText] = useState("何かお探しですか？");

  const messagesEndRef = useRef(null);

  // ★ 修正1: 画像パスを修正 (publicフォルダ内のファイルはルート相対パスで指定)
  const persona = currentUser?.current_persona || {
    name: "ドット絵の青年",
    avatar_url: "/avatars/model1.png",
    theme_color: "#1976d2"
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setShowBubble(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
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
      
      {/* 吹き出し (変更なし) */}
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
          <Box sx={{
            position: 'absolute', bottom: -10, right: 24,
            width: 0, height: 0,
            borderLeft: '10px solid transparent',
            borderRight: '10px solid transparent',
            borderTop: '10px solid white'
          }} />
        </Paper>
      </Fade>

      {/* ★ 修正2: Undertale風チャットウィンドウ */}
      <Fade in={isOpen} unmountOnExit>
        <Paper 
          elevation={6}
          sx={{ 
            width: 320, height: 500, mb: 2, 
            display: 'flex', flexDirection: 'column', 
            borderRadius: 2, overflow: 'hidden',
            border: '4px solid white', // 白枠
            bgcolor: 'rgba(0, 0, 0, 0.8)', // 背景を半透明の黒に
            color: 'white',
            fontFamily: '"Press Start 2P", cursive, sans-serif' // ドット絵風フォントがあれば適用
          }}
        >
          {/* 上部: キャラクター表示エリア (背景透ける) */}
          <Box sx={{ 
            flex: 1, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            position: 'relative',
            minHeight: '250px'
          }}>
            {/* 閉じるボタン */}
            <IconButton 
              size="small" 
              onClick={toggleChat} 
              sx={{ position: 'absolute', top: 5, right: 5, color: 'white' }}
            >
              <CloseIcon />
            </IconButton>

            {/* キャラクター画像 (大きく表示) */}
            <img 
              src={persona.avatar_url} 
              alt={persona.name} 
              style={{ 
                width: '180px', // サイズ調整
                height: 'auto', 
                imageRendering: 'pixelated' // ドット絵をくっきり表示
              }} 
            />
          </Box>

          {/* 下部: メッセージログエリア (RPGのメッセージウィンドウ風) */}
          <Box sx={{ 
            height: '200px', 
            borderTop: '4px solid white', 
            p: 2, 
            overflowY: 'auto',
            bgcolor: 'black', // ここは不透明の黒でもOK
            display: 'flex',
            flexDirection: 'column',
            gap: 1
          }}>
            {messages.length === 0 && (
              <Typography variant="body2" sx={{ color: '#aaa' }}>
                * {persona.name} が こちらをみている。
              </Typography>
            )}
            
            {messages.map((msg, index) => (
              <Box key={index} sx={{ mb: 1 }}>
                <Typography variant="caption" sx={{ color: msg.role === 'user' ? '#FFFF00' : '#00FFFF', display: 'block', mb: 0.5 }}>
                  {msg.role === 'user' ? 'YOU' : persona.name}
                </Typography>
                <Typography variant="body1" sx={{ lineHeight: 1.5 }}>
                  {msg.role === 'user' ? `> ${msg.content}` : `* ${msg.content}`}
                </Typography>
              </Box>
            ))}
            
            {isLoading && (
              <Typography variant="body2" sx={{ color: '#aaa' }}>
                * ...
              </Typography>
            )}
            <div ref={messagesEndRef} />
          </Box>

          {/* 入力エリア (シンプルに) */}
          <Box sx={{ p: 1, bgcolor: 'black', borderTop: '2px solid #333', display: 'flex' }}>
            <TextField 
              fullWidth size="small" placeholder="..." variant="standard"
              value={input} onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              InputProps={{ 
                disableUnderline: true,
                style: { color: 'white', paddingLeft: '10px' } 
              }}
            />
            <IconButton color="primary" onClick={handleSend} disabled={!input.trim() || isLoading}>
              <SendIcon sx={{ color: 'white' }} />
            </IconButton>
          </Box>
        </Paper>
      </Fade>

      {/* FAB (アバターボタン) - 画像パス修正済み */}
      <Fab 
        color="primary" aria-label="chat" 
        onClick={toggleChat}
        sx={{ 
          width: 64, height: 64, 
          bgcolor: 'black', // アイコン背景も黒に
          border: '3px solid white',
          boxShadow: 4
        }}
      >
        {isOpen ? <CloseIcon sx={{ color: 'white' }} /> : (
          <Avatar 
            src={persona.avatar_url} 
            sx={{ width: 56, height: 56 }} 
            alt={persona.name}
          >
             <SmartToyIcon /> 
          </Avatar>
        )}
      </Fab>
    </Box>
  );
};

export default AIChatWidget;