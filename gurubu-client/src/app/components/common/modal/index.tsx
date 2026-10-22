import { IconX } from "@tabler/icons-react";
import { useState, useEffect } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  confirmText?: string;
  onConfirm?: () => void;
  cancelText?: string;
  onCancel?: () => void;
  children: React.ReactNode;
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  confirmText,
  onConfirm,
  cancelText,
  onCancel,
  children,
}: Props) => {
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

  const handleConfirm = () => {
    onConfirm?.();
    closeModal();
  };

  const handleCancel = () => {
    onCancel?.();
    closeModal();
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
        {title && <h3 className="modal-title">{title}</h3>}
        {children}
        {(confirmText || cancelText) && (
          <div className="modal-actions">
            {cancelText && (
              <button
                type="button"
                className="modal-actions__cancel"
                onClick={handleCancel}
              >
                {cancelText}
              </button>
            )}
            {confirmText && (
              <button
                type="button"
                className="modal-actions__confirm"
                onClick={handleConfirm}
              >
                {confirmText}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
