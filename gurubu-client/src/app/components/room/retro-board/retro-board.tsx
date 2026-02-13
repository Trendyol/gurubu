"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRetroRoom } from "@/contexts/RetroRoomContext";
import { useRetroSocket } from "@/contexts/RetroSocketContext";
import { createAvatar } from "@dicebear/core";
import { avataaars } from "@dicebear/collection";
import RetroColumn from "./RetroColumn";
import RetroSidebar from "./RetroSidebar";
import RetroBoardImages from "./RetroBoardImages";
import RetroDeleteConfirm from "./RetroDeleteConfirm";
import RetroHeader from "./RetroHeader";
import RetroErrorPopup from "./RetroErrorPopup";
import RetroOnboarding from "./RetroOnboarding";
import RetroLoadingScreen from "./RetroLoadingScreen";
import { getCurrentRetroLobby, saveRetroToHistory, markRetroStarted } from "@/shared/helpers/lobbyStorage";
import { RetroParticipant, User } from "@/shared/interfaces";
import { RETRO_STAMPS, RETRO_CARD_TEMPLATES } from "@/constants/retroConstants";
import { copyRetroInviteLink, exportRetroToCSV, exportRetroToPDF, exportActionItemsToPDF } from "@/utils/retroUtils";
import toast from "react-hot-toast";

interface IProps {
  roomId: string;
}

type ColumnType = string;

