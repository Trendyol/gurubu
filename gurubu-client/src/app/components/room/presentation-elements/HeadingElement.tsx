"use client";

import { useState, useRef, useEffect } from "react";
import { PresentationElement } from "@/shared/interfaces";
import ResizeHandles from "../presentation-board/resize-handles";
import { snapToGrid } from "@/utils/gridUtils";

interface HeadingElementProps {
  element: PresentationElement;
  isEditing?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
  onUpdate?: (updates: any) => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  zIndex?: number;
}

const HeadingElement = ({ element, isEditing = false, isSelected = false, onSelect, onUpdate, onContextMenu, zIndex }: HeadingElementProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isEditingText, setIsEditingText] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const elementRef = useRef<HTMLDivElement>(null);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleClick = (e: React.MouseEvent) => {
    if (!isEditing) return;
    
    const target = e.target as HTMLElement;
    if (target.closest('.resize-handle')) {
      return;
    }
    
    // Single click - just select, don't start dragging
    onSelect?.();
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (!isEditing) return;
    
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
    }
    
    e.stopPropagation();
    setIsEditingText(true);
    setIsDragging(false);
    onSelect?.();
    
    setTimeout(() => {
      elementRef.current?.focus();
    }, 10);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isEditing || isEditingText) return;
    
    const target = e.target as HTMLElement;
    if (target.closest('.resize-handle')) {
      return;
    }
    
    e.preventDefault();
    e.stopPropagation();
    
    // Select element if not already selected
    if (!isSelected) {
      onSelect?.();
    }
    
    // Store initial mouse position for drag detection
    const pageElement = elementRef.current?.closest('.presentation-page');
    const pageRect = pageElement?.getBoundingClientRect();
    
    if (pageRect) {
      const mouseX = e.clientX - pageRect.left;
      const mouseY = e.clientY - pageRect.top;
      
      setDragStartPos({ x: mouseX, y: mouseY });
      setDragOffset({
        x: mouseX - element.position.x,
        y: mouseY - element.position.y,
      });
      setIsMouseDown(true);
    }
  };

  useEffect(() => {
    if (!isDragging && !isMouseDown) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isMouseDown || !isSelected || isEditingText) return;
      
      const pageElement = elementRef.current?.closest('.presentation-page');
      if (!pageElement) return;
      
      const pageRect = pageElement.getBoundingClientRect();
      const currentX = e.clientX - pageRect.left;
      const currentY = e.clientY - pageRect.top;
      
      // Check if mouse has moved enough to start dragging (threshold: 5px)
      if (!isDragging) {
        const deltaX = Math.abs(currentX - dragStartPos.x);
        const deltaY = Math.abs(currentY - dragStartPos.y);
        
        if (deltaX > 5 || deltaY > 5) {
          setIsDragging(true);
        } else {
          return; // Don't drag if threshold not met
        }
      }
      
      // Update position if dragging
      if (isDragging) {
        const rawX = currentX - dragOffset.x;
        const rawY = currentY - dragOffset.y;
        
        // Snap to grid
        const snappedX = snapToGrid(rawX);
        const snappedY = snapToGrid(rawY);
        
        // Constrain to page bounds with padding to prevent overlap
        const padding = 10;
        const constrainedX = Math.max(padding, Math.min(snappedX, pageRect.width - element.size.width - padding));
        const constrainedY = Math.max(padding, Math.min(snappedY, pageRect.height - element.size.height - padding));
        
        // Only update if position actually changed
        if (constrainedX !== element.position.x || constrainedY !== element.position.y) {
          onUpdate?.({
            position: {
              x: constrainedX,
              y: constrainedY,
            }
          });
        }
      }
    };

    const handleMouseUp = () => {
      setIsMouseDown(false);
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isMouseDown, isSelected, isEditingText, dragOffset, dragStartPos, element.size, element.position, onUpdate]);

  useEffect(() => {
    return () => {
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current);
      }
    };
  }, []);

  const handleContentChange = (e: React.FormEvent<HTMLDivElement>) => {
    if (!isEditing) return;
    const newContent = e.currentTarget.textContent || '';
    onUpdate?.({ content: newContent });
  };

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    setIsEditingText(false);
    handleContentChange(e);
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

  return (
    <div
      ref={elementRef}
      className={`heading-element ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''}`}
      style={{
        position: 'absolute',
        left: `${element.position.x}px`,
        top: `${element.position.y}px`,
        width: `${element.size.width}px`,
        height: `${element.size.height}px`,
        fontFamily: element.style.fontFamily || 'Arial',
        fontSize: `${element.style.fontSize || 48}px`,
        fontWeight: element.style.fontWeight || 'bold',
        color: element.style.color || '#000000',
        cursor: isEditing ? (isDragging ? 'grabbing' : 'grab') : 'text',
        zIndex: zIndex !== undefined ? zIndex : 'auto',
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseDown={handleMouseDown}
      onContextMenu={onContextMenu}
      contentEditable={isEditing && isEditingText && !isDragging}
      suppressContentEditableWarning={true}
      onBlur={handleBlur}
      onKeyDown={(e) => {
        if (isEditingText) {
          e.stopPropagation();
          if (e.key === 'Escape') {
            setIsEditingText(false);
            elementRef.current?.blur();
          }
        }
      }}
    >
      {element.content}
      {isEditing && isSelected && (
        <ResizeHandles
          elementRef={elementRef}
          elementSize={element.size}
          elementPosition={element.position}
          onResize={handleResize}
        />
      )}
    </div>
  );
};

export default HeadingElement;
