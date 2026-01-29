"use client";

import { useState, useEffect } from "react";
import { IconUser, IconNote, IconMoodSmile, IconPhoto, IconRefresh } from "@tabler/icons-react";
import classNames from "classnames";

interface RetroSidebarProps {
  // Profile
  currentNickname: string;
  newNickname: string;
  setNewNickname: (value: string) => void;
  editingNickname: boolean;
  setEditingNickname: (value: boolean) => void;
  avatarSvg: string;
  onRegenerateAvatar: () => void;
  onSaveNickname: () => void;

  // Cards
  cardTemplates: any[];
  draggedCard: any;
  onCardDragStart: (template: any, e: React.DragEvent) => void;

  // Stamps
  stamps: string[];
  customStamps: string[];
  selectedStamp: string | null;
  onStampSelect: (stamp: string) => void;
  onRemoveCustomStamp: (index: number) => void;
  onCustomStampUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;

  // Images
  boardImages: any[];
  onRemoveBoardImage: (id: string) => void;
  onBoardImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const RetroSidebar = ({
  currentNickname,
  newNickname,
  setNewNickname,
  editingNickname,
  setEditingNickname,
  avatarSvg,
  onRegenerateAvatar,
  onSaveNickname,
  cardTemplates,
  draggedCard,
  onCardDragStart,
  stamps,
  customStamps,
  selectedStamp,
  onStampSelect,
  onRemoveCustomStamp,
  onCustomStampUpload,
  boardImages,
  onRemoveBoardImage,
  onBoardImageUpload,
}: RetroSidebarProps) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'cards' | 'stamps' | 'images' | null>(null);

