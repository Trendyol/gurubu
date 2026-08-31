"use client";

import { useState, useRef, useEffect } from "react";
import { PresentationElement } from "@/shared/interfaces";
import ResizeHandles from "../presentation-board/resize-handles";
import { snapToGrid } from "@/utils/gridUtils";

interface VideoElementProps {
  element: PresentationElement;
  isEditing?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
  onUpdate?: (updates: any) => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  zIndex?: number;
  pageId: string;
}

const VideoElement = ({ element, isEditing = false, isSelected = false, onSelect, onUpdate, onContextMenu, zIndex, pageId }: VideoElementProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [videoUrl, setVideoUrl] = useState(element.content || '');
  const [isDragging, setIsDragging] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const elementRef = useRef<HTMLDivElement>(null);

  const handleClick = (e: React.MouseEvent) => {
    if (!isEditing) return;
    const target = e.target as HTMLElement;
    if (target.tagName === 'BUTTON' || 
        target.tagName === 'INPUT' ||
        target.closest('button') ||
        target.closest('input') ||
        target.closest('iframe')) {
      return;
    }
    onSelect?.();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isEditing) return;
    const target = e.target as HTMLElement;
    if (target.tagName === 'BUTTON' || 
        target.tagName === 'INPUT' ||
        target.closest('button') ||
        target.closest('input') ||
        target.closest('iframe')) {
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
      setVideoUrl(result);
      onUpdate?.({ content: result });
    };
    reader.readAsDataURL(file);
  };

  const handleUrlChange = (url: string) => {
    setVideoUrl(url);
    onUpdate?.({ content: url });
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
        className={`video-element ${isSelected ? 'selected' : ''} empty`}
        style={{
          position: 'absolute',
          left: `${element.position.x}px`,
          top: `${element.position.y}px`,
          width: `${element.size.width}px`,
          height: `${element.size.height}px`,
          border: '2px dashed #ccc',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f5f5f5',
          cursor: 'pointer',
          padding: '16px',
        }}
        onClick={() => {
          const url = prompt("Enter video URL (YouTube, Vimeo, or direct link):");
          if (url) handleUrlChange(url);
        }}
        onMouseDown={handleMouseDown}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />
        <span style={{ color: '#999', marginBottom: '8px' }}>Click to add video</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
          style={{
            padding: '8px 16px',
            background: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Upload Video
        </button>
      </div>
    );
  }

  const isYouTube = element.content.includes('youtube.com') || element.content.includes('youtu.be');
  const isVimeo = element.content.includes('vimeo.com');

  const getVideoSrc = () => {
    if (isYouTube) {
      const videoId = element.content.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }
    if (isVimeo) {
      const videoId = element.content.match(/vimeo\.com\/(\d+)/)?.[1];
      return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
    }
    return element.content;
  };

  const videoSrc = getVideoSrc();

  if (!videoSrc) {
    return (
      <div
        className={`video-element ${isSelected ? 'selected' : ''}`}
        style={{
          position: 'absolute',
          left: `${element.position.x}px`,
          top: `${element.position.y}px`,
          width: `${element.size.width}px`,
          height: `${element.size.height}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f5f5f5',
          border: '2px dashed #ccc',
        }}
        onClick={isEditing ? onSelect : undefined}
      >
        <span style={{ color: '#999' }}>Invalid video URL</span>
      </div>
    );
  }

  if (isYouTube || isVimeo) {
    return (
      <div
        ref={elementRef}
        className={`video-element ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''}`}
        style={{
          position: 'absolute',
          left: `${element.position.x}px`,
          top: `${element.position.y}px`,
          width: `${element.size.width}px`,
          height: `${element.size.height}px`,
          cursor: isEditing ? (isDragging ? 'grabbing' : 'grab') : 'default',
          zIndex: zIndex !== undefined ? zIndex : 'auto',
        }}
        onClick={isEditing ? onSelect : undefined}
        onMouseDown={handleMouseDown}
        onContextMenu={onContextMenu}
      >
        <iframe
          src={videoSrc || undefined}
          width="100%"
          height="100%"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ border: 'none', borderRadius: '4px' }}
        />
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
                const url = prompt("Enter video URL:", element.content);
                if (url) handleUrlChange(url);
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
  }

  return (
    <div
      ref={elementRef}
      className={`video-element ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''}`}
      style={{
        position: 'absolute',
        left: `${element.position.x}px`,
        top: `${element.position.y}px`,
        width: `${element.size.width}px`,
        height: `${element.size.height}px`,
        cursor: isEditing ? (isDragging ? 'grabbing' : 'grab') : 'default',
        zIndex: zIndex !== undefined ? zIndex : 'auto',
      }}
      onClick={isEditing ? handleClick : undefined}
      onMouseDown={handleMouseDown}
      onContextMenu={onContextMenu}
    >
      <video
        src={element.content || undefined}
        controls
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        }}
      />
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
              const url = prompt("Enter video URL:", element.content);
              if (url) handleUrlChange(url);
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

export default VideoElement;
