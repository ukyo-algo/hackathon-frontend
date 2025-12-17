// AIChatWidgetFloating.js
// ドラッグ＆リサイズ可能なフローティングチャットウィジェット

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Box, IconButton, Typography, Tooltip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MinimizeIcon from '@mui/icons-material/Minimize';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { useAuth } from '../contexts/auth_context';
import AIChatWidget from './AIChatWidget';
import { colors } from '../styles/theme';

const MIN_WIDTH = 320;
const MIN_HEIGHT = 400;
const DEFAULT_WIDTH = 380;
const DEFAULT_HEIGHT = 520;

const AIChatWidgetFloating = () => {
    const { currentUser } = useAuth();

    // 状態管理
    const [isOpen, setIsOpen] = useState(false); // デフォルトは閉じた状態
    const [isMinimized, setIsMinimized] = useState(false);
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
        if (isMinimized) return;
        e.preventDefault();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        setIsDragging(true);
        setDragOffset({
            x: clientX - position.x,
            y: clientY - position.y,
        });
    }, [position, isMinimized]);

    // ドラッグ中
    const handleDrag = useCallback((e) => {
        if (!isDragging) return;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        let newX = clientX - dragOffset.x;
        let newY = clientY - dragOffset.y;

        // 画面外に出ないように制限
        newX = Math.max(0, Math.min(newX, window.innerWidth - size.width));
        newY = Math.max(0, Math.min(newY, window.innerHeight - 50));

        setPosition({ x: newX, y: newY });
    }, [isDragging, dragOffset, size.width]);

    // ドラッグ終了
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
            newWidth = Math.max(MIN_WIDTH, clientX - position.x);
        }
        if (resizeDirection.includes('w')) {
            const diff = position.x - clientX;
            newWidth = Math.max(MIN_WIDTH, size.width + diff);
            if (newWidth !== size.width) newX = clientX;
        }
        if (resizeDirection.includes('s')) {
            newHeight = Math.max(MIN_HEIGHT, clientY - position.y);
        }
        if (resizeDirection.includes('n')) {
            const diff = position.y - clientY;
            newHeight = Math.max(MIN_HEIGHT, size.height + diff);
            if (newHeight !== size.height) newY = clientY;
        }

        // 最大サイズ制限
        newWidth = Math.min(newWidth, 600);
        newHeight = Math.min(newHeight, window.innerHeight - 100);

        setSize({ width: newWidth, height: newHeight });
        setPosition({ x: newX, y: newY });
    }, [isResizing, resizeDirection, position, size]);

    // リサイズ終了
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
                        bottom: 24,
                        right: 24,
                        zIndex: 2000,
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        border: `3px solid ${colors.primary}`,
                        boxShadow: `0 0 20px ${colors.primary}60, 0 4px 12px rgba(0,0,0,0.3)`,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            transform: 'scale(1.1)',
                            boxShadow: `0 0 30px ${colors.primary}80, 0 6px 16px rgba(0,0,0,0.4)`,
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
                width: isMinimized ? 220 : size.width,
                height: isMinimized ? 44 : size.height,
                minWidth: MIN_WIDTH,
                minHeight: isMinimized ? 44 : MIN_HEIGHT,
                zIndex: 2000,
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: `0 0 30px ${colors.primary}30, 0 8px 32px rgba(0,0,0,0.3)`,
                border: `2px solid ${colors.primary}`,
                backgroundColor: colors.paper,
                transition: isMinimized ? 'all 0.3s ease' : 'none',
            }}
        >
            {/* ヘッダー（ドラッグハンドル） */}
            <Box
                onMouseDown={handleDragStart}
                onTouchStart={handleDragStart}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    height: 44,
                    px: 1,
                    backgroundColor: colors.primary,
                    cursor: 'move',
                    userSelect: 'none',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DragIndicatorIcon sx={{ color: colors.background, fontSize: 20 }} />
                    {/* ヘッダーにもアバターを小さく表示 */}
                    <Box
                        component="img"
                        src={avatarUrl}
                        alt={personaName}
                        sx={{
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            border: `2px solid ${colors.background}`,
                            objectFit: 'cover',
                            imageRendering: 'pixelated',
                        }}
                    />
                    <Typography sx={{
                        color: colors.background,
                        fontFamily: '"VT323", monospace',
                        fontSize: '1.1rem',
                    }}>
                        {personaName}
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <IconButton
                        size="small"
                        onClick={() => setIsMinimized(!isMinimized)}
                        sx={{ color: colors.background, p: 0.5 }}
                    >
                        {isMinimized ? <OpenInFullIcon fontSize="small" /> : <MinimizeIcon fontSize="small" />}
                    </IconButton>
                    <IconButton
                        size="small"
                        onClick={() => setIsOpen(false)}
                        sx={{ color: colors.background, p: 0.5 }}
                    >
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Box>
            </Box>

            {/* チャット本体 */}
            {!isMinimized && (
                <Box sx={{ height: 'calc(100% - 44px)', overflow: 'hidden' }}>
                    <AIChatWidget />
                </Box>
            )}

            {/* リサイズハンドル */}
            {!isMinimized && (
                <>
                    {/* 右 */}
                    <Box
                        onMouseDown={(e) => handleResizeStart(e, 'e')}
                        onTouchStart={(e) => handleResizeStart(e, 'e')}
                        sx={{ ...resizeHandleStyle, right: 0, top: 44, width: 8, height: 'calc(100% - 52px)', cursor: 'ew-resize' }}
                    />
                    {/* 下 */}
                    <Box
                        onMouseDown={(e) => handleResizeStart(e, 's')}
                        onTouchStart={(e) => handleResizeStart(e, 's')}
                        sx={{ ...resizeHandleStyle, bottom: 0, left: 8, width: 'calc(100% - 16px)', height: 8, cursor: 'ns-resize' }}
                    />
                    {/* 左 */}
                    <Box
                        onMouseDown={(e) => handleResizeStart(e, 'w')}
                        onTouchStart={(e) => handleResizeStart(e, 'w')}
                        sx={{ ...resizeHandleStyle, left: 0, top: 44, width: 8, height: 'calc(100% - 52px)', cursor: 'ew-resize' }}
                    />
                    {/* 右下コーナー（視覚的なインジケーター付き） */}
                    <Box
                        onMouseDown={(e) => handleResizeStart(e, 'se')}
                        onTouchStart={(e) => handleResizeStart(e, 'se')}
                        sx={{
                            ...resizeHandleStyle,
                            right: 0,
                            bottom: 0,
                            width: 20,
                            height: 20,
                            cursor: 'nwse-resize',
                            '&::after': {
                                content: '""',
                                position: 'absolute',
                                right: 4,
                                bottom: 4,
                                width: 8,
                                height: 8,
                                borderRight: `2px solid ${colors.primary}60`,
                                borderBottom: `2px solid ${colors.primary}60`,
                            }
                        }}
                    />
                    {/* 左下コーナー */}
                    <Box
                        onMouseDown={(e) => handleResizeStart(e, 'sw')}
                        onTouchStart={(e) => handleResizeStart(e, 'sw')}
                        sx={{ ...resizeHandleStyle, left: 0, bottom: 0, width: 16, height: 16, cursor: 'nesw-resize' }}
                    />
                </>
            )}
        </Box>
    );
};

export default AIChatWidgetFloating;
