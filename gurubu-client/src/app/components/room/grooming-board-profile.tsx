import { useEffect, useState } from "react";
import Image from "next/image";
import { useGroomingRoom } from "@/contexts/GroomingRoomContext";
import { Modal } from "@/components/common/modal";
import { ChangeNameForm } from "@/components/room/change-name";
import { LeaveRoom } from "./leave-room";

type Props = {
  roomId: string;
};

type ModalType = "changeName" | "leaveRoom" | null;

const GroomingBoardProfile = ({ roomId }: Props) => {
  const { userInfo } = useGroomingRoom();
  const [showProfileBar, setShowProfileBar] = useState(false);
  const [selectedModal, setSelectedModal] = useState<ModalType>(null);

  const [modalOpen, setModalOpen] = useState(false);

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
      const groomingBoardProfileElement = document.getElementById("grooming-board-profile");
      const groomingBoardProfileBarElement = document.getElementById("grooming-board-profile__bar");
      if (groomingBoardProfileElement && groomingBoardProfileElement.contains(event.target)) {
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

  return (
    <>
      <div className="grooming-board-profile" id="grooming-board-profile" onClick={handleClick}>
        <div className="grooming-board-profile__icon">
          <Image src="/icon-user.svg" width={10} height={10} alt="User information" />
        </div>
        <p className="grooming-board-profile__text">{userInfo.nickname}</p>

        {showProfileBar && (
          <div className="grooming-board-profile__bar" id="grooming-board-profile__bar">
            <button
              className="grooming-board-profile__update-nickname-button"
              onClick={() => openModal("changeName")}>
              Change name
            </button>
            <button
              className="grooming-board-profile__leave-room-button"
              onClick={() => openModal("leaveRoom")}>
              Leave Room
            </button>
          </div>
        )}
      </div>
      <Modal isOpen={modalOpen} onClose={closeModal}>
        {selectedModal === "changeName" ? (
          <ChangeNameForm closeModal={closeModal} />
        ) : (
          <LeaveRoom roomId={roomId} closeModal={closeModal} />
        )}
      </Modal>
    </>
  );
};

export default GroomingBoardProfile;
