"use client";

import { useState, useRef, useEffect } from "react";
import { usePresentationRoom } from "@/contexts/PresentationRoomContext";

interface PresentationCameraProps {
  presentationId: string;
}

const PresentationCamera = ({ presentationId }: PresentationCameraProps) => {
  const { userInfo } = usePresentationRoom();
  const [isEnabled, setIsEnabled] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 120, height: 120 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize position on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPosition({ 
        x: window.innerWidth - size.width - 20, 
        y: window.innerHeight - size.height - 20 
      });
    }
  }, []);

  useEffect(() => {
    if (isEnabled) {
      // Request camera access
      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then((stream) => {
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((error) => {
          console.error("Error accessing camera:", error);
          setIsEnabled(false);
          alert("Could not access camera. Please check permissions.");
        });
    } else {
      // Stop camera stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isEnabled]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isEnabled) return;
    const target = e.target as HTMLElement;
    
    // Don't drag if clicking the close button or resize handle
    if (target.closest('.presentation-camera__close')) return;
    if (target.closest('.presentation-camera__resize')) {
      e.preventDefault();
      e.stopPropagation();
      setIsResizing(true);
      setResizeStart({
        x: e.clientX,
        y: e.clientY,
        width: size.width,
        height: size.height,
      });
      return;
    }
    
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  useEffect(() => {
    if (!isDragging && !isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;
        
        // Keep within viewport bounds
        const maxX = window.innerWidth - size.width;
        const maxY = window.innerHeight - size.height;
        
        setPosition({
          x: Math.max(0, Math.min(newX, maxX)),
          y: Math.max(0, Math.min(newY, maxY)),
        });
      } else if (isResizing) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;
        const newSize = Math.max(80, Math.min(400, resizeStart.width + deltaX));
        setSize({ width: newSize, height: newSize });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragOffset, resizeStart, size]);

  const toggleCamera = () => {
    setIsEnabled(!isEnabled);
  };

  if (!isEnabled) {
    return (
      <button
        className="presentation-camera__toggle"
        onClick={toggleCamera}
        title="Enable camera"
      >
        📹
      </button>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`presentation-camera presentation-camera--circular ${isDragging ? 'dragging' : ''} ${isResizing ? 'resizing' : ''}`}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        zIndex: 1000,
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="presentation-camera__video-wrapper">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="presentation-camera__video"
        />
      </div>
      <button
        className="presentation-camera__close"
        onClick={toggleCamera}
        title="Disable camera"
      >
        ×
      </button>
      <div
        className="presentation-camera__resize"
        title="Resize camera"
      />
    </div>
  );
};

export default PresentationCamera;
