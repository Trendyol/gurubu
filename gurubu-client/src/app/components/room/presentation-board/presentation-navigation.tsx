"use client";

interface PresentationNavigationProps {
  onPreviousPage: () => void;
  onNextPage: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
}

const PresentationNavigation = ({ onPreviousPage, onNextPage, canGoPrevious, canGoNext }: PresentationNavigationProps) => {
  return (
    <div className="presentation-navigation">
      <button
        className="presentation-navigation__button"
        onClick={onPreviousPage}
        disabled={!canGoPrevious}
      >
        ← Previous
      </button>
      <button
        className="presentation-navigation__button"
        onClick={onNextPage}
        disabled={!canGoNext}
      >
        Next →
      </button>
    </div>
  );
};

export default PresentationNavigation;
