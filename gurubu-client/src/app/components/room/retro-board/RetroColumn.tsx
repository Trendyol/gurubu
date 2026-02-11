"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { IconPlus, IconPhoto, IconInfoCircle, IconUnlink, IconUserOff } from "@tabler/icons-react";
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
  draggedImage: any;
  selectedStamp: string | null;
  columnHeaderImages: Record<string, string | null>;
  participants: any[];
  userInfo: any;
  draggingCardBetweenColumns?: { cardId: string; sourceColumn: string } | null;
  onSetActiveColumn: (key: string | null) => void;
  onSetNewCardText: (text: string) => void;
  onSetNewCardColor: (color: string | null) => void;
  onSetNewCardImage: (image: string | null) => void;
  onSetSelectedStamp: (stamp: string | null) => void;
  onSetDraggedCard: (card: any) => void;
  onSetDraggedImage: (image: any) => void;
  onDropImageOnColumn: (e: React.DragEvent, image: any) => void;
  isAnonymous: boolean;
  onSetIsAnonymous: (value: boolean) => void;
  cardsRevealed: boolean;
  onAddCard: (columnKey: string) => void;
  onDeleteCard: (columnKey: string, cardId: string) => void;
  onUpdateCard: (columnKey: string, cardId: string, text: string, image: string | null, stamps?: Array<{emoji: string, x: number, y: number}>) => void;
  onVoteCard: (columnKey: string, cardId: string) => void;
  onColumnHeaderImageUpload: (columnKey: string, e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveColumnHeaderImage: (columnKey: string) => void;
  onDoubleClick?: (columnKey: string) => void;
  onCardDragBetweenStart?: (cardId: string, sourceColumn: string) => void;
  onCardDropOnColumn?: (targetColumn: string) => void;
  onCardDragEnd?: () => void;
  createAvatarSvg?: (seed: string) => string;
  cardGroups?: Record<string, { name: string }>;
  onGroupCards?: (column: string, cardId1: string, cardId2: string) => void;
  onRenameGroup?: (groupId: string, name: string) => void;
  onUngroupCard?: (column: string, cardId: string) => void;
  isSideColumn?: boolean;
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
  draggedImage,
  selectedStamp,
  columnHeaderImages,
  participants,
  userInfo,
  draggingCardBetweenColumns,
  onSetActiveColumn,
  onSetNewCardText,
  onSetNewCardColor,
  onSetNewCardImage,
  onSetSelectedStamp,
  onSetDraggedCard,
  onSetDraggedImage,
  onDropImageOnColumn,
  isAnonymous,
  onSetIsAnonymous,
  cardsRevealed,
  onAddCard,
  onDeleteCard,
  onUpdateCard,
  onVoteCard,
  onColumnHeaderImageUpload,
  onRemoveColumnHeaderImage,
  onDoubleClick,
  onCardDragBetweenStart,
  onCardDropOnColumn,
  onCardDragEnd,
  createAvatarSvg,
  cardGroups = {},
  onGroupCards,
  onRenameGroup,
  onUngroupCard,
  isSideColumn,
}: RetroColumnProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const dragOverCountRef = useRef(0);
  const [dragOverCardId, setDragOverCardId] = useState<string | null>(null);
  const [groupHoverReady, setGroupHoverReady] = useState(false);
  const groupTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [groupNameInput, setGroupNameInput] = useState("");

  // Force reset drag highlight when no drag is active
  useEffect(() => {
    if (!draggingCardBetweenColumns && !draggedCard && !draggedImage) {
      setIsDragOver(false);
      setDragOverCardId(null);
      setGroupHoverReady(false);
      dragOverCountRef.current = 0;
      if (groupTimerRef.current) clearTimeout(groupTimerRef.current);
    }
  }, [draggingCardBetweenColumns, draggedCard, draggedImage]);

  const handleCardDragOverCard = useCallback((targetCardId: string) => {
    if (dragOverCardId === targetCardId) return;
    
    // Clear previous timer
    if (groupTimerRef.current) clearTimeout(groupTimerRef.current);
    setGroupHoverReady(false);
    setDragOverCardId(targetCardId);

    // After 400ms hovering, show group indicator
    groupTimerRef.current = setTimeout(() => {
      setGroupHoverReady(true);
    }, 400);
  }, [dragOverCardId]);

  const handleCardDragLeaveCard = useCallback(() => {
    if (groupTimerRef.current) clearTimeout(groupTimerRef.current);
    setDragOverCardId(null);
    setGroupHoverReady(false);
  }, []);

  const handleCardDropOnCard = useCallback((targetCardId: string, droppedCardId: string) => {
    if (groupTimerRef.current) clearTimeout(groupTimerRef.current);
    setDragOverCardId(null);
    setGroupHoverReady(false);

    // Always group on drop (no timer requirement) - if you dropped on a card, you meant to group
    if (targetCardId !== droppedCardId && onGroupCards) {
      onGroupCards(columnKey, droppedCardId, targetCardId);
    }
  }, [columnKey, onGroupCards]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragOverCountRef.current = 0;
    setIsDragOver(false);
    setDragOverCardId(null);
    setGroupHoverReady(false);
    if (groupTimerRef.current) clearTimeout(groupTimerRef.current);

    if (draggedCard) {
      onSetActiveColumn(columnKey);
      onSetNewCardColor(draggedCard.color);
      requestAnimationFrame(() => {
        onSetDraggedCard(null);
      });
    } else if (draggedImage) {
      onDropImageOnColumn(e, draggedImage);
    } else if (draggingCardBetweenColumns) {
      // Use elementsFromPoint to detect which card is under cursor
      // This works correctly with CSS transforms unlike native D&D hit testing
      const elements = document.elementsFromPoint(e.clientX, e.clientY);
      let targetCardId: string | null = null;
      
      for (const el of elements) {
        // Check the element itself or walk up to find a card wrapper
        const wrapper = (el as HTMLElement).closest?.('[data-card-id]') as HTMLElement | null;
        if (wrapper) {
          const cardId = wrapper.getAttribute('data-card-id');
          if (cardId && cardId !== draggingCardBetweenColumns.cardId) {
            targetCardId = cardId;
            break;
          }
        }
      }
      
      if (targetCardId && draggingCardBetweenColumns.sourceColumn === columnKey && onGroupCards) {
        // Same column + dropped on a different card → GROUP
        onGroupCards(columnKey, draggingCardBetweenColumns.cardId, targetCardId);
      } else if (onCardDropOnColumn) {
        // Different column or no specific card target → MOVE to column
        onCardDropOnColumn(columnKey);
      }
      // Always clean up drag state after drop
      onCardDragEnd?.();
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dragOverCountRef.current++;
    if (draggedCard || draggedImage || draggingCardBetweenColumns) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragOverCountRef.current--;
    if (dragOverCountRef.current <= 0) {
      dragOverCountRef.current = 0;
      setIsDragOver(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedCard || draggedImage || draggingCardBetweenColumns) {
      e.dataTransfer.dropEffect = draggedCard ? "copy" : "move";
    }
  };

  return (
    <div
      className={classNames("retro-column", `retro-column--${columnConfig.color}`, {
        "retro-column--drag-over": isDragOver,
        "retro-column--side": isSideColumn,
      })}
      data-column-key={columnKey}
      onDrop={handleDrop}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDoubleClick={(e) => {
        // Only trigger if clicking directly on the column, not on a card or button
        const target = e.target as HTMLElement;
        if (target.closest('.retro-card') || target.closest('button') || target.closest('.retro-column__new-card')) return;
        onDoubleClick?.(columnKey);
      }}
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
        {(() => {
          const currentUserId = userInfo.lobby ? Number(userInfo.lobby.userID) : undefined;
          
          // Group cards by groupId
          const ungroupedCards: any[] = [];
          const groupedCards: Record<string, any[]> = {};
          
          cards.forEach((card: any) => {
            if (card.groupId) {
              if (!groupedCards[card.groupId]) groupedCards[card.groupId] = [];
              groupedCards[card.groupId].push(card);
            } else {
              ungroupedCards.push(card);
            }
          });

          // Render a single card (used in both grouped and ungrouped)
          const renderSingleCard = (card: any, isInGroup = false) => {
            const authorParticipant = participants.find((p: any) => p.userID === card.authorId);
            const authorAvatarSvg = authorParticipant?.avatarSvg || (createAvatarSvg && authorParticipant?.avatarSeed ? createAvatarSvg(authorParticipant.avatarSeed) : undefined);
            const isCardAuthor = currentUserId !== undefined && card.authorId === currentUserId;
            const isGroupTarget = dragOverCardId === card.id && groupHoverReady;
            // Card is blurred if: cards are not globally revealed AND card is not individually revealed AND current user is not the author
            const isBlurred = !cardsRevealed && !card.isRevealed && !isCardAuthor;

            return (
              <div
                key={card.id}
                draggable={!isInGroup}
                data-card-id={card.id}
                className={classNames("retro-column__card-wrapper", {
                  "retro-column__card-wrapper--group-target": isGroupTarget,
                  "retro-column__card-wrapper--in-group": isInGroup,
                })}
                onDragStart={(e) => {
                  if (isInGroup) { e.preventDefault(); return; }
                  e.dataTransfer.effectAllowed = 'move';
                  e.dataTransfer.setData('text/plain', card.id);
                  onCardDragBetweenStart?.(card.id, columnKey);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (draggingCardBetweenColumns && draggingCardBetweenColumns.cardId !== card.id) {
                    handleCardDragOverCard(card.id);
                  }
                }}
                onDragLeave={handleCardDragLeaveCard}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (draggingCardBetweenColumns && draggingCardBetweenColumns.cardId !== card.id) {
                    handleCardDropOnCard(card.id, draggingCardBetweenColumns.cardId);
                  }
                }}
                onDragEnd={() => {
                  handleCardDragLeaveCard();
                  onCardDragEnd?.();
                }}
              >
                {isGroupTarget && (
                  <div className="retro-column__group-indicator">
                    Drop to group
                  </div>
                )}
                <RetroCard
                  card={card}
                  onDelete={(cardId) => onDeleteCard(columnKey, cardId)}
                  onUpdate={(cardId, text, image, stamps) =>
                    onUpdateCard(columnKey, cardId, text, image, stamps)
                  }
                  onVote={(cardId) => onVoteCard(columnKey, cardId)}
                  currentUserId={currentUserId}
                  isOwner={isCardAuthor}
                  selectedStamp={selectedStamp}
                  onStampClick={() => onSetSelectedStamp(null)}
                  participants={participants}
                  authorAvatarSvg={card.isAnonymous ? undefined : authorAvatarSvg}
                  authorName={card.isAnonymous ? "Anonymous" : authorParticipant?.nickname}
                  hideAuthorAvatar={isCardAuthor || card.isAnonymous}
                  isBlurred={isBlurred}
                />
                {isInGroup && onUngroupCard && (
                  <button
                    className="retro-column__ungroup-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUngroupCard(columnKey, card.id);
                    }}
                    title="Remove from group"
                  >
                    <IconUnlink size={12} />
                  </button>
                )}
              </div>
            );
          };

          // Collect all items (groups + ungrouped) in order
          const renderedGroupIds = new Set<string>();
          const allItems: React.ReactNode[] = [];

          cards.forEach((card: any) => {
            if (card.groupId) {
              if (renderedGroupIds.has(card.groupId)) return;
              renderedGroupIds.add(card.groupId);
              
              const group = groupedCards[card.groupId];
              const groupMeta = cardGroups[card.groupId];
              const groupName = groupMeta?.name || '';

              allItems.push(
                <div 
                  key={`group-${card.groupId}`} 
                  className="retro-column__card-group"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('text/plain', `group:${card.groupId}`);
                    onCardDragBetweenStart?.(group[0]?.id || card.id, columnKey);
                  }}
                  onDragEnd={() => {
                    onCardDragEnd?.();
                  }}
                >
                  <div className="retro-column__group-header">
                    {editingGroupId === card.groupId ? (
                      <input
                        className="retro-column__group-name-input"
                        value={groupNameInput}
                        onChange={(e) => setGroupNameInput(e.target.value)}
                        onBlur={() => {
                          if (onRenameGroup) onRenameGroup(card.groupId, groupNameInput);
                          setEditingGroupId(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            if (onRenameGroup) onRenameGroup(card.groupId, groupNameInput);
                            setEditingGroupId(null);
                          }
                        }}
                        autoFocus
                        placeholder="Group name..."
                      />
                    ) : (
                      <span
                        className="retro-column__group-name"
                        onClick={() => {
                          setEditingGroupId(card.groupId);
                          setGroupNameInput(groupName);
                        }}
                      >
                        {groupName || 'Unnamed Group'} ({group.length})
                      </span>
                    )}
                  </div>
                  <div className="retro-column__group-cards">
                    {group.map((c: any) => renderSingleCard(c, true))}
                  </div>
                </div>
              );
            } else {
              allItems.push(renderSingleCard(card));
            }
          });

          return allItems;
        })()}

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
              maxLength={200}
              autoFocus
              className="retro-column__textarea"
            />
            <div className="retro-column__card-bottom-row">
              <div className="retro-column__char-count">{newCardText.length}/200</div>
              <button
                className={classNames("retro-column__anonymous-toggle", { active: isAnonymous })}
                onClick={() => onSetIsAnonymous(!isAnonymous)}
                title={isAnonymous ? "This card will be posted anonymously" : "Post anonymously"}
                type="button"
              >
                <IconUserOff size={14} />
                <span>Anonymous</span>
              </button>
            </div>
            <div className="retro-column__actions">
              <button
                className="retro-column__icon-btn retro-column__icon-btn--save"
                onClick={() => {
                  onAddCard(columnKey);
                }}
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
