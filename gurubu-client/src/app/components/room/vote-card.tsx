import { useGroomingRoom } from "@/contexts/GroomingRoomContext";
import { useSocket } from "@/contexts/SocketContext";
import classNames from "classnames";

interface IProps {
  id: string;
  point: string;
  name: string;
}

const VoteCard = ({ id, point, name }: IProps) => {
  const socket = useSocket();
  const { setUserVote, userVote, userInfo } = useGroomingRoom();
  const isCardSelected = userVote ? userVote[name] === point : false;
  const handleClick = () => {
    if (userVote && userVote[name] === point) {
      const temp = { ...userVote };
      delete temp[name];
      setUserVote({ ...temp });
      socket.emit(
        "userVote",
        { ...temp },
        userInfo.lobby.roomID,
        userInfo.lobby.credentials
      );
      return;
    }
    setUserVote({ ...userVote, [name]: point });
    socket.emit(
      "userVote",
      { ...userVote, [name]: point },
      userInfo.lobby.roomID,
      userInfo.lobby.credentials
    );
  };

  return (
    <button
      className={classNames("vote-card", { selected: isCardSelected })}
      onClick={handleClick}
    >
      <p className="vote-point-text">{point}</p>
    </button>
  );
};

export default VoteCard;
