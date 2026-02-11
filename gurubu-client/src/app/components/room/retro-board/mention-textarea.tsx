"use client";

import { useState, useRef } from "react";

interface IProps {
  value: string;
  onChange: (value: string) => void;
  participants: Array<{ nickname: string }>;
  placeholder?: string;
  maxLength?: number;
  maxNewlines?: number;
  autoFocus?: boolean;
  className?: string;
}

const MentionTextarea = ({ 
  value, 
  onChange, 
  participants, 
  placeholder = "Enter your thoughts...",
  maxLength = 500,
  maxNewlines = 999,
  autoFocus = false,
  className = ""
}: IProps) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mentionStart, setMentionStart] = useState(-1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= maxLength) {
      onChange(newValue);
      checkForMention(newValue, e.target.selectionStart);
    }
  };

  const checkForMention = (text: string, cursorPos: number) => {
    // Find the last @ before cursor
    const textBeforeCursor = text.substring(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtIndex === -1) {
      setShowSuggestions(false);
      return;
    }

    // Check if there's a space between @ and cursor
    const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
    if (textAfterAt.includes(' ')) {
      setShowSuggestions(false);
      return;
    }

    // Get search query - support Turkish characters
    const query = textAfterAt.toLowerCase();
    
    // Filter participants - support Turkish characters in matching
    const filtered = participants
      .map(p => p.nickname)
      .filter(name => {
        const normalizedName = name.toLowerCase();
        const normalizedQuery = query.toLowerCase();
        return normalizedName.startsWith(normalizedQuery);
      })
      .slice(0, 5);

    if (filtered.length > 0) {
      setSuggestions(filtered);
      setMentionStart(lastAtIndex);
      setShowSuggestions(true);
      setSelectedIndex(0);
    } else {
      setShowSuggestions(false);
    }
  };

  const insertMention = (nickname: string) => {
    if (mentionStart === -1) return;

    const cursorPos = textareaRef.current?.selectionStart || 0;
    const textBeforeMention = value.substring(0, mentionStart);
    const textAfterCursor = value.substring(cursorPos);
    
    const newValue = `${textBeforeMention}@${nickname} ${textAfterCursor}`;
    onChange(newValue);
    
    setShowSuggestions(false);
    setMentionStart(-1);
    
    // Set cursor position after mention
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = mentionStart + nickname.length + 2;
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
        textareaRef.current.focus();
      }
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Block Enter key if max newlines reached (but still allow all other input)
    if (e.key === 'Enter' && !showSuggestions) {
      const newlineCount = (value.match(/\n/g) || []).length;
      if (newlineCount >= maxNewlines) {
        e.preventDefault();
        return;
      }
    }

    if (!showSuggestions) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter' && suggestions.length > 0) {
      e.preventDefault();
      insertMention(suggestions[selectedIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="mention-textarea-wrapper">
      <textarea
        ref={textareaRef}
        className={`mention-textarea ${className}`}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        maxLength={maxLength}
        autoFocus={autoFocus}
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="mention-suggestions">
          {suggestions.map((nickname, index) => (
            <button
              key={nickname}
              type="button"
              className={`mention-suggestion ${index === selectedIndex ? 'selected' : ''}`}
              onClick={() => insertMention(nickname)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <span className="mention-suggestion__at">@</span>
              <span className="mention-suggestion__name">{nickname}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MentionTextarea;
