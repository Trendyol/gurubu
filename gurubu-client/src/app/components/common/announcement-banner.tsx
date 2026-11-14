import { useState } from "react";
import { IconExternalLink } from "@tabler/icons-react";
import { SIDEHUB_GURUBU_URL } from "@/shared/sidehub";

interface AnnouncementBannerProps {
  onClose?: () => void;
}

const AnnouncementBanner = ({ onClose }: AnnouncementBannerProps) => {
  const [isClosed, setIsClosed] = useState(false);

  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsClosed(true);
    onClose?.();
  };

  if (isClosed) {
    return null;
  }

  return (
    <div className="announcement-banner announcement-banner--sidehub">
      <a
        href={SIDEHUB_GURUBU_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="announcement-banner__link"
      >
        <div className="announcement-banner__content">
          <p className="announcement-banner__text">
            Thanks for using GuruBu! A quick like or comment on SideHub really helps—and
            we&apos;re all ears for any feedback to help us improve.
          </p>
          <span className="announcement-banner__button">
            SideHub
            <IconExternalLink size={14} stroke={2} />
          </span>
        </div>
      </a>
      <button
        type="button"
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