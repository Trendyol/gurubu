"use client";

import { useState, useRef, useEffect } from "react";
import { IconNote, IconMoodSmile, IconSparkles, IconCoffee, IconUser, IconChevronUp, IconPalette, IconLayoutSidebar } from "@tabler/icons-react";
import classNames from "classnames";

interface RetroBottomBarProps {
  cardTemplates: any[];
  stamps: string[];
  customStamps: string[];
  selectedStamp: string | null;
  onStampSelect: (stamp: string) => void;
  onCardDragStart: (template: any, e: React.DragEvent) => void;
  onConfetti: () => void;
  isAfk?: boolean;
  onToggleAfk?: () => void;
  onEmoteSend: (emoji: string) => void;
  currentNickname: string;
  avatarSvg: string;
  sidebarMode: 'sidebar' | 'bottombar';
  onToggleSidebarMode: () => void;
  animatedBackground?: boolean;
  onToggleBackground?: () => void;
}

const RetroBottomBar = ({
  cardTemplates,
  stamps,
  customStamps,
  selectedStamp,
  onStampSelect,
  onCardDragStart,
  onConfetti,
  isAfk,
  onToggleAfk,
  onEmoteSend,
  currentNickname,
  avatarSvg,
  sidebarMode,
  onToggleSidebarMode,
  animatedBackground,
  onToggleBackground,
}: RetroBottomBarProps) => {
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [showEmoteDropdown, setShowEmoteDropdown] = useState(false);
  const emoteRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (emoteRef.current && !emoteRef.current.contains(target)) {
        setShowEmoteDropdown(false);
      }
      if (panelRef.current && !panelRef.current.contains(target) && !target.closest('.retro-bottombar__btn')) {
        setActivePanel(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStampSelect = (stamp: string) => {
    onStampSelect(stamp);
    setActivePanel(null);
  };

  return (
    <div className="retro-bottombar">
      {/* Upward dropdown panel */}
      {activePanel && (
        <div className="retro-bottombar__panel" ref={panelRef}>
          {activePanel === 'cards' && (
            <div className="retro-bottombar__panel-content">
              <h4>Cards</h4>
              <div className="retro-bottombar__card-grid">
                {cardTemplates.map((template) => (
                  <div
                    key={template.name}
                    className="retro-bottombar__card-item"
                    draggable
                    onDragStart={(e) => {
                      onCardDragStart(template, e);
                      setTimeout(() => setActivePanel(null), 100);
                    }}
                    style={{ backgroundColor: template.color }}
                    title={template.description}
                  >
                    <span>{template.emoji}</span>
                    <span className="retro-bottombar__card-name">{template.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {activePanel === 'stamps' && (
            <div className="retro-bottombar__panel-content">
              <h4>Stamps</h4>
              <div className="retro-bottombar__stamp-grid">
                {stamps.map((stamp) => (
                  <button
                    key={stamp}
                    className={classNames("retro-bottombar__stamp", { selected: selectedStamp === stamp })}
                    onClick={() => handleStampSelect(stamp)}
                  >
                    {stamp}
                  </button>
                ))}
                {customStamps.map((stamp, index) => (
                  <button
                    key={`custom-${index}`}
                    className={classNames("retro-bottombar__stamp", { selected: selectedStamp === stamp })}
                    onClick={() => handleStampSelect(stamp)}
                  >
                    <img src={stamp} alt="Custom" style={{ width: 20, height: 20 }} />
                  </button>
                ))}
              </div>
            </div>
          )}
          {activePanel === 'profile' && (
            <div className="retro-bottombar__panel-content">
              <h4>Settings</h4>
              <div className="retro-bottombar__settings">
                <label className="retro-bottombar__setting">
                  <span><IconPalette size={14} /> Animated BG</span>
                  <button
                    className={classNames("retro-profile__toggle", { active: animatedBackground })}
                    onClick={onToggleBackground}
                  >
                    <span className="retro-profile__toggle-knob" />
                  </button>
                </label>
                <label className="retro-bottombar__setting">
                  <span><IconLayoutSidebar size={14} /> Sidebar Mode</span>
                  <button
                    className={classNames("retro-profile__toggle", { active: sidebarMode === 'sidebar' })}
                    onClick={() => {
                      onToggleSidebarMode();
                      setActivePanel(null);
                    }}
                  >
                    <span className="retro-profile__toggle-knob" />
                  </button>
                </label>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main bottom bar */}
      <div className="retro-bottombar__bar">
        <div className="retro-bottombar__btn-wrapper">
          <button
            className={classNames("retro-bottombar__btn", { active: activePanel === 'cards' })}
            onClick={() => setActivePanel(activePanel === 'cards' ? null : 'cards')}
          >
            <IconNote size={20} />
          </button>
          <span className="retro-bottombar__btn-label">Cards</span>
        </div>
        <div className="retro-bottombar__btn-wrapper">
          <button
            className={classNames("retro-bottombar__btn", { active: activePanel === 'stamps' })}
            onClick={() => setActivePanel(activePanel === 'stamps' ? null : 'stamps')}
          >
            <IconMoodSmile size={20} />
          </button>
          <span className="retro-bottombar__btn-label">Stamps</span>
        </div>
        <div className="retro-bottombar__btn-wrapper">
          <button
            className="retro-bottombar__btn"
            onClick={onConfetti}
          >
            <IconSparkles size={20} />
          </button>
          <span className="retro-bottombar__btn-label">Confetti</span>
        </div>
        <div className="retro-bottombar__btn-wrapper">
          <button
            className={classNames("retro-bottombar__btn", { active: isAfk })}
            onClick={onToggleAfk}
          >
            <IconCoffee size={20} />
          </button>
          <span className="retro-bottombar__btn-label">{isAfk ? "Back" : "AFK"}</span>
        </div>

        <div className="retro-bottombar__divider" />

        {/* Emote Dropdown */}
        <div className="retro-bottombar__emote-wrapper" ref={emoteRef}>
          <div className="retro-bottombar__btn-wrapper">
            <button
              className={classNames("retro-bottombar__btn", { active: showEmoteDropdown })}
              onClick={() => setShowEmoteDropdown(!showEmoteDropdown)}
            >
              <span style={{ fontSize: 18 }}>😊</span>
              <IconChevronUp size={12} />
            </button>
            <span className="retro-bottombar__btn-label">React</span>
          </div>
          {showEmoteDropdown && (
            <div className="retro-bottombar__emote-dropdown">
              {['👍', '❤️', '😂', '🎉', '🔥', '👏', '💡', '😍', '🚀', '👀'].map((emoji) => (
                <button
                  key={emoji}
                  className="retro-bottombar__emote-item"
                  onClick={() => {
                    onEmoteSend(emoji);
                    setShowEmoteDropdown(false);
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="retro-bottombar__divider" />

        <div className="retro-bottombar__btn-wrapper">
          <button
            className={classNames("retro-bottombar__btn", { active: activePanel === 'profile' })}
            onClick={() => setActivePanel(activePanel === 'profile' ? null : 'profile')}
          >
            <IconUser size={20} />
          </button>
          <span className="retro-bottombar__btn-label">Settings</span>
        </div>
      </div>
    </div>
  );
};

export default RetroBottomBar;
