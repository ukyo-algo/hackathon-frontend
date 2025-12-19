// AIChatWidgetFloating.js
// ドラッグ＆リサイズ可能なフローティングチャットウィジェット（コンパクト版）

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { useAuth } from '../contexts/auth_context';
import AIChatWidget from './AIChatWidget';
import { colors } from '../styles/theme';
import { useLLMAgent } from '../hooks/useLLMAgent';
import { usePageContext } from './AIChatWidget';

const MIN_WIDTH = 300;
const MIN_HEIGHT = 350;
const DEFAULT_WIDTH = 340;
const DEFAULT_HEIGHT = 450;

const AIChatWidgetFloating = () => {
    const { currentUser } = useAuth();
    const { pageContext } = usePageContext();
    const llmAgent = useLLMAgent({ page_context: pageContext });

    // 状態管理
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState({ x: window.innerWidth - DEFAULT_WIDTH - 20, y: 80 });
    const [size, setSize] = useState({ width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT });
    const [lastMessage, setLastMessage] = useState('');
    const [showBubble, setShowBubble] = useState(false);
    const [bubbleProgress, setBubbleProgress] = useState(0);
    const bubbleTimerRef = useRef(null);

    // ドラッグ用
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    // リサイズ用
    const [isResizing, setIsResizing] = useState(false);
    const [resizeDirection, setResizeDirection] = useState(null);
    const containerRef = useRef(null);

    // 現在のペルソナ情報
    const currentPersona = currentUser?.current_persona;
    const avatarUrl = currentPersona?.avatar_url || '/avatars/model1.png';
    const personaName = currentPersona?.name || 'ドット絵の村人';

    // LLMからのメッセージを保持 + 10秒タイマー
    useEffect(() => {
        if (llmAgent.message && !llmAgent.isLoading) {
            setLastMessage(llmAgent.message);
            setShowBubble(true);
            setBubbleProgress(0);

            // 既存のタイマーをクリア
            if (bubbleTimerRef.current) {
                clearInterval(bubbleTimerRef.current);
            }

            // 100msごとにプログレスを更新（10秒 = 100ステップ）
            let progress = 0;
            bubbleTimerRef.current = setInterval(() => {
                progress += 1;
                setBubbleProgress(progress);
                if (progress >= 100) {
                    setShowBubble(false);
                    clearInterval(bubbleTimerRef.current);
                }
            }, 100);
        }

        return () => {
            if (bubbleTimerRef.current) {
                clearInterval(bubbleTimerRef.current);
            }
        };
    }, [llmAgent.message, llmAgent.isLoading]);

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

    // リサイズハンドル共通スタイル
    const resizeHandleStyle = {
        position: 'absolute',
        backgroundColor: 'transparent',
        zIndex: 10,
    };

    return (
        <>
            {/* 閉じた状態: キャラクターアバターボタン + 吹き出し（isOpenがfalseの時のみ表示） */}
            <Box sx={{
                position: 'fixed',
                bottom: 20,
                right: 20,
                zIndex: 2000,
                display: isOpen ? 'none' : 'block',
            }}>
                {/* 吹き出し（最新メッセージ）- 10秒で自動消去 */}
                {showBubble && lastMessage && (
                    <Box
                        onClick={() => {
                            setShowBubble(false);
                            if (bubbleTimerRef.current) clearInterval(bubbleTimerRef.current);
                            setIsOpen(true);
                        }}
                        sx={{
                            position: 'absolute',
                            bottom: 64,
                            right: 0,
                            width: 280,
                            maxWidth: 'calc(100vw - 60px)',
                            backgroundColor: colors.paper,
                            border: `1px solid ${colors.primary}`,
                            borderRadius: 2,
                            overflow: 'hidden',
                            cursor: 'pointer',
                            boxShadow: `0 0 15px ${colors.primary}40`,
                            '&::after': {
                                content: '""',
                                position: 'absolute',
                                bottom: -8,
                                right: 20,
                                width: 0,
                                height: 0,
                                borderLeft: '8px solid transparent',
                                borderRight: '8px solid transparent',
                                borderTop: `8px solid ${colors.primary}`,
                            },
                        }}
                    >
                        {/* プログレスバー（上部） */}
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: `${bubbleProgress}%`,
                                height: 3,
                                backgroundColor: colors.primary,
                                transition: 'width 0.1s linear',
                            }}
                        />

                        {/* メッセージ本文 */}
                        <Box sx={{ px: 1.5, py: 1.5, pt: 2 }}>
                            <Typography
                                sx={{
                                    color: colors.textPrimary,
                                    fontSize: '0.85rem',
                                    fontFamily: '"VT323", monospace',
                                    lineHeight: 1.4,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 8,
                                    WebkitBoxOrient: 'vertical',
                                }}
                            >
                                {lastMessage}
                            </Typography>
                        </Box>
                    </Box>
                )}

                {/* アバターボタン */}
                <Tooltip title={`${personaName}と話す`} placement="left">
                    <Box
                        onClick={() => setIsOpen(true)}
                        sx={{
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
            </Box>

            {/* 開いた状態: フルチャットウィジェット（常にレンダリング、isOpenがfalseの時はdisplay:none） */}
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
                    display: isOpen ? 'block' : 'none',
                }}
            >
                {/* キャラ画像エリア（ドラッグ可能 + 閉じるボタン） */}
                <Box
                    onMouseDown={handleDragStart}
                    onTouchStart={handleDragStart}
                    sx={{
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 2,
                        py: 1.5,
                        backgroundColor: '#0a0a0a',
                        borderBottom: `1px solid ${colors.border}`,
                        cursor: 'move',
                        userSelect: 'none',
                    }}
                >
                    {/* ドラッグアイコン（左上） */}
                    <Box sx={{ position: 'absolute', top: 4, left: 4 }}>
                        <DragIndicatorIcon sx={{ color: colors.primary, fontSize: 18, opacity: 0.6 }} />
                    </Box>

                    {/* 閉じるボタン（右上） */}
                    <IconButton
                        size="small"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsOpen(false);
                        }}
                        sx={{
                            position: 'absolute',
                            top: 2,
                            right: 2,
                            color: colors.primary,
                            p: 0.3,
                            '&:hover': { backgroundColor: 'rgba(57, 255, 20, 0.2)' }
                        }}
                    >
                        <CloseIcon sx={{ fontSize: 18 }} />
                    </IconButton>

                    {/* メインキャラドット絵 */}
                    <Box
                        component="img"
                        src={avatarUrl}
                        alt={personaName}
                        sx={{
                            maxWidth: 80,
                            maxHeight: 100,
                            objectFit: 'contain',
                            imageRendering: 'pixelated',
                            filter: 'drop-shadow(0 0 8px rgba(57, 255, 20, 0.3))',
                            zIndex: 2,
                        }}
                    />

                    {/* サブキャラドット絵（存在する場合） */}
                    {currentUser?.sub_persona && (
                        <Box
                            component="img"
                            src={currentUser.sub_persona.avatar_url}
                            alt={currentUser.sub_persona.name}
                            sx={{
                                maxWidth: 60,
                                maxHeight: 80,
                                objectFit: 'contain',
                                imageRendering: 'pixelated',
                                filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.3))',
                                opacity: 0.9,
                                transform: 'scaleX(-1)', // 向かい合わせるために反転
                            }}
                        />
                    )}
                </Box>

                {/* チャット本体 */}
                <Box sx={{ height: 'calc(100% - 120px)', overflow: 'hidden' }}>
                    <AIChatWidget />
                </Box>

                {/* リサイズハンドル（8方向） */}
                {/* 右 */}
                <Box
                    onMouseDown={(e) => handleResizeStart(e, 'e')}
                    onTouchStart={(e) => handleResizeStart(e, 'e')}
                    sx={{ ...resizeHandleStyle, right: 0, top: 36, width: 6, height: 'calc(100% - 42px)', cursor: 'ew-resize' }}
                />
                {/* 左 */}
                <Box
                    onMouseDown={(e) => handleResizeStart(e, 'w')}
                    onTouchStart={(e) => handleResizeStart(e, 'w')}
                    sx={{ ...resizeHandleStyle, left: 0, top: 36, width: 6, height: 'calc(100% - 42px)', cursor: 'ew-resize' }}
                />
                {/* 下 */}
                <Box
                    onMouseDown={(e) => handleResizeStart(e, 's')}
                    onTouchStart={(e) => handleResizeStart(e, 's')}
                    sx={{ ...resizeHandleStyle, bottom: 0, left: 6, width: 'calc(100% - 12px)', height: 6, cursor: 'ns-resize' }}
                />
                {/* 上 */}
                <Box
                    onMouseDown={(e) => handleResizeStart(e, 'n')}
                    onTouchStart={(e) => handleResizeStart(e, 'n')}
                    sx={{ ...resizeHandleStyle, top: 0, left: 6, width: 'calc(100% - 12px)', height: 6, cursor: 'ns-resize' }}
                />
                {/* 右下 */}
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
                {/* 左下 */}
                <Box
                    onMouseDown={(e) => handleResizeStart(e, 'sw')}
                    onTouchStart={(e) => handleResizeStart(e, 'sw')}
                    sx={{ ...resizeHandleStyle, left: 0, bottom: 0, width: 14, height: 14, cursor: 'nesw-resize' }}
                />
                {/* 右上 */}
                <Box
                    onMouseDown={(e) => handleResizeStart(e, 'ne')}
                    onTouchStart={(e) => handleResizeStart(e, 'ne')}
                    sx={{ ...resizeHandleStyle, right: 0, top: 0, width: 14, height: 14, cursor: 'nesw-resize' }}
                />
                {/* 左上 */}
                <Box
                    onMouseDown={(e) => handleResizeStart(e, 'nw')}
                    onTouchStart={(e) => handleResizeStart(e, 'nw')}
                    sx={{ ...resizeHandleStyle, left: 0, top: 0, width: 14, height: 14, cursor: 'nwse-resize' }}
                />
            </Box>
        </>
    );
};

export default AIChatWidgetFloating;
