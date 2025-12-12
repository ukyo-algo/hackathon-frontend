// hackathon-frontend/src/components/AIChatWidget.js

import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, Paper, TextField, IconButton, Typography, 
  Avatar
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { useAuth } from '../contexts/auth_context';
import apiClient from '../api/axios';

const AIChatWidget = () => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const defaultPersona = {
    name: "アシスタント",
    avatar_url: "/avatars/model1.png",
    theme_color: "#1976d2"
  };

  const [persona, setPersona] = useState(defaultPersona);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // ペルソナが変更されたらUIを即反映し、チャット履歴もリセット
  useEffect(() => {
    if (currentUser?.current_persona) {
      setPersona(currentUser.current_persona);
    } else {
      setPersona(defaultPersona);
    }
    setMessages([
      { 
        role: 'ai', 
        content: `こんにちは！${currentUser?.current_persona?.name || 'アシスタント'}です。何かお手伝いできることはありますか？` 
      }
    ]);
  }, [currentUser?.current_persona?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      setMessages(prev => [...prev, { role: 'ai', content: "申し訳ありません。通信エラーが発生しました。" }]);
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
    <Box sx={{ 
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: '#1a1a1a',
      color: 'white'
    }}>
      {/* ヘッダー */}
      <Box sx={{ 
        p: 2, 
        borderBottom: '2px solid #333',
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        backgroundColor: '#0d0d0d'
      }}>
        <Avatar 
          src={persona.avatar_url} 
          sx={{ width: 40, height: 40 }} 
          alt={persona.name}
        >
          <SmartToyIcon />
        </Avatar>
        <div>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'white' }}>
            {persona.name}
          </Typography>
          <Typography variant="caption" sx={{ color: '#999' }}>
            オンライン
          </Typography>
        </div>
      </Box>

      {/* キャラクター大表示エリア + メッセージ */}
      <Box sx={{ 
        flex: 1,
        display: 'flex',
        overflow: 'hidden'
      }}>
        {/* 左側：キャラクター画像（大） */}
        <Box sx={{ 
          width: '45%',
          borderRight: '2px solid #333',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
          backgroundColor: '#0d0d0d'
        }}>
          <img 
            src={persona.avatar_url} 
            alt={persona.name} 
            style={{ 
              width: '100%', 
              height: 'auto', 
              maxWidth: '280px',
              imageRendering: 'auto'
            }} 
          />
        </Box>

        {/* 右側：メッセージエリア */}
        <Box sx={{ 
          flex: 1,
          overflowY: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          backgroundColor: '#1a1a1a'
        }}>
          {messages.map((msg, index) => (
            <Box 
              key={index} 
              sx={{ 
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
              }}
            >
              <Paper
                sx={{
                  maxWidth: '85%',
                  p: 1.5,
                  backgroundColor: msg.role === 'user' ? '#00ff00' : '#333',
                  color: msg.role === 'user' ? '#000' : '#00ff00',
                  borderRadius: 1,
                  wordBreak: 'break-word',
                  boxShadow: 'none',
                  border: '1px solid ' + (msg.role === 'user' ? '#00ff00' : '#444'),
                  fontFamily: '"Courier New", monospace',
                  fontSize: '0.9rem'
                }}
              >
                <Typography variant="body2" sx={{ lineHeight: 1.6, color: 'inherit', fontFamily: 'inherit' }}>
                  {msg.role === 'user' ? `> ${msg.content}` : `* ${msg.content}`}
                </Typography>
              </Paper>
            </Box>
          ))}
          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
              <Paper sx={{ 
                p: 1.5, 
                backgroundColor: '#333', 
                border: '1px solid #444',
                borderRadius: 1,
                fontFamily: '"Courier New", monospace',
                color: '#00ff00'
              }}>
                <Typography variant="body2" sx={{ color: 'inherit', fontFamily: 'inherit' }}>
                  * ...
                </Typography>
              </Paper>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>
      </Box>

      {/* 入力エリア */}
      <Box sx={{ 
        p: 1.5, 
        borderTop: '2px solid #333',
        backgroundColor: '#0d0d0d',
        display: 'flex',
        gap: 1,
        alignItems: 'flex-end'
      }}>
        <Typography sx={{ color: '#00ff00', fontFamily: '"Courier New", monospace' }}>
          {'>'}
        </Typography>
        <TextField 
          fullWidth 
          multiline
          maxRows={2}
          minRows={1}
          placeholder="メッセージを入力..."
          value={input} 
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          variant="standard"
          InputProps={{
            disableUnderline: true,
            style: { 
              color: '#00ff00',
              fontFamily: '"Courier New", monospace',
              fontSize: '0.9rem'
            }
          }}
          sx={{
            '& .MuiInput-root::before': {
              borderBottom: 'none !important'
            },
            '& .MuiInput-root::after': {
              borderBottom: 'none !important'
            },
            '& .MuiOutlinedInput-root': {
              color: '#00ff00'
            }
          }}
        />
        <IconButton 
          color="primary" 
          onClick={handleSend} 
          disabled={!input.trim() || isLoading}
          size="small"
          sx={{ color: isLoading || !input.trim() ? '#666' : '#00ff00' }}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default AIChatWidget;