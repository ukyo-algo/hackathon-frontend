// AIChatWidgetFloating.js
// ドラッグ＆リサイズ可能なフローティングチャットウィジェット（コンパクト版）

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Box, IconButton, Typography, Tooltip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { useAuth } from '../contexts/auth_context';
import AIChatWidget from './AIChatWidget';
import { colors } from '../styles/theme';

const MIN_WIDTH = 300;
const MIN_HEIGHT = 350;
const DEFAULT_WIDTH = 340;
const DEFAULT_HEIGHT = 450;

const AIChatWidgetFloating = () => {
    const { currentUser } = useAuth();

    // 状態管理
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState({ x: window.innerWidth - DEFAULT_WIDTH - 20, y: 80 });
    const [size, setSize] = useState({ width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT });

    // ドラッグ用
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    // リサイズ用
    const [isResizing, setIsResizing] = useState(false);
    const [resizeDirection, setResizeDirection] = useState(null);
    const containerRef = useRef(null);

    // 現在のペルソナ情報
    const currentPersona = currentUser?.current_persona;
    const avatarUrl = currentPersona?.avatar_url || '/avatars/default.png';
    const personaName = currentPersona?.name || 'AIアシスタント';

    // ドラッグ開始
    const handleDragStart = useCallback((e) => {
        e.preventDefault();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        setIsDragging(true);
        setDragOffset({
            x: clientX - position.x,
            y: clientY - position.y,
        });
    }, [position]);

    // ドラッグ中
    const handleDrag = useCallback((e) => {
        if (!isDragging) return;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        let newX = clientX - dragOffset.x;
        let newY = clientY - dragOffset.y;

        newX = Math.max(0, Math.min(newX, window.innerWidth - size.width));
        newY = Math.max(0, Math.min(newY, window.innerHeight - 50));

        setPosition({ x: newX, y: newY });
    }, [isDragging, dragOffset, size.width]);

    const handleDragEnd = useCallback(() => {
        setIsDragging(false);
    }, []);

    // リサイズ開始
    const handleResizeStart = useCallback((e, direction) => {
        e.preventDefault();
        e.stopPropagation();
        setIsResizing(true);
        setResizeDirection(direction);
    }, []);

    // リサイズ中
    const handleResize = useCallback((e) => {
        if (!isResizing || !resizeDirection) return;

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        let newWidth = size.width;
        let newHeight = size.height;
        let newX = position.x;
        let newY = position.y;

        if (resizeDirection.includes('e')) {
            newWidth = Math.max(MIN_WIDTH, Math.min(500, clientX - position.x));
        }
        if (resizeDirection.includes('w')) {
            const diff = position.x - clientX;
            newWidth = Math.max(MIN_WIDTH, Math.min(500, size.width + diff));
            if (newWidth !== size.width) newX = clientX;
        }
        if (resizeDirection.includes('s')) {
            newHeight = Math.max(MIN_HEIGHT, Math.min(window.innerHeight - 100, clientY - position.y));
        }
        if (resizeDirection.includes('n')) {
            const diff = position.y - clientY;
            newHeight = Math.max(MIN_HEIGHT, Math.min(window.innerHeight - 100, size.height + diff));
            if (newHeight !== size.height) newY = clientY;
        }

        setSize({ width: newWidth, height: newHeight });
        setPosition({ x: newX, y: newY });
    }, [isResizing, resizeDirection, position, size]);

    const handleResizeEnd = useCallback(() => {
        setIsResizing(false);
        setResizeDirection(null);
    }, []);

    // グローバルイベントリスナー
    useEffect(() => {
        if (isDragging || isResizing) {
            const handleMove = (e) => {
                if (isDragging) handleDrag(e);
                if (isResizing) handleResize(e);
            };
            const handleEnd = () => {
                handleDragEnd();
                handleResizeEnd();
            };

            window.addEventListener('mousemove', handleMove);
            window.addEventListener('mouseup', handleEnd);
            window.addEventListener('touchmove', handleMove);
            window.addEventListener('touchend', handleEnd);

            return () => {
                window.removeEventListener('mousemove', handleMove);
                window.removeEventListener('mouseup', handleEnd);
                window.removeEventListener('touchmove', handleMove);
                window.removeEventListener('touchend', handleEnd);
            };
        }
    }, [isDragging, isResizing, handleDrag, handleDragEnd, handleResize, handleResizeEnd]);

    if (!currentUser) return null;

    // 閉じた状態: キャラクターアバターボタン
    if (!isOpen) {
        return (
            <Tooltip title={`${personaName}と話す`} placement="left">
                <Box
                    onClick={() => setIsOpen(true)}
                    sx={{
                        position: 'fixed',
                        bottom: 20,
                        right: 20,
                        zIndex: 2000,
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        border: `2px solid ${colors.primary}`,
                        boxShadow: `0 0 15px ${colors.primary}50`,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                            transform: 'scale(1.08)',
                            boxShadow: `0 0 25px ${colors.primary}70`,
                        },
                    }}
                >
                    <Box
                        component="img"
                        src={avatarUrl}
                        alt={personaName}
                        sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            imageRendering: 'pixelated',
                        }}
                    />
                </Box>
            </Tooltip>
        );
    }

    // リサイズハンドル共通スタイル
    const resizeHandleStyle = {
        position: 'absolute',
        backgroundColor: 'transparent',
        zIndex: 10,
    };

    return (
        <Box
            ref={containerRef}
            sx={{
                position: 'fixed',
                left: position.x,
                top: position.y,
                width: size.width,
                height: size.height,
                zIndex: 2000,
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: `0 0 20px ${colors.primary}25, 0 4px 20px rgba(0,0,0,0.3)`,
                border: `2px solid ${colors.primary}`,
                backgroundColor: colors.paper,
            }}
        >
            {/* コンパクトヘッダー: [ドラッグ][アバター][名前...] [×] */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    minHeight: 36,
                    py: 0.5,
                    backgroundColor: colors.primary,
                    userSelect: 'none',
                }}
            >
                {/* ドラッグハンドル */}
                <Box
                    onMouseDown={handleDragStart}
                    onTouchStart={handleDragStart}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'move',
                        px: 0.5,
                        alignSelf: 'stretch',
                    }}
                >
                    <DragIndicatorIcon sx={{ color: colors.background, fontSize: 18 }} />
                </Box>

                {/* アバター */}
                <Box
                    component="img"
                    src={avatarUrl}
                    alt={personaName}
                    sx={{
                        width: 26,
                        height: 26,
                        borderRadius: '50%',
                        border: `1.5px solid ${colors.background}`,
                        objectFit: 'cover',
                        imageRendering: 'pixelated',
                        flexShrink: 0,
                        alignSelf: 'flex-start',
                        mt: 0.25,
                    }}
                />

                {/* 名前（折り返し可能、アバターに被らない） */}
                <Typography
                    sx={{
                        flex: 1,
                        ml: 1,
                        mr: 0.5,
                        color: colors.background,
                        fontFamily: '"VT323", monospace',
                        fontSize: '1rem',
                        lineHeight: 1.2,
                        wordBreak: 'break-word',
                    }}
                >
                    {personaName}
                </Typography>

                {/* 閉じるボタン */}
                <IconButton
                    size="small"
                    onClick={() => setIsOpen(false)}
                    sx={{
                        color: colors.background,
                        p: 0.5,
                        mr: 0.5,
                        alignSelf: 'flex-start',
                        '&:hover': { backgroundColor: 'rgba(0,0,0,0.2)' }
                    }}
                >
                    <CloseIcon sx={{ fontSize: 18 }} />
                </IconButton>
            </Box>

            {/* チャット本体 */}
            <Box sx={{ height: 'calc(100% - 36px)', overflow: 'hidden' }}>
                <AIChatWidget />
            </Box>

            {/* リサイズハンドル（右・下・右下のみ） */}
            <Box
                onMouseDown={(e) => handleResizeStart(e, 'e')}
                onTouchStart={(e) => handleResizeStart(e, 'e')}
                sx={{ ...resizeHandleStyle, right: 0, top: 36, width: 6, height: 'calc(100% - 42px)', cursor: 'ew-resize' }}
            />
            <Box
                onMouseDown={(e) => handleResizeStart(e, 's')}
                onTouchStart={(e) => handleResizeStart(e, 's')}
                sx={{ ...resizeHandleStyle, bottom: 0, left: 6, width: 'calc(100% - 12px)', height: 6, cursor: 'ns-resize' }}
            />
            <Box
                onMouseDown={(e) => handleResizeStart(e, 'se')}
                onTouchStart={(e) => handleResizeStart(e, 'se')}
                sx={{
                    ...resizeHandleStyle,
                    right: 0,
                    bottom: 0,
                    width: 14,
                    height: 14,
                    cursor: 'nwse-resize',
                    '&::after': {
                        content: '""',
                        position: 'absolute',
                        right: 3,
                        bottom: 3,
                        width: 6,
                        height: 6,
                        borderRight: `2px solid ${colors.primary}50`,
                        borderBottom: `2px solid ${colors.primary}50`,
                    }
                }}
            />
        </Box>
    );
};

export default AIChatWidgetFloating;
