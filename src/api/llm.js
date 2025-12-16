// src/api/llm.js
// フロントからLLM関連APIを呼び出す薄いラッパー

const API_URL = process.env.REACT_APP_API_URL;

export async function postLLMContext(context) {
  // ページ遷移や閲覧中アイテム情報をバックエンドへ送る
  const res = await fetch(`${API_URL}/api/v1/llm/context`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(context.uid ? { 'X-Firebase-Uid': context.uid } : {}) },
    body: JSON.stringify(context)
  });
  if (!res.ok) throw new Error('Failed to post LLM context');
  return res.json();
}

export async function callLLMFunction(name, args, uid) {
  // LLMのFunction Callingをトリガー
  const res = await fetch(`${API_URL}/api/v1/llm/func`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(uid ? { 'X-Firebase-Uid': uid } : {}) },
    body: JSON.stringify({ name, args })
  });
  if (!res.ok) throw new Error('Failed to call LLM function');
  return res.json();
}


// getLLMRecommendationsは廃止。レコメンドはrecommend_page.js等で/api/v1/recommend(POST)に統一。
