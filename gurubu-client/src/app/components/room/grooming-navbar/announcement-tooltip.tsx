import { IconBell, IconX } from "@tabler/icons-react";
import { useState, useEffect, useRef } from "react";

export const AnnouncementTooltip = () => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const selectorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hasSeenAnnouncement = localStorage.getItem("hasSeenAnnouncement");
    setHasUnread(!hasSeenAnnouncement);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectorRef.current &&
        !selectorRef.current.contains(event.target as Node)
      ) {
        setShowTooltip(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClick = () => {
    setShowTooltip(!showTooltip);
    if (!localStorage.getItem("hasSeenAnnouncement")) {
      localStorage.setItem("hasSeenAnnouncement", "true");
      setHasUnread(false);
    }
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowTooltip(false);
  };

  return (
    <div className="announcement-tooltip" ref={selectorRef}>
      <div className="announcement-tooltip__icon" onClick={handleClick}>
        <IconBell size={24} />
        {hasUnread && <span className="announcement-tooltip__notification" />}
      </div>
      {showTooltip && (
        <div className="announcement-tooltip__content">
          <div className="announcement-tooltip__header">
            <h3>What's New - 11.01.2025</h3>
            <button onClick={handleClose}>
              <IconX size={16} />
            </button>
          </div>
          <div className="announcement-tooltip__body">
            <p>
              Welcome to GuruBu! Here are the latest updates:
            </p>
            <ul>
              <li>Customizable avatars add</li>
              <li>Improved UI/UX</li>
              <li>Better performance</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
