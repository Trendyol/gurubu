import classNames from "classnames";
import { useGroomingRoom } from "@/contexts/GroomingRoomContext";
import { useSocket } from "@/contexts/SocketContext";
import { getCurrentLobby } from "@/shared/helpers/lobbyStorage";
import { ENCOUTERED_ERROR_TYPE } from "@/shared/enums";
import { handleRoomJoin } from "@/shared/helpers/roomJoin";

interface IProps {
  title: string;
  roomId: string;
}
const GroomingBoardErrorPopup = ({ title, roomId }: IProps) => {
  const socket = useSocket();
  const { showErrorPopup, setShowErrorPopup, encounteredError, userInfo } = useGroomingRoom();

  const handleRemoveUser = () => {
    localStorage.removeItem("lobby");
    socket.emit(
      "removeUser",
      roomId,
      userInfo.lobby.userID,
      userInfo.lobby.credentials
    );
  };

  const handleClick = () => {
    setShowErrorPopup(false);
    if(encounteredError.id === ENCOUTERED_ERROR_TYPE.CREDENTIALS_ERROR){
      handleRemoveUser();
      handleRoomJoin(userInfo.nickname, true, roomId, userInfo.lobby.isAdmin)
      return;
    }
    const nickname = localStorage.getItem("nickname");
    const lobby = getCurrentLobby(roomId);
    socket.emit("joinRoom", {
      nickname,
      roomID: roomId,
      lobby,
    });
  };

  if (!showErrorPopup) {
    return null;
  }

  return (
    <>
      <div className={classNames("grooming-board-error-popup active")}>
        <div className="grooming-board-error-popup__header">
          <h4>{title}</h4>
        </div>
        <p className="grooming-board-error-popup__body">
          Please click reconnect to continue.
        </p>
        <button
          className="grooming-board-error-popup__button"
          onClick={handleClick}
        >
          Reconnect
        </button>
      </div>
      <div
        className={classNames("grooming-board-error-popup__overlay active")}
      ></div>
    </>
  );
};

export default GroomingBoardErrorPopup;
