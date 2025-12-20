// src/hooks/useWebSocket.js
// WebSocket接続を管理するカスタムフック

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/auth_context';

const WS_BASE_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:8000';

export function useWebSocket(onMessage) {
    const { currentUser } = useAuth();
    const [isConnected, setIsConnected] = useState(false);
    const wsRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const pingIntervalRef = useRef(null);

    const connect = useCallback(() => {
        if (!currentUser?.id) return;

        const wsUrl = `${WS_BASE_URL}/api/v1/messages/ws/${currentUser.id}`;
        console.log('[WebSocket] Connecting to:', wsUrl);

        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log('[WebSocket] Connected');
            setIsConnected(true);

            // Pingを30秒ごとに送信
            pingIntervalRef.current = setInterval(() => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send('ping');
                }
            }, 30000);
        };

        ws.onmessage = (event) => {
            if (event.data === 'pong') return;

            try {
                const data = JSON.parse(event.data);
                console.log('[WebSocket] Message received:', data);
                if (onMessage) {
                    onMessage(data);
                }
            } catch (e) {
                console.log('[WebSocket] Non-JSON message:', event.data);
            }
        };

        ws.onclose = () => {
            console.log('[WebSocket] Disconnected');
            setIsConnected(false);

            if (pingIntervalRef.current) {
                clearInterval(pingIntervalRef.current);
            }

            // 5秒後に再接続を試みる
            reconnectTimeoutRef.current = setTimeout(() => {
                console.log('[WebSocket] Attempting reconnect...');
                connect();
            }, 5000);
        };

        ws.onerror = (error) => {
            console.error('[WebSocket] Error:', error);
        };
    }, [currentUser?.id, onMessage]);

    const disconnect = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
        }
        if (pingIntervalRef.current) {
            clearInterval(pingIntervalRef.current);
        }
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
    }, []);

    useEffect(() => {
        connect();
        return () => disconnect();
    }, [connect, disconnect]);

    return { isConnected, reconnect: connect };
}
