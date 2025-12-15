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

export async function getLLMRecommendations(uid) {
  // レコメンド＆ゲーム内通貨報酬（バックエンド側で報酬付与）
  const res = await fetch(`${API_URL}/api/v1/recommendations`, {
    method: 'GET',
    headers: { ...(uid ? { 'X-Firebase-Uid': uid } : {}) }
  });
  if (!res.ok) throw new Error('Failed to fetch recommendations');
  return res.json();
}
