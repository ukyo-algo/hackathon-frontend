// AIChatWidgetをスライドイン・アウトで表示するコンポーネント

import React, { useState } from 'react';
import AIChatWidget from './AIChatWidget';
import { IconButton, Box } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const CHAT_WIDTH = 360; // px

const AIChatWidgetSlide = () => {
  const [open, setOpen] = useState(true);

  return (
    <>
      {/* チャット本体 */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          right: 0,
          height: '100vh',
          width: `${CHAT_WIDTH}px`,
          zIndex: 2000,
          boxShadow: open ? 4 : 'none',
          background: 'transparent',
          transform: open ? 'translateX(0)' : `translateX(${CHAT_WIDTH - 48}px)`,
          transition: 'transform 0.4s cubic-bezier(.4,0,.2,1)',
          pointerEvents: open ? 'auto' : 'none',
        }}
      >
        <Box sx={{
          width: '100%',
          height: '100%',
          background: '#fff',
          borderLeft: '1px solid #eee',
        }}>
          {/* ヘッダー右端に閉じるボタン */}
          <Box sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            zIndex: 10,
            p: 1,
            display: open ? 'block' : 'none',
          }}>
            <IconButton onClick={() => setOpen(false)} size="small">
              <ChevronRightIcon />
            </IconButton>
          </Box>
          <AIChatWidget />
        </Box>
      </Box>

      {/* 開くボタン（常に右端に表示） */}
      {!open && (
        <Box
          sx={{
            position: 'fixed',
            top: 80,
            right: 0,
            zIndex: 2100,
          }}
        >
          <IconButton
            onClick={() => setOpen(true)}
            size="large"
            sx={{
              background: '#fff',
              color: '#1976d2',
              border: '1px solid #eee',
              borderRadius: '24px 0 0 24px',
              width: 48,
              height: 48,
              boxShadow: 2,
              '&:hover': { background: '#f5f5f5' }
            }}
          >
            <ChevronLeftIcon />
          </IconButton>
        </Box>
      )}
    </>
  );
};

export default AIChatWidgetSlide;
