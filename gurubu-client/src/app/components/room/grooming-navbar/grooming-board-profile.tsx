import Avatar from "@/components/common/avatar";
import { useEffect, useRef, useState } from "react";
import { Modal } from "@/components/common/modal";
import { ChangeNameForm } from "@/components/room/grooming-navbar/change-name";
import { LeaveRoom } from "./leave-room";
import { useAvatar } from "@/contexts/AvatarContext";
import { ChangeAvatar } from "./change-avatar";
import { IconChevronDown, IconInfoCircle, IconX } from "@tabler/icons-react";
import { useGroomingRoom } from "@/contexts/GroomingRoomContext";
import { useTour } from "@/contexts/TourContext";

type Props = {
  roomId: string;
};

type ModalType = "changeName" | "leaveRoom" | "changeAvatar" | null;

const GroomingBoardProfile = ({ roomId }: Props) => {
  const [showProfileBar, setShowProfileBar] = useState(false);
  const [selectedModal, setSelectedModal] = useState<ModalType>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const {
    createAvatarSvg,
    updateAvatar,
    initializeAvatarOptions,
    avatar,
    setAvatar,
  } = useAvatar();
  const { userInfo, groomingInfo } = useGroomingRoom();
  const { showTour } = useTour();
  const selectorRef = useRef<HTMLDivElement>(null);
  const isGroomingInfoLoaded = Boolean(Object.keys(groomingInfo).length);

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

  useEffect(() => {
    const hasSeenTooltip = localStorage.getItem("hasSeenProfileTooltip");
    const tourCompleted = localStorage.getItem("tourCompleted");

    if (!hasSeenTooltip && tourCompleted && isGroomingInfoLoaded) {
      setShowTooltip(true);
      localStorage.setItem("hasSeenProfileTooltip", "true");

      const timer = setTimeout(() => {
        setShowTooltip(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [showTour, isGroomingInfoLoaded]);

  const handleCloseTooltip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowTooltip(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectorRef.current &&
        !selectorRef.current.contains(event.target as Node)
      ) {
        setShowTooltip(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <div
        className="grooming-board-profile"
        id="grooming-board-profile"
        onClick={handleClick}
      >
        <div className="grooming-board-profile__content">
          <div className="grooming-board-profile__icon">
            <Avatar svg={avatar} />
          </div>
          <span className="grooming-board-profile__nickname">
            {userInfo.nickname}
          </span>
          <IconChevronDown
            size={16}
            className="grooming-board-profile__chevron"
          />
        </div>
        {showTooltip && (
          <div className="grooming-board-profile__tooltip" ref={selectorRef}>
            <IconInfoCircle size={16} />
            <span>You can customize your avatar and profile from here</span>
            <button 
              className="grooming-board-profile__tooltip-close"
              onClick={handleCloseTooltip}
              aria-label="Close tooltip"
            >
              <IconX size={16} color="gray" />
            </button>
          </div>
        )}
        {showProfileBar && (
          <div
            className="grooming-board-profile__bar"
            id="grooming-board-profile__bar"
          >
            <button
              className="grooming-board-profile__update-avatar-button"
              onClick={() => openModal("changeAvatar")}
            >
              Avatar
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
