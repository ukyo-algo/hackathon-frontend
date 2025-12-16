// src/components/AIChatWidget.js
// LLMチャットをする部分（ページコンテキスト対応版）

import React, { useState, useEffect, useRef, useContext, createContext } from 'react';
import { useLLMAgent } from '../hooks/useLLMAgent';
import {
  Box, Paper, TextField, IconButton, Typography
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useAuth } from '../contexts/auth_context';
import apiClient from '../api/axios';
import { COLORS } from '../config';

// ページコンテキストを共有するためのContext
export const PageContextContext = createContext(null);

// ページコンテキストを設定するためのProvider
export const PageContextProvider = ({ children }) => {
  const [pageContext, setPageContext] = useState(null);
  return (
    <PageContextContext.Provider value={{ pageContext, setPageContext }}>
      {children}
    </PageContextContext.Provider>
  );
};

// ページコンテキストを使用するためのhook
export const usePageContext = () => {
  const context = useContext(PageContextContext);
  if (!context) {
    return { pageContext: null, setPageContext: () => { } };
  }
  return context;
};

const AIChatWidget = () => {
  // ページ遷移検知のためのLLMフック＆ガイダンスメッセージ取得
  const { pageContext } = usePageContext();
  const llmAgent = useLLMAgent({ page_context: pageContext });
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGuidanceLoading, setIsGuidanceLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const defaultPersona = {
    name: "キャラクター",
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
        content: `<${currentUser?.current_persona?.name || 'キャラクター'}がお買い物を手伝ってくれるようです>`
      }
    ]);
  }, [currentUser?.current_persona?.id]);

  // ページ遷移時にLLMからのガイダンスメッセージを自動追加
  useEffect(() => {
    if (llmAgent.isLoading) {
      setIsGuidanceLoading(true);
    } else {
      setIsGuidanceLoading(false);
      if (llmAgent.message) {
        setMessages(prev => [
          ...prev,
          {
            role: 'ai',
            content: llmAgent.message,
            type: 'guidance'
          }
        ]);
      }
    }
  }, [llmAgent.message, llmAgent.isLoading]);

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
      // ページコンテキストも一緒に送信
      const res = await apiClient.post('/chat', {
        message: userMessage.content,
        page_context: pageContext || null
      });
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
        backgroundColor: '#0d0d0d'
      }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'white' }}>
          {persona.name}
        </Typography>
        <Typography variant="caption" sx={{ color: COLORS.TEXT_TERTIARY }}>
          オンライン
        </Typography>
      </Box>

      {/* キャラクター画像 */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        backgroundColor: '#0d0d0d',
        borderBottom: '2px solid #333',
        minHeight: '150px'
      }}>
        <img
          src={persona.avatar_url}
          alt={persona.name}
          style={{
            maxWidth: '120px',
            maxHeight: '150px',
            imageRendering: 'auto'
          }}
        />
      </Box>

      {/* メッセージエリア */}
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
                backgroundColor: msg.type === 'guidance'
                  ? '#1a3a1a'
                  : (msg.role === 'user' ? '#00ff00' : '#333'),
                color: msg.type === 'guidance'
                  ? '#00ff88'
                  : (msg.role === 'user' ? '#000' : '#00ff00'),
                borderRadius: 1,
                wordBreak: 'break-word',
                boxShadow: 'none',
                border: msg.type === 'guidance'
                  ? '1px solid #00ff88'
                  : ('1px solid ' + (msg.role === 'user' ? '#00ff00' : '#444')),
                fontFamily: '"Courier New", monospace',
                fontSize: '0.9rem'
              }}
            >
              <Typography variant="body2" sx={{ lineHeight: 1.6, color: 'inherit', fontFamily: 'inherit' }}>
                {msg.type === 'guidance' && '💡 '}
                {msg.role === 'user' ? `> ${msg.content}` : `* ${msg.content}`}
              </Typography>
            </Paper>
          </Box>
        ))}
        {/* guidance生成中インジケータ */}
        {isGuidanceLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
            <Paper sx={{
              p: 1.5,
              backgroundColor: '#1a3a1a',
              border: '1px solid #00ff88',
              borderRadius: 1,
              fontFamily: '"Courier New", monospace',
              color: '#00ff88'
            }}>
              <Typography variant="body2" sx={{ color: 'inherit', fontFamily: 'inherit' }}>
                💡 ガイダンス生成中...
              </Typography>
            </Paper>
          </Box>
        )}
        {/* 通常チャット送信中インジケータ */}
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