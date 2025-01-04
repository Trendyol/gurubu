import React, { MouseEventHandler } from "react";

interface SidebarProps {
  children: React.ReactNode;
  position: string;
  width: string;
  isOpen: boolean;
  onClose: MouseEventHandler<HTMLButtonElement>;
  showCloseButton: boolean;
}

const Sidebar = ({
  children,
  position = "left",
  width = "300px",
  isOpen = false,
  onClose,
  showCloseButton = true,
}: SidebarProps) => {
  return (
    <div
      className={`sidebar ${position} ${isOpen ? "open" : ""}`}
      style={{ width }}
    >
      {showCloseButton && (
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
      )}
      <div className="content">{children}</div>
    </div>
  );
};

export default Sidebar;