  // Close panel when clicking outside
  useEffect(() => {
    if (!activeTab) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.retro-sidebar')) {
        setActiveTab(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeTab]);

  // Close panel when dragging a card
  useEffect(() => {
    if (draggedCard) {
      setActiveTab(null);
    }
  }, [draggedCard]);

  const handleStampSelect = (stamp: string) => {
    onStampSelect(stamp);
    setActiveTab(null);
  };

  return (
    <div className="retro-sidebar">
      <div className="retro-sidebar__icons">
        <button
          className={classNames("retro-sidebar__icon", { active: activeTab === 'cards' })}
          onClick={() => setActiveTab(activeTab === 'cards' ? null : 'cards')}
          title="Cards"
        >
          <IconNote size={20} />
        </button>
        <button
          className={classNames("retro-sidebar__icon", { active: activeTab === 'stamps' })}
          onClick={() => setActiveTab(activeTab === 'stamps' ? null : 'stamps')}
          title="Stamps"
        >
          <IconMoodSmile size={20} />
        </button>
        <button
          className={classNames("retro-sidebar__icon", { active: activeTab === 'images' })}
          onClick={() => setActiveTab(activeTab === 'images' ? null : 'images')}
          title="Images"
        >
          <IconPhoto size={20} />
        </button>

        <div className="retro-sidebar__spacer"></div>

        <button
          className={classNames("retro-sidebar__icon", { active: activeTab === 'profile' })}
          onClick={() => setActiveTab(activeTab === 'profile' ? null : 'profile')}
          title="Profile"
        >
          <IconUser size={20} />
        </button>
      </div>

      {activeTab === 'profile' && (
        <div className="retro-sidebar__panel retro-sidebar__panel--small">
          <div className="retro-sidebar__section">
            <h3 className="retro-sidebar__title">Profile</h3>
            <div className="retro-profile">
              <div className="retro-profile__avatar-wrapper">
                <div
                  className="retro-profile__avatar-svg"
                  data-username={currentNickname}
                >
                  {avatarSvg && (
                    <div dangerouslySetInnerHTML={{ __html: avatarSvg }} />
                  )}
                </div>
                <button
                  className="retro-profile__avatar-refresh"
                  onClick={onRegenerateAvatar}
                  title="Regenerate avatar"
                >
                  <IconRefresh size={14} />
                </button>
              </div>
              <div className="retro-profile__info">
                {editingNickname ? (
                  <div className="retro-profile__edit">
                    <input
                      type="text"
                      value={newNickname}
                      onChange={(e) => setNewNickname(e.target.value)}
                      className="retro-profile__input"
                      maxLength={20}
                      autoFocus
                    />
                    <div className="retro-profile__actions">
                      <button
                        className="retro-profile__btn retro-profile__btn--save"
                        onClick={onSaveNickname}
                      >
                        Save
                      </button>
                      <button
                        className="retro-profile__btn retro-profile__btn--cancel"
                        onClick={() => {
                          setNewNickname(currentNickname);
                          setEditingNickname(false);
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="retro-profile__display">
                    <div className="retro-profile__nickname">{currentNickname}</div>
                    <button
                      className="retro-profile__edit-btn"
                      onClick={() => setEditingNickname(true)}
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'cards' && (
        <div className="retro-sidebar__panel">
          <div className="retro-sidebar__section">
            <h3 className="retro-sidebar__title">Cards</h3>
            <div className="retro-card-templates">
              {cardTemplates.map((template) => (
                <div
                  key={template.name}
                  className="retro-card-template"
                  draggable
                  onDragStart={(e) => onCardDragStart(template, e)}
                  style={{ backgroundColor: template.color }}
                  title={template.description}
                >
                  <span className="retro-card-template__emoji">{template.emoji}</span>
                  <div className="retro-card-template__content">
                    <span className="retro-card-template__name">{template.name}</span>
                    <span className="retro-card-template__description">
                      {template.description}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <p className="retro-card-templates__hint">
              💡 Drag a card to any column to set its priority
            </p>
          </div>
        </div>
      )}

      {activeTab === 'stamps' && (
        <div className="retro-sidebar__panel">
          <div className="retro-sidebar__section">
            <h3 className="retro-sidebar__title">Stamps</h3>
            <div className="retro-stamps">
              {stamps.map((stamp) => (
                <button
                  key={stamp}
                  className={`retro-stamp ${selectedStamp === stamp ? "selected" : ""}`}
                  onClick={() => handleStampSelect(stamp)}
                >
                  {stamp}
                </button>
              ))}
              {customStamps.map((stamp, index) => (
                <div key={`custom-${index}`} className="retro-stamp retro-stamp--custom">
                  <button
                    className={`retro-stamp__btn ${selectedStamp === stamp ? "selected" : ""}`}
                    onClick={() => handleStampSelect(stamp)}
                  >
                    <img src={stamp} alt="Custom stamp" className="retro-stamp__image" />
                  </button>
                  <button
                    className="retro-stamp__remove"
                    onClick={() => onRemoveCustomStamp(index)}
                    title="Remove"
                  >
                    ×
                  </button>
                </div>
              ))}
              <label className="retro-stamp retro-stamp--upload">
                <input
                  type="file"
                  accept="image/*"
                  onChange={onCustomStampUpload}
                  style={{ display: "none" }}
                />
                <span className="retro-stamp__upload-icon">+</span>
              </label>
            </div>
            {selectedStamp && (
              <p className="retro-stamps__hint">Click on any card or area to place stamp</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'images' && (
        <div className="retro-sidebar__panel">
          <div className="retro-sidebar__section">
            <h3 className="retro-sidebar__title">Board Images</h3>
            <div className="retro-board-images">
              {boardImages.map((image) => (
                <div key={image.id} className="retro-board-image-preview">
                  <img src={image.src} alt="Board" draggable={false} />
                  <button
                    className="retro-board-image-preview__remove"
                    onClick={() => onRemoveBoardImage(image.id)}
                    title="Remove"
                  >
                    ×
                  </button>
                </div>
              ))}
              <label className="retro-board-image-upload">
                <input
                  type="file"
                  accept="image/*"
                  onChange={onBoardImageUpload}
                  style={{ display: "none" }}
                />
                <span className="retro-board-image-upload__icon">+</span>
              </label>
            </div>
            <p className="retro-board-images__hint">
              💡 Images will appear on the board and can be moved around
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RetroSidebar;
