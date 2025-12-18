// src/pages/register_page.js
/**
 * 新規登録ページ
 * el;ma テーマ - レトロゲーム風UI
 */

import React, { useRef, useState } from 'react';
import { useAuth } from '../contexts/auth_context';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box, Container, Typography, TextField, Button, Alert, Paper, CircularProgress
} from '@mui/material';
import { colors } from '../styles/theme';

const RegisterPage = () => {
  const emailRef = useRef();
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

      const response = await fetch(`${API_URL}/api/v1/users/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firebase_uid: user.uid,
          username: usernameRef.current.value,
          email: user.email,
          icon_url: null,
        }),
      });

      if (!response.ok) throw new Error('バックエンドへの保存に失敗しました');
      navigate('/');
    } catch (err) {
      console.error(err);
      setError('アカウント登録に失敗しました: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: `linear-gradient(135deg, ${colors.background} 0%, #0a0f14 100%)`,
      py: 4,
    }}>
      <Container maxWidth="xs">
        {/* ロゴ・タイトル */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant="h2"
            sx={{
              fontFamily: '"VT323", monospace',
              fontSize: { xs: '2.5rem', sm: '3.5rem' },
              color: colors.primary,
              textShadow: `0 0 20px ${colors.primary}80`,
              mb: 1,
            }}
          >
            el;ma
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: colors.textSecondary,
              fontFamily: 'monospace',
              fontSize: '0.9rem',
            }}
          >
            廃棄されたゲームキャラたちの市場
          </Typography>
        </Box>

        {/* 登録フォーム */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            background: `linear-gradient(180deg, ${colors.paper} 0%, ${colors.backgroundAlt} 100%)`,
            border: `2px solid ${colors.border}`,
            borderRadius: 2,
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -2,
              left: -2,
              right: -2,
              height: 4,
              background: `linear-gradient(90deg, ${colors.secondary}, ${colors.accent}, ${colors.primary})`,
              borderRadius: '4px 4px 0 0',
            },
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontFamily: '"VT323", monospace',
              fontSize: '1.8rem',
              color: colors.textPrimary,
              textAlign: 'center',
              mb: 3,
            }}
          >
            🆕 新規登録
          </Typography>

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                backgroundColor: 'rgba(255, 107, 107, 0.1)',
                border: `1px solid ${colors.error}`,
                '& .MuiAlert-icon': { color: colors.error },
              }}
            >
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              inputRef={usernameRef}
              type="text"
              label="ユーザー名"
              placeholder="your_username"
              required
              fullWidth
              variant="outlined"
              InputProps={{
                sx: {
                  fontFamily: 'monospace',
                  backgroundColor: colors.background,
                },
              }}
              InputLabelProps={{
                sx: { fontFamily: 'monospace' },
              }}
            />

            <TextField
              inputRef={emailRef}
              type="email"
              label="メールアドレス"
              placeholder="your@email.com"
              required
              fullWidth
              variant="outlined"
              InputProps={{
                sx: {
                  fontFamily: 'monospace',
                  backgroundColor: colors.background,
                },
              }}
              InputLabelProps={{
                sx: { fontFamily: 'monospace' },
              }}
            />

            <TextField
              inputRef={passwordRef}
              type="password"
              label="パスワード"
              placeholder="••••••••"
              required
              fullWidth
              variant="outlined"
              helperText="6文字以上で設定してください"
              InputProps={{
                sx: {
                  fontFamily: 'monospace',
                  backgroundColor: colors.background,
                },
              }}
              InputLabelProps={{
                sx: { fontFamily: 'monospace' },
              }}
              FormHelperTextProps={{
                sx: { fontFamily: 'monospace', color: colors.textTertiary },
              }}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              fullWidth
              sx={{
                mt: 1,
                py: 1.5,
                fontFamily: '"VT323", monospace',
                fontSize: '1.3rem',
                backgroundColor: colors.secondary,
                color: '#fff',
                border: `2px solid ${colors.secondary}`,
                boxShadow: `0 0 15px ${colors.secondary}40`,
                '&:hover': {
                  backgroundColor: '#cc00cc',
                  boxShadow: `0 0 25px ${colors.secondary}60`,
                },
                '&:disabled': {
                  backgroundColor: colors.border,
                  borderColor: colors.border,
                },
              }}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: '#fff' }} />
              ) : (
                '▶ アカウント作成'
              )}
            </Button>
          </Box>
        </Paper>

        {/* ログインリンク */}
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography
            variant="body2"
            sx={{
              color: colors.textSecondary,
              fontFamily: 'monospace',
            }}
          >
            すでにアカウントをお持ちですか？{' '}
            <Link
              to="/login"
              style={{
                color: colors.primary,
                textDecoration: 'none',
                fontWeight: 'bold',
              }}
            >
              ログイン
            </Link>
          </Typography>
        </Box>

        {/* デコレーション */}
        <Box sx={{
          mt: 4,
          textAlign: 'center',
          opacity: 0.3,
        }}>
          <Typography sx={{ fontFamily: 'monospace', fontSize: '0.7rem', color: colors.textTertiary }}>
            ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default RegisterPage;