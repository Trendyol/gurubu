import { useGroomingRoom } from "../../contexts/GroomingRoomContext";
import { useSocket } from "../../contexts/SocketContext";
import { getCurrentLobby } from "../../shared/helpers/lobbyStorage";
import classNames from "classnames";

interface IProps {
  title: string;
  roomId: string;
}
const GroomingBoardErrorPopup = ({ title, roomId }: IProps) => {
  const socket = useSocket();
  const { showErrorPopup, setShowErrorPopup } = useGroomingRoom();
  const handleClick = () => {
    const nickname = localStorage.getItem("nickname");
    const lobby = getCurrentLobby(roomId);
    socket.emit("joinRoom", {
      nickname,
      roomID: roomId,
      lobby,
    });
    setShowErrorPopup(false);
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
