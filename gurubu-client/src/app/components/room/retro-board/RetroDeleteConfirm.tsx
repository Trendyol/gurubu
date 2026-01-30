"use client";

interface RetroDeleteConfirmProps {
  show: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const RetroDeleteConfirm = ({ show, onConfirm, onCancel }: RetroDeleteConfirmProps) => {
  if (!show) return null;

  return (
    <div
      className="retro-delete-overlay"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-title"
    >
      <div
        className="retro-delete-popup"
        onClick={(e) => e.stopPropagation()}
        role="document"
      >
        <div className="retro-delete-popup__icon">🗑️</div>
        <h3 className="retro-delete-popup__title" id="delete-title">
          Delete Card?
        </h3>
        <p className="retro-delete-popup__message">
          This action cannot be undone. Are you sure you want to delete this card?
        </p>
        <div className="retro-delete-popup__actions">
          <button
            className="retro-delete-popup__btn retro-delete-popup__btn--cancel"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="retro-delete-popup__btn retro-delete-popup__btn--delete"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default RetroDeleteConfirm;
