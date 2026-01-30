"use client";

import { IconPlus, IconPhoto, IconInfoCircle } from "@tabler/icons-react";
import classNames from "classnames";
import RetroCard from "./retro-card";
import MentionTextarea from "./mention-textarea";

interface RetroColumnProps {
  columnKey: string;
  columnConfig: any;
  cards: any[];
  isAddingCard: boolean;
  newCardText: string;
  newCardColor: string | null;
  newCardImage: string | null;
  showAddButton: boolean;
  draggedCard: any;
  selectedStamp: string | null;
  columnHeaderImages: Record<string, string | null>;
  participants: any[];
  userInfo: any;
  onSetActiveColumn: (key: string | null) => void;
  onSetNewCardText: (text: string) => void;
  onSetNewCardColor: (color: string | null) => void;
  onSetNewCardImage: (image: string | null) => void;
  onSetSelectedStamp: (stamp: string | null) => void;
  onSetDraggedCard: (card: any) => void;
  onAddCard: (columnKey: string) => void;
  onDeleteCard: (columnKey: string, cardId: string) => void;
  onUpdateCard: (columnKey: string, cardId: string, text: string, image: string | null, stamps: string[]) => void;
  onVoteCard: (columnKey: string, cardId: string) => void;
  onColumnHeaderImageUpload: (columnKey: string, e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveColumnHeaderImage: (columnKey: string) => void;
}

const RetroColumn = ({
  columnKey,
  columnConfig,
  cards,
  isAddingCard,
  newCardText,
  newCardColor,
  newCardImage,
  showAddButton,
  draggedCard,
  selectedStamp,
  columnHeaderImages,
  participants,
  userInfo,
  onSetActiveColumn,
  onSetNewCardText,
  onSetNewCardColor,
  onSetNewCardImage,
  onSetSelectedStamp,
  onSetDraggedCard,
  onAddCard,
  onDeleteCard,
  onUpdateCard,
  onVoteCard,
  onColumnHeaderImageUpload,
  onRemoveColumnHeaderImage,
}: RetroColumnProps) => {
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (draggedCard) {
      onSetActiveColumn(columnKey);
      onSetNewCardColor(draggedCard.color);
      requestAnimationFrame(() => {
        onSetDraggedCard(null);
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedCard) {
      e.dataTransfer.dropEffect = "copy";
    }
  };

  return (
    <div
      className={classNames("retro-column", `retro-column--${columnConfig.color}`, {
        "retro-column--drag-over": draggedCard,
      })}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {columnHeaderImages[columnKey] && (
        <div className="retro-column__header-image">
          <img src={columnHeaderImages[columnKey]!} alt={`${columnConfig.title} header`} />
          <button
            className="retro-column__header-image-remove"
            onClick={() => onRemoveColumnHeaderImage(columnKey)}
            title="Remove header image"
          >
            ×
          </button>
        </div>
      )}

      <div className="retro-column__header">
        <div className="retro-column__header-content">
          <div className="retro-column__title-wrapper">
            <h2 className="retro-column__title">{columnConfig.title}</h2>
            {columnConfig.description && (
              <div 
                className="retro-column__info"
                title={columnConfig.description}
              >
                <IconInfoCircle size={16} className="retro-column__info-icon" />
              </div>
            )}
          </div>
          <span className="retro-column__count">{cards.length}</span>
        </div>
        {!columnHeaderImages[columnKey] && (
          <label className="retro-column__header-upload" title="Add header image">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => onColumnHeaderImageUpload(columnKey, e)}
              style={{ display: "none" }}
            />
            <IconPhoto size={16} />
          </label>
        )}
      </div>

      <div className="retro-column__cards">
        {cards.map((card: any) => (
          <RetroCard
            key={card.id}
            card={card}
            onDelete={(cardId) => onDeleteCard(columnKey, cardId)}
            onUpdate={(cardId, text, image, stamps) =>
              onUpdateCard(columnKey, cardId, text, image, stamps)
            }
            onVote={(cardId) => onVoteCard(columnKey, cardId)}
            currentUserId={userInfo.lobby ? Number(userInfo.lobby.userID) : undefined}
            isOwner={userInfo.lobby ? card.authorId === Number(userInfo.lobby.userID) : false}
            selectedStamp={selectedStamp}
            onStampClick={() => onSetSelectedStamp(null)}
            participants={participants}
          />
        ))}

        {showAddButton && !isAddingCard && (
          <button className="retro-column__add-btn" onClick={() => onSetActiveColumn(columnKey)}>
            <IconPlus size={20} />
            Add Card
          </button>
        )}

        {isAddingCard ? (
          <div
            className="retro-column__new-card"
            style={{ backgroundColor: newCardColor || "white" }}
          >
            <MentionTextarea
              value={newCardText}
              onChange={onSetNewCardText}
              participants={participants}
              placeholder="Enter your thoughts... (use @ to mention someone)"
              maxLength={120}
              autoFocus
              className="retro-column__textarea"
            />
            <div className="retro-column__char-count">{newCardText.length}/120</div>
            <div className="retro-column__actions">
              <button
                className="retro-column__icon-btn retro-column__icon-btn--save"
                onClick={() => onAddCard(columnKey)}
                title="Save"
              >
                ✓
              </button>
              <button
                className="retro-column__icon-btn retro-column__icon-btn--cancel"
                onClick={() => {
                  onSetActiveColumn(null);
                  onSetNewCardText("");
                  onSetNewCardImage(null);
                  onSetNewCardColor(null);
                }}
                title="Cancel"
              >
                ✕
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default RetroColumn;
