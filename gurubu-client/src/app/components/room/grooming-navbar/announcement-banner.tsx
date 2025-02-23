import { useGroomingRoom } from '@/contexts/GroomingRoomContext';
import { useState, useEffect } from 'react';

const announcements = [
  {
    id: 1,
    icon: "✨",
    text: "Hey there! We'd love to hear your thoughts on our new Jira design. Your feedback shapes our future!",
    buttonText: "Share Thoughts",
    link: process.env.NEXT_PUBLIC_FEEDBACK_SHEET_LINK,
  },
  {
    id: 3,
    icon: "💡",
    text: "Got ideas for making GuruBu better? We're all ears!",
    buttonText: "Give Feedback",
    link: process.env.NEXT_PUBLIC_FEEDBACK_SHEET_LINK,
  }
];

const AnnouncementBanner = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const { isAnnouncementBannerVisible, setIsAnnouncementBannerVisible } = useGroomingRoom();

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

  if (!isAnnouncementBannerVisible) {
    return null;
  }

  const currentAnnouncement = announcements[currentIndex];

  const handleActionClick = () => {
    window.open(currentAnnouncement.link, '_blank');
    setIsAnnouncementBannerVisible(false);
  };

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
        <button
          className="announcement-banner__close"
          onClick={() => setIsAnnouncementBannerVisible(false)}
          aria-label="Close announcement"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default AnnouncementBanner;
