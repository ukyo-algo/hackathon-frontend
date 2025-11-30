// src/pages/login_page.js
import React, { useRef, useState } from 'react';
// ↓ インポートパス修正
import { useAuth } from '../contexts/auth_context';
import { useNavigate, Link } from 'react-router-dom';

const LoginPage = () => {
  const emailRef = useRef();
  const passwordRef = useRef();
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setError('');
      setLoading(true);
      await login(emailRef.current.value, passwordRef.current.value); // ログイン処理
      navigate('/');
    } catch (err) {
      console.error(err);
      setError('ログインに失敗しました: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>ログイン</h2>
      {error && <p style={{color: 'red'}}>{error}</p>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px' }}>
        <input type="email" ref={emailRef} placeholder="メールアドレス" required />
        <input type="password" ref={passwordRef} placeholder="パスワード" required />
        <button disabled={loading} type="submit">ログイン</button>
      </form>
      <div style={{ marginTop: '10px' }}>
        アカウントをお持ちでないですか？ <Link to="/register">登録</Link>
      </div>
    </div>
  );
};

export default LoginPage;