import Logo from "../../common/logo";
import Timer from "./timer";
import GroomingBoardProfile from "./grooming-board-profile";
import ThemeSelector from "./theme-selector";
import { useState } from "react";
import { useGroomingRoom } from "@/contexts/GroomingRoomContext";
import { IconClipboardCheck, IconCopy, IconFileImport } from "@tabler/icons-react";
import { ROOM_STATUS } from "@/room/[id]/enums";
import { Modal } from "@/components/common/modal";
import { ImportJiraIssuesForm } from "@/components/room/grooming-navbar/import-jira-issues";
import { GroomingMode } from "@/shared/enums";
import { AnnouncementTooltip } from "./announcement-tooltip";
import AnnouncementBanner from "../../common/announcement-banner";
import classNames from "classnames";

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

  const { groomingInfo, roomStatus, userInfo, jiraSidebarExpanded } = useGroomingRoom();
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
    <>
      <AnnouncementBanner />
      <nav className={classNames("grooming-navbar", { "grooming-navbar--nickname-form": showNickNameForm })}>
        <div className={classNames("grooming-navbar__content", { "jira-sidebar-expanded": jiraSidebarExpanded })}>
          <Logo />
          <div className="grooming-navbar__content-right">
            <div className="grooming-navbar__content-actions">
              {userInfo.lobby?.isAdmin &&
                groomingInfo?.mode === GroomingMode.PlanningPoker && (
                  <div>
                    <button
                      className="grooming-navbar__content-import-jira-issues"
                      onClick={() => openModal("importJiraIssues")}
                    >
                      <IconFileImport size={20} />
                      Import Jira Issues
                    </button>
                  </div>
                )}
              <button
                className="grooming-navbar__content-copy-link"
                onClick={handleCopyGroomingLinkClick}
              >
                {isGroomingLinkCopied ? (
                  <IconClipboardCheck size={20} />
                ) : (
                  <IconCopy size={20} />
                )}
                Link
              </button>
            </div>
            <div className="grooming-navbar__content-user-section">
              <Timer roomId={roomId} />
              <ThemeSelector />
              <AnnouncementTooltip />
              <GroomingBoardProfile roomId={roomId} />
            </div>
          </div>
          <Modal isOpen={modalOpen} onClose={closeModal}>
            <ImportJiraIssuesForm roomId={roomId} closeModal={closeModal} />
          </Modal>
        </div>
      </nav>
    </>
  );
};

export default GroomingNavbar;
