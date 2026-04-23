"use client";

import { useState, useEffect, useMemo } from "react";
import { usePresentationRoom } from "@/contexts/PresentationRoomContext";
import { usePresentationSocket } from "@/contexts/PresentationSocketContext";
import PresentationEditor from "./presentation-editor";
import PresentationViewer from "./presentation-viewer";
import PresentationLoadingScreen from "./PresentationLoadingScreen";
import { PresentationInfo } from "@/shared/interfaces";

interface PresentationBoardProps {
  presentationId: string;
}

const PresentationBoard = ({ presentationId }: PresentationBoardProps) => {
  const socket = usePresentationSocket();
  const { presentationInfo, userInfo, setPresentationInfo, setShowErrorPopup } = usePresentationRoom();
  
  const [mounted, setMounted] = useState(false);
  const [isViewerMode, setIsViewerMode] = useState(false);

  const isOwner = userInfo.lobby && presentationInfo?.owner === Number(userInfo.lobby.userID);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!userInfo.lobby) return;

    const nickname = localStorage.getItem("presentationNickname");
    const lobby = userInfo.lobby;

    if (nickname && lobby) {
      socket.emit("joinPresentation", {
        nickname,
        presentationId,
        lobby,
        avatarSeed: "",
      });
    }

    const heartbeatInterval = setInterval(() => {
      socket.emit("heartbeat");
    }, 30000);

    const handleInitializePresentation = (data: PresentationInfo) => {
      setPresentationInfo(data);
      setIsViewerMode(data.participants[userInfo.lobby.userID]?.isViewer || false);
    };

    const handlePageUpdated = (data: PresentationInfo) => {
      setPresentationInfo(data);
    };

    const handlePageAdded = (data: PresentationInfo) => {
      setPresentationInfo(data);
      // Backend already sets currentPage to the new page
    };

    const handlePageDeleted = (data: PresentationInfo) => {
      setPresentationInfo(data);
    };

    const handlePagesReordered = (data: PresentationInfo) => {
      setPresentationInfo(data);
    };

    const handleElementAdded = (data: PresentationInfo) => {
      setPresentationInfo(data);
    };

    const handleElementUpdated = (data: PresentationInfo) => {
      setPresentationInfo(data);
    };

    const handleElementDeleted = (data: PresentationInfo) => {
      setPresentationInfo(data);
    };

    const handleCurrentPageChanged = (data: PresentationInfo) => {
      setPresentationInfo(data);
    };

    const handleEncounteredError = (data: any) => {
      console.error("Presentation error:", data);
      setShowErrorPopup(true);
    };

    socket.on("initializePresentation", handleInitializePresentation);
    socket.on("pageUpdated", handlePageUpdated);
    socket.on("pageAdded", handlePageAdded);
    socket.on("pageDeleted", handlePageDeleted);
    socket.on("pagesReordered", handlePagesReordered);
    socket.on("elementAdded", handleElementAdded);
    socket.on("elementUpdated", handleElementUpdated);
    socket.on("elementDeleted", handleElementDeleted);
    socket.on("currentPageChanged", handleCurrentPageChanged);
    socket.on("encounteredError", handleEncounteredError);

    return () => {
      clearInterval(heartbeatInterval);
      socket.off("initializePresentation", handleInitializePresentation);
      socket.off("pageUpdated", handlePageUpdated);
      socket.off("pageAdded", handlePageAdded);
      socket.off("pageDeleted", handlePageDeleted);
      socket.off("pagesReordered", handlePagesReordered);
      socket.off("elementAdded", handleElementAdded);
      socket.off("elementUpdated", handleElementUpdated);
      socket.off("elementDeleted", handleElementDeleted);
      socket.off("currentPageChanged", handleCurrentPageChanged);
      socket.off("encounteredError", handleEncounteredError);
    };
  }, [socket, presentationId, userInfo.lobby]);

  if (!mounted) return null;
  
  if (!presentationInfo || !presentationInfo.pages) {
    return <PresentationLoadingScreen />;
  }

  // Owner sees editor, viewers see viewer mode
  const shouldShowEditor = isOwner && !isViewerMode;

  return (
    <div className="presentation-board-container">
      {shouldShowEditor ? (
        <PresentationEditor presentationId={presentationId} />
      ) : (
        <PresentationViewer presentationId={presentationId} />
      )}
    </div>
  );
};

export default PresentationBoard;
