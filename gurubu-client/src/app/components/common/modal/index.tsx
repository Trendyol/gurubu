import { IconX } from "@tabler/icons-react";
import { useState, useEffect } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const Modal = ({ isOpen, onClose, children }: Props) => {
  const [modalVisible, setModalVisible] = useState(isOpen);

  const closeModal = () => {
    setModalVisible(false);
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isOpen]);

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      closeModal();
      onClose();
    }
  };

  return (
    <div
      className={`modal ${isOpen || modalVisible ? "open" : ""}`}
      role="dialog"
      aria-modal="true"
    >
      <div className="overlay" onClick={closeModal}></div>
      <div className="modal-content" role="document">
        <button className="close-btn" onClick={closeModal} aria-label="Close">
          <IconX size={16} color="gray" />
        </button>
        {children}
      </div>
    </div>
  );
};
