// src/components/ProgressSteps.js
import React from 'react';
import { Box, Typography } from '@mui/material';
import { PROGRESS_STEPS } from '../config';
import { colors } from '../styles/theme';

// status: 'pending_shipment' | 'in_transit' | 'completed'
const ProgressSteps = ({ status, compact = false }) => {
  const currentIndex = PROGRESS_STEPS.STATUS_INDEX[status] ?? 0;
  const totalSteps = PROGRESS_STEPS.LABELS.length;

  // プログレス割合を計算
  // 現在のステップと次のステップの中間に配置
  // 例: 0 → 12.5%, 1 → 37.5%, 2 → 62.5%, 3 → 100%
  const getProgressPercent = () => {
    if (currentIndex >= totalSteps - 1) return 100; // 完了
    // 現在のステップの位置 + 半ステップ分進める
    return ((currentIndex + 0.5) / (totalSteps - 1)) * 100;
  };

  const progressPercent = getProgressPercent();

  // ステータスに応じた色（白文字で見やすく）
  const getStepColor = (idx) => {
    if (idx < currentIndex) return colors.primary; // 完了（緑）
    if (idx === currentIndex) return '#fbbf24'; // 現在（黄色・明るめ）
    return '#9ca3af'; // 未到達（明るいグレー）
  };

  return (
    <Box sx={{ width: '100%', minWidth: compact ? 150 : 250 }}>
      {/* ステップラベル（上部）- 白文字で見やすく */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        mb: 0.5,
        px: 0.5
      }}>
        {PROGRESS_STEPS.LABELS.map((label, idx) => (
          <Typography
            key={label}
            sx={{
              fontSize: compact ? '0.65rem' : '0.75rem',
              fontFamily: '"VT323", monospace',
              color: getStepColor(idx),
              fontWeight: idx === currentIndex ? 'bold' : 'normal',
              textAlign: 'center',
              flex: 1,
              textShadow: idx === currentIndex ? '0 0 4px rgba(251, 191, 36, 0.5)' : 'none',
            }}
          >
            {label}
          </Typography>
        ))}
      </Box>

      {/* プログレスバー（ゲージ） */}
      <Box sx={{
        position: 'relative',
        height: compact ? 6 : 10,
        backgroundColor: '#4b5563', // より明るいグレー
        borderRadius: 1,
        overflow: 'visible', // マーカーがはみ出しても見えるように
        border: '1px solid #6b7280'
      }}>
        {/* 進捗バー */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          width: `${progressPercent}%`,
          background: `linear-gradient(90deg, ${colors.primary} 0%, #4ade80 100%)`,
          borderRadius: 1,
          transition: 'width 0.5s ease',
        }} />

        {/* 現在位置マーカー（中間地点） */}
        {currentIndex < totalSteps - 1 && (
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: `${progressPercent}%`,
            transform: 'translate(-50%, -50%)',
            width: compact ? 12 : 16,
            height: compact ? 12 : 16,
            borderRadius: '50%',
            backgroundColor: '#fbbf24', // 黄色
            border: '2px solid #fff',
            boxShadow: '0 0 10px rgba(251, 191, 36, 0.8)',
            zIndex: 10,
            animation: 'pulse 1.5s infinite',
            '@keyframes pulse': {
              '0%': { boxShadow: '0 0 6px rgba(251, 191, 36, 0.5)' },
              '50%': { boxShadow: '0 0 14px rgba(251, 191, 36, 1)' },
              '100%': { boxShadow: '0 0 6px rgba(251, 191, 36, 0.5)' },
            }
          }} />
        )}

        {/* 完了時のチェックマーク */}
        {status === 'completed' && (
          <Box sx={{
            position: 'absolute',
            right: 4,
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: compact ? '0.8rem' : '1rem',
            color: '#fff',
          }}>
            ✓
          </Box>
        )}
      </Box>

      {/* ステップドット（バーの下） */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        mt: 0.5,
        px: 0.5
      }}>
        {PROGRESS_STEPS.LABELS.map((label, idx) => (
          <Box
            key={`dot-${label}`}
            sx={{
              width: compact ? 8 : 10,
              height: compact ? 8 : 10,
              borderRadius: '50%',
              backgroundColor: idx <= currentIndex ? colors.primary : '#6b7280',
              border: idx === currentIndex ? '2px solid #fbbf24' : '1px solid #9ca3af',
              transition: 'all 0.3s ease',
              boxShadow: idx === currentIndex ? '0 0 6px rgba(251, 191, 36, 0.6)' : 'none',
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default ProgressSteps;
