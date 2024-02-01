import { useGroomingRoom } from "@/contexts/GroomingRoomContext";
import {
  IconClipboardCheck,
  IconCopy,
  IconUserFilled,
} from "@tabler/icons-react";
import { ROOM_STATUS } from "@/room/[id]/enums";
import { useState } from "react";
import GroomingBoardProfile from "./grooming-board-profile";

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
          <p>Participants:</p>
          <div className="grooming-navbar__participant-number">
            <IconUserFilled width={20} />
            <p>{groomingInfo.totalParticipants || "0"}</p>
          </div>
        </div>
        <div>
          <button
            className="grooming-navbar__copy-link"
            onClick={handleCopyGroomingLinkClick}
          >
            Copy Grooming Link
            {isGroomingLinkCopied ? (
              <IconClipboardCheck width={20} color="green" />
            ) : (
              <IconCopy width={20} />
            )}
          </button>
        </div>
      </div>
      <GroomingBoardProfile />
    </nav>
  );
};

export default GroomingNavbar;
