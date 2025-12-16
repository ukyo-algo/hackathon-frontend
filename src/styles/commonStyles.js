// src/styles/commonStyles.js
// 共通のスタイルオブジェクトを定義

import { colors, spacing, borderRadius, fontSize } from './theme';

// ボタンスタイル
export const buttonStyles = {
    primary: {
        backgroundColor: colors.primary,
        color: colors.white,
        border: 'none',
        px: 2,
        py: 1,
        borderRadius: `${borderRadius.sm}px`,
        fontWeight: 'bold',
        cursor: 'pointer',
        '&:hover': {
            backgroundColor: colors.primaryDark,
        },
    },
    outlined: {
        backgroundColor: colors.white,
        color: colors.primary,
        border: `1px solid ${colors.primary}`,
        px: 2,
        py: 1,
        borderRadius: `${borderRadius.sm}px`,
        fontWeight: 'bold',
        cursor: 'pointer',
        '&:hover': {
            backgroundColor: colors.background,
        },
    },
    secondary: {
        backgroundColor: colors.white,
        color: colors.secondary,
        border: `1px solid ${colors.secondary}`,
        px: 2,
        py: 1,
        borderRadius: `${borderRadius.sm}px`,
        fontWeight: 'bold',
        cursor: 'pointer',
        '&:hover': {
            backgroundColor: colors.background,
        },
    },
    success: {
        backgroundColor: colors.white,
        color: colors.success,
        border: `1px solid ${colors.success}`,
        px: 2,
        py: 1,
        borderRadius: `${borderRadius.sm}px`,
        fontWeight: 'bold',
        cursor: 'pointer',
        '&:hover': {
            backgroundColor: colors.background,
        },
    },
    warning: {
        backgroundColor: colors.white,
        color: colors.warning,
        border: `1px solid ${colors.warning}`,
        px: 2,
        py: 1,
        borderRadius: `${borderRadius.sm}px`,
        fontWeight: 'bold',
        cursor: 'pointer',
        '&:hover': {
            backgroundColor: colors.background,
        },
    },
    neutral: {
        backgroundColor: colors.white,
        color: colors.textSecondary,
        border: `1px solid ${colors.border}`,
        px: 2,
        py: 1,
        borderRadius: `${borderRadius.sm}px`,
        fontWeight: 'bold',
        cursor: 'pointer',
        '&:hover': {
            backgroundColor: colors.background,
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

// カードスタイル
export const cardStyles = {
    card: {
        borderRadius: `${borderRadius.md}px`,
        border: `1px solid ${colors.border}`,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
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
        backgroundColor: colors.white,
    },
    elevated: {
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        borderRadius: `${borderRadius.md}px`,
        backgroundColor: colors.white,
    },
};

// ナビゲーションバースタイル
export const navBarStyles = {
    container: {
        backgroundColor: colors.white,
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
        },
    },
    navButtons: {
        display: 'flex',
        gap: 2,
        px: 2,
        py: 1,
        borderTop: `1px solid ${colors.border}`,
        justifyContent: 'flex-start',
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
        bgcolor: colors.white,
        border: `1px solid ${colors.border}`,
    },
    scrollArea: {
        flexGrow: 1,
        overflowY: 'auto',
        mb: 2,
        border: `1px solid #eee`,
        borderRadius: 1,
        p: 2,
        width: '100%',
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
        borderTop: `1px solid #eee`,
        width: '100%',
    },
};
