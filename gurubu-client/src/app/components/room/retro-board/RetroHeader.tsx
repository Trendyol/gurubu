"use client";

import { IconClock, IconMusic, IconDownload, IconShare } from "@tabler/icons-react";
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
  onTimerUpdate: (data: any) => void;
  onMusicUpdate: (data: any) => void;
  onExportCSV: () => void;
  onCopyInviteLink: () => void;
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
  onTimerUpdate,
  onMusicUpdate,
  onExportCSV,
  onCopyInviteLink,
}: RetroHeaderProps) => {
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
              className="retro-board__participant"
              title={participant.nickname}
            >
              {participant.avatarSvg && (
                <div dangerouslySetInnerHTML={{ __html: participant.avatarSvg }} />
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="retro-board__header-right">
      {/* Timer - Show to owner if panel is open, or to everyone if running */}
      {(isOwner && showTimer) || (!isOwner && timer.isRunning) ? (
        <div className="retro-board__timer">
          <IconClock size={18} />
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
        {isOwner && (
          <>
            <button
              className={`retro-board__control-btn ${showTimer ? "active" : ""}`}
              onClick={() => setShowTimer(!showTimer)}
              title="Timer"
            >
              <IconClock size={20} />
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
            <button
              className="retro-board__control-btn"
              onClick={onExportCSV}
              title="Export to CSV"
            >
              <IconDownload size={20} />
            </button>
          </>
        )}

        <button
          className="retro-board__invite-btn"
          onClick={onCopyInviteLink}
          title="Copy invite link"
        >
          <IconShare size={20} />
        </button>
      </div>
      </div>
    </div>
  );
};

export default RetroHeader;
