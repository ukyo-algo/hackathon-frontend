// hackathon-frontend/src/components/AIChatWidget.js

import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, Paper, TextField, IconButton, Typography, 
  Avatar, Divider, Chip
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
        content: `こんにちは！${currentUser?.current_persona?.name || 'アシスタント'}です。商品選びのお手伝いをしますね！` 
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
      backgroundColor: '#fafafa'
    }}>
      {/* ヘッダー */}
      <Box sx={{ 
        p: 1.5, 
        borderBottom: '1px solid #e0e0e0',
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        backgroundColor: 'white'
      }}>
        <Avatar 
          src={persona.avatar_url} 
          sx={{ width: 36, height: 36 }} 
          alt={persona.name}
        >
          <SmartToyIcon />
        </Avatar>
        <div>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
            {persona.name}
          </Typography>
          <Typography variant="caption" sx={{ color: '#666' }}>
            オンライン
          </Typography>
        </div>
      </Box>

      {/* メッセージエリア */}
      <Box sx={{ 
        flex: 1,
        overflowY: 'auto',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5
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
                backgroundColor: msg.role === 'user' ? '#1976d2' : '#fff',
                color: msg.role === 'user' ? 'white' : '#333',
                borderRadius: 2,
                wordBreak: 'break-word',
                boxShadow: msg.role === 'user' ? 1 : 0,
                border: msg.role === 'ai' ? '1px solid #e0e0e0' : 'none'
              }}
            >
              <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                {msg.content}
              </Typography>
            </Paper>
          </Box>
        ))}
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
            <Paper sx={{ p: 1.5, backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: 2 }}>
              <Typography variant="body2" sx={{ color: '#999' }}>
                入力中...
              </Typography>
            </Paper>
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* 入力エリア */}
      <Box sx={{ 
        p: 1.5, 
        borderTop: '1px solid #e0e0e0',
        backgroundColor: 'white',
        display: 'flex',
        gap: 1,
        alignItems: 'flex-end'
      }}>
        <TextField 
          fullWidth 
          multiline
          maxRows={3}
          minRows={1}
          placeholder="メッセージを入力..."
          value={input} 
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          variant="outlined"
          size="small"
          sx={{ 
            '& .MuiOutlinedInput-root': {
              borderRadius: 1
            }
          }}
        />
        <IconButton 
          color="primary" 
          onClick={handleSend} 
          disabled={!input.trim() || isLoading}
          size="small"
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default AIChatWidget;