// src/styles/commonStyles.js
// el;ma 共通スタイル (ダークモード + レトロゲーム風)

import { colors, spacing, borderRadius, fontSize } from './theme';

// ボタンスタイル (レトロゲーム風)
export const buttonStyles = {
    primary: {
        backgroundColor: colors.primary,
        color: colors.background,
        border: `2px solid ${colors.primary}`,
        px: 2,
        py: 1,
        borderRadius: `${borderRadius.sm}px`,
        fontFamily: '"VT323", monospace',
        fontSize: '1.1rem',
        cursor: 'pointer',
        transition: 'all 0.2s',
        '&:hover': {
            boxShadow: `0 0 15px ${colors.primary}`,
            transform: 'translateY(-1px)',
        },
    },
    outlined: {
        backgroundColor: 'transparent',
        color: colors.primary,
        border: `2px solid ${colors.primary}`,
        px: 2,
        py: 1,
        borderRadius: `${borderRadius.sm}px`,
        fontFamily: '"VT323", monospace',
        fontSize: '1.1rem',
        cursor: 'pointer',
        transition: 'all 0.2s',
        '&:hover': {
            backgroundColor: `${colors.primary}20`,
            boxShadow: `0 0 10px ${colors.primary}40`,
        },
    },
    secondary: {
        backgroundColor: 'transparent',
        color: colors.secondary,
        border: `2px solid ${colors.secondary}`,
        px: 2,
        py: 1,
        borderRadius: `${borderRadius.sm}px`,
        fontFamily: '"VT323", monospace',
        fontSize: '1.1rem',
        cursor: 'pointer',
        transition: 'all 0.2s',
        '&:hover': {
            backgroundColor: `${colors.secondary}20`,
            boxShadow: `0 0 10px ${colors.secondary}40`,
        },
    },
    success: {
        backgroundColor: 'transparent',
        color: colors.success,
        border: `2px solid ${colors.success}`,
        px: 2,
        py: 1,
        borderRadius: `${borderRadius.sm}px`,
        fontFamily: '"VT323", monospace',
        fontSize: '1.1rem',
        cursor: 'pointer',
        transition: 'all 0.2s',
        '&:hover': {
            backgroundColor: `${colors.success}20`,
            boxShadow: `0 0 10px ${colors.success}40`,
        },
    },
    warning: {
        backgroundColor: 'transparent',
        color: colors.warning,
        border: `2px solid ${colors.warning}`,
        px: 2,
        py: 1,
        borderRadius: `${borderRadius.sm}px`,
        fontFamily: '"VT323", monospace',
        fontSize: '1.1rem',
        cursor: 'pointer',
        transition: 'all 0.2s',
        '&:hover': {
            backgroundColor: `${colors.warning}20`,
            boxShadow: `0 0 10px ${colors.warning}40`,
        },
    },
    neutral: {
        backgroundColor: 'transparent',
        color: colors.textSecondary,
        border: `2px solid ${colors.border}`,
        px: 2,
        py: 1,
        borderRadius: `${borderRadius.sm}px`,
        fontFamily: '"VT323", monospace',
        fontSize: '1.1rem',
        cursor: 'pointer',
        transition: 'all 0.2s',
        '&:hover': {
            borderColor: colors.textSecondary,
            backgroundColor: `${colors.border}40`,
        },
    },
};

// レイアウトスタイル
export const layoutStyles = {
    flexCenter: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    flexBetween: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    flexStart: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    flexColumn: {
        display: 'flex',
        flexDirection: 'column',
    },
};

// カードスタイル (ゲームウィンドウ風)
export const cardStyles = {
    card: {
        backgroundColor: colors.paper,
        borderRadius: `${borderRadius.sm}px`,
        border: `1px solid ${colors.border}`,
        transition: 'all 0.2s',
        '&:hover': {
            transform: 'translateY(-4px)',
            borderColor: colors.primary,
            boxShadow: `0 0 20px ${colors.primary}30`,
        },
    },
    cardImage: {
        width: '100%',
        aspectRatio: '1/1',
        objectFit: 'cover',
    },
};

// ペーパースタイル
export const paperStyles = {
    outlined: {
        border: `1px solid ${colors.border}`,
        borderRadius: `${borderRadius.md}px`,
        backgroundColor: colors.paper,
    },
    elevated: {
        boxShadow: `0 4px 20px ${colors.background}`,
        borderRadius: `${borderRadius.md}px`,
        backgroundColor: colors.paper,
        border: `1px solid ${colors.border}`,
    },
};

// ナビゲーションバースタイル (ダークモード)
export const navBarStyles = {
    container: {
        backgroundColor: colors.backgroundAlt,
        borderBottom: `1px solid ${colors.border}`,
    },
    topSection: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 2,
        py: 1,
    },
    logo: {
        fontSize: fontSize.xxl,
        fontWeight: 'bold',
        color: colors.primary,
    },
    searchForm: {
        flex: 1,
        maxWidth: '400px',
        marginLeft: '20px',
    },
    searchInput: {
        '& .MuiOutlinedInput-root': {
            borderRadius: `${borderRadius.sm}px`,
            backgroundColor: colors.background,
            color: colors.textPrimary,
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
        '& .MuiInputBase-input': {
            color: colors.textPrimary,
            '&::placeholder': {
                color: colors.textTertiary,
                opacity: 1,
            },
        },
    },
    navButtons: {
        display: 'flex',
        gap: 2,
        px: 2,
        py: 1,
        borderTop: `1px solid ${colors.border}`,
        justifyContent: 'flex-start',
        flexWrap: 'wrap',
    },
};

// フォームスタイル
export const formStyles = {
    container: {
        maxWidth: '500px',
        margin: '0 auto',
        padding: `${spacing.lg}px`,
    },
    input: {
        marginBottom: `${spacing.md}px`,
    },
    submitButton: {
        marginTop: `${spacing.md}px`,
        width: '100%',
        padding: `${spacing.md}px`,
        fontWeight: 'bold',
    },
};

// コメントセクションスタイル
export const commentStyles = {
    container: {
        width: '100%',
        height: '500px',
        p: 3,
        mb: 6,
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        bgcolor: colors.paper,
        border: `1px solid ${colors.border}`,
    },
    scrollArea: {
        flexGrow: 1,
        overflowY: 'auto',
        mb: 2,
        border: `1px solid ${colors.border}`,
        borderRadius: 1,
        p: 2,
        width: '100%',
        backgroundColor: colors.backgroundAlt,
    },
    emptyState: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: colors.textTertiary,
    },
    inputForm: {
        display: 'flex',
        gap: 1,
        alignItems: 'center',
        pt: 2,
        borderTop: `1px solid ${colors.border}`,
        width: '100%',
    },
};
