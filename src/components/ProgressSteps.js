// src/components/ProgressSteps.js
import React from 'react';
import { PROGRESS_STEPS } from '../config';

// status: 'pending_shipment' | 'in_transit' | 'completed'
const ProgressSteps = ({ status, compact = false }) => {
  const currentIndex = PROGRESS_STEPS.STATUS_INDEX[status] ?? 0;
  const activeColor = PROGRESS_STEPS.ACTIVE_COLOR;
  const inactiveColor = PROGRESS_STEPS.INACTIVE_COLOR;
  const textActive = PROGRESS_STEPS.TEXT_ACTIVE;
  const textInactive = PROGRESS_STEPS.TEXT_INACTIVE;
  const dotSize = compact ? PROGRESS_STEPS.DOT_SIZE_COMPACT : PROGRESS_STEPS.DOT_SIZE;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {PROGRESS_STEPS.LABELS.map((label, idx) => (
        <React.Fragment key={label}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
              width: dotSize,
              height: dotSize,
              borderRadius: '50%',
              background: idx <= currentIndex ? activeColor : inactiveColor
            }} />
            {!compact && (
              <span style={{ fontSize: 12, color: idx <= currentIndex ? textActive : textInactive, marginTop: 4 }}>{label}</span>
            )}
          </div>
          {idx < PROGRESS_STEPS.LABELS.length - 1 && (
            <div style={{ flex: 1, height: 2, background: idx < currentIndex ? activeColor : PROGRESS_STEPS.BAR_INACTIVE }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default ProgressSteps;
