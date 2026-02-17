"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
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
import RetroBottomBar from "./RetroBottomBar";
import RetroModals from "./RetroModals";
import { RetroParticipant, User } from "@/shared/interfaces";
import { RETRO_STAMPS, RETRO_CARD_TEMPLATES } from "@/constants/retroConstants";
import { copyRetroInviteLink, exportRetroToCSV, exportRetroToPDF, exportActionItemsToPDF, parseImportedRetroFile, ImportedColumn } from "@/utils/retroUtils";
import { RetroService } from "@/services/retroService";
import { getRetroHistory } from "@/shared/helpers/lobbyStorage";
import toast from "react-hot-toast";
import { useRetroSocketEvents } from "./hooks/useRetroSocketEvents";
import { useCanvasControls } from "./hooks/useCanvasControls";
import { useBoardImages } from "./hooks/useBoardImages";

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

  // ─── Local State ───────────────────────────────────────────────
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
  const [confettiElements, setConfettiElements] = useState<Array<{id: string, x: number, y: number, color: string, rotation: number, delay: number, randomX: number, size: number}>>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<{show: boolean, cardId: string | null, column: ColumnType | null}>({
    show: false, cardId: null, column: null
  });
  const [showActionItems, setShowActionItems] = useState(false);
  const [animatedBackground, setAnimatedBackground] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isAfk, setIsAfk] = useState(false);
  const [draggingCardBetweenColumns, setDraggingCardBetweenColumns] = useState<{cardId: string, sourceColumn: string} | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<'sidebar' | 'bottombar'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('retroSidebarMode') as 'sidebar' | 'bottombar') || 'sidebar';
    }
    return 'sidebar';
  });
  const [floatingEmotes, setFloatingEmotes] = useState<Array<{id: string, emoji: string, nickname: string, x: number}>>([]);
  const [showEndRetroModal, setShowEndRetroModal] = useState(false);
  const [endRetroReport, setEndRetroReport] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState<ImportedColumn[] | null>(null);
  const [importColumnMapping, setImportColumnMapping] = useState<Record<string, string>>({});
  const [showPreviousActions, setShowPreviousActions] = useState(false);
  const [previousActionItems, setPreviousActionItems] = useState<any>(null);
  const [previousRetroTitle, setPreviousRetroTitle] = useState<string>('');
  const importFileRef = useRef<HTMLInputElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  // ─── Hooks ─────────────────────────────────────────────────────
  const canvasReady = !!(retroInfo && retroInfo.template);

  const {
    canvasViewportRef,
    isPanning,
    zoomLevel,
    pan,
    panRef,
    zoomRef,
    isPanningRef,
    handleZoomIn,
    handleZoomOut,
    handleZoomReset,
    handleCanvasMouseDown,
  } = useCanvasControls({ templateReady: canvasReady });

  const {
    boardImages,
    setBoardImages,
    draggingImage,
    setDraggingImage,
    resizingImage,
    columnHeaderImages,
    setColumnHeaderImages,
    columnHeaderImagePositions,
    setColumnHeaderImagePositions,
    handleImageMouseDown,
    handleRemoveBoardImage,
    handleResizeStart,
    handleBoardImageUpload,
    handleImageDragStart: hookImageDragStart,
    handleDropImageOnColumn,
    handleColumnHeaderImageUpload,
    handleRemoveColumnHeaderImage,
    handleColumnHeaderImagePositionUpdate,
  } = useBoardImages({ socket, roomId, userInfo, canvasViewportRef, pan, zoomLevel });

  const triggerConfettiAnimation = useCallback(() => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
      '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52C7B8',
      '#FF85A1', '#FFD93D', '#6BCF7F', '#A29BFE', '#FD79A8',
      '#FDCB6E', '#74B9FF', '#A29BFE', '#FF7675', '#00B894'
    ];
    const newConfetti: Array<{id: string, x: number, y: number, color: string, rotation: number, delay: number, randomX: number, size: number}> = [];
    const burstCount = 5 + Math.floor(Math.random() * 3);

    for (let burst = 0; burst < burstCount; burst++) {
      const x = 100 + Math.random() * (window.innerWidth - 200);
      const y = window.innerHeight * (0.5 + Math.random() * 0.3);
      const confettiPerBurst = 10 + Math.floor(Math.random() * 6);

      for (let i = 0; i < confettiPerBurst; i++) {
        newConfetti.push({
          id: `confetti-${Date.now()}-${burst}-${i}-${Math.random()}`,
          x: x + (Math.random() - 0.5) * 100,
          y: y,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          delay: burst * 0.08 + Math.random() * 0.12,
          randomX: Math.random(),
          size: 8 + Math.random() * 6,
        });
      }
    }

    setConfettiElements(prev => [...prev, ...newConfetti]);
    setTimeout(() => {
      setConfettiElements(prev => prev.filter(c => !newConfetti.find(nc => nc.id === c.id)));
    }, 4500);
  }, []);

  useRetroSocketEvents({
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
  });

  // ─── Derived Values ────────────────────────────────────────────
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
  const isReadonly = retroInfo?.status === 'completed';

  // ─── Effects ───────────────────────────────────────────────────
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!showActionItems) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.retro-action-panel')) setShowActionItems(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showActionItems]);

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

  useEffect(() => {
    if (retroInfo?.boardImages) setBoardImages(retroInfo.boardImages);
    if (retroInfo?.columnHeaderImages) setColumnHeaderImages(retroInfo.columnHeaderImages);
    if (retroInfo?.columnHeaderImagePositions) setColumnHeaderImagePositions(retroInfo.columnHeaderImagePositions);
  }, [retroInfo]);

  // Cursor tracking refs and effect
  const lobbyRef = useRef(userInfo.lobby);
  useEffect(() => { lobbyRef.current = userInfo.lobby; }, [userInfo.lobby]);

  useEffect(() => {
    if (!canvasReady || !canvasViewportRef.current) return;
    let lastEmit = 0;
    const THROTTLE_MS = 50;

    const handleMouseMove = (e: MouseEvent) => {
      if (isPanningRef.current) return;
      if (!lobbyRef.current) return;
      const now = Date.now();
      if (now - lastEmit < THROTTLE_MS) return;
      lastEmit = now;

      const vp = canvasViewportRef.current;
      if (!vp) return;
      const vpRect = vp.getBoundingClientRect();
      const viewportX = e.clientX - vpRect.left;
      const viewportY = e.clientY - vpRect.top;
      const canvasX = (viewportX - panRef.current.x) / zoomRef.current;
      const canvasY = (viewportY - panRef.current.y) / zoomRef.current;

      socket.emit("cursorMove", roomId, { x: canvasX, y: canvasY }, lobbyRef.current?.credentials);
    };

    const el = canvasViewportRef.current;
    el.addEventListener('mousemove', handleMouseMove);
    return () => { el.removeEventListener('mousemove', handleMouseMove); };
  }, [socket, roomId, canvasReady]);

  // ─── Avatar ────────────────────────────────────────────────────
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
      socket.emit("updateAvatar", { retroId: roomId, credentials: userInfo.lobby.credentials, avatarSeed: newSeed });
    }
  };

  // ─── Nickname ──────────────────────────────────────────────────
  const handleSaveNickname = () => {
    if (!newNickname.trim() || newNickname === currentNickname) {
      setEditingNickname(false);
      return;
    }
    if (userInfo.lobby) {
      socket.emit("updateNickname", { retroId: roomId, credentials: userInfo.lobby.credentials, newNickname: newNickname.trim() });
      localStorage.setItem("retroNickname", newNickname.trim());
      setCurrentNickname(newNickname.trim());
      setEditingNickname(false);
      toast.success("Nickname updated successfully!");
    }
  };

  // ─── Card Actions ──────────────────────────────────────────────
  const sanitizeCardText = (text: string): string => {
    let sanitized = text.trim();
    sanitized = sanitized.replace(/\n{3,}/g, '\n\n');
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
      isAnonymous: isAnonymous,
    };
    socket.emit("addRetroCard", roomId, columnKey, newCard, userInfo.lobby.credentials);
    setActiveColumn(null);
    setNewCardText("");
    setNewCardImage(null);
    setNewCardColor(null);
    setIsAnonymous(false);
  };

  const handleColumnDoubleClick = (columnKey: string) => {
    if (isReadonly || activeColumn) return;
    setActiveColumn(columnKey);
    setNewCardColor('#FFF9E5');
  };

  const handleDeleteCard = (columnKey: string, cardId: string) => {
    setDeleteConfirm({ show: true, cardId, column: columnKey });
  };

  const confirmDelete = () => {
    if (deleteConfirm.cardId && deleteConfirm.column && userInfo.lobby) {
      if (retroInfo && retroInfo.retroCards && retroInfo.retroCards[deleteConfirm.column]) {
        const updatedRetroCards = {
          ...retroInfo.retroCards,
          [deleteConfirm.column]: retroInfo.retroCards[deleteConfirm.column].filter(
            (card: any) => card.id !== deleteConfirm.cardId
          ),
        };
        setRetroInfo({ ...retroInfo, retroCards: updatedRetroCards } as any);
      }
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
    socket.emit("updateRetroCard", roomId, columnKey, cardId, { votes: newVotes, voteCount: newVotes.length }, userInfo.lobby.credentials);
  };

  // ─── Card Grouping ─────────────────────────────────────────────
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

  // ─── Card Drag Between Columns ─────────────────────────────────
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
    const sourceCards: any[] = retroInfo?.retroCards?.[draggingCardBetweenColumns.sourceColumn] || [];
    const draggedCardData = sourceCards.find((c: any) => c.id === draggingCardBetweenColumns.cardId);

    if (draggedCardData?.groupId) {
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

  // ─── Reveal / End / Confetti / Emote ───────────────────────────
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

  const handleConfetti = () => {
    if (socket && userInfo.lobby?.credentials) {
      socket.emit("triggerConfetti", roomId, userInfo.lobby.credentials);
    }
  };

  const handleEndRetro = () => {
    if (socket && userInfo.lobby?.credentials) {
      socket.emit("endRetro", roomId, userInfo.lobby.credentials);
    }
  };

  const handleEndRetroConfirm = () => {
    setShowEndRetroModal(false);
    setEndRetroReport(null);
    if (typeof window !== 'undefined') {
      window.location.href = '/retro/dashboard';
    }
  };

  const handleEmoteSend = (emoji: string) => {
    if (socket && userInfo.lobby?.credentials) {
      socket.emit("emoteReaction", roomId, { emoji }, userInfo.lobby.credentials);
    }
  };

  // ─── AFK / Sidebar Mode ───────────────────────────────────────
  const handleToggleAfk = () => {
    const newAfk = !isAfk;
    setIsAfk(newAfk);
    if (userInfo.lobby) {
      socket.emit("updateAfkStatus", { retroId: roomId, credentials: userInfo.lobby.credentials, isAfk: newAfk });
    }
  };

  const handleToggleSidebarMode = () => {
    const next = sidebarMode === 'sidebar' ? 'bottombar' : 'sidebar';
    setSidebarMode(next);
    localStorage.setItem('retroSidebarMode', next);
  };

  // ─── Timer / Music ─────────────────────────────────────────────
  const handleTimerUpdate = (timerData: { timeLeft: number; isRunning: boolean; startTime: number | null }) => {
    if (userInfo.lobby) {
      socket.emit("updateRetroTimer", roomId, timerData, userInfo.lobby.credentials);
    }
  };

  const handleMusicUpdate = (musicData: { isPlaying: boolean; url: string | null }) => {
    if (userInfo.lobby) {
      socket.emit("updateRetroMusic", roomId, musicData, userInfo.lobby.credentials);
    }
  };

  // ─── Export ────────────────────────────────────────────────────
  const handleCopyInviteLink = () => copyRetroInviteLink(roomId);
  const handleExportCSV = () => exportRetroToCSV(mainColumns, retroCards, participants);
  const handleExportPDF = () => exportRetroToPDF(mainColumns, retroCards, participants, retroInfo?.title || "Retrospective");
  const handleExportActionItemsPDF = () => exportActionItemsToPDF(sideColumns, retroCards, participants, retroInfo?.title || "Retrospective");

  // ─── Import ────────────────────────────────────────────────────
  const handleImportCards = () => { importFileRef.current?.click(); };

  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = parseImportedRetroFile(content, file.name);
        if (parsed.length === 0) {
          toast.error("No cards found in the imported file.");
          return;
        }
        setImportData(parsed);
        const mapping: Record<string, string> = {};
        parsed.forEach((importCol) => {
          const matchedColumn = mainColumns.find(
            (mc: any) => mc.title.toLowerCase().replace(/[^a-z0-9]/g, '') ===
              importCol.column.toLowerCase().replace(/[^a-z0-9]/g, '')
          );
          mapping[importCol.column] = matchedColumn ? matchedColumn.key : (mainColumns[0]?.key || '');
        });
        setImportColumnMapping(mapping);
        setShowImportModal(true);
      } catch (err: any) {
        toast.error(err.message || "Failed to parse import file.");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleConfirmImport = () => {
    if (!importData || !userInfo.lobby) return;
    importData.forEach((importCol) => {
      const targetColumn = importColumnMapping[importCol.column];
      if (targetColumn && importCol.cards.length > 0) {
        socket.emit("importCards", roomId, targetColumn, importCol.cards, userInfo.lobby.credentials);
      }
    });
    setShowImportModal(false);
    setImportData(null);
    setImportColumnMapping({});
  };

  // ─── Previous Action Items ─────────────────────────────────────
  const hasPreviousRetro = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const history = getRetroHistory();
    return history.filter(h => h.retroId !== roomId).length > 0;
  }, [roomId]);

  const handleShowPreviousActionItems = async () => {
    if (showPreviousActions) { setShowPreviousActions(false); return; }
    const history = getRetroHistory();
    const previousRetros = history.filter(h => h.retroId !== roomId);
    if (previousRetros.length === 0) { toast.error("No previous retros found."); return; }

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const retroService = new RetroService(baseUrl);
    for (const prev of previousRetros) {
      try {
        const data = await retroService.getRetroActionItems(prev.retroId);
        if (data && data.actionItems) {
          const hasItems = Object.values(data.actionItems).some((col: any) => col.cards && col.cards.length > 0);
          if (hasItems) {
            setPreviousActionItems(data.actionItems);
            setPreviousRetroTitle(data.title || prev.title || 'Previous Retro');
            setShowPreviousActions(true);
            return;
          }
        }
      } catch {
        // Try the next one
      }
    }
    toast("No action items found in previous retros.", { icon: 'ℹ️' });
  };

  // ─── Stamps ────────────────────────────────────────────────────
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

  // ─── Drag Handlers ─────────────────────────────────────────────
  const handleImageDragStart = (image: any, e: React.DragEvent) => {
    setDraggedImage(image);
    hookImageDragStart(image, e);
  };

  const handleCardDragStart = (template: any, e: React.DragEvent) => {
    setDraggedCard(template);
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', template.name);
    const cleanup = () => {
      setDraggedCard(null);
      setDraggedImage(null);
      setDraggingCardBetweenColumns(null);
      e.target.removeEventListener('dragend', cleanup);
    };
    e.target.addEventListener('dragend', cleanup);
  };

  // ─── Canvas Drop Handler ───────────────────────────────────────
  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedCard) {
      const elements = document.elementsFromPoint(e.clientX, e.clientY);
      let found = false;
      for (const el of elements) {
        const col = (el as HTMLElement).closest?.('[data-column-key]') as HTMLElement | null;
        if (col) {
          const colKey = col.getAttribute('data-column-key');
          if (colKey) { setActiveColumn(colKey); setNewCardColor(draggedCard.color); found = true; }
          break;
        }
      }
      if (!found) {
        const allColumns = document.querySelectorAll('[data-column-key]');
        let closestCol: Element | null = null;
        let closestDist = Infinity;
        allColumns.forEach(col => {
          const rect = col.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const dist = Math.sqrt((e.clientX - cx) ** 2 + (e.clientY - cy) ** 2);
          if (dist < closestDist) { closestDist = dist; closestCol = col; }
        });
        if (closestCol) {
          const colKey = (closestCol as HTMLElement).getAttribute('data-column-key');
          if (colKey) { setActiveColumn(colKey); setNewCardColor(draggedCard.color); }
        }
      }
      requestAnimationFrame(() => setDraggedCard(null));
    } else if (draggedImage) {
      const vpRect = canvasViewportRef.current?.getBoundingClientRect();
      if (!vpRect) return;
      const viewportX = e.clientX - vpRect.left;
      const viewportY = e.clientY - vpRect.top;
      const canvasX = (viewportX - pan.x) / zoomLevel;
      const canvasY = (viewportY - pan.y) / zoomLevel;
      const x = canvasX - draggedImage.width / 2;
      const y = canvasY - draggedImage.height / 2;
      const updatedImages = boardImages.map(img => img.id === draggedImage.id ? { ...img, x, y } : img);
      setBoardImages(updatedImages);
      if (userInfo.lobby) {
        socket.emit("updateBoardImages", roomId, updatedImages, userInfo.lobby.credentials);
      }
      setDraggedImage(null);
    }
  };

  // ─── Render Column ─────────────────────────────────────────────
  const renderColumn = (columnKey: string, columnConfig: any, showAddButton: boolean, isSideColumn: boolean = false) => {
    const cards = (retroCards[columnKey] || []).sort((a: any, b: any) => a.createdAt - b.createdAt);

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
        columnHeaderImagePositions={columnHeaderImagePositions}
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
        onColumnHeaderImagePositionUpdate={handleColumnHeaderImagePositionUpdate}
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
        onToggleAnonymous={() => setIsAnonymous(!isAnonymous)}
        cardsRevealed={retroInfo?.cardsRevealed}
        isReadonly={isReadonly}
      />
    );
  };

  // ─── Loading ───────────────────────────────────────────────────
  if (!mounted) return null;
  if (!retroInfo || !retroInfo.template) return <RetroLoadingScreen />;

  const avatarSvg = createAvatarSvg(avatarSeed);
  const participantsWithAvatars = participants.map(p => ({
    ...p,
    avatarSvg: createAvatarSvg(p.avatarSeed || '')
  }));

  // ─── JSX ───────────────────────────────────────────────────────
  return (
    <div className="retro-board-container">
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

      {sidebarMode === 'sidebar' ? (
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
          sidebarMode={sidebarMode}
          onToggleSidebarMode={handleToggleSidebarMode}
        />
      ) : null}

      <div
        ref={boardRef}
        className={`retro-board ${!animatedBackground ? 'retro-board--plain' : ''} ${sidebarCollapsed || sidebarMode === 'bottombar' ? 'retro-board--sidebar-collapsed' : ''} ${isPanning ? 'retro-board--panning' : ''}`}
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
            onImportCards={handleImportCards}
            onShowPreviousActionItems={handleShowPreviousActionItems}
            hasPreviousRetro={hasPreviousRetro}
            cardsRevealed={retroInfo?.cardsRevealed}
            onRevealAllCards={handleRevealAllCards}
            onRevealMyCards={handleRevealMyCards}
            onHideAllCards={handleHideAllCards}
            hasCards={Object.values(retroCards).some(col => col.length > 0)}
            onEndRetro={handleEndRetro}
            isReadonly={isReadonly}
          />

          <div
            ref={canvasViewportRef}
            className="retro-board__canvas-viewport"
            onMouseDown={handleCanvasMouseDown}
            onDrop={handleCanvasDrop}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = draggedCard ? 'copy' : 'move';
            }}
          >
            <div className="retro-board__gradient-bg" />
            <div className="retro-board__grid-bg" style={{ backgroundPosition: `${pan.x % 24}px ${pan.y % 24}px` }} />
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

              {Object.entries(cursors).map(([userId, cursor]) => (
                <div key={userId} className="retro-cursor" style={{ left: cursor.x, top: cursor.y }}>
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
                <div key={col.key}>{renderColumn(col.key, col, true, true)}</div>
              ))}
            </div>
          )}
        </div>
      )}

      <RetroDeleteConfirm show={deleteConfirm.show} onConfirm={confirmDelete} onCancel={cancelDelete} />

      <input ref={importFileRef} type="file" accept=".json,.csv,.txt" style={{ display: 'none' }} onChange={handleImportFileChange} />

      <RetroModals
        showImportModal={showImportModal}
        importData={importData}
        importColumnMapping={importColumnMapping}
        mainColumns={mainColumns}
        sideColumns={sideColumns}
        onImportColumnMappingChange={setImportColumnMapping}
        onConfirmImport={handleConfirmImport}
        onCloseImportModal={() => setShowImportModal(false)}
        showPreviousActions={showPreviousActions}
        previousActionItems={previousActionItems}
        previousRetroTitle={previousRetroTitle}
        onClosePreviousActions={() => setShowPreviousActions(false)}
        showEndRetroModal={showEndRetroModal}
        endRetroReport={endRetroReport}
        retroTitle={retroInfo?.title || "Retrospective"}
        isOwner={!!isOwner}
        onEndRetroConfirm={handleEndRetroConfirm}
      />

      <RetroErrorPopup title="Connection Error" retroId={roomId} />
      <RetroOnboarding isOwner={isOwner} onTriggerConfetti={handleConfetti} />

      <div className="retro-floating-emotes">
        {floatingEmotes.map((emote) => (
          <div key={emote.id} className="retro-floating-emote" style={{ left: `${emote.x}%` }}>
            <span className="retro-floating-emote__emoji">{emote.emoji}</span>
            <span className="retro-floating-emote__name">{emote.nickname}</span>
          </div>
        ))}
      </div>

      {sidebarMode === 'bottombar' && !isReadonly && (
        <RetroBottomBar
          cardTemplates={cardTemplates}
          stamps={stamps}
          customStamps={customStamps}
          selectedStamp={selectedStamp}
          onStampSelect={setSelectedStamp}
          onCardDragStart={handleCardDragStart}
          onConfetti={handleConfetti}
          isAfk={isAfk}
          onToggleAfk={handleToggleAfk}
          onEmoteSend={handleEmoteSend}
          currentNickname={currentNickname}
          avatarSvg={avatarSvg}
          sidebarMode={sidebarMode}
          onToggleSidebarMode={handleToggleSidebarMode}
          animatedBackground={animatedBackground}
          onToggleBackground={() => setAnimatedBackground(!animatedBackground)}
        />
      )}

      {sidebarMode === 'sidebar' && !isReadonly && (
        <div className="retro-emote-bar">
          {['👍', '❤️', '😂', '🎉', '🔥', '👏', '💡', '😍', '🚀', '👀'].map((emoji) => (
            <button
              key={emoji}
              className="retro-emote-bar__btn"
              onClick={() => handleEmoteSend(emoji)}
              title={emoji}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default RetroBoard;
