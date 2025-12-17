// src/styles/commonStyles.js
// el;ma 共通スタイル (ダークモード + レトロゲーム風)

import { colors, spacing, borderRadius, fontSize } from './theme';

// ボタンスタイル (レトロゲーム風・落ち着いたダークテーマ)
export const buttonStyles = {
    primary: {
        backgroundColor: '#2d3748',
        color: '#e2e8f0',
        border: '2px solid #4a5568',
        px: 2,
        py: 1,
        borderRadius: `${borderRadius.sm}px`,
        fontFamily: '"VT323", monospace',
        fontSize: '1.1rem',
        cursor: 'pointer',
        transition: 'all 0.2s',
        '&:hover': {
            backgroundColor: '#4a5568',
            borderColor: '#718096',
        },
    },
    outlined: {
        backgroundColor: 'transparent',
        color: '#a0aec0',
        border: '2px solid #4a5568',
        px: 2,
        py: 1,
        borderRadius: `${borderRadius.sm}px`,
        fontFamily: '"VT323", monospace',
        fontSize: '1.1rem',
        cursor: 'pointer',
        transition: 'all 0.2s',
        '&:hover': {
            backgroundColor: '#2d374820',
            borderColor: '#718096',
            color: '#e2e8f0',
        },
    },
    secondary: {
        backgroundColor: 'transparent',
        color: '#9f7aea',
        border: '2px solid #6b46c1',
        px: 2,
        py: 1,
        borderRadius: `${borderRadius.sm}px`,
        fontFamily: '"VT323", monospace',
        fontSize: '1.1rem',
        cursor: 'pointer',
        transition: 'all 0.2s',
        '&:hover': {
            backgroundColor: '#6b46c120',
            borderColor: '#9f7aea',
        },
    },
    success: {
        backgroundColor: 'transparent',
        color: '#68d391',
        border: '2px solid #38a169',
        px: 2,
        py: 1,
        borderRadius: `${borderRadius.sm}px`,
        fontFamily: '"VT323", monospace',
        fontSize: '1.1rem',
        cursor: 'pointer',
        transition: 'all 0.2s',
        '&:hover': {
            backgroundColor: '#38a16920',
            borderColor: '#68d391',
        },
    },
    warning: {
        backgroundColor: 'transparent',
        color: '#f6ad55',
        border: '2px solid #dd6b20',
        px: 2,
        py: 1,
        borderRadius: `${borderRadius.sm}px`,
        fontFamily: '"VT323", monospace',
        fontSize: '1.1rem',
        cursor: 'pointer',
        transition: 'all 0.2s',
        '&:hover': {
            backgroundColor: '#dd6b2020',
            borderColor: '#f6ad55',
        },
    },
    neutral: {
        backgroundColor: 'transparent',
        color: '#718096',
        border: '2px solid #4a5568',
        px: 2,
        py: 1,
        borderRadius: `${borderRadius.sm}px`,
        fontFamily: '"VT323", monospace',
        fontSize: '1.1rem',
        cursor: 'pointer',
        transition: 'all 0.2s',
        '&:hover': {
            borderColor: '#718096',
            backgroundColor: '#2d374840',
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
