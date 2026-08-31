"use client";

import { useState, useRef, useEffect } from "react";
import { PresentationElement } from "@/shared/interfaces";
import ResizeHandles from "../presentation-board/resize-handles";
import { snapToGrid } from "@/utils/gridUtils";

interface ImageElementProps {
  element: PresentationElement;
  isEditing?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
  onUpdate?: (updates: any) => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  zIndex?: number;
  pageId: string;
}

const ImageElement = ({ element, isEditing = false, isSelected = false, onSelect, onUpdate, onContextMenu, zIndex, pageId }: ImageElementProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const elementRef = useRef<HTMLDivElement>(null);

  const handleClick = (e: React.MouseEvent) => {
    if (!isEditing) return;
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.closest('button') || target.closest('.image-element__change')) {
      return;
    }
    onSelect?.();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isEditing) return;
    // Don't drag if clicking on file input or change button
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.closest('button') || target.closest('.image-element__change')) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    
    if (!isSelected) {
      onSelect?.();
    }
    
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
      if (!isMouseDown || !isSelected) return;
      
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
          return;
        }
      }
      
      if (isDragging) {
        const rawX = currentX - dragOffset.x;
        const rawY = currentY - dragOffset.y;
        
        const snappedX = snapToGrid(rawX);
        const snappedY = snapToGrid(rawY);
        
        // Constrain to page bounds with padding to prevent overlap
        const padding = 10;
        const constrainedX = Math.max(padding, Math.min(snappedX, pageRect.width - element.size.width - padding));
        const constrainedY = Math.max(padding, Math.min(snappedY, pageRect.height - element.size.height - padding));
        
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
  }, [isDragging, isMouseDown, isSelected, dragOffset, dragStartPos, element.size, element.position, onUpdate]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      onUpdate?.({ content: result });
    };
    reader.readAsDataURL(file);
  };

  const handleImageClick = (e: React.MouseEvent) => {
    if (isEditing && !element.content) {
      fileInputRef.current?.click();
    } else if (isEditing) {
      handleClick(e);
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

  // Don't render if content is empty and not editing
  if (!element.content || element.content.trim() === '') {
    if (!isEditing) return null;
    
    return (
      <div
        ref={elementRef}
        className={`image-element ${isSelected ? 'selected' : ''} empty`}
        style={{
          position: 'absolute',
          left: `${element.position.x}px`,
          top: `${element.position.y}px`,
          width: `${element.size.width}px`,
          height: `${element.size.height}px`,
          border: '2px dashed #ccc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f5f5f5',
          cursor: 'pointer',
        }}
        onClick={handleImageClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />
        <span style={{ color: '#999' }}>
          {element.type === 'gif' ? 'Click to upload GIF' : 
           element.type === 'animation' ? 'Click to upload animation' : 
           'Click to upload image'}
        </span>
      </div>
    );
  }

  return (
    <div
      ref={elementRef}
      className={`image-element ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''}`}
      style={{
        position: 'absolute',
        left: `${element.position.x}px`,
        top: `${element.position.y}px`,
        width: `${element.size.width}px`,
        height: `${element.size.height}px`,
        cursor: isEditing ? (isDragging ? 'grabbing' : 'grab') : 'default',
        zIndex: zIndex !== undefined ? zIndex : 'auto',
      }}
      onClick={handleImageClick}
      onMouseDown={handleMouseDown}
      onContextMenu={onContextMenu}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={element.type === 'gif' ? 'image/gif' : element.type === 'animation' ? 'image/*,.json' : 'image/*'}
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />
      {element.type === 'gif' || element.type === 'animation' ? (
        <img
          src={element.content || undefined}
          alt={element.type === 'gif' ? 'GIF' : 'Animation'}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            pointerEvents: 'none',
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      ) : (
        <img
          src={element.content || undefined}
          alt="Presentation image"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            pointerEvents: 'none',
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      )}
      {isEditing && isSelected && (
        <>
          <div
            style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              background: 'rgba(0,0,0,0.7)',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer',
              zIndex: 10,
            }}
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            Change
          </div>
          <ResizeHandles
            elementRef={elementRef}
            elementSize={element.size}
            elementPosition={element.position}
            onResize={handleResize}
          />
        </>
      )}
    </div>
  );
};

export default ImageElement;
