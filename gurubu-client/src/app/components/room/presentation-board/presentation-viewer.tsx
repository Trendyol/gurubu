"use client";

import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { usePresentationRoom } from "@/contexts/PresentationRoomContext";
import { usePresentationSocket } from "@/contexts/PresentationSocketContext";
import PresentationPage from "./presentation-page";
import PresentationNavigation from "./presentation-navigation";
import PresentationProgress from "./presentation-progress";
import PresentationCamera from "./presentation-camera";

interface PresentationViewerProps {
  presentationId: string;
}

const PresentationViewer = ({ presentationId }: PresentationViewerProps) => {
  const { presentationInfo, userInfo } = usePresentationRoom();
  const socket = usePresentationSocket();
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

  const handlePreviousPage = () => {
    if (!userInfo.lobby || !presentationInfo) return;
    const newIndex = Math.max(0, (presentationInfo.currentPage || 0) - 1);
    socket.emit("setCurrentPage", presentationId, newIndex, userInfo.lobby.credentials);
  };

  const handleNextPage = () => {
    if (!userInfo.lobby || !presentationInfo) return;
    const newIndex = Math.min(
      presentationInfo.pages.length - 1,
      (presentationInfo.currentPage || 0) + 1
    );
    socket.emit("setCurrentPage", presentationId, newIndex, userInfo.lobby.credentials);
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        handlePreviousPage();
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        handleNextPage();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [presentationInfo, userInfo.lobby]);

  return (
    <div className="presentation-viewer">
      <div className="presentation-viewer__main">
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
                key={`viewer-${currentPage.id}-${presentationInfo.currentPage}`}
                page={currentPage}
                isEditing={false}
                pageKey={presentationInfo.currentPage}
                presentationId={presentationId}
              />
            </div>
          )}
        </AnimatePresence>
      </div>

      <PresentationNavigation
        onPreviousPage={handlePreviousPage}
        onNextPage={handleNextPage}
        canGoPrevious={(presentationInfo?.currentPage || 0) > 0}
        canGoNext={(presentationInfo?.currentPage || 0) < (presentationInfo?.pages?.length || 0) - 1}
      />

      <PresentationProgress
        currentPage={presentationInfo?.currentPage || 0}
        totalPages={presentationInfo?.pages?.length || 0}
        onPreviousPage={handlePreviousPage}
        onNextPage={handleNextPage}
      />
    </div>
  );
};

export default PresentationViewer;
