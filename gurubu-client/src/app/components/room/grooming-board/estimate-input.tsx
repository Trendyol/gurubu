import React, { useState, useEffect } from "react";
import { IconCheck, IconX } from "@tabler/icons-react";
import { useGroomingRoom } from "@/contexts/GroomingRoomContext";

interface EstimateInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  placeholder?: string;
  defaultValue: string;
}

export const EstimateInput: React.FC<EstimateInputProps> = ({
  label,
  value,
  onChange,
  onConfirm,
  onCancel,
  defaultValue,
  placeholder = "Enter story points...",
}) => {
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [inputValue, setInputValue] = useState(value || defaultValue || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { userInfo } = useGroomingRoom();

  useEffect(() => {
    if (!value && defaultValue) {
      setInputValue(defaultValue);
    } else {
      setInputValue(value);
    }
  }, [value, defaultValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    onChange(e.target.value);
  };

  const handleConfirm = async () => {
    if (isSubmitting) return; // Prevent multiple submissions
    setIsSubmitting(true);

    try {
      await onConfirm();
    } finally {
      setIsSubmitting(false);
      setIsInputFocused(false);
    }
  };

  const handleCancel = () => {
    setInputValue(defaultValue || "");
    onCancel();
    setIsInputFocused(false);
  };

  const handleBlur = (e: React.FocusEvent) => {
    // Check if the related target is one of our action buttons
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (!relatedTarget?.classList.contains("vote-action-button")) {
      // Only unfocus if there's no value
      if (!inputValue.trim() || defaultValue === inputValue) {
        setIsInputFocused(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent form submission
      handleConfirm();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  return (
    <div className="grooming-board-estimate-input">
      <label>{label}</label>
      <div className="vote-input-container">
        <input
          type="text"
          className="grooming-board-jira-table-vote-input"
          value={inputValue}
          onChange={handleChange}
          onFocus={() => setIsInputFocused(true)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={!userInfo?.lobby?.isAdmin || isSubmitting}
        />
        {isInputFocused && (
          <div className="vote-input-actions">
            <button
              className="vote-action-button check"
              onClick={handleConfirm}
              title="Save vote"
              disabled={isSubmitting}
            >
              <IconCheck size={16} />
            </button>
            <button
              className="vote-action-button cancel"
              onClick={handleCancel}
              title="Cancel"
              disabled={isSubmitting}
            >
              <IconX size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
