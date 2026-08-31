"use client";

import { useState, useRef, useEffect } from "react";
import { PresentationElement } from "@/shared/interfaces";
import { usePresentationRoom } from "@/contexts/PresentationRoomContext";
import { usePresentationSocket } from "@/contexts/PresentationSocketContext";
import ResizeHandles from "../presentation-board/resize-handles";
import { snapToGrid } from "@/utils/gridUtils";

interface TableElementProps {
  element: PresentationElement;
  isEditing?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
  onUpdate?: (updates: any) => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  onEditData?: () => void;
  zIndex?: number;
  pageId: string;
  presentationId?: string;
}

const TableElement = ({ element, isEditing = false, isSelected = false, onSelect, onUpdate, onContextMenu, onEditData, zIndex, pageId, presentationId }: TableElementProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const elementRef = useRef<HTMLDivElement>(null);
  const { presentationInfo, userInfo } = usePresentationRoom();
  const socket = usePresentationSocket();
  const tableData = element.style?.tableData || [
    ['Header 1', 'Header 2', 'Header 3'],
    ['Row 1 Col 1', 'Row 1 Col 2', 'Row 1 Col 3'],
    ['Row 2 Col 1', 'Row 2 Col 2', 'Row 2 Col 3'],
  ];

  const handleClick = (e: React.MouseEvent) => {
    if (!isEditing) return;
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TD' || target.tagName === 'TH') {
      return;
    }
    onSelect?.();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isEditing) return;
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TD' || target.tagName === 'TH') {
      return;
    }
    e.stopPropagation();
    setIsMouseDown(true);
    setDragStartPos({ x: e.clientX, y: e.clientY });
    const rect = elementRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  useEffect(() => {
    if (!isMouseDown) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isEditing || !elementRef.current) return;
      const deltaX = Math.abs(e.clientX - dragStartPos.x);
      const deltaY = Math.abs(e.clientY - dragStartPos.y);
      
      if (deltaX > 5 || deltaY > 5) {
        setIsDragging(true);
      }

      if (isDragging && onUpdate) {
        const pageElement = elementRef.current?.closest('.presentation-page');
        if (!pageElement) return;
        const pageRect = pageElement.getBoundingClientRect();
        const rawX = e.clientX - pageRect.left - dragOffset.x;
        const rawY = e.clientY - pageRect.top - dragOffset.y;
        const snappedX = snapToGrid(rawX);
        const snappedY = snapToGrid(rawY);
        // Constrain to page bounds with padding to prevent overlap
        const padding = 10;
        const constrainedX = Math.max(padding, Math.min(snappedX, pageRect.width - element.size.width - padding));
        const constrainedY = Math.max(padding, Math.min(snappedY, pageRect.height - element.size.height - padding));
        onUpdate({ position: { x: constrainedX, y: constrainedY } });
      }
    };

    const handleMouseUp = () => {
      setIsMouseDown(false);
      setTimeout(() => setIsDragging(false), 0);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isMouseDown, isDragging, dragOffset, dragStartPos, isEditing, onUpdate]);

  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    if (userInfo.lobby && presentationId) {
      const newData = tableData.map((row, rIdx) => 
        rIdx === rowIndex 
          ? row.map((cell, cIdx) => cIdx === colIndex ? value : cell)
          : row
      );
      socket.emit("updateElement",
        presentationId,
        pageId,
        element.id,
        { style: { ...element.style, tableData: newData } },
        userInfo.lobby.credentials
      );
    }
  };

  const handleResize = (newSize: { width: number; height: number }, newPosition?: { x: number; y: number }) => {
    const updates: any = { 
      size: {
        width: snapToGrid(newSize.width),
        height: snapToGrid(newSize.height),
      }
    };
    if (newPosition) {
      updates.position = {
        x: snapToGrid(newPosition.x),
        y: snapToGrid(newPosition.y),
      };
    }
    onUpdate?.(updates);
  };

  if (isEditing) {
    return (
      <div
        ref={elementRef}
        className={`table-element ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''}`}
        style={{
          position: 'absolute',
          left: `${element.position.x}px`,
          top: `${element.position.y}px`,
          width: `${element.size.width}px`,
          height: `${element.size.height}px`,
          cursor: isDragging ? 'grabbing' : 'default',
          zIndex: zIndex !== undefined ? zIndex : 'auto',
        }}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onContextMenu={onContextMenu}
      >
        {isSelected && onEditData && (
          <div className="table-element__edit-overlay">
            <button
              className="table-element__edit-btn"
              onClick={(e) => {
                e.stopPropagation();
                onEditData();
              }}
            >
              Edit Table Data
            </button>
          </div>
        )}
        <table className="table-element__table">
          <thead>
            <tr>
              {tableData[0]?.map((header, colIndex) => (
                <th key={colIndex}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.slice(1).map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, colIndex) => (
                  <td key={colIndex}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {isSelected && (
          <ResizeHandles
            elementRef={elementRef}
            currentSize={element.size}
            currentPosition={element.position}
            onResize={handleResize}
          />
        )}
      </div>
    );
  }

  return (
    <div
      ref={elementRef}
      className="table-element"
      style={{
        position: 'absolute',
        left: `${element.position.x}px`,
        top: `${element.position.y}px`,
        width: `${element.size.width}px`,
        height: `${element.size.height}px`,
        zIndex: zIndex !== undefined ? zIndex : 'auto',
      }}
    >
      <table className="table-element__table">
        <thead>
          <tr>
            {tableData[0]?.map((header, colIndex) => (
              <th key={colIndex}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableData.slice(1).map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, colIndex) => (
                <td key={colIndex}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableElement;
