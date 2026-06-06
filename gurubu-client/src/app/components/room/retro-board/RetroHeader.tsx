"use client";

import { useState, useRef, useEffect } from "react";
import {
  IconAlarm,
  IconMusic,
  IconDownload,
  IconUpload,
  IconShare,
  IconFileTypeCsv,
  IconFileTypePdf,
  IconChecklist,
  IconLink,
  IconUserPlus,
  IconEye,
  IconClipboardList,
  IconFlag,
  IconPlayerPause,
  IconPlayerPlay,
  IconVolume,
} from "@tabler/icons-react";
import RetroTimerV2 from "./retro-timer-v2";

interface RetroHeaderProps {
  isOwner: boolean;
  showTimer: boolean;
  setShowTimer: (value: boolean) => void;
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
  onImportCards: () => void;
  onShowPreviousActionItems: () => void;
  hasPreviousRetro?: boolean;
  cardsRevealed?: boolean;
  onRevealAllCards?: () => void;
  onRevealMyCards?: () => void;
  onHideAllCards?: () => void;
  hasCards?: boolean;
  onEndRetro?: () => void;
  isReadonly?: boolean;
}

const RetroHeader = ({
  isOwner,
  showTimer,
  setShowTimer,
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
  onImportCards,
  onShowPreviousActionItems,
  hasPreviousRetro,
  cardsRevealed,
  onRevealAllCards,
  onRevealMyCards,
  onHideAllCards,
  hasCards,
  onEndRetro,
  isReadonly,
}: RetroHeaderProps) => {
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [showInviteDropdown, setShowInviteDropdown] = useState(false);
  const [showMusicDropdown, setShowMusicDropdown] = useState(false);
  const [pendingPlay, setPendingPlay] = useState(false);
  const [musicUrl, setMusicUrl] = useState("");
  const [localVolume, setLocalVolume] = useState(50);
  const [isLocallyPaused, setIsLocallyPaused] = useState(false);

  const exportRef = useRef<HTMLDivElement>(null);
  const inviteRef = useRef<HTMLDivElement>(null);
  const musicRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasInteracted = useRef(false);

  type MusicPlatform = "audio" | "youtube";

  // Click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node))
        setShowExportDropdown(false);
      if (inviteRef.current && !inviteRef.current.contains(e.target as Node))
        setShowInviteDropdown(false);
      if (musicRef.current && !musicRef.current.contains(e.target as Node))
        setShowMusicDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const detectPlatform = (url: string): MusicPlatform => {
    if (url.includes("youtube.com") || url.includes("youtu.be"))
      return "youtube";
    return "audio";
  };

  const platform = music.url ? detectPlatform(music.url) : "audio";

  // Load volume from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("retroMusicVolume");
    if (saved) setLocalVolume(Number(saved));
  }, []);

  // Sync music URL from prop
  useEffect(() => {
    if (music.url) setMusicUrl(music.url);
  }, [music.url]);

  // Reset local pause when owner stops
  useEffect(() => {
    if (!music.isPlaying) setIsLocallyPaused(false);
  }, [music.isPlaying]);

  // Audio instance
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.loop = true;
    audioRef.current.volume = localVolume / 100;
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Volume
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = localVolume / 100;
  }, [localVolume]);

  // Interaction tracker
  useEffect(() => {
    const mark = () => {
      hasInteracted.current = true;
    };
    document.addEventListener("click", mark, { once: true });
    return () => document.removeEventListener("click", mark);
  }, []);

  // Play/Pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || platform !== "audio" || !music.url) return;

    const handleError = () => {
      console.error("Audio load failed:", music.url);
      onMusicUpdate({ ...music, isPlaying: false, error: "unsupported" });
    };

    audio.addEventListener("error", handleError);
    audio.pause();
    audio.src = music.url;
    audio.load();

    if (!music.isPlaying) {
      audio.removeEventListener("error", handleError);
      return;
    }

    if (!hasInteracted.current) {
      setPendingPlay(true);
      audio.removeEventListener("error", handleError);
      return;
    }

    audio.play().catch(() => {
      onMusicUpdate({ ...music, isPlaying: false, error: "unsupported" });
    });

    return () => audio.removeEventListener("error", handleError);
  }, [music.isPlaying, music.url, platform]);

  const handleSetMusic = () => {
    if (!musicUrl.trim()) return;
    onMusicUpdate({ url: musicUrl, isPlaying: true });
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value);
    setLocalVolume(newVolume);
    localStorage.setItem("retroMusicVolume", newVolume.toString());
  };

  const inviteUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/retro/${roomId}`
      : "";

  const sortedParticipants = [...participants].sort((a, b) =>
    a.nickname.localeCompare(b.nickname, "tr", { sensitivity: "base" }),
  );

  return (
    <div className="retro-board__header">
      <div className="retro-board__header-left">
        <h1 className="retro-board__title">{retroTitle}</h1>
        <div className="retro-board__participants">
          {sortedParticipants.map((participant) => (
            <div
              key={participant.userID}
              className={`retro-board__participant ${participant.isAfk ? "retro-board__participant--afk" : ""}`}
              title={participant.nickname}
            >
              {participant.avatarSvg && (
                <div
                  dangerouslySetInnerHTML={{ __html: participant.avatarSvg }}
                />
              )}
              {participant.isAfk && (
                <span className="retro-board__participant-afk">AFK</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="retro-board__header-right">
        {((isOwner && showTimer) || (!isOwner && timer.isRunning)) && (
          <div className="retro-board__timer">
            <RetroTimerV2
              timer={timer}
              isOwner={isOwner}
              onTimerUpdate={onTimerUpdate}
            />
          </div>
        )}

        {/* Non-owner music control */}
        {(pendingPlay || music.isPlaying) && !isOwner && (
          <button
            className={`retro-board__control-btn ${music.isPlaying && !pendingPlay && !isLocallyPaused ? "active" : ""}`}
            onClick={() => {
              if (pendingPlay) {
                hasInteracted.current = true;
                audioRef.current?.play().catch(console.error);
                setPendingPlay(false);
                setIsLocallyPaused(false);
              } else if (isLocallyPaused) {
                audioRef.current?.play().catch(console.error);
                setIsLocallyPaused(false);
              } else {
                audioRef.current?.pause();
                setIsLocallyPaused(true);
              }
            }}
            title={
              pendingPlay || isLocallyPaused ? "Play Music" : "Pause Music"
            }
          >
            {pendingPlay || isLocallyPaused ? (
              <IconPlayerPlay size={20} />
            ) : (
              <IconPlayerPause size={20} />
            )}
          </button>
        )}

        <div className="retro-board__controls">
          {isOwner && !isReadonly && (
            <button
              className={`retro-board__control-btn ${showTimer ? "active" : ""}`}
              onClick={() => setShowTimer(!showTimer)}
              title="Timer"
            >
              <IconAlarm size={20} />
            </button>
          )}

          {/* Music - owner only */}
          {isOwner && !isReadonly && (
            <div className="retro-board__dropdown-wrapper" ref={musicRef}>
              <button
                className={`retro-board__control-btn ${showMusicDropdown || music.isPlaying ? "active" : ""}`}
                onClick={() => {
                  setShowMusicDropdown(!showMusicDropdown);
                  setShowExportDropdown(false);
                  setShowInviteDropdown(false);
                }}
                title="Background Music"
              >
                <IconMusic size={20} />
              </button>
              {showMusicDropdown && (
                <div className="retro-board__dropdown retro-board__dropdown--music">
                  <div className="retro-board__dropdown-header">
                    Background Music
                  </div>
                  <div className="retro-board__music-url-input">
                    <input
                      type="url"
                      value={musicUrl}
                      onChange={(e) => setMusicUrl(e.target.value)}
                      placeholder="Audio URL (YouTube, .mp3, .wav)"
                      className="retro-board__dropdown-url-input"
                    />
                    <button
                      className="retro-board__dropdown-btn retro-board__dropdown-btn--primary"
                      onClick={handleSetMusic}
                      disabled={!musicUrl.trim()}
                    >
                      Set Music
                    </button>
                  </div>
                  {music.url && (
                    <>
                      <div className="retro-board__dropdown-divider" />
                      <div className="retro-board__music-controls">
                        <button
                          className="retro-board__dropdown-item"
                          onClick={() =>
                            onMusicUpdate({
                              ...music,
                              isPlaying: !music.isPlaying,
                            })
                          }
                        >
                          {music.isPlaying ? (
                            <>
                              <IconPlayerPause size={18} />
                              <span>Pause</span>
                            </>
                          ) : (
                            <>
                              <IconPlayerPlay size={18} />
                              <span>Play</span>
                            </>
                          )}
                        </button>
                        {platform === "audio" && (
                          <div className="retro-board__music-volume">
                            <IconVolume size={18} />
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={localVolume}
                              onChange={handleVolumeChange}
                              className="retro-board__volume-slider"
                            />
                            <span>{localVolume}%</span>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                  <div className="retro-board__dropdown-hint">
                    💡Youtube & Direct audio file links only (.mp3, .wav)
                  </div>
                  {musicUrl && music.error === "unsupported" && (
                    <div className="retro-board__dropdown-error">
                      ⚠️ Audio format not supported or URL is invalid
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Export - owner only */}
          {isOwner && (
            <div className="retro-board__dropdown-wrapper" ref={exportRef}>
              <button
                className={`retro-board__control-btn ${showExportDropdown ? "active" : ""}`}
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
                  <button
                    className="retro-board__dropdown-item"
                    onClick={() => {
                      onExportCSV();
                      setShowExportDropdown(false);
                    }}
                  >
                    <IconFileTypeCsv size={18} />
                    <span>Export CSV</span>
                  </button>
                  <button
                    className="retro-board__dropdown-item"
                    onClick={() => {
                      onExportPDF();
                      setShowExportDropdown(false);
                    }}
                  >
                    <IconFileTypePdf size={18} />
                    <span>Export PDF</span>
                  </button>
                  <div className="retro-board__dropdown-divider" />
                  <button
                    className="retro-board__dropdown-item"
                    onClick={() => {
                      onExportActionItemsPDF();
                      setShowExportDropdown(false);
                    }}
                  >
                    <IconChecklist size={18} />
                    <span>Export Action Items</span>
                  </button>
                  <div className="retro-board__dropdown-divider" />
                  <div
                    className="retro-board__dropdown-item retro-board__dropdown-item--disabled"
                    title="Import from Ludi, MetroRetro, Zoom Retro (Coming Soon)"
                  >
                    <IconUpload size={18} />
                    <span>Import Cards</span>
                    <span className="retro-board__dropdown-soon">
                      Import from Other Tools - Soon
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Invite */}
          <div className="retro-board__dropdown-wrapper" ref={inviteRef}>
            <button
              className={`retro-board__control-btn ${showInviteDropdown ? "active" : ""}`}
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
                <button
                  className="retro-board__dropdown-invite-btn"
                  onClick={() => {
                    onCopyInviteLink();
                    setShowInviteDropdown(false);
                  }}
                >
                  <IconUserPlus size={18} />
                  <span>Copy Invite Link</span>
                </button>
              </div>
            )}
          </div>

          <div className="retro-board__divider" />

          {hasCards && !isReadonly && !cardsRevealed && (
            <div className="retro-board__reveal-controls">
              <button
                className="retro-board__reveal-btn"
                onClick={onRevealMyCards}
                title="Reveal your cards"
              >
                <IconEye size={18} />
                <span>Reveal Mine</span>
              </button>
              {isOwner && (
                <button
                  className="retro-board__reveal-btn retro-board__reveal-btn--all"
                  onClick={onRevealAllCards}
                  title="Reveal all cards"
                >
                  <IconEye size={18} />
                  <span>Reveal All</span>
                </button>
              )}
            </div>
          )}

          <div className="retro-board__control-wrapper">
            <button
              className="retro-board__control-btn retro-board__control-btn--disabled"
              disabled
              title="View action items from previous retro (Coming Soon)"
            >
              <IconClipboardList size={20} />
            </button>
            <span className="retro-board__control-tooltip">
              Previous Actions - Soon
            </span>
          </div>

          {isOwner && !isReadonly && (
            <button
              className="retro-board__end-retro-btn"
              onClick={onEndRetro}
              title="End this retro"
            >
              <IconFlag size={16} />
              <span>End Retro</span>
            </button>
          )}

          {isReadonly && (
            <div className="retro-board__readonly-badge">
              <span>Read Only</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RetroHeader;
