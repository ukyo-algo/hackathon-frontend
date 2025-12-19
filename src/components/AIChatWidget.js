// src/components/AIChatWidget.js
// LLMチャットをする部分（ページコンテキスト対応版）

import React, { useState, useEffect, useRef, useContext, createContext, useCallback } from 'react';
import { useLLMAgent } from '../hooks/useLLMAgent';
import {
  Box, Paper, TextField, IconButton, Typography
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useAuth } from '../contexts/auth_context';
import apiClient from '../api/axios';
import { COLORS } from '../config';
import CharacterDetailModal from './CharacterDetailModal';
import { createFunctionCallHandlers, processFunctionCalls } from '../utils/functionCallHandlers';

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
  const { currentUser, refreshUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGuidanceLoading, setIsGuidanceLoading] = useState(false);
  const messagesEndRef = useRef(null);


  const defaultPersona = {
    name: "ドット絵の村人",
    avatar_url: "/avatars/model1.png",
    theme_color: "#1976d2"
  };

  const [persona, setPersona] = useState(defaultPersona);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // キャラクター詳細モーダルの状態
  const [detailOpen, setDetailOpen] = useState(false);

  const handleOpenDetail = () => {
    setDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailOpen(false);
  };

  const handleSetPartner = (char) => {
    console.log("Set partner:", char);
    // TODO: パートナー変更APIを実装してここから呼ぶ
    handleCloseDetail();
  };

  // 重複メッセージ防止用: 表示済みメッセージのハッシュをセットで管理
  const getDisplayedMessagesKey = () => 'llm_displayed_messages';

  const getDisplayedMessages = () => {
    try {
      const stored = sessionStorage.getItem(getDisplayedMessagesKey());
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const addDisplayedMessage = (content) => {
    try {
      const displayed = getDisplayedMessages();
      // 最新50件のみ保持（メモリ節約）
      const updated = [...displayed, content].slice(-50);
      sessionStorage.setItem(getDisplayedMessagesKey(), JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const isMessageDisplayed = (content) => {
    const displayed = getDisplayedMessages();
    return displayed.includes(content);
  };

  // ペルソナが変更されたらUIを即反映し、初期メッセージをセット
  useEffect(() => {
    if (currentUser?.current_persona) {
      setPersona(currentUser.current_persona);
    } else {
      setPersona(defaultPersona);
    }

    // 初期メッセージをセット（履歴はAPIから取得する）
    setMessages([
      {
        role: 'ai',
        content: `<${currentUser?.current_persona?.name || 'ドット絵の村人'}がお買い物を手伝ってくれるようです>`
      }
    ]);

    // ペルソナ変更時に表示済みメッセージをクリア
    sessionStorage.removeItem(getDisplayedMessagesKey());
  }, [currentUser?.current_persona?.id]);

  // 最後に追加したガイダンスメッセージを記憶（重複防止 - sessionStorageで永続化）
  const getLastGuidanceKey = () => `llm_last_guidance_${window.location.pathname}`;

  // ページ遷移時にLLMからのガイダンスメッセージを自動追加
  useEffect(() => {
    if (llmAgent.isLoading) {
      setIsGuidanceLoading(true);
    } else {
      setIsGuidanceLoading(false);
      if (llmAgent.message) {
        // グローバル重複チェック（全ページ共通）
        if (isMessageDisplayed(llmAgent.message)) {
          console.log('[AIChatWidget] 既に表示済みのメッセージのためスキップ (global)');
          return;
        }

        // sessionStorageで永続的に重複チェック（ウィジェット開閉でも保持）
        const lastGuidance = sessionStorage.getItem(getLastGuidanceKey());
        if (lastGuidance === llmAgent.message) {
          console.log('[AIChatWidget] 同じガイダンスのためスキップ (sessionStorage)');
          return;
        }

        // メッセージ配列内に既に同じ内容があるかチェック
        setMessages(prev => {
          const alreadyExists = prev.some(m => m.content === llmAgent.message);
          if (alreadyExists) {
            console.log('[AIChatWidget] 同じガイダンスが履歴にあるためスキップ');
            return prev;
          }

          const newAIMessage = {
            role: 'ai',
            content: llmAgent.message,
            type: 'guidance'
          };

          // グローバル重複チェック用に記録
          addDisplayedMessage(llmAgent.message);

          // sessionStorageに保存
          sessionStorage.setItem(getLastGuidanceKey(), llmAgent.message);

          // AIメッセージをDBに保存
          saveMessageToAPI(newAIMessage);

          return [...prev, newAIMessage];
        });
      }
    }
  }, [llmAgent.message, llmAgent.isLoading]);

  // チャットウィジェット開始時に履歴をAPIから取得
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await apiClient.get('/chat/messages?limit=10');
        if (res.data && res.data.length > 0) {
          // 重複を除外しながらメッセージを作成
          const seenContents = new Set();
          const historyMessages = [];

          for (const msg of res.data) {
            // 同じ内容のメッセージは1回だけ追加
            if (!seenContents.has(msg.content)) {
              seenContents.add(msg.content);
              historyMessages.push({
                role: msg.role,
                content: msg.content,
                type: msg.type || 'chat'
              });
              // グローバル重複チェック用に登録
              addDisplayedMessage(msg.content);
            }
          }

          setMessages(prev => {
            // 重複を避ける: 初期メッセージの後に履歴を追加
            if (prev.length <= 1) {
              // 履歴とprevの間の重複も除外
              const existingContents = new Set(prev.map(m => m.content));
              const filteredHistory = historyMessages.filter(m => !existingContents.has(m.content));
              return [...prev, ...filteredHistory];
            }
            return prev;
          });
        }
      } catch (error) {
        console.log("履歴取得をスキップ:", error.message);
      }
    };

    if (currentUser) {
      loadHistory();
    }
  }, [currentUser?.id]);

  // メッセージをAPIに保存するヘルパー関数
  const saveMessageToAPI = async (message) => {
    try {
      await apiClient.post('/chat/messages', {
        role: message.role,
        content: message.content,
        type: message.type || 'chat',
        page_path: window.location.pathname
      });
    } catch (error) {
      console.log("メッセージ保存エラー:", error.message);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input, type: 'chat' };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // ユーザーメッセージをDBに保存
    saveMessageToAPI(userMessage);

    try {
      // ページコンテキストも一緒に送信
      const res = await apiClient.post('/chat', {
        message: userMessage.content,
        page_context: pageContext || null
      });
      const aiMessage = {
        role: 'ai',
        content: res.data.reply,
        persona: res.data.persona,
        type: 'chat'
      };
      setMessages(prev => [...prev, aiMessage]);

      // AIメッセージをDBに保存
      saveMessageToAPI(aiMessage);

      // Function Callsを処理
      if (res.data.function_calls && res.data.function_calls.length > 0) {
        handleFunctionCalls(res.data.function_calls);
      }
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { role: 'ai', content: "申し訳ありません。通信エラーが発生しました。" }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Function Callの結果をUIに反映
  const handleFunctionCalls = useCallback((functionCalls) => {
    const handlers = createFunctionCallHandlers({ setMessages, refreshUser });
    processFunctionCalls(functionCalls, handlers);
  }, [refreshUser]);

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
      {/* ヘッダーとアバター画像はAIChatWidgetFloating.jsで表示するため削除 */}
      <CharacterDetailModal
        open={detailOpen}
        onClose={handleCloseDetail}
        character={persona}
        onSetPartner={handleSetPartner}
      />

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
                {msg.role === 'user' ? `> ${msg.content}` : msg.content}
              </Typography>

              {/* ガチャ結果画像の表示 */}
              {msg.type === 'gacha_result' && msg.gachaData && (
                <Box sx={{ mt: 1, textAlign: 'center' }}>
                  <img
                    src={msg.gachaData.avatar_url || "/default_avatar.png"}
                    alt={msg.gachaData.name}
                    style={{
                      width: '120px',
                      height: '120px',
                      borderRadius: '8px',
                      border: '2px solid #00ff00',
                      objectFit: 'cover'
                    }}
                  />
                  <Typography variant="caption" display="block" sx={{ color: '#00ff00', mt: 0.5 }}>
                    ★{msg.gachaData.rarity} {msg.gachaData.name}
                  </Typography>
                </Box>
              )}
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
                ...
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