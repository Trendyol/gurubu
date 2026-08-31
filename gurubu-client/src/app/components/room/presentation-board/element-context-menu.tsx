"use client";

import { useEffect, useRef } from "react";

interface ElementContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

const ElementContextMenu = ({
  x,
  y,
  onClose,
  onBringToFront,
  onSendToBack,
  onBringForward,
  onSendBackward,
  onDuplicate,
  onDelete,
}: ElementContextMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    // Small delay to prevent immediate close
    const timer = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('contextmenu', handleClickOutside);
      window.addEventListener('keydown', handleEscape);
    }, 10);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('contextmenu', handleClickOutside);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  // Adjust position to keep menu in viewport
  const adjustPosition = () => {
    if (!menuRef.current) return { x, y };
    
    const menuRect = menuRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    let adjustedX = x;
    let adjustedY = y;
    
    if (x + menuRect.width > viewportWidth) {
      adjustedX = viewportWidth - menuRect.width - 10;
    }
    if (y + menuRect.height > viewportHeight) {
      adjustedY = viewportHeight - menuRect.height - 10;
    }
    if (adjustedX < 10) adjustedX = 10;
    if (adjustedY < 10) adjustedY = 10;
    
    return { x: adjustedX, y: adjustedY };
  };

  const position = adjustPosition();

  return (
    <div
      ref={menuRef}
      className="element-context-menu"
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 10000,
      }}
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="element-context-menu__item" onClick={onBringToFront}>
        <span className="element-context-menu__icon">⬆️</span>
        <span>Bring to Front</span>
      </div>
      <div className="element-context-menu__item" onClick={onBringForward}>
        <span className="element-context-menu__icon">↑</span>
        <span>Bring Forward</span>
      </div>
      <div className="element-context-menu__item" onClick={onSendBackward}>
        <span className="element-context-menu__icon">↓</span>
        <span>Send Backward</span>
      </div>
      <div className="element-context-menu__item" onClick={onSendToBack}>
        <span className="element-context-menu__icon">⬇️</span>
        <span>Send to Back</span>
      </div>
      <div className="element-context-menu__divider" />
      <div className="element-context-menu__item" onClick={onDuplicate}>
        <span className="element-context-menu__icon">📋</span>
        <span>Duplicate</span>
      </div>
      <div className="element-context-menu__divider" />
      <div className="element-context-menu__item element-context-menu__item--danger" onClick={onDelete}>
        <span className="element-context-menu__icon">🗑️</span>
        <span>Delete</span>
      </div>
    </div>
  );
};

export default ElementContextMenu;
