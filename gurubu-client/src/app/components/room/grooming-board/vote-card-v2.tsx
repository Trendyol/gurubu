import classNames from "classnames";
import { useGroomingRoom } from "@/contexts/GroomingRoomContext";
import { useSocket } from "@/contexts/SocketContext";
import { IconCoffee } from "@tabler/icons-react";

interface IProps {
  point: string;
  name: string;
}

const VoteCardV2 = ({ point, name }: IProps) => {
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
      className={classNames(
        "vote-card-v2",
        { flipped: isCardSelected },
        { "story-point-card": name === "storyPoint" }
      )}
      onClick={handleClick}
    >
      <div className="card-inner">
        <div className="card-front">
          <div className="card-value card-value-top-left">
            {point === "break" ? <IconCoffee size={14}/> : point}
          </div>
          <div className="card-value card-value-center">
            {point === "break" ? <IconCoffee size={32}/> : point}
          </div>
          <div className="card-value card-value-bottom-right">
            {point === "break" ? <IconCoffee size={14}/> : point}
          </div>
        </div>
        <div className="card-back">
          <div className="card-back-design">🃏</div>
        </div>
      </div>
    </button>
  );
};

export default VoteCardV2;
