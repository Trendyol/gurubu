"use client";

import { useState, useRef } from "react";
import { RetroCard as RetroCardType } from "@/shared/interfaces";
import { IconTrash, IconEdit } from "@tabler/icons-react";
import classNames from "classnames";
import MentionTextarea from "./mention-textarea";

interface IProps {
  card: RetroCardType;
  onDelete: (cardId: string) => void;
  onUpdate: (cardId: string, text: string, image: string | null, stamps?: Array<{emoji: string, x: number, y: number}>) => void;
  onVote?: (cardId: string) => void;
  currentUserId?: number;
  isOwner: boolean;
  selectedStamp?: string | null;
  onStampClick?: () => void;
  participants?: Array<{ nickname: string; userID?: number; avatarSvg?: string }>;
  authorAvatarSvg?: string;
  authorName?: string;
  hideAuthorAvatar?: boolean;
}

const RetroCard = ({ card, onDelete, onUpdate, onVote, currentUserId, isOwner, selectedStamp, onStampClick, participants = [], authorAvatarSvg, authorName, hideAuthorAvatar }: IProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(card.text);
  const [imagePreview, setImagePreview] = useState<string | null>(card.image);
  const [stamps, setStamps] = useState<Array<{emoji: string, x: number, y: number}>>(card.stamps || []);
  const cardRef = useRef<HTMLDivElement>(null);
  const [editSize, setEditSize] = useState<{ width: number; height: number } | null>(null);

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (selectedStamp && !isEditing && onStampClick) {
      e.stopPropagation();
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      const newStamps = [...stamps, { emoji: selectedStamp, x, y }];
      setStamps(newStamps);
      // Update card with new stamps
      onUpdate(card.id, card.text, card.image, newStamps);
      onStampClick();
    }
  };


  const sanitizeCardText = (text: string): string => {
    let sanitized = text.trim();
    sanitized = sanitized.replace(/\n{3,}/g, '\n\n');
    sanitized = sanitized.split('\n').map(line => line.trimEnd()).join('\n');
    return sanitized;
  };

  const handleSave = () => {
    const sanitized = sanitizeCardText(editText);
    if (sanitized) {
      onUpdate(card.id, sanitized, imagePreview);
      setIsEditing(false);
      setEditSize(null);
    }
  };

  const startEditing = () => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      setEditSize({ width: rect.width, height: rect.height });
    }
    setEditText(card.text);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditText(card.text);
    setImagePreview(card.image);
    setIsEditing(false);
    setEditSize(null);
  };

  // Generate avatar color based on author name
  const getAvatarColor = (name: string) => {
    const colors = [
      '#667eea', '#764ba2', '#f093fb', '#4facfe',
      '#43e97b', '#fa709a', '#fee140', '#30cfd0'
    ];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };


  // Render text with highlighted mentions - support Turkish characters
  const renderTextWithMentions = (text: string) => {
    // Support Turkish characters: ğ, ü, ş, ı, ö, ç, Ğ, Ü, Ş, İ, Ö, Ç
    const mentionRegex = /@([a-zA-ZğüşıöçĞÜŞİÖÇ0-9_]+)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      // Add text before mention
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }

      // Add highlighted mention
      parts.push(
        <span key={`mention-${match.index}`} className="retro-card__mention">
          {match[0]}
        </span>
      );

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  return (
    <div
      ref={cardRef}
      className={classNames("retro-card", {
        editing: isEditing,
        'stamp-mode': selectedStamp
      })}
      onClick={handleCardClick}
      style={{
        backgroundColor: card.color || 'white',
        ...(isEditing && editSize ? { minWidth: editSize.width, minHeight: editSize.height } : {}),
      }}
    >
      {stamps.map((stamp, index) => (
        <div
          key={index}
          className="retro-card__stamp"
          style={{ left: `${stamp.x}%`, top: `${stamp.y}%` }}
        >
          {stamp.emoji.startsWith('data:image') ? (
            <img src={stamp.emoji} alt="stamp" className="retro-card__stamp-image" />
          ) : (
            stamp.emoji
          )}
        </div>
      ))}

      {isEditing ? (
        <div className="retro-card__edit-mode">
          <MentionTextarea
            value={editText}
            onChange={setEditText}
            participants={participants}
            placeholder="Enter your thoughts... (use @ to mention someone)"
            maxLength={200}
            autoFocus
            className="retro-card__textarea"
          />
          <div className="retro-card__char-count">
            {editText.length}/200
          </div>
          <div className="retro-card__actions">
            <button className="retro-card__icon-btn retro-card__icon-btn--save" onClick={handleSave} title="Save">
              ✓
            </button>
            <button className="retro-card__icon-btn retro-card__icon-btn--cancel" onClick={handleCancel} title="Cancel">
              ✕
            </button>
          </div>
        </div>
      ) : (
        <div className="retro-card__view-mode">
          <div className="retro-card__content">
            <p className="retro-card__text">{renderTextWithMentions(card.text)}</p>
            {card.image && (
              <div className="retro-card__image">
                <img src={card.image} alt="Card attachment" />
              </div>
            )}
          </div>
          <div className="retro-card__footer">
            <div className="retro-card__vote-section">
              {onVote && (
                <button
                  className={classNames("retro-card__vote-btn", {
                    'voted': card.votes?.includes(currentUserId || 0)
                  })}
                  onClick={(e) => {
                    e.stopPropagation();
                    onVote(card.id);
                  }}
                  title="Vote for this card"
                >
                  👍 {card.voteCount || 0}
                </button>
              )}
            </div>
            <div className="retro-card__footer-right">
              {isOwner && (
                <div className="retro-card__owner-actions">
                  <button
                    className="retro-card__edit-btn"
                    onClick={() => startEditing()}
                    title="Edit"
                  >
                    <IconEdit size={16} />
                  </button>
                  <button
                    className="retro-card__delete-btn"
                    onClick={() => onDelete(card.id)}
                    title="Delete"
                  >
                    <IconTrash size={16} />
                  </button>
                </div>
              )}
              {/* Author avatar */}
              {authorAvatarSvg && !hideAuthorAvatar && (
                <div className="retro-card__author-avatar-wrapper">
                  <div 
                    className="retro-card__author-avatar"
                    dangerouslySetInnerHTML={{ __html: authorAvatarSvg }}
                  />
                  <span className="retro-card__author-tooltip">
                    {authorName || card.author || 'Unknown'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RetroCard;
