// src/styles/commonStyles.js
// el;ma 共通スタイル (ダークモード + レトロゲーム風)

import { colors, spacing, borderRadius, fontSize } from './theme';

// ボタンスタイル (レトロゲーム風・洗練されたダークテーマ)
export const buttonStyles = {
    primary: {
        backgroundColor: '#3d4a5c',
        color: '#f0f4f8',
        border: '2px solid #5a6b7d',
        px: 2,
        py: 1,
        borderRadius: `${borderRadius.sm}px`,
        fontFamily: '"VT323", monospace',
        fontSize: '1.1rem',
        cursor: 'pointer',
        transition: 'all 0.2s',
        '&:hover': {
            backgroundColor: '#4d5a6c',
            borderColor: '#7a8b9d',
        },
    },
    outlined: {
        backgroundColor: 'transparent',
        color: '#b8c5d4',
        border: '2px solid #5a6b7d',
        px: 2,
        py: 1,
        borderRadius: `${borderRadius.sm}px`,
        fontFamily: '"VT323", monospace',
        fontSize: '1.1rem',
        cursor: 'pointer',
        transition: 'all 0.2s',
        '&:hover': {
            backgroundColor: '#3d4a5c30',
            borderColor: '#8a9bac',
            color: '#f0f4f8',
        },
    },
    secondary: {
        backgroundColor: 'transparent',
        color: '#b794f4',
        border: '2px solid #805ad5',
        px: 2,
        py: 1,
        borderRadius: `${borderRadius.sm}px`,
        fontFamily: '"VT323", monospace',
        fontSize: '1.1rem',
        cursor: 'pointer',
        transition: 'all 0.2s',
        '&:hover': {
            backgroundColor: '#805ad525',
            borderColor: '#b794f4',
        },
    },
    success: {
        backgroundColor: 'transparent',
        color: '#7ee2a8',
        border: '2px solid #48bb78',
        px: 2,
        py: 1,
        borderRadius: `${borderRadius.sm}px`,
        fontFamily: '"VT323", monospace',
        fontSize: '1.1rem',
        cursor: 'pointer',
        transition: 'all 0.2s',
        '&:hover': {
            backgroundColor: '#48bb7825',
            borderColor: '#7ee2a8',
        },
    },
    warning: {
        backgroundColor: 'transparent',
        color: '#fbb670',
        border: '2px solid #ed8936',
        px: 2,
        py: 1,
        borderRadius: `${borderRadius.sm}px`,
        fontFamily: '"VT323", monospace',
        fontSize: '1.1rem',
        cursor: 'pointer',
        transition: 'all 0.2s',
        '&:hover': {
            backgroundColor: '#ed893625',
            borderColor: '#fbb670',
        },
    },
    neutral: {
        backgroundColor: 'transparent',
        color: '#8a9bac',
        border: '2px solid #5a6b7d',
        px: 2,
        py: 1,
        borderRadius: `${borderRadius.sm}px`,
        fontFamily: '"VT323", monospace',
        fontSize: '1.1rem',
        cursor: 'pointer',
        transition: 'all 0.2s',
        '&:hover': {
            borderColor: '#8a9bac',
            backgroundColor: '#3d4a5c40',
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
