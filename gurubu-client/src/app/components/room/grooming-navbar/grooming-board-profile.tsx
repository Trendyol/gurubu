import Avatar from "@/components/common/avatar";
import { useEffect, useState } from "react";
import { Modal } from "@/components/common/modal";
import { ChangeNameForm } from "@/components/room/grooming-navbar/change-name";
import { LeaveRoom } from "./leave-room";
import { useAvatar } from "@/contexts/AvatarContext";
import { ChangeAvatar } from "./change-avatar";

type Props = {
  roomId: string;
};

type ModalType = "changeName" | "leaveRoom" | "changeAvatar" | null;

const GroomingBoardProfile = ({ roomId }: Props) => {
  const [showProfileBar, setShowProfileBar] = useState(false);
  const [selectedModal, setSelectedModal] = useState<ModalType>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const {
    createAvatarSvg,
    updateAvatar,
    initializeAvatarOptions,
    avatar,
    setAvatar,
  } = useAvatar();

  const openModal = (modalType: ModalType) => {
    setModalOpen(true);
    setSelectedModal(modalType);
  };

  const closeModal = () => {
    setModalOpen(false);
    setShowProfileBar(false);
  };

  const handleClick = () => {
    setShowProfileBar(!showProfileBar);
  };

  useEffect(() => {
    const handleDocumentClick = (event: any) => {
      const groomingBoardProfileElement = document.getElementById(
        "grooming-board-profile"
      );
      const groomingBoardProfileBarElement = document.getElementById(
        "grooming-board-profile__bar"
      );
      if (
        groomingBoardProfileElement &&
        groomingBoardProfileElement.contains(event.target)
      ) {
        return;
      }
      if (
        groomingBoardProfileBarElement &&
        !groomingBoardProfileBarElement.contains(event.target)
      ) {
        setShowProfileBar(false);
      }
    };

    document.addEventListener("click", handleDocumentClick);

    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, []);

  useEffect(() => {
    const options = initializeAvatarOptions();
    setAvatar(createAvatarSvg(options));
    updateAvatar(options);
  }, []);

  return (
    <>
      <div
        className="grooming-board-profile"
        id="grooming-board-profile"
        onClick={handleClick}
      >
        <div className="grooming-board-profile__icon">
          <Avatar svg={avatar} />
        </div>
        {showProfileBar && (
          <div
            className="grooming-board-profile__bar"
            id="grooming-board-profile__bar"
          >
            <button
              className="grooming-board-profile__update-avatar-button"
              onClick={() => openModal("changeAvatar")}
            >
              Change avatar
            </button>
            <button
              className="grooming-board-profile__update-nickname-button"
              onClick={() => openModal("changeName")}
            >
              Change name
            </button>
            <button
              className="grooming-board-profile__leave-room-button"
              onClick={() => openModal("leaveRoom")}
            >
              Leave Room
            </button>
          </div>
        )}
      </div>
      <Modal isOpen={modalOpen} onClose={closeModal}>
        {selectedModal === "changeName" ? (
          <ChangeNameForm closeModal={closeModal} />
        ) : selectedModal === "changeAvatar" ? (
          <ChangeAvatar closeModal={closeModal} />
        ) : (
          <LeaveRoom roomId={roomId} closeModal={closeModal} />
        )}
      </Modal>
    </>
  );
};

export default GroomingBoardProfile;
