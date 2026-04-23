"use client";

import { useState, useEffect } from "react";
import { usePresentationRoom } from "@/contexts/PresentationRoomContext";
import { usePresentationSocket } from "@/contexts/PresentationSocketContext";

interface PageBackgroundPanelProps {
  presentationId: string;
  pageId: string;
  onClose: () => void;
}

const GRADIENT_PRESETS = [
  { name: 'None', value: null },
  { name: 'Blue Gradient', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { name: 'Purple Gradient', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { name: 'Blue Sky', value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { name: 'Green Gradient', value: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
  { name: 'Dark Gradient', value: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' },
  { name: 'Warm Gradient', value: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
  { name: 'Cool Gradient', value: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)' },
];

const COLOR_PRESETS = [
  '#ffffff', '#000000', '#f8f9fa', '#e9ecef', '#dee2e6',
  '#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe',
  '#00f2fe', '#43e97b', '#38f9d7', '#1a1a2e', '#16213e',
];

const PageBackgroundPanel = ({ presentationId, pageId, onClose }: PageBackgroundPanelProps) => {
  const { presentationInfo, userInfo } = usePresentationRoom();
  const socket = usePresentationSocket();
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [backgroundGradient, setBackgroundGradient] = useState<string | null>(null);

  const currentPage = presentationInfo?.pages?.find(p => p.id === pageId);

  useEffect(() => {
    if (currentPage?.background) {
      setBackgroundColor(currentPage.background.color || '#ffffff');
      setBackgroundGradient(currentPage.background.gradient || null);
    }
  }, [currentPage]);

  const handleUpdateBackground = () => {
    if (!userInfo.lobby || !currentPage) return;

    const background: any = {};
    if (backgroundGradient) {
      background.gradient = backgroundGradient;
    } else {
      background.color = backgroundColor;
    }

    socket.emit("updatePage", presentationId, pageId, { background }, userInfo.lobby.credentials);
    onClose();
  };

  if (!currentPage || !userInfo.lobby) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="page-background-panel" onClick={handleBackdropClick}>
      <div className="page-background-panel__content-wrapper" onClick={(e) => e.stopPropagation()}>
      <div className="page-background-panel__header">
        <h3>Page Background</h3>
        <button onClick={onClose} className="page-background-panel__close">×</button>
      </div>

      <div className="page-background-panel__content">
        <div className="page-background-panel__section">
          <label>Background Type</label>
          <div className="page-background-panel__type-toggle">
            <button
              className={!backgroundGradient ? 'active' : ''}
              onClick={() => setBackgroundGradient(null)}
            >
              Solid Color
            </button>
            <button
              className={backgroundGradient ? 'active' : ''}
              onClick={() => {
                setBackgroundGradient('linear-gradient(135deg, #667eea 0%, #764ba2 100%)');
              }}
            >
              Gradient
            </button>
          </div>
        </div>

        {!backgroundGradient ? (
          <div className="page-background-panel__section">
            <label>Color</label>
            <div className="page-background-panel__color-picker">
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="page-background-panel__color-input"
              />
              <div className="page-background-panel__color-grid">
                {COLOR_PRESETS.map(c => (
                  <button
                    key={c}
                    className={`page-background-panel__color-swatch ${backgroundColor === c ? 'active' : ''}`}
                    style={{ backgroundColor: c }}
                    onClick={() => setBackgroundColor(c)}
                    title={c}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="page-background-panel__section">
            <label>Gradient</label>
            <div className="page-background-panel__gradient-grid">
              {GRADIENT_PRESETS.map((preset, index) => (
                <button
                  key={index}
                  className={`page-background-panel__gradient-preset ${backgroundGradient === preset.value ? 'active' : ''}`}
                  style={{ background: preset.value || '#ffffff' }}
                  onClick={() => setBackgroundGradient(preset.value)}
                  title={preset.name}
                />
              ))}
            </div>
          </div>
        )}

        <button
          className="page-background-panel__apply-btn"
          onClick={handleUpdateBackground}
        >
          Apply Background
        </button>
      </div>
      </div>
    </div>
  );
};

export default PageBackgroundPanel;
