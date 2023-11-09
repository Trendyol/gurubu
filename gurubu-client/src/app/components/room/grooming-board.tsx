import { useEffect, useState } from "react";
import { useSocket } from "../../contexts/SocketContext";
import {
  checkUserJoinedLobbyBefore,
  getCurrentLobby,
} from "../../shared/helpers/lobbyStorage";
import { useGroomingRoom } from "../../contexts/GroomingRoomContext";
import VotingStick from "./voting-stick";
import classNames from "classnames";
import Image from "next/image";
import MetricAverages from "./metric-averages";
import GroomingBoardParticipants from "./grooming-board-participants";
import { IconEdit, IconReportAnalytics } from "@tabler/icons-react";
import { ROOM_STATUS } from "../../room/[id]/enums";

interface IProps {
  roomId: string;
  showNickNameForm: boolean;
  setShowNickNameForm: (value: boolean) => void;
}

const GroomingBoard = ({
  roomId,
  showNickNameForm,
  setShowNickNameForm,
}: IProps) => {
  const socket = useSocket();
  const [editVoteClicked, setEditVoteClicked] = useState(false);
  const { userInfo, setGroomingInfo, groomingInfo, setUserVote, roomStatus } =
    useGroomingRoom();

  const isGroomingInfoLoaded = Boolean(Object.keys(groomingInfo).length);

  useEffect(() => {
    if (!checkUserJoinedLobbyBefore(roomId)) {
      if (roomStatus === ROOM_STATUS.FOUND) {
        setShowNickNameForm(true);
      }
      return;
    }
    const nickname = localStorage.getItem("nickname");
    const lobby = getCurrentLobby(roomId);

    if(roomStatus === ROOM_STATUS.FOUND){
      socket.emit("joinRoom", {
        nickname,
        roomID: roomId,
        lobby,
      });
    }

    socket.on("initialize", (data) => {
      if (data?.participants[lobby.userID]) {
        setUserVote(data.participants[lobby.userID].votes);
        setGroomingInfo(data);
      }
    });

    socket.on("voteSent", (data) => setGroomingInfo(data));

    socket.on("showResults", (data) => {
      setGroomingInfo(data);
    });

    socket.on("resetVotes", (data) => {
      setUserVote({});
      setGroomingInfo(data);
      setEditVoteClicked(false);
    });

    socket.on("userDisconnected", (data) => setGroomingInfo(data));

  }, [roomStatus]);

  const handleShowResultsClick = () => {
    if (groomingInfo.isResultShown) {
      return;
    }
    socket.emit("showResults", roomId);
  };

  const handleResetVotesClick = () => {
    socket.emit("resetVotes", roomId);
  };

  const handleEditButtonClick = () => {
    setEditVoteClicked(!editVoteClicked);
  };

  const renderLoading = () => {
    return <div className="grooming-board__loading">Loading..</div>;
  };

  if (showNickNameForm) {
    return null;
  }

  return (
    <div className="grooming-board">
      <section className="grooming-board__playground">
        {!editVoteClicked &&
          groomingInfo.isResultShown &&
          isGroomingInfoLoaded && (
            <div className="grooming-board__results">
              <Image
                priority
                src="/trophy.svg"
                alt="trophy"
                width={200}
                height={200}
              />
              <p>{groomingInfo.score}</p>
            </div>
          )}
        {(editVoteClicked || !groomingInfo.isResultShown) &&
          isGroomingInfoLoaded && (
            <div className="grooming-board__voting-sticks">
              {groomingInfo.metrics?.map((metric) => (
                <VotingStick
                  key={metric.id}
                  id={metric.id}
                  points={metric.points}
                  name={metric.name}
                />
              ))}
            </div>
          )}
        {!editVoteClicked && <MetricAverages />}
        {groomingInfo.isResultShown && (
          <div className="grooming-board__toggle-button-wrapper">
            <button
              className={classNames("grooming-board__edit-vote-toggle-button", {
                clicked: editVoteClicked,
              })}
              onClick={handleEditButtonClick}
            >
              {editVoteClicked ? "Back to Results" : "Edit Vote"}
              {editVoteClicked ? (
                <IconReportAnalytics width={16} />
              ) : (
                <IconEdit width={16} />
              )}
            </button>
          </div>
        )}
        {userInfo.lobby?.isAdmin && isGroomingInfoLoaded && (
          <div className="grooming-board__actions-wrapper">
            <button
              className="grooming-board__reset-votes-button"
              onClick={handleResetVotesClick}
            >
              Reset Votes
            </button>
            <button
              className={classNames("grooming-board__show-result-button", {
                disabled: groomingInfo.isResultShown,
              })}
              onClick={handleShowResultsClick}
            >
              Show Results
            </button>
          </div>
        )}
        {!isGroomingInfoLoaded && renderLoading()}
      </section>
      <section className="grooming-board__logs-section">
        <>
          {isGroomingInfoLoaded && (
            <>
              <ul className="grooming-board__metrics">
                {groomingInfo.metrics?.map((metric) => (
                  <li key={metric.id}>{metric.name}</li>
                ))}
              </ul>
              <GroomingBoardParticipants />
            </>
          )}
          {!isGroomingInfoLoaded && renderLoading()}
        </>
      </section>
    </div>
  );
};

export default GroomingBoard;
