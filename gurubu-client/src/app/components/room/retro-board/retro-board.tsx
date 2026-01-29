"use client";

import { useState, useEffect, useMemo } from "react";
import { useRetroRoom } from "@/contexts/RetroRoomContext";
import { useSocket } from "@/contexts/SocketContext";
import { createAvatar } from "@dicebear/core";
import { avataaars } from "@dicebear/collection";
import RetroColumn from "./RetroColumn";
import RetroSidebar from "./RetroSidebar";
import RetroBoardImages from "./RetroBoardImages";
import RetroDeleteConfirm from "./RetroDeleteConfirm";
import RetroHeader from "./RetroHeader";
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
  const socket = useSocket();
  const { retroInfo, userInfo, setRetroInfo } = useRetroRoom();
  
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

  // Close timer panel when timer starts
  useEffect(() => {
    if (timer.isRunning && showTimer) {
      setShowTimer(false);
    }
  }, [timer.isRunning]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedOptions = localStorage.getItem("avatarOptions");
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
        localStorage.setItem("avatarOptions", JSON.stringify({ seed: newSeed }));
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
    localStorage.setItem("avatarOptions", JSON.stringify({ seed: newSeed }));
    
    if (userInfo.lobby) {
      socket.emit("updateAvatar", {
        retroId: roomId,
        credentials: userInfo.lobby.credentials,
        avatarSeed: newSeed,
      });
    }
  };

  useEffect(() => {
    const nickname = localStorage.getItem("nickname");
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

    const handleInitializeRetro = (data: any) => setRetroInfo(data);
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

    const handleNicknameUpdated = (data: any) => {
      setRetroInfo(data.retroData);
      
      if (userInfo.lobby && data.userID === Number(userInfo.lobby.userID)) {
        setCurrentNickname(data.nickname);
        setNewNickname(data.nickname);
      }
      
      setCursors(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(userId => {
          if (userId === String(data.userID)) {
            updated[userId] = {
              ...updated[userId],
              nickname: data.nickname
            };
          }
        });
        return updated;
      });
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
    socket.on("boardImagesUpdated", handleBoardImagesUpdated);
    socket.on("columnHeaderImagesUpdated", handleColumnHeaderImagesUpdated);
    socket.on("mentioned", handleMentioned);
    socket.on("nicknameUpdated", handleNicknameUpdated);

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
      socket.off("boardImagesUpdated", handleBoardImagesUpdated);
      socket.off("columnHeaderImagesUpdated", handleColumnHeaderImagesUpdated);
      socket.off("mentioned", handleMentioned);
      socket.off("nicknameUpdated", handleNicknameUpdated);
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

  const handleUpdateCard = (columnKey: string, cardId: string, text: string, image: string | null, stamps: string[]) => {
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
    if (!newNickname.trim() || !userInfo.lobby) return;
    
    localStorage.setItem("nickname", newNickname);
    
    socket.emit("updateNickname", {
      retroId: roomId,
      credentials: userInfo.lobby.credentials,
      nickname: newNickname,
    });
    
    setEditingNickname(false);
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
          x: 100,
          y: 100,
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

    const updatedImages = boardImages.map(img => 
      img.id === draggingImage 
        ? { ...img, x: newX, y: newY }
        : img
    );
    
    setBoardImages(updatedImages);
  };

  const handleImageMouseUp = () => {
    if (draggingImage && userInfo.lobby) {
      socket.emit("updateBoardImages", roomId, boardImages, userInfo.lobby.credentials);
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

    const updatedImages = boardImages.map(img => 
      img.id === resizingImage.id 
        ? { ...img, width: newWidth, height: newHeight }
        : img
    );
    
    setBoardImages(updatedImages);
  };

  const handleResizeEnd = () => {
    if (resizingImage && userInfo.lobby) {
      socket.emit("updateBoardImages", roomId, boardImages, userInfo.lobby.credentials);
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
    return (
      <div className="retro-board-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <div>Loading retrospective...</div>
        </div>
      </div>
    );
  }

  const avatarSvg = createAvatarSvg(avatarSeed);
  const participantsWithAvatars = participants.map(p => ({
    ...p,
    avatarSvg: createAvatarSvg(p.avatarSeed || '')
  }));

  return (
    <div className="retro-board-container">
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
        boardImages={boardImages}
        onRemoveBoardImage={handleRemoveBoardImage}
        onBoardImageUpload={handleBoardImageUpload}
      />

      <div className="retro-board">
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
          images={boardImages}
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
    </div>
  );
};

export default RetroBoard;
