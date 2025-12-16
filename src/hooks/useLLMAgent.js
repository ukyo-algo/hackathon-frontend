// src/hooks/useLLMAgent.js
// ページ遷移ごとにLLMへコンテキスト送信し、気の利いたメッセージや提案を受け取るフック
// 各ページでextraContextにページ固有情報を渡すことで、LLMがより具体的な応答を返せる

import { useEffect, useState, useCallback } from 'react';
import { postLLMContext, callLLMFunction } from '../api/llm';
import { useAuth } from '../contexts/auth_context';
import { useLocation } from 'react-router-dom';

/**
 * ページコンテキストを構築するためのヘルパー
 * @param {string} pageType - ページタイプ ("homepage" | "item_detail" | "search" | etc.)
 * @param {object} data - ページ固有のデータ
 */
export function buildPageContext(pageType, data = {}) {
  const context = {
    page_type: pageType,
    ...data
  };
  return context;
}

/**
 * アイテム情報をコンテキスト用に変換
 * @param {object} item - アイテムオブジェクト
 * @param {number} likeCount - いいね数
 * @param {array} comments - コメント配列
 */
export function buildItemContext(item, likeCount = 0, comments = []) {
  if (!item) return null;

  return {
    item_id: item.item_id || item.id,
    name: item.name || item.title,
    price: item.price,
    category: item.category,
    condition: item.condition,
    description: item.description,
    seller_name: item.seller?.username || item.seller_name,
    like_count: likeCount,
    comment_count: comments?.length || item.comment_count || 0,
    comments: comments?.slice(0, 5).map(c => ({
      username: c.user?.username || c.username || '匿名',
      content: c.content || c.text || ''
    }))
  };
}

export function useLLMAgent(extraContext = {}) {
  const { currentUser } = useAuth();
  const location = useLocation();
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // ページ遷移時にコンテキストを送信
  useEffect(() => {
    let ignore = false;

    console.log('[useLLMAgent] ページ遷移検知:', {
      uid: currentUser?.uid,
      path: location.pathname,
      query: location.search,
      page_context: extraContext?.page_context,
    });

    // guidance生成開始時にnullをセット
    setMessage(null);
    setIsLoading(true);

    const run = async () => {
      try {
        const uid = currentUser?.uid;

        // ページコンテキスト送信
        const ctxResp = await postLLMContext({
          uid,
          path: location.pathname,
          query: location.search,
          page_context: extraContext?.page_context || null,
        });

        if (!ignore) {
          setMessage(ctxResp?.message || null);
        }
      } catch (e) {
        console.warn('LLM agent error:', e);
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    run();
    return () => { ignore = true; };
  }, [currentUser, location.pathname, location.search, JSON.stringify(extraContext?.page_context)]);

  // 任意のFunction Calling
  const call = useCallback(async (name, args) => {
    const uid = currentUser?.uid;
    return callLLMFunction(name, args, uid);
  }, [currentUser]);

  // 現在のページコンテキストを取得（AIChatWidgetから参照）
  const getPageContext = useCallback(() => {
    return extraContext?.page_context || null;
  }, [extraContext]);

  return { message, isLoading, call, getPageContext };
}
