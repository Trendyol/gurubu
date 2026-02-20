"use client";

import { useEffect, useRef } from "react";
import { getCurrentRetroLobby, saveRetroToHistory, markRetroStarted } from "@/shared/helpers/lobbyStorage";
import toast from "react-hot-toast";

interface UseRetroSocketEventsParams {
  socket: any;
  roomId: string;
  avatarSeed: string;
  userInfo: any;
  setRetroInfo: (data: any) => void;
  setShowErrorPopup: (show: boolean) => void;
  setBoardImages: React.Dispatch<React.SetStateAction<Array<{id: string, src: string, x: number, y: number, width: number, height: number}>>>;
  setColumnHeaderImages: React.Dispatch<React.SetStateAction<Record<string, string | null>>>;
  setColumnHeaderImagePositions: React.Dispatch<React.SetStateAction<Record<string, { x: number; y: number }>>>;
  setCurrentNickname: (nickname: string) => void;
  setNewNickname: (nickname: string) => void;
  setCursors: React.Dispatch<React.SetStateAction<Record<string, { x: number; y: number; nickname: string; avatarSeed?: string }>>>;
  setEndRetroReport: (report: string | null) => void;
  setShowEndRetroModal: (show: boolean) => void;
  setFloatingEmotes: React.Dispatch<React.SetStateAction<Array<{id: string, emoji: string, nickname: string, x: number}>>>;
  triggerConfettiAnimation: () => void;
}

