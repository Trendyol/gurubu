import { useGroomingRoom } from "@/contexts/GroomingRoomContext";
import { useSocket } from "@/contexts/SocketContext";
import { GroomingInfo } from "@/shared/interfaces";
import classNames from "classnames";
import { useEffect } from "react";

interface IProps {
  point: string;
  name: string;
}

const VoteCard = ({ point, name }: IProps) => {
  const socket = useSocket();
  const { setUserVote, userVote, userInfo, setGroomingInfo } = useGroomingRoom();

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

  useEffect(() => {
    const handleVoteSent = (data: GroomingInfo) => {
      setGroomingInfo(data);
    };

    socket.on("voteSent", handleVoteSent);

    return () => {
      socket.off("voteSent", handleVoteSent);
    };
  }, [setGroomingInfo, socket]);

  return (
    <button
      className={classNames("vote-card", { selected: isCardSelected }, {"story-point-card": name === "storyPoint"})}
      onClick={handleClick}
    >
      <p className="vote-point-text">{point}</p>
    </button>
  );
};

export default VoteCard;
