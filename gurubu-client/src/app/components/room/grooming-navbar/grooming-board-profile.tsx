import Avatar from "@/components/common/avatar";
import { useCallback, useEffect, useRef, useState } from "react";
import { Modal } from "@/components/common/modal";
import { ChangeNameForm } from "@/components/room/grooming-navbar/change-name";
import { LeaveRoom } from "./leave-room";
import { useAvatar } from "@/contexts/AvatarContext";
import { ChangeAvatar } from "./change-avatar";
import {
  IconChevronDown,
  IconCircleCheckFilled,
  IconInfoCircle,
  IconX,
  IconExclamationCircleFilled,
} from "@tabler/icons-react";
import { useGroomingRoom } from "@/contexts/GroomingRoomContext";
import { useTour } from "@/contexts/TourContext";
import { PService } from "../../../services/pService";
import { useSocket } from "@/contexts/SocketContext";
import Image from "next/image";
import PLogo from "./p-icon";
import PsyncModalContent from "./p-sync-modal-content";

type Props = {
  roomId: string;
};

type ModalType = "changeName" | "leaveRoom" | "changeAvatar" | "Psync" | null;

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
  const socket = useSocket();
  const { userInfo, groomingInfo, pProfileStorage, setPProfileStorage } = useGroomingRoom();
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

  const updateProfile = useCallback(
    (profile: any) => {
      if (!userInfo.lobby?.roomID || !userInfo.lobby?.credentials) {
        return;
      }
      socket.emit(
        "updateProfilePicture",
        userInfo.lobby?.roomID,
        profile,
        userInfo.lobby?.credentials
      );
    },
    [userInfo.lobby?.roomID, userInfo.lobby?.credentials]
  );

  const fetchPUser = async () => {
    try {
      const ispProfileConsentGiven = JSON.parse(
        localStorage.getItem("pProfile") || "{}"
      ).isConsentGiven;
      const ispProfileLoginClicked = JSON.parse(
        localStorage.getItem("pProfile") || "{}"
      ).isLoginClicked;
      const ispProfileSelected = JSON.parse(
        localStorage.getItem("pProfile") || "{}"
      ).isSelected;
      if ((ispProfileConsentGiven === false) && !ispProfileLoginClicked) {
        return;
      }
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const pService = new PService(baseUrl);

      const result = await pService.searchUser();
      if (result.isSuccess && result.data) {
        localStorage.setItem("pProfile", JSON.stringify({
          isLoginClicked: ispProfileLoginClicked,
          isSelected: ispProfileSelected,
          isConsentGiven: true,
        }));
        setPProfileStorage({
          isLoginClicked: ispProfileLoginClicked,
          isSelected: ispProfileSelected,
          isConsentGiven: true,
        });
        const profile = result?.data?.[0]?.spec?.profile;
        profile.isSelected = ispProfileSelected || ispProfileLoginClicked;
        updateProfile(profile);
      } else {
        localStorage.setItem("pProfile", JSON.stringify({
          isLoginClicked: ispProfileLoginClicked,
          isSelected: ispProfileSelected,
          isConsentGiven: false,
        }));
        setPProfileStorage({
          isLoginClicked: ispProfileLoginClicked,
          isSelected: ispProfileSelected,
          isConsentGiven: false,
        });
      }
    } catch (error) {}
  };

  useEffect(() => {
    fetchPUser();
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
            {groomingInfo?.participants?.[userInfo.lobby?.userID]?.profile
              ?.picture &&
            groomingInfo?.participants?.[userInfo.lobby?.userID]?.profile
              ?.isSelected ? (
              <Image
                src={
                  groomingInfo?.participants?.[userInfo.lobby?.userID]?.profile
                    ?.picture
                }
                alt="Profile Picture"
                width={32}
                height={32}
              />
            ) : (
              <Avatar svg={avatar} />
            )}
          </div>
          <span className="grooming-board-profile__nickname">
            {groomingInfo?.participants?.[userInfo.lobby?.userID]?.profile
              ?.isSelected
              ? groomingInfo?.participants?.[userInfo.lobby?.userID]?.profile
                  ?.displayName
              : userInfo.nickname}
          </span>
          {process.env.NEXT_PUBLIC_P_ENABLED === "true" && (
            <div className="grooming-board-profile__p-logo-container">
              {!pProfileStorage.isConsentGiven && (
                <IconExclamationCircleFilled
                  size={16}
                  className="p-logo-exclamation"
                />
              )}
              {pProfileStorage.isConsentGiven && (
                <IconCircleCheckFilled size={16} className="p-logo-check" />
              )}
              <PLogo className="grooming-board-profile__p-logo" />
            </div>
          )}
          <IconChevronDown
            size={16}
            className="grooming-board-profile__chevron"
          />
        </div>
        {showTooltip && (
          <div className="grooming-board-profile__tooltip" ref={selectorRef}>
            <IconInfoCircle />
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
            {process.env.NEXT_PUBLIC_P_ENABLED === "true" && (
              <button
                className="grooming-board-profile__p-sync-button"
                onClick={() => openModal("Psync")}
              >
                <PLogo className="grooming-board-profile__p-logo" />
                <p>Profile</p>
                <p className="p-sync-new">New</p>
              </button>
            )}
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
        ) : selectedModal === "Psync" ? (
          <PsyncModalContent
            updateProfile={updateProfile}
            closeModal={closeModal}
          />
        ) : (
          <LeaveRoom roomId={roomId} closeModal={closeModal} />
        )}
      </Modal>
    </>
  );
};

export default GroomingBoardProfile;