const RetroBoard = ({ roomId }: IProps) => {
  const socket = useRetroSocket();
  const { retroInfo, userInfo, setRetroInfo, setShowErrorPopup } = useRetroRoom();
  
  const template = retroInfo?.template;
  const mainColumns = useMemo(() => 
    template?.columns?.filter((col: any) => col.isMain !== false) || [], 
    [template]
  );
  const sideColumns = useMemo(() => 
    template?.columns?.filter((col: any) => col.isMain === false) || [], 
    [template]
  );
  
  const [mounted, setMounted] = useState(false);
  const [avatarSeed, setAvatarSeed] = useState<string>("");
  const [avatarCache, setAvatarCache] = useState<Record<string, string>>({});
  const [activeColumn, setActiveColumn] = useState<ColumnType | null>(null);
  const [newCardText, setNewCardText] = useState("");
  const [newCardImage, setNewCardImage] = useState<string | null>(null);
  const [newCardColor, setNewCardColor] = useState<string | null>(null);
  const [showTimer, setShowTimer] = useState(false);
  const [showMusic, setShowMusic] = useState(false);
  const [selectedStamp, setSelectedStamp] = useState<string | null>(null);
  const [draggedCard, setDraggedCard] = useState<{color: string, emoji: string} | null>(null);
  const [draggedImage, setDraggedImage] = useState<any>(null);
  const [editingNickname, setEditingNickname] = useState(false);
  const [currentNickname, setCurrentNickname] = useState(userInfo.nickname || "");
  const [newNickname, setNewNickname] = useState(userInfo.nickname || "");
  const [customStamps, setCustomStamps] = useState<string[]>([]);
  const [cursors, setCursors] = useState<Record<string, { x: number; y: number; nickname: string; avatarSeed?: string }>>({});
  const [boardImages, setBoardImages] = useState<Array<{id: string, src: string, x: number, y: number, width: number, height: number}>>([]);
  const [draggingImage, setDraggingImage] = useState<string | null>(null);
  const [resizingImage, setResizingImage] = useState<{id: string, startX: number, startY: number, startWidth: number, startHeight: number} | null>(null);
  const [dragOffset, setDragOffset] = useState<{x: number, y: number} | null>(null);
  const [confettiElements, setConfettiElements] = useState<Array<{id: string, x: number, y: number, color: string, rotation: number, delay: number, randomX: number, size: number}>>([]);
  const [columnHeaderImages, setColumnHeaderImages] = useState<Record<string, string | null>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<{show: boolean, cardId: string | null, column: ColumnType | null}>({
    show: false,
    cardId: null,
    column: null
  });
  const [showActionItems, setShowActionItems] = useState(false);
  const [animatedBackground, setAnimatedBackground] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isAfk, setIsAfk] = useState(false);
  const [draggingCardBetweenColumns, setDraggingCardBetweenColumns] = useState<{cardId: string, sourceColumn: string} | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Canvas transform-based panning/zoom state
  const boardRef = useRef<HTMLDivElement>(null);
  const canvasViewportRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const panOriginRef = useRef({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const stamps = RETRO_STAMPS;
  const cardTemplates = RETRO_CARD_TEMPLATES;

  const retroCards: Record<string, any[]> = retroInfo?.retroCards || {};
  const timer = retroInfo?.timer || { timeLeft: 0, isRunning: false, startTime: null };
  const music = retroInfo?.music || { isPlaying: false, url: null };

  const participants = retroInfo?.participants 
    ? (Object.values(retroInfo.participants) as Array<RetroParticipant | User>)
        .filter((p): p is RetroParticipant | User => (p as any).connected !== false)
        .map(p => ({
          userID: p.userID,
          nickname: p.nickname,
          avatarSeed: (p as any).avatarSeed,
          connected: (p as any).connected,
          isAfk: (p as any).isAfk || false,
        } as RetroParticipant & { isAfk: boolean }))
    : [];

  const isOwner = userInfo.lobby && retroInfo?.owner === Number(userInfo.lobby.userID);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close action items when clicking outside
  useEffect(() => {
    if (!showActionItems) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.retro-action-panel')) {
        setShowActionItems(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showActionItems]);

  // Timer panel is now a toggle switch - no auto-close behavior

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedOptions = localStorage.getItem("retroAvatarOptions");
      if (storedOptions) {
        try {
          const parsed = JSON.parse(storedOptions);
          setAvatarSeed(parsed.seed || Math.random().toString(36).substring(2));
        } catch {
          setAvatarSeed(Math.random().toString(36).substring(2));
        }
      } else {
        const newSeed = Math.random().toString(36).substring(2);
        setAvatarSeed(newSeed);
        localStorage.setItem("retroAvatarOptions", JSON.stringify({ seed: newSeed }));
      }
    }
  }, []);

  const createAvatarSvg = useMemo(() => {
    return (seed: string) => {
      if (!seed) return '';
      if (avatarCache[seed]) return avatarCache[seed];
      
      const avatar = createAvatar(avataaars, { 
        seed,
        mouth: ["smile"],
        backgroundColor: ["transparent"],
      });
      const svgString = avatar.toString();
      setAvatarCache(prev => ({ ...prev, [seed]: svgString }));
      return svgString;
    };
  }, [avatarCache]);

  const handleRegenerateAvatar = () => {
    const newSeed = Math.random().toString(36).substring(2);
    setAvatarSeed(newSeed);
    localStorage.setItem("retroAvatarOptions", JSON.stringify({ seed: newSeed }));
    
    if (userInfo.lobby) {
      socket.emit("updateAvatar", {
        retroId: roomId,
        credentials: userInfo.lobby.credentials,
        avatarSeed: newSeed,
      });
    }
  };

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
    }, 30000);

    const handleInitializeRetro = (data: any) => {
      setRetroInfo(data);
      if (data.boardImages) {
        setBoardImages(data.boardImages);
      }
      if (data.columnHeaderImages) {
        setColumnHeaderImages(data.columnHeaderImages);
      }
      // Save to history for dashboard access and mark as started
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
    const handleUserDisconnected = (data: any) => {
      setRetroInfo(data);
      // Clean up cursor for disconnected user
      handleUserDisconnectedCursor(data);
    };
    const handleAvatarUpdated = (data: any) => setRetroInfo(data.retroData);

    const handleCursorMove = (data: { userId: string; x: number; y: number; nickname: string; avatarSeed?: string }) => {
      // Don't show own cursor
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

    // Clean up stale cursors from disconnected users
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

    const handleNicknameUpdated = (data: { userID: number; oldNickname: string; newNickname: string; retroData: any }) => {
      setRetroInfo(data.retroData);
      
      // If it's the current user, update local nickname
      if (userInfo.lobby && data.userID === userInfo.lobby.userID) {
        setCurrentNickname(data.newNickname);
        setNewNickname(data.newNickname);
      }
      
      // No toast notification for nickname changes
    };

    const handleBoardImagesUpdated = (data: any) => {
      setBoardImages(data.boardImages || []);
    };

    const handleColumnHeaderImagesUpdated = (data: any) => {
      setColumnHeaderImages(data.columnHeaderImages || {});
    };

    const handleMentioned = (data: { cardId: string; mentionedBy: string }) => {
      toast.success(`${data.mentionedBy} mentioned you in a card!`, {
        duration: 4000,
        icon: '👋',
      });
    };

    const handleEncounteredError = (data: any) => {
      console.error("Retro error:", data);
      setShowErrorPopup(true);
    };

    const handleConfettiTriggered = () => {
      triggerConfettiAnimation();
    };

    const handleAfkStatusUpdated = (data: any) => {
      setRetroInfo(data.retroData);
    };

    const handleCardsRevealed = (data: any) => {
      setRetroInfo(data);
    };

    const handleUserCardsRevealed = (data: any) => {
      setRetroInfo(data);
    };

    const handleCardsHidden = (data: any) => {
      setRetroInfo(data);
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
    socket.on("mentioned", handleMentioned);
    socket.on("encounteredError", handleEncounteredError);
    socket.on("confettiTriggered", handleConfettiTriggered);
    socket.on("afkStatusUpdated", handleAfkStatusUpdated);
    socket.on("cardsRevealed", handleCardsRevealed);
    socket.on("userCardsRevealed", handleUserCardsRevealed);
    socket.on("cardsHidden", handleCardsHidden);

    return () => {
      clearInterval(heartbeatInterval);
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
      socket.off("mentioned", handleMentioned);
      socket.off("encounteredError", handleEncounteredError);
      socket.off("confettiTriggered", handleConfettiTriggered);
      socket.off("afkStatusUpdated", handleAfkStatusUpdated);
      socket.off("cardsRevealed", handleCardsRevealed);
      socket.off("userCardsRevealed", handleUserCardsRevealed);
      socket.off("cardsHidden", handleCardsHidden);
    };
  }, [socket, roomId, avatarSeed]);

  useEffect(() => {
    if (retroInfo?.boardImages) {
      setBoardImages(retroInfo.boardImages);
    }
    if (retroInfo?.columnHeaderImages) {
      setColumnHeaderImages(retroInfo.columnHeaderImages);
    }
  }, [retroInfo]);

  // Cursor tracking - emit cursor position in CANVAS-SPACE so it stays correct when others pan
  useEffect(() => {
    if (!userInfo.lobby || !canvasViewportRef.current) return;

    let lastEmit = 0;
    const THROTTLE_MS = 50; // Throttle cursor updates to ~20fps

    const handleMouseMove = (e: MouseEvent) => {
      // Don't emit during panning
      if (isPanning) return;
      
      const now = Date.now();
      if (now - lastEmit < THROTTLE_MS) return;
      lastEmit = now;
      
      const vp = canvasViewportRef.current;
      if (!vp) return;
      const vpRect = vp.getBoundingClientRect();
      
      // Convert screen coords to canvas-space (accounting for viewport offset, pan, zoom)
      const viewportX = e.clientX - vpRect.left;
      const viewportY = e.clientY - vpRect.top;
      const canvasX = (viewportX - pan.x) / zoomLevel;
      const canvasY = (viewportY - pan.y) / zoomLevel;
      
      // Backend expects: (retroId, data, credentials)
      socket.emit("cursorMove", roomId, {
        x: canvasX,
        y: canvasY,
      }, userInfo.lobby?.credentials);
    };

    const el = canvasViewportRef.current;
    el.addEventListener('mousemove', handleMouseMove);
    return () => {
      el.removeEventListener('mousemove', handleMouseMove);
    };
  }, [socket, roomId, userInfo.lobby, avatarSeed, isPanning, currentNickname, pan, zoomLevel]);

  const sanitizeCardText = (text: string): string => {
    // Trim leading/trailing whitespace and newlines
    let sanitized = text.trim();
    // Collapse 3+ consecutive newlines into 2
    sanitized = sanitized.replace(/\n{3,}/g, '\n\n');
    // Remove lines that are only whitespace
    sanitized = sanitized.split('\n').map(line => line.trimEnd()).join('\n');
    return sanitized;
  };

  const handleAddCard = (columnKey: string) => {
    const sanitized = sanitizeCardText(newCardText);
    if (!sanitized || !userInfo.lobby) return;

    const newCard = {
      id: Date.now().toString(),
      text: sanitized,
      image: newCardImage,
      color: newCardColor,
      voteCount: 0,
      votes: [],
      authorId: Number(userInfo.lobby.userID),
      createdAt: Date.now(),
      stamps: [],
      isAnonymous,
    };

    socket.emit("addRetroCard", roomId, columnKey, newCard, userInfo.lobby.credentials);
    
    setActiveColumn(null);
    setNewCardText("");
    setNewCardImage(null);
    setNewCardColor(null);
    setIsAnonymous(false);
  };

  // Double-click on column area to add a default yellow card
  const handleColumnDoubleClick = (columnKey: string) => {
    if (activeColumn) return; // Don't open if already adding
    setActiveColumn(columnKey);
    setNewCardColor('#FFF9E5'); // Default yellow
  };

  // Reveal cards
  const handleRevealAllCards = () => {
    if (!userInfo.lobby) return;
    socket.emit("revealAllCards", roomId, userInfo.lobby.credentials);
  };

  const handleRevealMyCards = () => {
    if (!userInfo.lobby) return;
    socket.emit("revealMyCards", roomId, userInfo.lobby.credentials);
  };

  const handleHideAllCards = () => {
    if (!userInfo.lobby) return;
    socket.emit("hideAllCards", roomId, userInfo.lobby.credentials);
  };

  // AFK toggle
  const handleToggleAfk = () => {
    const newAfk = !isAfk;
    setIsAfk(newAfk);
    if (userInfo.lobby) {
      socket.emit("updateAfkStatus", {
        retroId: roomId,
        credentials: userInfo.lobby.credentials,
        isAfk: newAfk,
      });
    }
  };

  // Drag card between columns
  const handleCardDragBetweenStart = (cardId: string, sourceColumn: string) => {
    setDraggingCardBetweenColumns({ cardId, sourceColumn });
  };

  const handleCardDragEnd = () => {
    setDraggingCardBetweenColumns(null);
    setDraggedCard(null);
    setDraggedImage(null);
  };

  const handleCardDropOnColumn = (targetColumn: string) => {
    if (!draggingCardBetweenColumns || !userInfo.lobby) return;
    if (draggingCardBetweenColumns.sourceColumn === targetColumn) {
      setDraggingCardBetweenColumns(null);
      return;
    }
    
    // Check if this card is part of a group - if so, move ALL cards in the group
    const sourceCards: any[] = retroInfo?.retroCards?.[draggingCardBetweenColumns.sourceColumn] || [];
    const draggedCardData = sourceCards.find((c: any) => c.id === draggingCardBetweenColumns.cardId);
    
    if (draggedCardData?.groupId) {
      // Move all cards in this group
      const groupCards = sourceCards.filter((c: any) => c.groupId === draggedCardData.groupId);
      groupCards.forEach((c: any) => {
        socket.emit("moveRetroCard", roomId, {
          sourceColumn: draggingCardBetweenColumns.sourceColumn,
          targetColumn,
          cardId: c.id,
        }, userInfo.lobby.credentials);
      });
    } else {
      socket.emit("moveRetroCard", roomId, {
        sourceColumn: draggingCardBetweenColumns.sourceColumn,
        targetColumn,
        cardId: draggingCardBetweenColumns.cardId,
      }, userInfo.lobby.credentials);
    }
    
    setDraggingCardBetweenColumns(null);
  };

  // Card grouping handlers
  const handleGroupCards = (column: string, cardId1: string, cardId2: string) => {
    if (!userInfo.lobby) return;
    socket.emit("groupRetroCards", roomId, { column, cardId1, cardId2 }, userInfo.lobby.credentials);
  };

  const handleRenameGroup = (groupId: string, name: string) => {
    if (!userInfo.lobby) return;
    socket.emit("renameCardGroup", roomId, { groupId, name }, userInfo.lobby.credentials);
  };

  const handleUngroupCard = (column: string, cardId: string) => {
    if (!userInfo.lobby) return;
    socket.emit("ungroupCard", roomId, { column, cardId }, userInfo.lobby.credentials);
  };

  const handleDeleteCard = (columnKey: string, cardId: string) => {
    setDeleteConfirm({ show: true, cardId, column: columnKey });
  };

  const confirmDelete = () => {
    if (deleteConfirm.cardId && deleteConfirm.column && userInfo.lobby) {
      socket.emit("deleteRetroCard", roomId, deleteConfirm.column, deleteConfirm.cardId, userInfo.lobby.credentials);
    }
    setDeleteConfirm({ show: false, cardId: null, column: null });
  };

  const cancelDelete = () => {
    setDeleteConfirm({ show: false, cardId: null, column: null });
  };

  const handleUpdateCard = (columnKey: string, cardId: string, text: string, image: string | null, stamps?: Array<{emoji: string, x: number, y: number}>) => {
    if (userInfo.lobby) {
      socket.emit("updateRetroCard", roomId, columnKey, cardId, { text, image, stamps }, userInfo.lobby.credentials);
    }
  };

  const handleVoteCard = (columnKey: string, cardId: string) => {
    if (!userInfo.lobby) return;
    
    const userId = Number(userInfo.lobby.userID);
    const card = retroCards[columnKey]?.find((c: any) => c.id === cardId);
    
    if (!card) return;
    
    const currentVotes = Array.isArray(card.votes) ? card.votes : [];
    const hasVoted = currentVotes.includes(userId);
    const newVotes = hasVoted 
      ? currentVotes.filter((id: number) => id !== userId)
      : [...currentVotes, userId];
    
    socket.emit("updateRetroCard", roomId, columnKey, cardId, { 
      votes: newVotes,
      voteCount: newVotes.length 
    }, userInfo.lobby.credentials);
  };

  const handleTimerUpdate = (timer: { timeLeft: number; isRunning: boolean; startTime: number | null }) => {
    if (userInfo.lobby) {
      socket.emit("updateRetroTimer", roomId, timer, userInfo.lobby.credentials);
    }
  };

  const handleMusicUpdate = (music: { isPlaying: boolean; url: string | null }) => {
    if (userInfo.lobby) {
      socket.emit("updateRetroMusic", roomId, music, userInfo.lobby.credentials);
    }
  };

  const handleCopyInviteLink = () => {
    copyRetroInviteLink(roomId);
  };

  const handleExportCSV = () => {
    exportRetroToCSV(mainColumns, retroCards, participants);
  };

  const handleExportPDF = () => {
    exportRetroToPDF(mainColumns, retroCards, participants, retroInfo?.title || "Retrospective");
  };

  const handleExportActionItemsPDF = () => {
    exportActionItemsToPDF(sideColumns, retroCards, participants, retroInfo?.title || "Retrospective");
  };

  const handleSaveNickname = () => {
    if (!newNickname.trim() || newNickname === currentNickname) {
      setEditingNickname(false);
      return;
    }

    if (userInfo.lobby) {
      socket.emit("updateNickname", {
        retroId: roomId,
        credentials: userInfo.lobby.credentials,
        newNickname: newNickname.trim(),
      });
      
      // Update local storage
      localStorage.setItem("retroNickname", newNickname.trim());
      
      setCurrentNickname(newNickname.trim());
      setEditingNickname(false);
      toast.success("Nickname updated successfully!");
    }
  };

  const handleRemoveCustomStamp = (index: number) => {
    setCustomStamps(prev => prev.filter((_, i) => i !== index));
  };

  const handleCustomStampUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setCustomStamps(prev => [...prev, result]);
    };
    reader.readAsDataURL(file);
  };

  const triggerConfettiAnimation = () => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
      '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52C7B8',
      '#FF85A1', '#FFD93D', '#6BCF7F', '#A29BFE', '#FD79A8',
      '#FDCB6E', '#74B9FF', '#A29BFE', '#FF7675', '#00B894'
    ];
    const newConfetti: Array<{id: string, x: number, y: number, color: string, rotation: number, delay: number, randomX: number, size: number}> = [];
    
    // 5-7 farklı noktadan konfeti fırlat (daha dağınık)
    const burstCount = 5 + Math.floor(Math.random() * 3); // 5-7 burst
    
    for (let burst = 0; burst < burstCount; burst++) {
      // Tamamen rastgele konumlar (ekranın her yerinden)
      const x = 100 + Math.random() * (window.innerWidth - 200);
      const y = window.innerHeight * (0.5 + Math.random() * 0.3); // 50-80% yükseklikte
      
      // Her burst'ten 10-15 konfeti (daha az yoğun)
      const confettiPerBurst = 10 + Math.floor(Math.random() * 6);
      
      for (let i = 0; i < confettiPerBurst; i++) {
        newConfetti.push({
          id: `confetti-${Date.now()}-${burst}-${i}-${Math.random()}`,
          x: x + (Math.random() - 0.5) * 100,
          y: y,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          delay: burst * 0.08 + Math.random() * 0.12, // Daha hızlı art arda
          randomX: Math.random(),
          size: 8 + Math.random() * 6, // 8-14px arası (daha küçük)
        });
      }
    }
    
    setConfettiElements(prev => [...prev, ...newConfetti]);
    
    // Remove confetti after animation
    setTimeout(() => {
      setConfettiElements(prev => prev.filter(c => !newConfetti.find(nc => nc.id === c.id)));
    }, 4500);
  };

  const handleConfetti = () => {
    // Emit to socket to trigger for all users
    if (socket && userInfo.lobby?.credentials) {
      socket.emit("triggerConfetti", roomId, userInfo.lobby.credentials);
    }
  };

  const handleImageDragStart = (image: any, e: React.DragEvent) => {
    setDraggedImage(image);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', image.id);
  };

  const handleDropImageOnColumn = (e: React.DragEvent, image: any) => {
    // Convert screen coords to canvas-space (accounting for viewport offset, pan/zoom)
    const vpRect = canvasViewportRef.current?.getBoundingClientRect();
    if (!vpRect) return;
    const viewportX = e.clientX - vpRect.left;
    const viewportY = e.clientY - vpRect.top;
    const canvasX = (viewportX - pan.x) / zoomLevel;
    const canvasY = (viewportY - pan.y) / zoomLevel;
    const x = canvasX - image.width / 2;
    const y = canvasY - image.height / 2;
    
    const updatedImages = boardImages.map(img => 
      img.id === image.id 
        ? { ...img, x, y }
        : img
    );
    
    setBoardImages(updatedImages);
    
    if (userInfo.lobby) {
      socket.emit("updateBoardImages", roomId, updatedImages, userInfo.lobby.credentials);
    }
    
    setDraggedImage(null);
  };

  const handleBoardImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      
      const img = new Image();
      img.onload = () => {
        const maxSize = 300;
        let width = img.naturalWidth;
        let height = img.naturalHeight;
        
        if (width > maxSize || height > maxSize) {
          const ratio = Math.min(maxSize / width, maxSize / height);
          width = width * ratio;
          height = height * ratio;
        }
        
        const newImage = {
          id: Date.now().toString(),
          src: result,
          x: -99999, // Sentinel value: in sidebar, not placed on canvas
          y: -99999,
          width,
          height
        };
        
        const updatedImages = [...boardImages, newImage];
        setBoardImages(updatedImages);
        
        if (userInfo.lobby) {
          socket.emit("updateBoardImages", roomId, updatedImages, userInfo.lobby.credentials);
        }
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const handleImageMouseDown = (e: React.MouseEvent, imageId: string) => {
    if ((e.target as HTMLElement).closest('.retro-board-image__remove') || 
        (e.target as HTMLElement).closest('.retro-board-image__resize-handle')) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    
    const image = boardImages.find(img => img.id === imageId);
    if (image) {
      setDraggingImage(imageId);
      // Calculate offset in canvas-space (accounting for viewport offset, pan/zoom)
      const vpRect = canvasViewportRef.current?.getBoundingClientRect();
      const vpLeft = vpRect?.left || 0;
      const vpTop = vpRect?.top || 0;
      const canvasX = (e.clientX - vpLeft - pan.x) / zoomLevel;
      const canvasY = (e.clientY - vpTop - pan.y) / zoomLevel;
      setDragOffset({
        x: canvasX - image.x,
        y: canvasY - image.y
      });
    }
  };

  const handleImageMouseMove = (e: MouseEvent) => {
    if (!draggingImage || !dragOffset) return;

    // Convert screen coords to canvas-space (accounting for viewport offset)
    const vpRect = canvasViewportRef.current?.getBoundingClientRect();
    const vpLeft = vpRect?.left || 0;
    const vpTop = vpRect?.top || 0;
    const canvasX = (e.clientX - vpLeft - pan.x) / zoomLevel;
    const canvasY = (e.clientY - vpTop - pan.y) / zoomLevel;
    const newX = canvasX - dragOffset.x;
    const newY = canvasY - dragOffset.y;

    setBoardImages(prevImages => {
      const updatedImages = prevImages.map(img => 
        img.id === draggingImage 
          ? { ...img, x: newX, y: newY }
          : img
      );
      return updatedImages;
    });
  };

  const handleImageMouseUp = () => {
    if (draggingImage && userInfo.lobby) {
      // Use the latest boardImages state
      setBoardImages(prevImages => {
        socket.emit("updateBoardImages", roomId, prevImages, userInfo.lobby.credentials);
        return prevImages;
      });
    }
    setDraggingImage(null);
    setDragOffset(null);
  };

  useEffect(() => {
    if (draggingImage) {
      window.addEventListener('mousemove', handleImageMouseMove);
      window.addEventListener('mouseup', handleImageMouseUp);
      
      return () => {
        window.removeEventListener('mousemove', handleImageMouseMove);
        window.removeEventListener('mouseup', handleImageMouseUp);
      };
    }
  }, [draggingImage, dragOffset, boardImages, pan, zoomLevel]);

  const handleRemoveBoardImage = (imageId: string) => {
    const updatedImages = boardImages.filter(img => img.id !== imageId);
    setBoardImages(updatedImages);
    
    if (userInfo.lobby) {
      socket.emit("updateBoardImages", roomId, updatedImages, userInfo.lobby.credentials);
    }
  };

  const handleResizeStart = (e: React.MouseEvent, imageId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const image = boardImages.find(img => img.id === imageId);
    if (image) {
      setResizingImage({
        id: imageId,
        startX: e.clientX,
        startY: e.clientY,
        startWidth: image.width,
        startHeight: image.height
      });
    }
  };

  const handleResizeMove = (e: MouseEvent) => {
    if (!resizingImage) return;

    // Divide by zoomLevel so resize feels consistent at any zoom
    const deltaX = (e.clientX - resizingImage.startX) / zoomLevel;
    const aspectRatio = resizingImage.startWidth / resizingImage.startHeight;
    const newWidth = Math.max(100, resizingImage.startWidth + deltaX);
    const newHeight = newWidth / aspectRatio;

    setBoardImages(prevImages => {
      const updatedImages = prevImages.map(img => 
        img.id === resizingImage.id 
          ? { ...img, width: newWidth, height: newHeight }
          : img
      );
      return updatedImages;
    });
  };

  const handleResizeEnd = () => {
    if (resizingImage && userInfo.lobby) {
      // Use the latest boardImages state
      setBoardImages(prevImages => {
        socket.emit("updateBoardImages", roomId, prevImages, userInfo.lobby.credentials);
        return prevImages;
      });
    }
    setResizingImage(null);
  };

  useEffect(() => {
    if (resizingImage) {
      window.addEventListener('mousemove', handleResizeMove);
      window.addEventListener('mouseup', handleResizeEnd);
      
      return () => {
        window.removeEventListener('mousemove', handleResizeMove);
        window.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [resizingImage, boardImages]);

  const handleColumnHeaderImageUpload = (columnKey: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      const updatedImages = { ...columnHeaderImages, [columnKey]: result };
      setColumnHeaderImages(updatedImages);
      
      if (userInfo.lobby) {
        socket.emit("updateColumnHeaderImages", roomId, updatedImages, userInfo.lobby.credentials);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveColumnHeaderImage = (columnKey: string) => {
    const updatedImages = { ...columnHeaderImages };
    delete updatedImages[columnKey];
    setColumnHeaderImages(updatedImages);
    
    if (userInfo.lobby) {
      socket.emit("updateColumnHeaderImages", roomId, updatedImages, userInfo.lobby.credentials);
    }
  };

  // Zoom handlers (zoom toward center of viewport)
  const zoomTowardCenter = (newZoom: number) => {
    const vp = canvasViewportRef.current;
    if (!vp) { setZoomLevel(newZoom); return; }
    const rect = vp.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const sf = newZoom / zoomLevel;
    setPan(prev => ({
      x: cx - sf * (cx - prev.x),
      y: cy - sf * (cy - prev.y),
    }));
    setZoomLevel(newZoom);
  };

  const handleZoomIn = () => zoomTowardCenter(Math.min(zoomLevel * 1.2, 3));
  const handleZoomOut = () => zoomTowardCenter(Math.max(zoomLevel / 1.2, 0.2));
  const handleZoomReset = () => {
    setZoomLevel(1);
    setPan({ x: 0, y: 0 });
  };

  // Mouse/trackpad wheel handler:
  // - Two-finger scroll on Mac trackpad → PAN the canvas
  // - Pinch-to-zoom on Mac trackpad (sends ctrlKey) → ZOOM
  // - Ctrl+scroll on mouse → ZOOM
  // - Regular scroll wheel → PAN
  useEffect(() => {
    const vp = canvasViewportRef.current;
    if (!vp) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      if (e.ctrlKey || e.metaKey) {
        // Pinch-to-zoom or Ctrl+scroll → ZOOM toward cursor
        const rect = vp.getBoundingClientRect();
        const cx = e.clientX - rect.left;
        const cy = e.clientY - rect.top;
        const delta = -e.deltaY * 0.01;
        
        setZoomLevel(prevZoom => {
          const newZoom = Math.min(3, Math.max(0.2, prevZoom * (1 + delta)));
          const sf = newZoom / prevZoom;
          setPan(prevPan => ({
            x: cx - sf * (cx - prevPan.x),
            y: cy - sf * (cy - prevPan.y),
          }));
          return newZoom;
        });
      } else {
        // Regular scroll / two-finger trackpad → PAN
        setPan(prev => ({
          x: prev.x - e.deltaX,
          y: prev.y - e.deltaY,
        }));
      }
    };

    vp.addEventListener('wheel', handleWheel, { passive: false });
    return () => vp.removeEventListener('wheel', handleWheel);
  }, [retroInfo?.template]); // Re-attach when template loads and viewport renders

  // Canvas panning via mouse drag
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    // Only start panning on empty space (not on interactive elements or columns)
    if (
      target.closest('.retro-column') ||
      target.closest('.retro-card') ||
      target.closest('button') ||
      target.closest('.retro-column__new-card') ||
      target.closest('.retro-sidebar') ||
      target.closest('.retro-action-panel') ||
      target.closest('input') ||
      target.closest('textarea') ||
      target.closest('.retro-board-image') ||
      target.closest('.retro-column__header') ||
      target.closest('.retro-column__add-btn')
    ) {
      return;
    }

    setIsPanning(true);
    panStartRef.current = { x: e.clientX, y: e.clientY };
    panOriginRef.current = { x: pan.x, y: pan.y };
    e.preventDefault();
  };

  useEffect(() => {
    if (!isPanning) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPan({
        x: panOriginRef.current.x + (e.clientX - panStartRef.current.x),
        y: panOriginRef.current.y + (e.clientY - panStartRef.current.y),
      });
    };

    const handleMouseUp = () => {
      setIsPanning(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isPanning]);

  const handleCardDragStart = (template: any, e: React.DragEvent) => {
    setDraggedCard(template);
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', template.name);
    
    // Clean up on drag end (handles drops outside valid targets)
    const cleanup = () => {
      setDraggedCard(null);
      setDraggedImage(null);
      setDraggingCardBetweenColumns(null);
      e.target.removeEventListener('dragend', cleanup);
    };
    e.target.addEventListener('dragend', cleanup);
  };

  const renderColumn = (columnKey: string, columnConfig: any, showAddButton: boolean, isSideColumn: boolean = false) => {
    // Cards maintain their original order (by creation time) - votes don't change position
    const cards = (retroCards[columnKey] || []).sort((a: any, b: any) => {
      return a.createdAt - b.createdAt;
    });

    return (
      <RetroColumn
        key={columnKey}
        columnKey={columnKey}
        columnConfig={columnConfig}
        cards={cards}
        isAddingCard={activeColumn === columnKey}
        newCardText={newCardText}
        newCardColor={newCardColor}
        newCardImage={newCardImage}
        showAddButton={showAddButton}
        draggedCard={draggedCard}
        draggedImage={draggedImage}
        selectedStamp={selectedStamp}
        columnHeaderImages={columnHeaderImages}
        participants={participantsWithAvatars}
        userInfo={userInfo}
        draggingCardBetweenColumns={draggingCardBetweenColumns}
        onSetActiveColumn={setActiveColumn}
        onSetNewCardText={setNewCardText}
        onSetNewCardColor={setNewCardColor}
        onSetNewCardImage={setNewCardImage}
        onSetSelectedStamp={setSelectedStamp}
        onSetDraggedCard={setDraggedCard}
        onSetDraggedImage={setDraggedImage}
        onDropImageOnColumn={handleDropImageOnColumn}
        onAddCard={handleAddCard}
        onDeleteCard={handleDeleteCard}
        onUpdateCard={handleUpdateCard}
        onVoteCard={handleVoteCard}
        onColumnHeaderImageUpload={handleColumnHeaderImageUpload}
        onRemoveColumnHeaderImage={handleRemoveColumnHeaderImage}
        onDoubleClick={handleColumnDoubleClick}
        onCardDragBetweenStart={handleCardDragBetweenStart}
        onCardDropOnColumn={handleCardDropOnColumn}
        onCardDragEnd={handleCardDragEnd}
        createAvatarSvg={createAvatarSvg}
        cardGroups={retroInfo?.cardGroups || {}}
        onGroupCards={handleGroupCards}
        onRenameGroup={handleRenameGroup}
        onUngroupCard={handleUngroupCard}
        isSideColumn={isSideColumn}
        isAnonymous={isAnonymous}
        onSetIsAnonymous={setIsAnonymous}
        cardsRevealed={retroInfo?.cardsRevealed}
      />
    );
  };

  if (!mounted) return null;
  
  // Show loading if retroInfo hasn't loaded yet
  if (!retroInfo || !retroInfo.template) {
    return <RetroLoadingScreen />;
  }

  const avatarSvg = createAvatarSvg(avatarSeed);
  const participantsWithAvatars = participants.map(p => ({
    ...p,
    avatarSvg: createAvatarSvg(p.avatarSeed || '')
  }));

  return (
    <div className="retro-board-container">
      {/* Confetti */}
      {confettiElements.map(confetti => (
        <div
          key={confetti.id}
          className="retro-confetti"
          style={{
            left: `${confetti.x}px`,
            top: `${confetti.y}px`,
            backgroundColor: confetti.color,
            width: `${confetti.size}px`,
            height: `${confetti.size}px`,
            transform: `rotate(${confetti.rotation}deg)`,
            animationDelay: `${confetti.delay}s`,
            // @ts-ignore
            '--random-x': confetti.randomX,
          }}
        />
      ))}

      <RetroSidebar
        currentNickname={currentNickname}
        newNickname={newNickname}
        setNewNickname={setNewNickname}
        editingNickname={editingNickname}
        setEditingNickname={setEditingNickname}
        avatarSvg={avatarSvg}
        onRegenerateAvatar={handleRegenerateAvatar}
        onSaveNickname={handleSaveNickname}
        cardTemplates={cardTemplates}
        draggedCard={draggedCard}
        onCardDragStart={handleCardDragStart}
        stamps={stamps}
        customStamps={customStamps}
        selectedStamp={selectedStamp}
        onStampSelect={setSelectedStamp}
        onRemoveCustomStamp={handleRemoveCustomStamp}
        onCustomStampUpload={handleCustomStampUpload}
        boardImages={boardImages.filter(img => img.x <= -99990 && img.y <= -99990)}
        onRemoveBoardImage={handleRemoveBoardImage}
        onBoardImageUpload={handleBoardImageUpload}
        onImageDragStart={handleImageDragStart}
        onConfetti={handleConfetti}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        animatedBackground={animatedBackground}
        onToggleBackground={() => setAnimatedBackground(!animatedBackground)}
        isAfk={isAfk}
        onToggleAfk={handleToggleAfk}
      />

      <div 
        ref={boardRef}
        className={`retro-board ${!animatedBackground ? 'retro-board--plain' : ''} ${sidebarCollapsed ? 'retro-board--sidebar-collapsed' : ''} ${isPanning ? 'retro-board--panning' : ''}`}
      >
        <div className="retro-board__main">
          <RetroHeader
            isOwner={isOwner}
            showTimer={showTimer}
            setShowTimer={setShowTimer}
            showMusic={showMusic}
            setShowMusic={setShowMusic}
            timer={timer}
            music={music}
            participants={participantsWithAvatars}
            retroTitle={retroInfo?.title || "Retrospective"}
            roomId={roomId}
            onTimerUpdate={handleTimerUpdate}
            onMusicUpdate={handleMusicUpdate}
            onExportCSV={handleExportCSV}
            onExportPDF={handleExportPDF}
            onExportActionItemsPDF={handleExportActionItemsPDF}
            onCopyInviteLink={handleCopyInviteLink}
            cardsRevealed={retroInfo?.cardsRevealed}
            onRevealAllCards={handleRevealAllCards}
            onRevealMyCards={handleRevealMyCards}
            onHideAllCards={handleHideAllCards}
            hasCards={Object.values(retroCards).some(col => col.length > 0)}
          />

          {/* Canvas viewport - transform-based zoom/pan */}
          <div 
            ref={canvasViewportRef}
            className="retro-board__canvas-viewport"
            onMouseDown={handleCanvasMouseDown}
            onDrop={(e) => {
              e.preventDefault();
              if (draggedCard) {
                // Sidebar card template dropped - find which column using elementsFromPoint
                const elements = document.elementsFromPoint(e.clientX, e.clientY);
                let found = false;
                for (const el of elements) {
                  const col = (el as HTMLElement).closest?.('[data-column-key]') as HTMLElement | null;
                  if (col) {
                    const colKey = col.getAttribute('data-column-key');
                    if (colKey) {
                      setActiveColumn(colKey);
                      setNewCardColor(draggedCard.color);
                      found = true;
                    }
                    break;
                  }
                }
                // Fallback: find closest column by checking all column elements
                if (!found) {
                  const allColumns = document.querySelectorAll('[data-column-key]');
                  let closestCol: Element | null = null;
                  let closestDist = Infinity;
                  allColumns.forEach(col => {
                    const rect = col.getBoundingClientRect();
                    const cx = rect.left + rect.width / 2;
                    const cy = rect.top + rect.height / 2;
                    const dist = Math.sqrt((e.clientX - cx) ** 2 + (e.clientY - cy) ** 2);
                    if (dist < closestDist) {
                      closestDist = dist;
                      closestCol = col;
                    }
                  });
                  if (closestCol) {
                    const colKey = (closestCol as HTMLElement).getAttribute('data-column-key');
                    if (colKey) {
                      setActiveColumn(colKey);
                      setNewCardColor(draggedCard.color);
                    }
                  }
                }
                requestAnimationFrame(() => setDraggedCard(null));
              } else if (draggedImage) {
                // Convert screen coords to canvas-space (account for viewport offset)
                const vpRect = canvasViewportRef.current?.getBoundingClientRect();
                if (!vpRect) return;
                const viewportX = e.clientX - vpRect.left;
                const viewportY = e.clientY - vpRect.top;
                const canvasX = (viewportX - pan.x) / zoomLevel;
                const canvasY = (viewportY - pan.y) / zoomLevel;
                const x = canvasX - draggedImage.width / 2;
                const y = canvasY - draggedImage.height / 2;
                
                const updatedImages = boardImages.map(img => 
                  img.id === draggedImage.id 
                    ? { ...img, x, y }
                    : img
                );
                
                setBoardImages(updatedImages);
                
                if (userInfo.lobby) {
                  socket.emit("updateBoardImages", roomId, updatedImages, userInfo.lobby.credentials);
                }
                
                setDraggedImage(null);
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
              if (draggedCard) {
                e.dataTransfer.dropEffect = 'copy';
              } else {
                e.dataTransfer.dropEffect = 'move';
              }
            }}
          >
            {/* Background layers */}
            <div className="retro-board__gradient-bg" />
            <div 
              className="retro-board__grid-bg"
              style={{ backgroundPosition: `${pan.x % 24}px ${pan.y % 24}px` }}
            />

            {/* Transform layer - pans and zooms */}
            <div 
              className="retro-board__canvas"
              style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomLevel})`, transformOrigin: '0 0' }}
            >
              <div className="retro-board__columns">
                {mainColumns.map((col: any) => (
                  <div key={col.key} className="retro-board__column-wrapper">
                    {renderColumn(col.key, col, false)}
                  </div>
                ))}
              </div>

              <RetroBoardImages
                images={boardImages.filter(img => !(img.x <= -99990 && img.y <= -99990))}
                draggingImage={draggingImage}
                resizingImage={resizingImage}
                onImageMouseDown={handleImageMouseDown}
                onRemoveImage={handleRemoveBoardImage}
                onResizeStart={handleResizeStart}
              />

              {/* Remote cursors - positioned in canvas-space, move with pan/zoom */}
              {Object.entries(cursors).map(([userId, cursor]) => (
                <div 
                  key={userId}
                  className="retro-cursor"
                  style={{ left: cursor.x, top: cursor.y }}
                >
                  <div className="retro-cursor__avatar">
                    {cursor.avatarSeed && (
                      <div dangerouslySetInnerHTML={{ __html: createAvatarSvg(cursor.avatarSeed) }} />
                    )}
                  </div>
                  <span className="retro-cursor__name">{cursor.nickname}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Zoom controls */}
      <div className="retro-board__zoom-controls">
        <button className="retro-board__zoom-controls__btn" onClick={handleZoomOut} title="Zoom out">−</button>
        <span className="retro-board__zoom-controls__level" onClick={handleZoomReset} title="Reset zoom" style={{ cursor: 'pointer' }}>
          {Math.round(zoomLevel * 100)}%
        </span>
        <button className="retro-board__zoom-controls__btn" onClick={handleZoomIn} title="Zoom in">+</button>
      </div>

      {mounted && sideColumns.length > 0 && (
        <div className={`retro-action-panel ${showActionItems ? 'expanded' : ''}`}>
          <button 
            className="retro-action-panel__toggle"
            onClick={() => setShowActionItems(!showActionItems)}
            title={sideColumns[0]?.title || "Action Items"}
          >
            {sideColumns[0]?.title?.match(/[\p{Emoji}]/u)?.[0] || '🎯'}
          </button>

          {showActionItems && (
            <div className="retro-action-panel__content">
              {sideColumns.map((col: any) => (
                <div key={col.key}>
                  {renderColumn(col.key, col, true, true)}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <RetroDeleteConfirm
        show={deleteConfirm.show}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      <RetroErrorPopup title="Connection Error" retroId={roomId} />
      <RetroOnboarding isOwner={isOwner} onTriggerConfetti={handleConfetti} />
    </div>
  );
};

export default RetroBoard;
