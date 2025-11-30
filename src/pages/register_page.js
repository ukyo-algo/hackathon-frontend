// src/pages/register_page.js
import React, { useRef, useState } from 'react';
// ↓ インポートパス修正
import { useAuth } from '../contexts/auth_context';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const emailRef = useRef(); // useref: inputの値を取得するためのフック
  const passwordRef = useRef();
  const usernameRef = useRef();
  const { signup } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL;

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setError('');
      setLoading(true);
      
      const userCredential = await signup(emailRef.current.value, passwordRef.current.value);
      const user = userCredential.user;

      const response = await fetch(`${API_URL}/api/v1/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firebase_uid: user.uid,
          username: usernameRef.current.value,
          email: user.email,
          icon_url: null 
        }), // 送るデータの定義
      });

      if (!response.ok) {
        throw new Error('バックエンドへの保存に失敗しました');
      }

      navigate('/');
    } catch (err) {
      console.error(err);
      setError('アカウント登録に失敗しました: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>ユーザー登録</h2>
      {error && <p style={{color: 'red'}}>{error}</p>} {/* エラーメッセージの表示 */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px' }}>
        <input type="text" ref={usernameRef} placeholder="ユーザー名" required />
        <input type="email" ref={emailRef} placeholder="メールアドレス" required />
        <input type="password" ref={passwordRef} placeholder="パスワード" required />
        <button disabled={loading} type="submit">登録する</button>
      </form>
    </div>
  );
};

export default RegisterPage;