// hackathon-frontend/src/api/axios.js
/*
 * =======================================================
 * ★ API通信の窓口と認証の番人 (axiosクライアント)
 * =======================================================
 * 役割:
 * 1. ベースURLを設定し、バックエンドとの通信を簡略化する。
 * 2. 全てのリクエストに対し、FirebaseのUIDをヘッダーに自動付与する (認証)。
 * 3. サーバーから認証エラー(401)が返ってきた際、ユーザーを強制的にログアウトさせる。
 */
import axios from 'axios';
import { auth } from '../firebase_config'; // Firebase Authインスタンスをインポート

// 1. Base URLの設定（末尾スラッシュを除去してダブルスラッシュを防止）
const baseUrl = (process.env.REACT_APP_API_URL || '').replace(/\/$/, '');
const apiClient = axios.create({
  baseURL: baseUrl + '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. リクエストインターセプターの設定 (認証ヘッダー付与)
apiClient.interceptors.request.use(async (config) => {
  // Firebaseの認証情報が利用可能かチェック
  const user = auth.currentUser;

  if (user) {
    try {
      // Firebase IDトークンを取得（有効期限が切れていればサイレントリフレッシュされる）
      const token = await user.getIdToken();

      // バックエンドのget_current_user関数（users.py）はヘッダーからUIDを求めているため、
      // ここでは Firebase ID Token ではなく、UIDを渡します。
      // ※ もしバックエンドをJWT検証方式に変更した場合は、'Authorization: Bearer ' + token を使ってください。

      // 現在はUIDを渡す方式で進めます。
      config.headers['X-Firebase-Uid'] = user.uid;

    } catch (error) {
      console.error("Firebase ID Token取得エラー:", error);
      // トークンが取得できない場合は、ヘッダーをつけずにリクエストを続行
    }
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

// 3. レスポンスインターセプターの設定 (エラーハンドリング)
apiClient.interceptors.response.use((response) => {
  return response;
}, async (error) => {
  const originalRequest = error.config;

  // 401エラー（認証失敗）をキャッチ
  if (error.response && error.response.status === 401) {
    console.error("401 Unauthorized: 認証情報が無効です。強制ログアウトします。");

    // AuthContextのlogout関数を直接呼ぶことはできないため、
    // ここではグローバルに利用可能なログアウト処理（LocalStorageクリアなど）を実装するか、
    // または AuthContextがグローバルなログアウト関数を提供する仕組みが必要です。

    // 今回は簡易的に、Firebaseからログアウトしてページをリロードします。
    // (auth_context.js の logout 関数が signOut(auth) を呼んでいるため)
    await auth.signOut();
    window.location.href = '/login'; // ログインページへリダイレクト

    // 再リトライを防ぐ
    return Promise.reject(error);
  }

  return Promise.reject(error);
});

export default apiClient;