export const useRetroSocketEvents = ({
  socket,
  roomId,
  avatarSeed,
  userInfo,
  setRetroInfo,
  setShowErrorPopup,
  setBoardImages,
  setColumnHeaderImages,
  setColumnHeaderImagePositions,
  setCurrentNickname,
  setNewNickname,
  setCursors,
  setEndRetroReport,
  setShowEndRetroModal,
  setFloatingEmotes,
  triggerConfettiAnimation,
}: UseRetroSocketEventsParams) => {
  const emoteIdCounter = useRef(0);

  useEffect(() => {
    const nickname = localStorage.getItem("retroNickname");
    const lobby = getCurrentRetroLobby(roomId);

    if (nickname && lobby) {
      socket.emit("joinRetro", {
        nickname,
        retroId: roomId,
        lobby,
        avatarSeed,
      });
    }

    const heartbeatInterval = setInterval(() => {
      socket.emit("heartbeat");
    }, 10000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        socket.emit("heartbeat");
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    let lastActivityHeartbeat = 0;
    const handleUserActivity = () => {
      const now = Date.now();
      if (now - lastActivityHeartbeat > 60000) {
        lastActivityHeartbeat = now;
        socket.emit("heartbeat");
      }
    };
    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);

    const handleInitializeRetro = (data: any) => {
      setRetroInfo(data);
      if (data.boardImages) setBoardImages(data.boardImages);
      if (data.columnHeaderImages) setColumnHeaderImages(data.columnHeaderImages);
      if (data.columnHeaderImagePositions) setColumnHeaderImagePositions(data.columnHeaderImagePositions);
      if (data?.title) {
        saveRetroToHistory(roomId, data.title, data.templateId, true);
        markRetroStarted(roomId);
      }
    };
    const handleAddRetroCard = (data: any) => setRetroInfo(data);
    const handleUpdateRetroCard = (data: any) => setRetroInfo(data);
    const handleDeleteRetroCard = (data: any) => setRetroInfo(data);
    const handleUpdateRetroTimer = (data: any) => setRetroInfo(data);
    const handleUpdateRetroMusic = (data: any) => setRetroInfo(data);

    const handleUserDisconnectedCursor = (data: any) => {
      if (data?.participants) {
        setCursors(prev => {
          const activeCursors = { ...prev };
          const activeUserIds = new Set(
            Object.values(data.participants)
              .filter((p: any) => p.connected !== false)
              .map((p: any) => String(p.userID))
          );
          Object.keys(activeCursors).forEach(userId => {
            if (!activeUserIds.has(userId)) {
              delete activeCursors[userId];
            }
          });
          return activeCursors;
        });
      }
    };

    const handleUserDisconnected = (data: any) => {
      setRetroInfo(data);
      handleUserDisconnectedCursor(data);
    };
    const handleAvatarUpdated = (data: any) => setRetroInfo(data.retroData);

    const handleCursorMove = (data: { userId: string; x: number; y: number; nickname: string; avatarSeed?: string }) => {
      if (userInfo.lobby && String(data.userId) === String(userInfo.lobby.userID)) return;
      setCursors(prev => ({
        ...prev,
        [data.userId]: { x: data.x, y: data.y, nickname: data.nickname, avatarSeed: data.avatarSeed }
      }));
    };

    const handleCursorLeave = (data: { userId: string }) => {
      setCursors(prev => {
        const newCursors = { ...prev };
        delete newCursors[data.userId];
        return newCursors;
      });
    };

    const handleNicknameUpdated = (data: { userID: number; oldNickname: string; newNickname: string; retroData: any }) => {
      setRetroInfo(data.retroData);
      if (userInfo.lobby && data.userID === userInfo.lobby.userID) {
        setCurrentNickname(data.newNickname);
        setNewNickname(data.newNickname);
      }
    };

    const handleBoardImagesUpdated = (data: any) => setBoardImages(data.boardImages || []);
    const handleColumnHeaderImagesUpdated = (data: any) => setColumnHeaderImages(data.columnHeaderImages || {});
    const handleColumnHeaderImagePositionUpdated = (data: any) => {
      if (data.columnKey && data.position) {
        setColumnHeaderImagePositions(prev => ({ ...prev, [data.columnKey]: data.position }));
      }
    };

    const handleMentioned = (data: { cardId: string; mentionedBy: string }) => {
      toast.success(`${data.mentionedBy} mentioned you in a card!`, { duration: 4000, icon: '👋' });
    };
    const handleEncounteredError = (data: any) => {
      console.error("Retro error:", data);
      setShowErrorPopup(true);
    };
    const handleConfettiTriggered = () => triggerConfettiAnimation();
    const handleAfkStatusUpdated = (data: any) => setRetroInfo(data.retroData);
    const handleCardsRevealed = (data: any) => setRetroInfo(data);
    const handleUserCardsRevealed = (data: any) => setRetroInfo(data);
    const handleCardsHidden = (data: any) => setRetroInfo(data);
    const handleCardsImported = (data: any) => {
      setRetroInfo(data);
      toast.success("Cards imported successfully!", { duration: 3000, icon: '📥' });
    };
    const handleRetroEnded = (data: { retroData: any; report: string }) => {
      setRetroInfo(data.retroData);
      setEndRetroReport(data.report);
      setShowEndRetroModal(true);
    };
    const handleEmoteReaction = (data: { emoji: string; nickname: string; userId: string }) => {
      const id = `emote-${Date.now()}-${emoteIdCounter.current++}`;
      const x = 10 + Math.random() * 80;
      setFloatingEmotes(prev => [...prev, { id, emoji: data.emoji, nickname: data.nickname, x }]);
      setTimeout(() => {
        setFloatingEmotes(prev => prev.filter(e => e.id !== id));
      }, 3000);
    };

    socket.on("initializeRetro", handleInitializeRetro);
    socket.on("addRetroCard", handleAddRetroCard);
    socket.on("updateRetroCard", handleUpdateRetroCard);
    socket.on("deleteRetroCard", handleDeleteRetroCard);
    socket.on("updateRetroTimer", handleUpdateRetroTimer);
    socket.on("updateRetroMusic", handleUpdateRetroMusic);
    socket.on("cursorMove", handleCursorMove);
    socket.on("cursorLeave", handleCursorLeave);
    socket.on("userDisconnectedRetro", handleUserDisconnected);
    socket.on("avatarUpdated", handleAvatarUpdated);
    socket.on("nicknameUpdated", handleNicknameUpdated);
    socket.on("boardImagesUpdated", handleBoardImagesUpdated);
    socket.on("columnHeaderImagesUpdated", handleColumnHeaderImagesUpdated);
    socket.on("columnHeaderImagePositionUpdated", handleColumnHeaderImagePositionUpdated);
    socket.on("mentioned", handleMentioned);
    socket.on("encounteredError", handleEncounteredError);
    socket.on("confettiTriggered", handleConfettiTriggered);
    socket.on("afkStatusUpdated", handleAfkStatusUpdated);
    socket.on("cardsRevealed", handleCardsRevealed);
    socket.on("userCardsRevealed", handleUserCardsRevealed);
    socket.on("cardsHidden", handleCardsHidden);
    socket.on("cardsImported", handleCardsImported);
    socket.on("emoteReaction", handleEmoteReaction);
    socket.on("retroEnded", handleRetroEnded);

    return () => {
      clearInterval(heartbeatInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      socket.off("initializeRetro", handleInitializeRetro);
      socket.off("addRetroCard", handleAddRetroCard);
      socket.off("updateRetroCard", handleUpdateRetroCard);
      socket.off("deleteRetroCard", handleDeleteRetroCard);
      socket.off("updateRetroTimer", handleUpdateRetroTimer);
      socket.off("updateRetroMusic", handleUpdateRetroMusic);
      socket.off("cursorMove", handleCursorMove);
      socket.off("cursorLeave", handleCursorLeave);
      socket.off("userDisconnectedRetro", handleUserDisconnected);
      socket.off("avatarUpdated", handleAvatarUpdated);
      socket.off("nicknameUpdated", handleNicknameUpdated);
      socket.off("boardImagesUpdated", handleBoardImagesUpdated);
      socket.off("columnHeaderImagesUpdated", handleColumnHeaderImagesUpdated);
      socket.off("columnHeaderImagePositionUpdated", handleColumnHeaderImagePositionUpdated);
      socket.off("mentioned", handleMentioned);
      socket.off("encounteredError", handleEncounteredError);
      socket.off("confettiTriggered", handleConfettiTriggered);
      socket.off("afkStatusUpdated", handleAfkStatusUpdated);
      socket.off("cardsRevealed", handleCardsRevealed);
      socket.off("userCardsRevealed", handleUserCardsRevealed);
      socket.off("cardsHidden", handleCardsHidden);
      socket.off("cardsImported", handleCardsImported);
      socket.off("emoteReaction", handleEmoteReaction);
      socket.off("retroEnded", handleRetroEnded);
    };
  }, [socket, roomId, avatarSeed]);
};
