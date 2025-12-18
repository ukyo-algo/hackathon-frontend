// src/styles/theme.js
// el;ma - 廃棄されたゲームキャラたちの市場
import { createTheme } from '@mui/material/styles';

// ===== el;ma カラーパレット (ダークモード + レトロゲーム) =====
export const colors = {
  // メインカラー
  primary: '#00ff88',        // ネオングリーン (レトロゲーム風)
  primaryDark: '#00cc6a',
  secondary: '#ff00ff',      // マゼンタ (グリッチ感)
  accent: '#00ffff',         // シアン

  // 背景
  background: '#0d1117',     // 深い黒
  backgroundAlt: '#161b22',  // 少し明るい黒
  paper: '#1c2128',          // カード背景

  // テキスト
  textPrimary: '#e6edf3',    // 明るいグレー
  textSecondary: '#8b949e',  // 中間グレー
  textTertiary: '#6e7681',   // 暗めグレー
  textAccent: '#00ff88',     // アクセント (価格など)

  // ボーダー
  border: '#30363d',
  borderLight: '#444c56',

  // ステータス
  success: '#00ff88',
  error: '#ff6b6b',
  warning: '#ffcc00',

  // 価格 (ネオン風)
  price: '#00ff88',
};

// スペーシング
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

// ボーダー半径 (レトロゲーム風は角張り気味)
export const borderRadius = {
  sm: 2,
  md: 4,
  lg: 8,
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

// MUIテーマの作成 (ダークモード)
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: colors.primary,
      dark: colors.primaryDark,
      contrastText: '#0d1117',
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
      paper: colors.paper,
    },
    text: {
      primary: colors.textPrimary,
      secondary: colors.textSecondary,
    },
    divider: colors.border,
  },
  typography: {
    fontFamily: [
      '"VT323"',           // レトロゲームフォント (Google Fonts)
      '"Press Start 2P"',  // ドット風フォント (フォールバック)
      'monospace',
      '-apple-system',
      'BlinkMacSystemFont',
      'sans-serif',
    ].join(','),
    h1: {
      fontFamily: '"VT323", monospace',
      fontWeight: 400,
    },
    h2: {
      fontFamily: '"VT323", monospace',
      fontWeight: 400,
    },
    h3: {
      fontFamily: '"VT323", monospace',
      fontWeight: 400,
    },
    h4: {
      fontFamily: '"VT323", monospace',
      fontWeight: 400,
    },
    h5: {
      fontFamily: '"VT323", monospace',
      fontWeight: 400,
    },
    h6: {
      fontFamily: '"VT323", monospace',
      fontWeight: 400,
    },
    body1: {
      fontFamily: 'monospace, sans-serif',
    },
    body2: {
      fontFamily: 'monospace, sans-serif',
    },
  },
  shape: {
    borderRadius: borderRadius.sm,
  },
  spacing: 8,
  breakpoints: {
    values: breakpoints,
  },
  components: {
    // グローバルスタイル (カスタムカーソル等)
    MuiCssBaseline: {
      styleOverrides: {
        // カスタムピクセルカーソル - クラシックな矢印
        '*': {
          cursor: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%2300ff88' d='M1 1l4 12 2-4 4-2z'/%3E%3Cpath fill='%23000' d='M1 1l1 0 0 1-1 0z M2 2l1 0 0 1-1 0z M3 3l1 0 0 1-1 0z M4 4l1 0 0 1-1 0z'/%3E%3C/svg%3E") 0 0, auto !important`,
        },
        'a, button, [role="button"], input[type="submit"], .MuiButton-root, .MuiIconButton-root, .MuiTab-root, .MuiChip-root, .MuiCard-root': {
          cursor: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23ff00ff' d='M6 1l2 5 5 2-5 2-2 5-2-5-5-2 5-2z'/%3E%3C/svg%3E") 8 8, pointer !important`,
        },
        'body': {
          backgroundColor: colors.background,
          color: colors.textPrimary,
          fontFamily: 'monospace, sans-serif',
        },
        '::-webkit-scrollbar': {
          width: '10px',
          height: '10px',
        },
        '::-webkit-scrollbar-track': {
          backgroundColor: colors.backgroundAlt,
        },
        '::-webkit-scrollbar-thumb': {
          backgroundColor: colors.border,
          border: `2px solid ${colors.backgroundAlt}`,
          '&:hover': {
            backgroundColor: colors.primary,
          },
        },
        '::selection': {
          backgroundColor: colors.primary,
          color: colors.background,
        },
      },
    },
    // ボタンのスタイル (レトロゲーム風)
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 2,
          fontFamily: '"VT323", monospace',
          fontSize: '1.1rem',
          letterSpacing: '0.05em',
          border: '2px solid',
          '&:hover': {
            boxShadow: `0 0 10px ${colors.primary}`,
          },
        },
        contained: {
          backgroundColor: colors.primary,
          color: colors.background,
          borderColor: colors.primary,
          '&:hover': {
            backgroundColor: colors.primaryDark,
          },
        },
        outlined: {
          borderColor: colors.primary,
          color: colors.primary,
        },
      },
    },
    // カードのスタイル (ゲームウィンドウ風)
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: colors.paper,
          border: `1px solid ${colors.border}`,
          borderRadius: 4,
          '&:hover': {
            borderColor: colors.primary,
            boxShadow: `0 0 12px ${colors.primary}40`,
          },
        },
      },
    },
    // 紙のスタイル
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: colors.paper,
          backgroundImage: 'none',
        },
      },
    },
    // 入力フィールド
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: colors.border,
            },
            '&:hover fieldset': {
              borderColor: colors.primary,
            },
            '&.Mui-focused fieldset': {
              borderColor: colors.primary,
            },
          },
        },
      },
    },
    // タブ
    MuiTab: {
      styleOverrides: {
        root: {
          fontFamily: '"VT323", monospace',
          fontSize: '1.1rem',
          textTransform: 'none',
          '&.Mui-selected': {
            color: colors.primary,
          },
        },
      },
    },
    // チップ
    MuiChip: {
      styleOverrides: {
        root: {
          fontFamily: 'monospace',
          borderRadius: 4,
        },
      },
    },
  },
});

export default theme;
