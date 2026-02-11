"use client";

import { useState, useRef, useEffect } from "react";
import { IconAlarm, IconMusic, IconDownload, IconShare, IconFileTypeCsv, IconFileTypePdf, IconChecklist, IconLink, IconUserPlus, IconEye } from "@tabler/icons-react";
import RetroTimerV2 from "./retro-timer-v2";
import RetroMusicPlayer from "./retro-music-player";

interface RetroHeaderProps {
  isOwner: boolean;
  showTimer: boolean;
  setShowTimer: (value: boolean) => void;
  showMusic: boolean;
  setShowMusic: (value: boolean) => void;
  timer: any;
  music: any;
  participants: any[];
  retroTitle: string;
  roomId: string;
  onTimerUpdate: (data: any) => void;
  onMusicUpdate: (data: any) => void;
  onExportCSV: () => void;
  onExportPDF: () => void;
  onExportActionItemsPDF: () => void;
  onCopyInviteLink: () => void;
  cardsRevealed: boolean;
  onRevealAllCards: () => void;
  onRevealMyCards: () => void;
}

const RetroHeader = ({
  isOwner,
  showTimer,
  setShowTimer,
  showMusic,
  setShowMusic,
  timer,
  music,
  participants,
  retroTitle,
  roomId,
  onTimerUpdate,
  onMusicUpdate,
  onExportCSV,
  onExportPDF,
  onExportActionItemsPDF,
  onCopyInviteLink,
  cardsRevealed,
  onRevealAllCards,
  onRevealMyCards,
}: RetroHeaderProps) => {
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [showInviteDropdown, setShowInviteDropdown] = useState(false);
  const [showRevealedBadge, setShowRevealedBadge] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);
  const inviteRef = useRef<HTMLDivElement>(null);

  // Show "Cards Revealed" badge briefly when cards get revealed
  useEffect(() => {
    if (cardsRevealed) {
      setShowRevealedBadge(true);
      const timer = setTimeout(() => setShowRevealedBadge(false), 5000);
      return () => clearTimeout(timer);
    }
    setShowRevealedBadge(false);
  }, [cardsRevealed]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setShowExportDropdown(false);
      }
      if (inviteRef.current && !inviteRef.current.contains(e.target as Node)) {
        setShowInviteDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const inviteUrl = typeof window !== 'undefined' ? `${window.location.origin}/retro/${roomId}` : '';

  // Sort participants by nickname alphabetically
  const sortedParticipants = [...participants].sort((a, b) => 
    a.nickname.localeCompare(b.nickname, 'tr', { sensitivity: 'base' })
  );

  return (
    <div className="retro-board__header">
      <div className="retro-board__header-left">
        <h1 className="retro-board__title">{retroTitle}</h1>
        <div className="retro-board__participants">
          {sortedParticipants.map((participant) => (
            <div
              key={participant.userID}
              className={`retro-board__participant ${participant.isAfk ? 'retro-board__participant--afk' : ''}`}
              title={participant.nickname}
            >
              {participant.avatarSvg && (
                <div dangerouslySetInnerHTML={{ __html: participant.avatarSvg }} />
              )}
              {participant.isAfk && <span className="retro-board__participant-afk">AFK</span>}
            </div>
          ))}
        </div>
      </div>
      
      <div className="retro-board__header-right">
      {/* Timer - Show to owner if panel is open, or to everyone if running */}
      {(isOwner && showTimer) || (!isOwner && timer.isRunning) ? (
        <div className="retro-board__timer">
          <IconAlarm size={18} />
          <RetroTimerV2
            timer={timer}
            isOwner={isOwner}
            onTimerUpdate={onTimerUpdate}
          />
        </div>
      ) : null}

      {/* Music - Show to owner if panel is open, or to everyone if playing */}
      {(music.isPlaying || (isOwner && showMusic)) && (
        <div className="retro-board__music">
          <IconMusic size={18} />
          <RetroMusicPlayer
            music={music}
            isOwner={isOwner}
            onMusicUpdate={onMusicUpdate}
          />
        </div>
      )}

      <div className="retro-board__controls">
        {/* Reveal buttons - show to everyone */}
        {!cardsRevealed && (
          <button
            className="retro-board__reveal-btn retro-board__reveal-btn--mine"
            onClick={onRevealMyCards}
            title="Reveal my cards"
          >
            <IconEye size={16} />
            <span>Reveal Mine</span>
          </button>
        )}
        {isOwner && !cardsRevealed && (
          <button
            className="retro-board__reveal-btn retro-board__reveal-btn--all"
            onClick={onRevealAllCards}
            title="Reveal all cards"
          >
            <IconEye size={16} />
            <span>Reveal All</span>
          </button>
        )}
        {cardsRevealed && showRevealedBadge && (
          <div className="retro-board__revealed-badge">
            <IconEye size={16} />
            <span>Cards Revealed</span>
          </div>
        )}

        {isOwner && (
          <>
            <button
              className={`retro-board__control-btn ${showTimer ? "active" : ""}`}
              onClick={() => setShowTimer(!showTimer)}
              title="Timer"
            >
              <IconAlarm size={20} />
            </button>
            <div className="retro-board__control-wrapper">
              <button
                className="retro-board__control-btn retro-board__control-btn--disabled"
                disabled
              >
                <IconMusic size={20} />
              </button>
              <span className="retro-board__control-tooltip">Soon</span>
            </div>
            {/* Export Dropdown */}
            <div className="retro-board__dropdown-wrapper" ref={exportRef}>
              <button
                className={`retro-board__control-btn ${showExportDropdown ? 'active' : ''}`}
                onClick={() => {
                  setShowExportDropdown(!showExportDropdown);
                  setShowInviteDropdown(false);
                }}
                title="Export"
              >
                <IconDownload size={20} />
              </button>
              {showExportDropdown && (
                <div className="retro-board__dropdown">
                  <button className="retro-board__dropdown-item" onClick={() => { onExportCSV(); setShowExportDropdown(false); }}>
                    <IconFileTypeCsv size={18} />
                    <span>Export CSV</span>
                  </button>
                  <button className="retro-board__dropdown-item" onClick={() => { onExportPDF(); setShowExportDropdown(false); }}>
                    <IconFileTypePdf size={18} />
                    <span>Export PDF</span>
                  </button>
                  <div className="retro-board__dropdown-divider" />
                  <button className="retro-board__dropdown-item" onClick={() => { onExportActionItemsPDF(); setShowExportDropdown(false); }}>
                    <IconChecklist size={18} />
                    <span>Export Action Items</span>
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* Invite Dropdown */}
        <div className="retro-board__dropdown-wrapper" ref={inviteRef}>
          <button
            className={`retro-board__invite-btn ${showInviteDropdown ? 'active' : ''}`}
            onClick={() => {
              setShowInviteDropdown(!showInviteDropdown);
              setShowExportDropdown(false);
            }}
            title="Invite"
          >
            <IconShare size={20} />
          </button>
          {showInviteDropdown && (
            <div className="retro-board__dropdown retro-board__dropdown--invite">
              <div className="retro-board__dropdown-url">
                <IconLink size={16} />
                <input 
                  type="text" 
                  value={inviteUrl} 
                  readOnly 
                  className="retro-board__dropdown-url-input"
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
              </div>
              <button className="retro-board__dropdown-invite-btn" onClick={() => { onCopyInviteLink(); setShowInviteDropdown(false); }}>
                <IconUserPlus size={18} />
                <span>Copy Invite Link</span>
              </button>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
};

export default RetroHeader;
