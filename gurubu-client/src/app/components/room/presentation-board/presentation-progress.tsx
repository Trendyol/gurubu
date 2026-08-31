"use client";

interface PresentationProgressProps {
  currentPage: number;
  totalPages: number;
  onPreviousPage: () => void;
  onNextPage: () => void;
}

const PresentationProgress = ({ currentPage, totalPages, onPreviousPage, onNextPage }: PresentationProgressProps) => {
  const progress = totalPages > 0 ? ((currentPage + 1) / totalPages) * 100 : 0;

  return (
    <div className="presentation-progress">
      <div className="presentation-progress__bar">
        <div
          className="presentation-progress__fill"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="presentation-progress__info">
        <span className="presentation-progress__text">
          Page {currentPage + 1} of {totalPages}
        </span>
      </div>
    </div>
  );
};

export default PresentationProgress;
