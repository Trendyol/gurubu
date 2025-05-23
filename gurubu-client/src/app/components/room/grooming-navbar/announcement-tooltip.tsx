"use client";

import { IconBell, IconX } from "@tabler/icons-react";
import { useState, useEffect, useRef } from "react";

export const AnnouncementTooltip = () => {
  const [showTooltip, setShowTooltip] = useState(
    localStorage.getItem("hasSeenAnnouncementV2") === "true" ? false : true
  );
  const [hasUnread, setHasUnread] = useState(false);
  const selectorRef = useRef<HTMLDivElement>(null);
  const whatsNewText = "Profile Pictures Beta!";

  useEffect(() => {
    const hasSeenAnnouncement = localStorage.getItem("hasSeenAnnouncementV2");
    setHasUnread(!hasSeenAnnouncement);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectorRef.current &&
        !selectorRef.current.contains(event.target as Node)
      ) {
        setShowTooltip(false);
        setHasUnread(false);
        localStorage.setItem("hasSeenAnnouncementV2", "true");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClick = () => {
    setShowTooltip(!showTooltip);
    if (!localStorage.getItem("hasSeenAnnouncementV2")) {
      localStorage.setItem("hasSeenAnnouncementV2", "true");
      setHasUnread(false);
    }
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    localStorage.setItem("hasSeenAnnouncementV2", "true");
    setShowTooltip(false);
    setHasUnread(false);
  };

  useEffect(() => {
    localStorage.removeItem("hasSeenAnnouncement");
  }, []);

  return (
    <div className="announcement-tooltip" ref={selectorRef}>
      <div className="announcement-tooltip__icon" onClick={handleClick}>
        <IconBell size={24} />
        {hasUnread && <span className="announcement-tooltip__notification" />}
      </div>
      {showTooltip && (
        <div className="announcement-tooltip__content">
          <div className="announcement-tooltip__header">
            <h3>{whatsNewText}</h3>
            <button onClick={handleClose}>
              <IconX size={16} />
            </button>
          </div>
          <div className="announcement-tooltip__body">
            <p>Welcome to GuruBu! Here are the latest updates:</p>
            <ul>
              <li>Profile Pictures Added (Beta)</li>
              <li>{process.env.NEXT_PUBLIC_P_ANNOUNCEMENT_TEXT ?? ""}</li>
            </ul>
            <p>
              This feature is still in beta and we would love to hear your
              feedback!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
