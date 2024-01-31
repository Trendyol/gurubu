import { useGroomingRoom } from "../../contexts/GroomingRoomContext";
import {
  IconClipboardCheck,
} from "@tabler/icons-react";
import { ROOM_STATUS } from "../../room/[id]/enums";
import { useState } from "react";
import GroomingBoardProfile from "./grooming-board-profile";
import Image from "next/image";

interface IProps {
  showNickNameForm: boolean;
}

const GroomingNavbar = ({ showNickNameForm }: IProps) => {
  const { groomingInfo, roomStatus } = useGroomingRoom();
  const [isGroomingLinkCopied, setIsGroomingLinkCopied] = useState(false);

  if (roomStatus !== ROOM_STATUS.FOUND || showNickNameForm) {
    return null;
  }

  const getGroomingLink = () => {
    let currentUrl: string = "";
    if (typeof window !== "undefined") {
      currentUrl = window.location.href;
    }
    return currentUrl;
  };

  const handleCopyGroomingLinkClick = () => {
    navigator.clipboard
      .writeText(getGroomingLink())
      .then(() => {
        setIsGroomingLinkCopied(true);
      })
      .catch((error) => {
        console.error("Unable to copy text: ", error);
      });

    setTimeout(() => {
      setIsGroomingLinkCopied(false);
    }, 3000);
  };

  return (
    <nav className="grooming-navbar">
      <div className="grooming-navbar__actions">
        <div className="grooming-navbar__participants">
          <div className="grooming-navbar__participant-number-section">
            <Image src="/icon-user-group.svg" width={12} height={12} alt="Participants" />
            <p className="grooming-navbar__participant-number">{groomingInfo.totalParticipants || "0"}</p>
          </div>
          <p className="grooming-navbar__participant-text">Participants is here</p>
        </div>
        <div>
          <button
            className="grooming-navbar__copy-link"
            onClick={handleCopyGroomingLinkClick}
          >
            {isGroomingLinkCopied ? (
              <IconClipboardCheck stroke={3} width={14} height={14} />
            ) : (
              <Image src="/icon-copy.svg" width={14} height={14} alt="Copy link" />
              )}
            Copy Link
          </button>
        </div>
      </div>
      <GroomingBoardProfile />
    </nav>
  );
};

export default GroomingNavbar;
