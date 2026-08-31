"use client";

import { useState, useEffect } from "react";
import { usePresentationRoom } from "@/contexts/PresentationRoomContext";
import { usePresentationSocket } from "@/contexts/PresentationSocketContext";

interface PageTransitionPanelProps {
  presentationId: string;
  pageId: string;
  onClose: () => void;
}

const TRANSITION_TYPES = [
  { value: 'fade', label: 'Fade', icon: '✨' },
  { value: 'slide', label: 'Slide', icon: '➡️' },
  { value: 'slide-up', label: 'Slide Up', icon: '⬆️' },
  { value: 'slide-down', label: 'Slide Down', icon: '⬇️' },
  { value: 'zoom', label: 'Zoom', icon: '🔍' },
  { value: 'zoom-in', label: 'Zoom In', icon: '🔎' },
  { value: 'zoom-out', label: 'Zoom Out', icon: '🔍' },
  { value: 'rotate', label: 'Rotate', icon: '🔄' },
  { value: 'flip', label: 'Flip', icon: '🔄' },
  { value: 'cube', label: 'Cube', icon: '📦' },
  { value: 'blur', label: 'Blur', icon: '🌫️' },
];

const DURATION_OPTIONS = [
  { value: 300, label: 'Fast (0.3s)' },
  { value: 500, label: 'Normal (0.5s)' },
  { value: 700, label: 'Slow (0.7s)' },
  { value: 1000, label: 'Very Slow (1s)' },
];

const PageTransitionPanel = ({ presentationId, pageId, onClose }: PageTransitionPanelProps) => {
  const { presentationInfo, userInfo } = usePresentationRoom();
  const socket = usePresentationSocket();
  const [transitionType, setTransitionType] = useState('fade');
  const [duration, setDuration] = useState(500);

  const currentPage = presentationInfo?.pages?.find(p => p.id === pageId);

  useEffect(() => {
    if (currentPage?.transition) {
      setTransitionType(currentPage.transition.type || 'fade');
      setDuration(currentPage.transition.duration || 500);
    }
  }, [currentPage]);

  const handleUpdateTransition = () => {
    if (!userInfo.lobby || !currentPage) return;

    socket.emit("updatePage", presentationId, pageId, { 
      transition: { type: transitionType, duration } 
    }, userInfo.lobby.credentials);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!currentPage || !userInfo.lobby) return null;

  return (
    <div className="page-transition-panel" onClick={handleBackdropClick}>
      <div className="page-transition-panel__content-wrapper" onClick={(e) => e.stopPropagation()}>
        <div className="page-transition-panel__header">
          <h3>Page Transition</h3>
          <button onClick={onClose} className="page-transition-panel__close">×</button>
        </div>

        <div className="page-transition-panel__content">
          <div className="page-transition-panel__section">
            <label>Transition Type</label>
            <div className="page-transition-panel__transition-grid">
              {TRANSITION_TYPES.map((transition) => (
                <button
                  key={transition.value}
                  className={`page-transition-panel__transition-option ${transitionType === transition.value ? 'active' : ''}`}
                  onClick={() => setTransitionType(transition.value)}
                >
                  <span className="page-transition-panel__transition-icon">{transition.icon}</span>
                  <span>{transition.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="page-transition-panel__section">
            <label>Duration</label>
            <select
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              className="page-transition-panel__select"
            >
              {DURATION_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <button
            className="page-transition-panel__apply-btn"
            onClick={handleUpdateTransition}
          >
            Apply Transition
          </button>
        </div>
      </div>
    </div>
  );
};

export default PageTransitionPanel;
