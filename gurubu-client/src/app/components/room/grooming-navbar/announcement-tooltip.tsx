"use client";

import { IconBell, IconX } from "@tabler/icons-react";
import { useState, useEffect, useRef } from "react";
import { SIDEHUB_GURUBU_URL } from "@/shared/sidehub";

export const AnnouncementTooltip = () => {
  const [showTooltip, setShowTooltip] = useState(
    localStorage.getItem("hasSeenSideHubPromo") === "true" ? false : true
  );
  const [hasUnread, setHasUnread] = useState(false);
  const selectorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hasSeen = localStorage.getItem("hasSeenSideHubPromo");
    setHasUnread(!hasSeen);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectorRef.current &&
        !selectorRef.current.contains(event.target as Node)
      ) {
        setShowTooltip(false);
        setHasUnread(false);
        localStorage.setItem("hasSeenSideHubPromo", "true");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClick = () => {
    setShowTooltip(!showTooltip);
    if (!localStorage.getItem("hasSeenSideHubPromo")) {
      localStorage.setItem("hasSeenSideHubPromo", "true");
      setHasUnread(false);
    }
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    localStorage.setItem("hasSeenSideHubPromo", "true");
    setShowTooltip(false);
    setHasUnread(false);
  };

  const openSideHub = () => {
    window.open(SIDEHUB_GURUBU_URL, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="announcement-tooltip" ref={selectorRef}>
      <div className="announcement-tooltip__icon" onClick={handleClick}>
        <IconBell size={24} />
        {hasUnread && <span className="announcement-tooltip__notification" />}
      </div>
      {showTooltip && (
        <div className="announcement-tooltip__content announcement-tooltip__content--sidehub">
          <div className="announcement-tooltip__header">
            <h3>GuruBu turns 3 🎂</h3>
            <button type="button" onClick={handleClose}>
              <IconX size={16} />
            </button>
          </div>
          <div className="announcement-tooltip__body">
            <p>
              Thanks for celebrating GuruBu&apos;s 3rd birthday with us! Dropping a
              quick like or comment on SideHub really helps us out—and if you have
              any feedback to help us improve, we&apos;re all ears!
            </p>
            <button
              type="button"
              className="announcement-tooltip__link-btn"
              onClick={openSideHub}
            >
              Celebrate on SideHub
            </button>
          </div>
        </div>
      )}
    </div>
  );
};