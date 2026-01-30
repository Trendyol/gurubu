"use client";

import { useState, useEffect, useMemo } from "react";
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
import { getCurrentRetroLobby } from "@/shared/helpers/lobbyStorage";
import { RetroParticipant, User } from "@/shared/interfaces";
import { RETRO_STAMPS, RETRO_CARD_TEMPLATES } from "@/constants/retroConstants";
import { copyRetroInviteLink, exportRetroToCSV } from "@/utils/retroUtils";
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
  const [lastCursorUpdate, setLastCursorUpdate] = useState(0);
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
          connected: (p as any).connected
        } as RetroParticipant))
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
    };
    const handleAddRetroCard = (data: any) => setRetroInfo(data);
    const handleUpdateRetroCard = (data: any) => setRetroInfo(data);
    const handleDeleteRetroCard = (data: any) => setRetroInfo(data);
    const handleUpdateRetroTimer = (data: any) => setRetroInfo(data);
    const handleUpdateRetroMusic = (data: any) => setRetroInfo(data);
    const handleUserDisconnected = (data: any) => setRetroInfo(data);
    const handleAvatarUpdated = (data: any) => setRetroInfo(data.retroData);

    const handleCursorMove = (data: { userId: string; x: number; y: number; nickname: string; avatarSeed?: string }) => {
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

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastCursorUpdate < 50) return;
      
      setLastCursorUpdate(now);
      
      if (userInfo.lobby) {
        socket.emit("cursorMove", roomId, {
          x: e.clientX,
          y: e.clientY,
        }, userInfo.lobby.credentials);
      }
    };

    const handleMouseLeave = () => {
      if (userInfo.lobby) {
        socket.emit("cursorLeave", roomId, {}, userInfo.lobby.credentials);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [socket, roomId, userInfo.lobby, lastCursorUpdate]);

  const handleAddCard = (columnKey: string) => {
    if (!newCardText.trim() || !userInfo.lobby) return;

    const newCard = {
      id: Date.now().toString(),
      text: newCardText,
      image: newCardImage,
      color: newCardColor,
      voteCount: 0,
      votes: [],
      authorId: Number(userInfo.lobby.userID),
      createdAt: Date.now(),
      stamps: []
    };

    socket.emit("addRetroCard", roomId, columnKey, newCard, userInfo.lobby.credentials);
    
    setActiveColumn(null);
    setNewCardText("");
    setNewCardImage(null);
    setNewCardColor(null);
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
    // Get the column element's position
    const columnElement = e.currentTarget as HTMLElement;
    const rect = columnElement.getBoundingClientRect();
    
    // Calculate position relative to the board (not the column)
    const boardElement = document.querySelector('.retro-board') as HTMLElement;
    if (!boardElement) return;
    
    const boardRect = boardElement.getBoundingClientRect();
    const x = Math.max(60, e.clientX - boardRect.left - image.width / 2);
    const y = Math.max(0, e.clientY - boardRect.top - image.height / 2);
    
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
          x: -1000, // Off-screen initially, will be placed on drag
          y: -1000,
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
      setDragOffset({
        x: e.clientX - image.x,
        y: e.clientY - image.y
      });
    }
  };

  const handleImageMouseMove = (e: MouseEvent) => {
    if (!draggingImage || !dragOffset) return;

    const newX = Math.max(60, e.clientX - dragOffset.x);
    const newY = Math.max(0, e.clientY - dragOffset.y);

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
  }, [draggingImage, dragOffset, boardImages]);

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

    const deltaX = e.clientX - resizingImage.startX;
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

  const handleCardDragStart = (template: any, e: React.DragEvent) => {
    setDraggedCard(template);
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', template.name);
  };

  const renderColumn = (columnKey: string, columnConfig: any, showAddButton: boolean) => {
    const cards = (retroCards[columnKey] || []).sort((a: any, b: any) => {
      const voteDiff = (b.voteCount || 0) - (a.voteCount || 0);
      if (voteDiff !== 0) return voteDiff;
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
        participants={participants}
        userInfo={userInfo}
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
        boardImages={boardImages.filter(img => img.x < 0 || img.y < 0)}
        onRemoveBoardImage={handleRemoveBoardImage}
        onBoardImageUpload={handleBoardImageUpload}
        onImageDragStart={handleImageDragStart}
        onConfetti={handleConfetti}
      />

      <div 
        className="retro-board"
        onDrop={(e) => {
          e.preventDefault();
          if (draggedImage) {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = Math.max(60, e.clientX - rect.left - draggedImage.width / 2);
            const y = Math.max(0, e.clientY - rect.top - draggedImage.height / 2);
            
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
          if (draggedImage) {
            e.dataTransfer.dropEffect = 'move';
          }
        }}
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
            onTimerUpdate={handleTimerUpdate}
            onMusicUpdate={handleMusicUpdate}
            onExportCSV={handleExportCSV}
            onCopyInviteLink={handleCopyInviteLink}
          />

          <div className="retro-board__columns">
            {mainColumns.map((col: any) => (
              <div key={col.key}>
                {renderColumn(col.key, col, false)}
              </div>
            ))}
          </div>
        </div>

        <RetroBoardImages
          images={boardImages.filter(img => img.x >= 0 && img.y >= 0)}
          draggingImage={draggingImage}
          resizingImage={resizingImage}
          onImageMouseDown={handleImageMouseDown}
          onRemoveImage={handleRemoveBoardImage}
          onResizeStart={handleResizeStart}
        />

        {Object.entries(cursors).map(([userId, cursor]) => (
          <div
            key={userId}
            className="retro-cursor"
            style={{
              left: `${cursor.x}px`,
              top: `${cursor.y}px`,
            }}
          >
            {cursor.avatarSeed && (
              <div 
                className="retro-cursor__avatar"
                dangerouslySetInnerHTML={{ __html: createAvatarSvg(cursor.avatarSeed) }}
              />
            )}
            <div className="retro-cursor__name">{cursor.nickname}</div>
          </div>
        ))}
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
                  {renderColumn(col.key, col, true)}
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
