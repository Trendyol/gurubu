import React from "react";
import classNames from "classnames";
import { useGroomingRoom } from "@/contexts/GroomingRoomContext";
import { useSocket } from "@/contexts/SocketContext";
import { GroomingMode } from "@/shared/enums";

interface Props {
  roomId: string;
}

const GroomingBoardActions = ({ roomId }: Props) => {
  const { groomingInfo, userInfo } = useGroomingRoom();
  const socket = useSocket();

  const isGroomingInfoLoaded = Boolean(Object.keys(groomingInfo).length);

  const handleShowResultsClick = () => {
    if (groomingInfo.isResultShown) {
      return;
    }
    socket.emit("showResults", roomId, userInfo.lobby.credentials);
  };

  const handleResetVotesClick = () => {
    socket.emit("resetVotes", roomId, userInfo.lobby.credentials);
  };

  if (!isGroomingInfoLoaded || (!userInfo.lobby?.isAdmin && !groomingInfo?.isResultShown)) {
    return null;
  }

  return (
    <div
      className={classNames("grooming-board__actions-wrapper", {
        "story-point-mode": groomingInfo.mode === GroomingMode.PlanningPoker,
      })}
    >
      {!groomingInfo?.isResultShown && userInfo.lobby?.isAdmin && (
        <button
          className={classNames("grooming-board__show-result-button", {
            disabled: groomingInfo.isResultShown,
          })}
          onClick={handleShowResultsClick}
        >
          Show Results
        </button>
      )}
      {userInfo.lobby?.isAdmin && (
      <button
        className="grooming-board__reset-votes-button"
        onClick={handleResetVotesClick}
      >
          Reset Votes
        </button>
      )}
      {groomingInfo?.isResultShown && !userInfo.lobby?.isAdmin && (
      <button
        className="grooming-board__reset-votes-button"
        onClick={handleResetVotesClick}
      >
          Reset Votes
        </button>
      )}
    </div>
  );
};

export default GroomingBoardActions;
