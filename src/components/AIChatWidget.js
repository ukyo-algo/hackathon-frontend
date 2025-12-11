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
  
  // 吹き出し用（最初は挨拶を表示）
  const [showBubble, setShowBubble] = useState(true);
  const [bubbleText, setBubbleText] = useState("何かお探しですか？");

  const messagesEndRef = useRef(null);

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
    <>
      {/* 1. 起動ボタン (FAB) & 吹き出し - チャットが閉じている時だけ表示 */}
      {!isOpen && (
        <Box sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <Fade in={showBubble}>
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

          <Fab 
            color="primary" aria-label="chat" 
            onClick={toggleChat}
            sx={{ 
              width: 64, height: 64, 
              bgcolor: 'black',
              border: '3px solid white',
              boxShadow: 4
            }}
          >
            <Avatar 
              src={persona.avatar_url} 
              sx={{ width: 56, height: 56 }} 
              alt={persona.name}
            >
               <SmartToyIcon /> 
            </Avatar>
          </Fab>
        </Box>
      )}

      {/* 2. Undertale風 横長メッセージウィンドウ (画面下部固定) */}
      <Fade in={isOpen} unmountOnExit>
        <Box sx={{ 
          position: 'fixed', 
          bottom: 20, 
          left: '50%', 
          transform: 'translateX(-50%)', // 中央寄せ
          width: '90%', // 画面幅の90%
          maxWidth: '800px', // 最大幅制限
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: 1
        }}>
          
          {/* メインウィンドウ */}
          <Paper 
            elevation={10}
            sx={{ 
              display: 'flex',
              height: '200px', // 高さ固定
              bgcolor: 'black',
              border: '4px solid white',
              borderRadius: 0, // 角丸なし
              color: 'white',
              fontFamily: '"Press Start 2P", cursive, sans-serif',
              overflow: 'hidden'
            }}
          >
            {/* 左側: キャラクター顔グラフィックエリア */}
            <Box sx={{ 
              width: '180px', // 固定幅
              borderRight: '4px solid white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 2
            }}>
               <img 
                src={persona.avatar_url} 
                alt={persona.name} 
                style={{ 
                  width: '100%', 
                  height: 'auto', 
                  imageRendering: 'pixelated' 
                }} 
              />
            </Box>

            {/* 右側: メッセージ表示エリア */}
            <Box sx={{ 
              flex: 1, 
              p: 3, 
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative'
            }}>
              {/* 閉じるボタン (右上) */}
              <IconButton 
                size="small" 
                onClick={toggleChat} 
                sx={{ position: 'absolute', top: 5, right: 5, color: 'white' }}
              >
                <CloseIcon />
              </IconButton>

              {/* メッセージログ */}
              <Box sx={{ flex: 1 }}>
                {messages.length === 0 ? (
                  <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                    * {persona.name} が あらわれた！<br/>
                    * なにか はなしかけてみよう。
                  </Typography>
                ) : (
                  messages.map((msg, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Typography variant="caption" sx={{ color: msg.role === 'user' ? '#FFFF00' : '#00FFFF', display: 'block', mb: 0.5 }}>
                        {msg.role === 'user' ? 'YOU' : persona.name}
                      </Typography>
                      <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                        {msg.role === 'user' ? `> ${msg.content}` : `* ${msg.content}`}
                      </Typography>
                    </Box>
                  ))
                )}
                {isLoading && (
                  <Typography variant="body1" sx={{ mt: 1 }}>* ...</Typography>
                )}
                <div ref={messagesEndRef} />
              </Box>
            </Box>
          </Paper>

          {/* 入力バー (ウィンドウの下に配置) */}
          <Paper sx={{ 
            p: '2px 4px', 
            display: 'flex', 
            alignItems: 'center', 
            bgcolor: 'black', 
            border: '2px solid white',
            borderRadius: 0
          }}>
            <Typography sx={{ color: 'white', ml: 1, mr: 1 }}>{'>'}</Typography>
            <TextField 
              fullWidth 
              variant="standard"
              placeholder=""
              value={input} 
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              InputProps={{ 
                disableUnderline: true,
                style: { color: 'white', fontFamily: 'inherit' } 
              }}
              autoFocus // 開いた時にフォーカス
            />
            <IconButton color="primary" onClick={handleSend} disabled={!input.trim() || isLoading}>
              <SendIcon sx={{ color: 'white' }} />
            </IconButton>
          </Paper>

        </Box>
      </Fade>
    </>
  );
};

export default AIChatWidget;