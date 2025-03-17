'use client';

import React from 'react';
import { IconCheck, IconAlertCircle } from '@tabler/icons-react';

interface ProgressBarProps {
  total: number;
  processed: number;
  status: 'in_progress' | 'completed' | 'error';
}

export default function ProgressBar({ total, processed, status }: ProgressBarProps) {
  const percentage = Math.round((processed / total) * 100) || 0;
  
  return (
    <div className={`progress-container status-${status}`}>
      <div className="progress-info">
        <div className="progress-status-indicator">
          {status === 'in_progress' && <div className="progress-spinner" />}
          {status === 'completed' && <IconCheck size={20} className="progress-icon completed" />}
          {status === 'error' && <IconAlertCircle size={20} className="progress-icon error" />}
          <span className="progress-status-text">
            {status === 'in_progress' && 'Processing...'}
            {status === 'completed' && 'Completed!'}
            {status === 'error' && 'Error'}
          </span>
        </div>
        <span className="progress-detail">
          {processed} of {total} issues processed
        </span>
        <span className="progress-percentage">{percentage}%</span>
      </div>
      
      <div className="progress-bar-outer">
        <div 
          className="progress-bar-inner" 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
} 