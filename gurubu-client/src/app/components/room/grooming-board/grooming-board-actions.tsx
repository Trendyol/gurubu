import React, { useEffect } from "react";
import classNames from "classnames";
import { useGroomingRoom } from "@/contexts/GroomingRoomContext";
import { useSocket } from "@/contexts/SocketContext";
import { GroomingMode } from "@/shared/enums";
import { GroomingInfo } from "@/shared/interfaces";

interface Props {
  roomId: string;
  setEditVoteClicked: (value: boolean) => void;
}

const GroomingBoardActions = ({ roomId, setEditVoteClicked }: Props) => {
  const { groomingInfo, setGroomingInfo, userInfo, setUserVote } =
    useGroomingRoom();
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

  useEffect(() => {
    const handleShowResults = (data: GroomingInfo) => setGroomingInfo(data);

    const handleResetVotes = (data: GroomingInfo) => {
      setUserVote({});
      setGroomingInfo(data);
      setEditVoteClicked(false);
    };

    socket.on("showResults", handleShowResults);
    socket.on("resetVotes", handleResetVotes);

    return () => {
      socket.off("showResults", handleShowResults);
      socket.off("resetVotes", handleResetVotes);
    };
  }, [setGroomingInfo, setUserVote, socket, setEditVoteClicked]);

  if (!userInfo.lobby?.isAdmin || !isGroomingInfoLoaded) {
    return null;
  }

  return (
    <div
      className={classNames("grooming-board__actions-wrapper", {
        "story-point-mode": groomingInfo.mode === GroomingMode.PlanningPoker,
      })}
    >
      {!groomingInfo.isResultShown && (
        <button
          className={classNames("grooming-board__show-result-button", {
            disabled: groomingInfo.isResultShown,
          })}
          onClick={handleShowResultsClick}
        >
          Show Results
        </button>
      )}
      <button
        className="grooming-board__reset-votes-button"
        onClick={handleResetVotesClick}
      >
        Reset Votes
      </button>
    </div>
  );
};

export default GroomingBoardActions;
