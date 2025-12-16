// src/styles/theme.js
import { createTheme } from '@mui/material/styles';

// カラーパレット
export const colors = {
  primary: '#ff0099',
  primaryDark: '#e60080',
  secondary: '#9c27b0',
  background: '#f5f5f5',
  textPrimary: '#333',
  textSecondary: '#666',
  textTertiary: '#999',
  border: '#e0e0e0',
  success: '#2e7d32',
  error: '#d32f2f',
  warning: '#f57c00',
  white: '#ffffff',
};

// スペーシング
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

// ボーダー半径
export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 16,
};

// フォントサイズ
export const fontSize = {
  xs: '0.75rem',
  sm: '0.875rem',
  md: '1rem',
  lg: '1.25rem',
  xl: '1.5rem',
  xxl: '2rem',
};

// ブレークポイント
export const breakpoints = {
  xs: 0,
  sm: 600,
  md: 960,
  lg: 1280,
  xl: 1920,
};

// MUIテーマの作成
const theme = createTheme({
  palette: {
    primary: {
      main: colors.primary,
      dark: colors.primaryDark,
    },
    secondary: {
      main: colors.secondary,
    },
    success: {
      main: colors.success,
    },
    error: {
      main: colors.error,
    },
    warning: {
      main: colors.warning,
    },
    background: {
      default: colors.background,
      paper: colors.white,
    },
    text: {
      primary: colors.textPrimary,
      secondary: colors.textSecondary,
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h4: {
      fontWeight: 'bold',
    },
    h6: {
      fontWeight: 'bold',
    },
  },
  shape: {
    borderRadius: borderRadius.sm,
  },
  spacing: 8, // MUIのspacing基本単位
  breakpoints: {
    values: breakpoints,
  },
});

export default theme;
