// src/hooks/useLLMAgent.js
// ページ遷移ごとにLLMへコンテキスト送信し、気の利いたメッセージや提案を受け取るフック

import { useEffect, useState } from 'react';
import { postLLMContext, callLLMFunction, getLLMRecommendations } from '../api/llm';
import { useAuth } from '../contexts/auth_context';
import { useLocation } from 'react-router-dom';

export function useLLMAgent(extraContext = {}) {
  const { currentUser } = useAuth();
  const location = useLocation();
  const [message, setMessage] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    let ignore = false;
    console.log('[useLLMAgent] ページ遷移検知:', {
      uid: currentUser?.uid,
      path: location.pathname,
      query: location.search,
      ...extraContext,
    });
    // guidance生成開始時にnullをセット
    setMessage(null);
    const run = async () => {
      try {
        const uid = currentUser?.uid;
        // ページコンテキスト送信
        const ctxResp = await postLLMContext({
          uid,
          path: location.pathname,
          query: location.search,
          ...extraContext,
        });
        if (!ignore) setMessage(ctxResp?.message || null);

        // レコメンド（任意トリガーだが初期版は同時取得）
        const rec = await getLLMRecommendations(uid);
        if (!ignore) setRecommendations(rec?.items || []);
      } catch (e) {
        // 失敗時は静かに
        console.warn('LLM agent error:', e);
      }
    };
    run();
    return () => { ignore = true; };
  }, [currentUser, location.pathname, location.search]);

  // 任意のFunction Calling（例: 相場チェック）
  const call = async (name, args) => {
    const uid = currentUser?.uid;
    return callLLMFunction(name, args, uid);
  };

  return { message, recommendations, call };
}
