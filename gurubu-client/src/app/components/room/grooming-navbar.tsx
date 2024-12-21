import { useState } from "react";
import { useGroomingRoom } from "@/contexts/GroomingRoomContext";
import { IconClipboardCheck } from "@tabler/icons-react";
import { ROOM_STATUS } from "@/room/[id]/enums";
import { Modal } from "@/components/common/modal";
import { ImportJiraIssuesForm } from "@/components/room/import-jira-issues";
import GroomingBoardProfile from "./grooming-board-profile";
import Image from "next/image";
import ThemeSelector from "./theme-selector";
import { GroomingMode } from "@/shared/enums";
import Logo from "../common/logo";

interface Props {
  showNickNameForm: boolean;
  roomId: string;
}

const GroomingNavbar = ({ showNickNameForm, roomId }: Props) => {
  type ModalType = "importJiraIssues" | null;
  const [selectedModal, setSelectedModal] = useState<ModalType>(null);

  const [modalOpen, setModalOpen] = useState(false);

  const openModal = (modalType: ModalType) => {
    setModalOpen(true);
    setSelectedModal(modalType);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const { groomingInfo, roomStatus, userInfo, setIssues } = useGroomingRoom();
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
      <div className="grooming-navbar__content">
        <div className="grooming-navbar__content-actions">
          <Logo />
          <div className="grooming-navbar__content-participants">
            <div className="grooming-navbar__content-participant-number-section">
              <Image
                src="/icon-user-group.svg"
                width={12}
                height={12}
                alt="Participants"
              />
              <p className="grooming-navbar__content-participant-number">
                {groomingInfo.totalParticipants || "0"}
              </p>
            </div>
          </div>
          <div>
            <button
              className="grooming-navbar__content-copy-link"
              onClick={handleCopyGroomingLinkClick}
            >
              {isGroomingLinkCopied ? (
                <IconClipboardCheck stroke={3} width={14} height={14} />
              ) : (
                <Image
                  src="/icon-copy.svg"
                  width={14}
                  height={14}
                  alt="Copy link"
                />
              )}
              Link
            </button>
          </div>
          {userInfo.lobby?.isAdmin &&
            groomingInfo?.mode === GroomingMode.PlanningPoker && (
              <div>
                <button
                  className="grooming-navbar__content-import-jira-issues"
                  onClick={() => openModal("importJiraIssues")}
                >
                  <span className="grooming-navbar__content-import-jira-issues-version">
                    Beta
                  </span>
                  <Image
                    src="/planning.svg"
                    width={14}
                    height={14}
                    alt="Copy link"
                  />
                  Import Jira Issues
                </button>
              </div>
            )}
        </div>
        <div className="grooming-navbar__content-user-section">
          <ThemeSelector />
          <GroomingBoardProfile roomId={roomId} />
        </div>
        <Modal isOpen={modalOpen} onClose={closeModal}>
          <ImportJiraIssuesForm roomId={roomId} closeModal={closeModal} />
        </Modal>
      </div>
    </nav>
  );
};

export default GroomingNavbar;
