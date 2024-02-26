import { useEffect, useState } from "react";
import classNames from "classnames";
import Image from "next/image";
import { notFound } from "next/navigation";
import { useSocket } from "@/contexts/SocketContext";
import {
  checkUserJoinedLobbyBefore,
  getCurrentLobby,
} from "@/shared/helpers/lobbyStorage";
import { useGroomingRoom } from "@/contexts/GroomingRoomContext";
import VotingStick from "./voting-stick";
import MetricAverages from "./metric-averages";
import GroomingBoardParticipants from "./grooming-board-participants";
import { IconEdit, IconReportAnalytics } from "@tabler/icons-react";
import { ROOM_STATUS } from "../../room/[id]/enums";
import { EncounteredError, GroomingInfo } from "@/shared/interfaces";
import { ENCOUTERED_ERROR_TYPE } from "@/shared/enums";
import GroomingBoardErrorPopup from "./grooming-board-error-popup";

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
  const {
    userInfo,
    setGroomingInfo,
    groomingInfo,
    setUserVote,
    roomStatus,
    setEncounteredError,
    encounteredError,
    setShowErrorPopup,
  } = useGroomingRoom();

  const isGroomingInfoLoaded = Boolean(Object.keys(groomingInfo).length);

  useEffect(() => {
    const handleInitialize = (data: GroomingInfo) => {
      if (data?.participants[lobby.userID]) {
        setUserVote(data.participants[lobby.userID].votes);
        setGroomingInfo(data);
      }
    };

    const handleVoteSent = (data: GroomingInfo) => {
      setGroomingInfo(data);
    };

    const handleShowResults = (data: GroomingInfo) => setGroomingInfo(data);

    const handleUpdateNickName = (data: GroomingInfo) => setGroomingInfo(data);

    const handleResetVotes = (data: GroomingInfo) => {
      setUserVote({});
      setGroomingInfo(data);
      setEditVoteClicked(false);
    };

    const handleUserDisconnected = (data: GroomingInfo) => {
      setGroomingInfo(data);
    }

    const handleEncounteredError = (data: EncounteredError) => {
      if(data.id === ENCOUTERED_ERROR_TYPE.CONNECTION_ERROR){
        setShowErrorPopup(true);
      }
      setEncounteredError(data);
    }

    if (!checkUserJoinedLobbyBefore(roomId)) {
      if (roomStatus === ROOM_STATUS.FOUND) {
        setShowNickNameForm(true);
      }
      return;
    }
    const nickname = localStorage.getItem("nickname");
    const lobby = getCurrentLobby(roomId);

    if (roomStatus === ROOM_STATUS.FOUND) {
      socket.emit("joinRoom", {
        nickname,
        roomID: roomId,
        lobby,
      });
    }

    socket.on('disconnect', (reason) => {
      setShowErrorPopup(true);
    });

    socket.on("initialize", handleInitialize);
    socket.on("voteSent", handleVoteSent);
    socket.on("showResults", handleShowResults);
    socket.on("updateNickName", handleUpdateNickName);
    socket.on("resetVotes", handleResetVotes);
    socket.on("userDisconnected", handleUserDisconnected);
    socket.on("encounteredError", handleEncounteredError)

    return () => {
      socket.off("initialize", handleInitialize);
      socket.off("voteSent", handleVoteSent);
      socket.off("showResults", handleShowResults);
      socket.off("updateNickName", handleUpdateNickName);
      socket.off("resetVotes", handleResetVotes);
      socket.off("userDisconnected", handleUserDisconnected);
      socket.off("encounteredError", handleEncounteredError)
    };
  }, [
    roomStatus,
    roomId,
    socket,
    setShowNickNameForm,
    setUserVote,
    setGroomingInfo,
    setEditVoteClicked,
    setEncounteredError,
    setShowErrorPopup
  ]);


  const handleShowResultsClick = () => {
    if (groomingInfo.isResultShown) {
      return;
    }
    socket.emit("showResults", roomId, userInfo.lobby.credentials);
  };

  const handleResetVotesClick = () => {
    socket.emit("resetVotes", roomId, userInfo.lobby.credentials);
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

  if(encounteredError.id === ENCOUTERED_ERROR_TYPE.ROOM_EXPIRED){
    notFound();
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
                  displayName={metric.displayName}
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
              {!groomingInfo.isResultShown && (
                <Image priority src="/right-arrow.svg" alt="right-arrow" width={20} height={20} />
              )}
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
                  <li key={metric.id}>{metric.displayName}</li>
                ))}
              </ul>
              <GroomingBoardParticipants />
            </>
          )}
          {!isGroomingInfoLoaded && renderLoading()}
        </>
      </section>
      <GroomingBoardErrorPopup title="Connection lost !" roomId={roomId}/>
    </div>
  );
};

export default GroomingBoard;
