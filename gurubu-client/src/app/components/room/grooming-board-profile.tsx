import { SetStateAction, useEffect, useState } from "react";
import { IconUserCircle } from "@tabler/icons-react";
import { useGroomingRoom } from "../../contexts/GroomingRoomContext";
import { useSocket } from "../../contexts/SocketContext";

const GroomingBoardProfile = () => {
  const socket = useSocket();
  const { userInfo, setUserinfo } = useGroomingRoom();
  const [newNickname, setNewNickname] = useState(userInfo.nickname);
  const [showProfileBar, setShowProfileBar] = useState(false);

  const handleClick = () => {
    setShowProfileBar(!showProfileBar);
  };

  const handleNicknameInputChange = (e: {
    target: { value: SetStateAction<string> };
  }) => {
    if (e.target.value.length < 17) {
      setNewNickname((e.target.value as string).trim());
    }
  };

  const handleUpdateNicknameButtonClick = () => {
    if (newNickname.trim()) {
      socket.emit("updateNickName", userInfo.lobby.roomID, newNickname);
      setUserinfo({ ...userInfo, nickname: newNickname.trim() });
      localStorage.setItem("nickname", newNickname.trim());
    }
  };

  useEffect(() => {
    const handleDocumentClick = (event: any) => {
      const groomingBoardProfileBarElement = document.getElementById(
        "grooming-board-profile__bar"
      );
      const groomingBoardProfileElement = document.getElementById(
        "grooming-board-profile"
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

  return (
    <>
      <button
        className="grooming-board-profile"
        id="grooming-board-profile"
        onClick={handleClick}
      >
        <p>{userInfo.nickname}</p>
        <IconUserCircle />
      </button>
      {showProfileBar && (
        <div
          className="grooming-board-profile__bar"
          id="grooming-board-profile__bar"
        >
          <label
            htmlFor="profile-nickname-input"
            className="grooming-board-profile__nickname-label"
          >
            Nickname
          </label>
          <input
            id="profile-nickname-input"
            className="grooming-board-profile__nickname-input"
            onChange={handleNicknameInputChange}
            value={newNickname}
          ></input>
          <button
            className="grooming-board-profile__update-nickname-button"
            onClick={handleUpdateNicknameButtonClick}
          >
            Update Your Nickname
          </button>
        </div>
      )}
    </>
  );
};

export default GroomingBoardProfile;
