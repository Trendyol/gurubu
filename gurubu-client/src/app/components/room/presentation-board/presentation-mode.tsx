"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { usePresentationRoom } from "@/contexts/PresentationRoomContext";
import { usePresentationSocket } from "@/contexts/PresentationSocketContext";
import PresentationPage from "./presentation-page";
import PresentationCamera from "./presentation-camera";
import { IconX, IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

interface PresentationModeProps {
  presentationId: string;
  onExit: () => void;
}

const PresentationMode = ({ presentationId, onExit }: PresentationModeProps) => {
  const { presentationInfo, userInfo } = usePresentationRoom();
  const socket = usePresentationSocket();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [scale, setScale] = useState(1);

  const currentPage = presentationInfo?.pages?.[presentationInfo.currentPage || 0];

  // Calculate scale to fit viewport
  useEffect(() => {
    const calculateScale = () => {
      const baseWidth = 960;
      const baseHeight = 540;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      const scaleX = viewportWidth / baseWidth;
      const scaleY = viewportHeight / baseHeight;
      const newScale = Math.min(scaleX, scaleY);
      
      setScale(newScale);
    };

    calculateScale();
    window.addEventListener('resize', calculateScale);
    return () => window.removeEventListener('resize', calculateScale);
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      ));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    const enterFullscreen = async () => {
      try {
        const element = document.documentElement;
        if (element.requestFullscreen) {
          await element.requestFullscreen();
        } else if ((element as any).webkitRequestFullscreen) {
          await (element as any).webkitRequestFullscreen();
        } else if ((element as any).mozRequestFullScreen) {
          await (element as any).mozRequestFullScreen();
        } else if ((element as any).msRequestFullscreen) {
          await (element as any).msRequestFullscreen();
        }
      } catch (err) {
        console.error('Failed to enter fullscreen:', err);
        // If fullscreen fails, still show presentation mode
      }
    };
    
    // Small delay to ensure component is mounted
    const timer = setTimeout(() => {
      enterFullscreen();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const handlePreviousPage = useCallback(() => {
    if (!userInfo.lobby || !presentationInfo) return;
    const newIndex = Math.max(0, (presentationInfo.currentPage || 0) - 1);
    socket.emit("setCurrentPage", presentationId, newIndex, userInfo.lobby.credentials);
  }, [userInfo.lobby, presentationInfo, presentationId, socket]);

  const handleNextPage = useCallback(() => {
    if (!userInfo.lobby || !presentationInfo) return;
    const newIndex = Math.min(
      presentationInfo.pages.length - 1,
      (presentationInfo.currentPage || 0) + 1
    );
    socket.emit("setCurrentPage", presentationId, newIndex, userInfo.lobby.credentials);
  }, [userInfo.lobby, presentationInfo, presentationId, socket]);

  const handleExit = useCallback(async () => {
    // Exit fullscreen first
    try {
      const isFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );

      if (isFullscreen) {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).mozCancelFullScreen) {
          await (document as any).mozCancelFullScreen();
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen();
        }
      }
    } catch (err) {
      console.error('Failed to exit fullscreen:', err);
    }
    
    // Then exit presentation mode
    onExit();
  }, [onExit]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Prevent default browser behavior for these keys
      if (e.key === 'Escape' || e.key === 'ArrowLeft' || e.key === 'ArrowUp' || 
          e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
      }

      if (e.key === 'Escape') {
        handleExit();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        handlePreviousPage();
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
        handleNextPage();
      }
    };

    // Use capture phase to ensure we catch the event first
    window.addEventListener('keydown', handleKeyPress, true);
    return () => window.removeEventListener('keydown', handleKeyPress, true);
  }, [handleExit, handlePreviousPage, handleNextPage]);

  const canGoPrevious = (presentationInfo?.currentPage || 0) > 0;
  const canGoNext = (presentationInfo?.currentPage || 0) < (presentationInfo?.pages?.length || 0) - 1;

  return (
    <div className="presentation-mode">
      <div className="presentation-mode__controls">
        <button
          className="presentation-mode__exit"
          onClick={handleExit}
          title="Exit presentation mode (ESC)"
        >
          <IconX size={20} />
        </button>
        <div className="presentation-mode__navigation">
          <button
            className="presentation-mode__nav-btn"
            onClick={handlePreviousPage}
            disabled={!canGoPrevious}
            title="Previous slide (←)"
          >
            <IconChevronLeft size={24} />
          </button>
          <span className="presentation-mode__page-info">
            {(presentationInfo?.currentPage || 0) + 1} / {presentationInfo?.pages?.length || 0}
          </span>
          <button
            className="presentation-mode__nav-btn"
            onClick={handleNextPage}
            disabled={!canGoNext}
            title="Next slide (→)"
          >
            <IconChevronRight size={24} />
          </button>
        </div>
      </div>

      <div className="presentation-mode__content">
        <AnimatePresence mode="wait">
          {currentPage && (
            <div
              style={{
                transform: `scale(${scale})`,
                transformOrigin: 'center center',
                width: '960px',
                height: '540px',
              }}
            >
              <PresentationPage
                key={`mode-${currentPage.id}-${presentationInfo.currentPage}`}
                page={currentPage}
                isEditing={false}
                pageKey={presentationInfo.currentPage}
                presentationId={presentationId}
              />
            </div>
          )}
        </AnimatePresence>
      </div>

      <PresentationCamera presentationId={presentationId} />
    </div>
  );
};

export default PresentationMode;
