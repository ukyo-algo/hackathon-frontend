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

          // 3. バックエンドもOKなら、Firebaseの情報とバックエンドの情報を合体させてセット
          setCurrentUser({ ...firebaseUser, ...response.data });
          
        } else {
          // Firebase上でログアウト状態ならnull
          setCurrentUser(null);
        }
      } catch (error) {
        console.error("認証同期エラー:", error);
        // ★重要: バックエンドで拒否されたら、Firebase側も強制ログアウトさせる
        await signOut(auth);
        setCurrentUser(null);
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
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}