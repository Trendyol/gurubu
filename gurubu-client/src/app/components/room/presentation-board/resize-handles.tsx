"use client";

import { useState, useRef, useEffect } from "react";
import { snapToGrid } from "@/utils/gridUtils";

interface ResizeHandlesProps {
  elementRef: React.RefObject<HTMLElement>;
  elementSize: { width: number; height: number };
  elementPosition: { x: number; y: number };
  onResize: (newSize: { width: number; height: number }, newPosition?: { x: number; y: number }) => void;
  minWidth?: number;
  minHeight?: number;
}

const ResizeHandles = ({ 
  elementRef, 
  elementSize, 
  elementPosition,
  onResize,
  minWidth = 50,
  minHeight = 50 
}: ResizeHandlesProps) => {
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startSize, setStartSize] = useState({ width: 0, height: 0 });
  const [startElementPos, setStartElementPos] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent, handle: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeHandle(handle);
    setStartPos({ x: e.clientX, y: e.clientY });
    setStartSize({ width: elementSize.width, height: elementSize.height });
    setStartElementPos({ x: elementPosition.x, y: elementPosition.y });
  };

  useEffect(() => {
    if (!isResizing || !resizeHandle) return;

    const handleMouseMove = (e: MouseEvent) => {
      const pageElement = elementRef.current?.closest('.presentation-page');
      if (!pageElement) return;

      const pageRect = pageElement.getBoundingClientRect();
      const deltaX = e.clientX - startPos.x;
      const deltaY = e.clientY - startPos.y;

      let newWidth = startSize.width;
      let newHeight = startSize.height;
      let newX = startElementPos.x;
      let newY = startElementPos.y;

      switch (resizeHandle) {
        case 'se': // Southeast (bottom-right)
          newWidth = Math.max(minWidth, startSize.width + deltaX);
          newHeight = Math.max(minHeight, startSize.height + deltaY);
          break;
        case 'sw': // Southwest (bottom-left)
          newWidth = Math.max(minWidth, startSize.width - deltaX);
          newHeight = Math.max(minHeight, startSize.height + deltaY);
          newX = startElementPos.x + (startSize.width - newWidth);
          break;
        case 'ne': // Northeast (top-right)
          newWidth = Math.max(minWidth, startSize.width + deltaX);
          newHeight = Math.max(minHeight, startSize.height - deltaY);
          newY = startElementPos.y + (startSize.height - newHeight);
          break;
        case 'nw': // Northwest (top-left)
          newWidth = Math.max(minWidth, startSize.width - deltaX);
          newHeight = Math.max(minHeight, startSize.height - deltaY);
          newX = startElementPos.x + (startSize.width - newWidth);
          newY = startElementPos.y + (startSize.height - newHeight);
          break;
        case 'e': // East (right)
          newWidth = Math.max(minWidth, startSize.width + deltaX);
          break;
        case 'w': // West (left)
          newWidth = Math.max(minWidth, startSize.width - deltaX);
          newX = startElementPos.x + (startSize.width - newWidth);
          break;
        case 's': // South (bottom)
          newHeight = Math.max(minHeight, startSize.height + deltaY);
          break;
        case 'n': // North (top)
          newHeight = Math.max(minHeight, startSize.height - deltaY);
          newY = startElementPos.y + (startSize.height - newHeight);
          break;
      }

      // Snap to grid
      newWidth = snapToGrid(newWidth);
      newHeight = snapToGrid(newHeight);
      newX = snapToGrid(newX);
      newY = snapToGrid(newY);

      // Keep within page bounds
      const maxX = pageRect.width - newWidth;
      const maxY = pageRect.height - newHeight;
      newX = Math.max(0, Math.min(newX, maxX));
      newY = Math.max(0, Math.min(newY, maxY));

      onResize({ width: newWidth, height: newHeight }, { x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeHandle(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, resizeHandle, startPos, startSize, startElementPos, elementRef, onResize, minWidth, minHeight]);

  return (
    <>
      {/* Corner handles */}
      <div
        className="resize-handle resize-handle--nw"
        onMouseDown={(e) => handleMouseDown(e, 'nw')}
      />
      <div
        className="resize-handle resize-handle--ne"
        onMouseDown={(e) => handleMouseDown(e, 'ne')}
      />
      <div
        className="resize-handle resize-handle--sw"
        onMouseDown={(e) => handleMouseDown(e, 'sw')}
      />
      <div
        className="resize-handle resize-handle--se"
        onMouseDown={(e) => handleMouseDown(e, 'se')}
      />
      {/* Edge handles */}
      <div
        className="resize-handle resize-handle--n"
        onMouseDown={(e) => handleMouseDown(e, 'n')}
      />
      <div
        className="resize-handle resize-handle--s"
        onMouseDown={(e) => handleMouseDown(e, 's')}
      />
      <div
        className="resize-handle resize-handle--e"
        onMouseDown={(e) => handleMouseDown(e, 'e')}
      />
      <div
        className="resize-handle resize-handle--w"
        onMouseDown={(e) => handleMouseDown(e, 'w')}
      />
    </>
  );
};

export default ResizeHandles;
