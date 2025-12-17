// src/components/ProgressSteps.js
import React from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';
import { PROGRESS_STEPS } from '../config';
import { colors } from '../styles/theme';

// status: 'pending_shipment' | 'in_transit' | 'completed'
const ProgressSteps = ({ status, compact = false }) => {
  const currentIndex = PROGRESS_STEPS.STATUS_INDEX[status] ?? 0;
  const totalSteps = PROGRESS_STEPS.LABELS.length;

  // プログレス割合を計算（0%, 33%, 66%, 100%）
  const progressPercent = (currentIndex / (totalSteps - 1)) * 100;

  // ステータスに応じた色
  const getStepColor = (idx) => {
    if (idx < currentIndex) return colors.primary; // 完了
    if (idx === currentIndex) return '#f59e0b'; // 現在（アンバー）
    return '#555'; // 未到達
  };

  return (
    <Box sx={{ width: '100%', minWidth: compact ? 150 : 250 }}>
      {/* ステップラベル（上部） */}
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
        backgroundColor: '#333',
        borderRadius: 1,
        overflow: 'hidden',
        border: '1px solid #444'
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

        {/* 現在位置マーカー */}
        {currentIndex < totalSteps - 1 && (
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: `${progressPercent}%`,
            transform: 'translate(-50%, -50%)',
            width: compact ? 10 : 14,
            height: compact ? 10 : 14,
            borderRadius: '50%',
            backgroundColor: '#f59e0b',
            border: '2px solid #fff',
            boxShadow: '0 0 8px rgba(245, 158, 11, 0.6)',
            animation: 'pulse 1.5s infinite',
            '@keyframes pulse': {
              '0%': { boxShadow: '0 0 4px rgba(245, 158, 11, 0.4)' },
              '50%': { boxShadow: '0 0 12px rgba(245, 158, 11, 0.8)' },
              '100%': { boxShadow: '0 0 4px rgba(245, 158, 11, 0.4)' },
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
            fontSize: compact ? '0.7rem' : '0.9rem',
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
              width: compact ? 6 : 8,
              height: compact ? 6 : 8,
              borderRadius: '50%',
              backgroundColor: idx <= currentIndex ? colors.primary : '#555',
              border: idx === currentIndex ? '2px solid #f59e0b' : 'none',
              transition: 'all 0.3s ease',
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default ProgressSteps;
