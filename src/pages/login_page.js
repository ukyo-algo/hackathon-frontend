// src/pages/login_page.js
/**
 * ログインページ
 * el;ma テーマ - レトロゲーム風UI
 */

import React, { useRef, useState } from 'react';
import { useAuth } from '../contexts/auth_context';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box, Container, Typography, TextField, Button, Alert, Paper, CircularProgress
} from '@mui/material';
import { colors } from '../styles/theme';

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
      await login(emailRef.current.value, passwordRef.current.value);
      navigate('/');
    } catch (err) {
      console.error(err);
      const { getFirebaseErrorMessage } = await import('../utils/firebaseErrors');
      setError(getFirebaseErrorMessage(err));
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
            過去と未来をつなぐ、フリマアプリ
          </Typography>
        </Box>

        {/* ログインフォーム */}
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
              background: `linear-gradient(90deg, ${colors.primary}, ${colors.accent}, ${colors.secondary})`,
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
            🎮 ログイン
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
                backgroundColor: colors.primary,
                color: colors.background,
                border: `2px solid ${colors.primary}`,
                boxShadow: `0 0 15px ${colors.primary}40`,
                '&:hover': {
                  backgroundColor: colors.primaryDark,
                  boxShadow: `0 0 25px ${colors.primary}60`,
                },
                '&:disabled': {
                  backgroundColor: colors.border,
                  borderColor: colors.border,
                },
              }}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: colors.background }} />
              ) : (
                '▶ ログイン'
              )}
            </Button>
          </Box>
        </Paper>

        {/* 登録リンク */}
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography
            variant="body2"
            sx={{
              color: colors.textSecondary,
              fontFamily: 'monospace',
            }}
          >
            アカウントをお持ちでないですか？{' '}
            <Link
              to="/register"
              style={{
                color: colors.primary,
                textDecoration: 'none',
                fontWeight: 'bold',
              }}
            >
              新規登録
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

export default LoginPage;