import { useState, useEffect } from 'react';

const announcements = [
  {
    id: 1,
    icon: "✨",
    text: "Hey! What do you think about the new voting window?",
    buttonText: "Share Thoughts",
    link: process.env.NEXT_PUBLIC_FEEDBACK_SHEET_LINK,
  },
  {
    id: 3,
    icon: "💡",
    text: "Hello! We'd love to hear your thoughts on our new feature GuruBu AI, what do you think about it?",
    buttonText: "Give Feedback",
    link: process.env.NEXT_PUBLIC_FEEDBACK_SHEET_LINK,
  }
];

interface AnnouncementBannerProps {
  onClose?: () => void;
}

const AnnouncementBanner = ({ onClose }: AnnouncementBannerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isClosed, setIsClosed] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % announcements.length);
        setIsAnimating(false);
      }, 500); // Animation duration
    }, 5000); // Change announcement every 10 seconds

    return () => clearInterval(interval);
  }, []);


  const currentAnnouncement = announcements[currentIndex];

  const handleActionClick = () => {
    window.open(currentAnnouncement.link, '_blank');
  };

  const handleClose = () => {
    setIsClosed(true);
    onClose?.();
  };

  if (isClosed) {
    return null;
  }

  return (
    <div className="announcement-banner">
      <div className="announcement-banner__content">
        <div className={`announcement-banner__icon ${isAnimating ? 'animate-out' : ''}`}>
          {currentAnnouncement.icon}
        </div>
        <p className={`announcement-banner__text ${isAnimating ? 'animate-out' : ''}`}>
          {currentAnnouncement.text}
        </p>
        <button 
          className={`announcement-banner__button ${isAnimating ? 'animate-out' : ''}`}
          onClick={handleActionClick}
        >
          {currentAnnouncement.buttonText}
        </button>
      </div>
      <button
        className="announcement-banner__close"
        onClick={handleClose}
        aria-label="Close announcement"
      >
        ✕
      </button>
    </div>
  );
};

export default AnnouncementBanner;
