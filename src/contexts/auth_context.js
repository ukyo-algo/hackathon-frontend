import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase_config';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import axios from 'axios'; // API呼び出し用 (fetchでもOK)

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ユーザー登録
  function signup(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  // ログイン
  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  // ログアウト
  function logout() {
    return signOut(auth);
  }

useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // 1. Firebase上はログインしている
          
          // ※現状のバックエンドはトークン検証ではなく生UIDを求めているため、
          // トークン取得(getIdToken)は必須ではありませんが、将来のために残してもOKです。
          // const token = await firebaseUser.getIdToken(); 

          // 2. バックエンドに「本当にこのユーザーは有効か？」と問い合わせる
          const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/users/me`, {
            headers: {
              // ★ここを修正！ バックエンドが求めている「X-Firebase-Uid」を送ります
              "X-Firebase-Uid": firebaseUser.uid
            }
          });

          console.log("【確認】バックエンドから届いたユーザー情報:", response.data);

          // 3. バックエンドもOKなら、Firebaseの情報とバックエンドの情報を合体させてセット
          setCurrentUser({ ...firebaseUser, ...response.data });
          
        } else {
          // Firebase上でログアウト状態ならnull
          setCurrentUser(null);
        }
      } catch (error) {
        console.error("認証同期エラー:", error);
        
        // ★ 404 (Not Found) の場合は、まだバックエンドに登録されていないだけの可能性が高いので
        // 強制ログアウトさせずに、Firebaseユーザー情報だけで続行させる
        if (error.response && error.response.status === 404) {
             console.log("バックエンドにユーザーがいません (新規登録中など)");
             setCurrentUser(firebaseUser); // Firebase情報だけでセット
        } else {
            // その他のエラー（認証トークン不正など）の場合はログアウト
            await signOut(auth);
            setCurrentUser(null);
        }
      } finally {
        // 全てのチェックが終わってからローディングを解除
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout,
    refreshUser, // ユーザー情報を最新化する関数を提供
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

async function  refreshUser() {
  if (!auth.currentUser) return;
  try {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/users/me`, {
      headers: {
        "X-Firebase-Uid": auth.currentUser.uid
      }
    });
    const updatedUser = { ...auth.currentUser, ...response.data };
    setCurrentUser(updatedUser);
    return updatedUser;
  } catch (error) {
    console.error("ユーザー情報更新エラー:", error);
    return auth.currentUser; // エラー時は既存の情報を返す
  }
}