import classNames from "classnames";
import VotingStick from "./voting-stick";
import MetricAverages from "./metric-averages";
import GroomingBoardErrorPopup from "./grooming-board-error-popup";
import GroomingBoardJiraTable from "./grooming-board-jira-table";
import GroomingBoardResult from "./grooming-board-result";
import GroomingBoardLogs from "./grooming-board-logs";
import GroomingBoardActions from "./grooming-board-actions";
import Loading from "../loading";
import {
  checkUserJoinedLobbyBefore,
  getCurrentLobby,
} from "@/shared/helpers/lobbyStorage";
import { useEffect, useState } from "react";
import { useRouter, notFound } from "next/navigation";
import { useSocket } from "@/contexts/SocketContext";
import { useGroomingRoom } from "@/contexts/GroomingRoomContext";
import { IconEdit, IconReportAnalytics } from "@tabler/icons-react";
import { ROOM_STATUS } from "../../../room/[id]/enums";
import { EncounteredError, GroomingInfo } from "@/shared/interfaces";
import { ENCOUTERED_ERROR_TYPE, GroomingMode } from "@/shared/enums";

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
  const router = useRouter();
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

  const showVotingStick =
    (editVoteClicked ||
      !groomingInfo.isResultShown ||
      groomingInfo.mode === GroomingMode.PlanningPoker) &&
    isGroomingInfoLoaded;

  useEffect(() => {
    const handleInitialize = (data: GroomingInfo) => {
      if (data?.participants[lobby.userID]) {
        setUserVote(data.participants[lobby.userID].votes);
        setGroomingInfo(data);
      }
    };

    const setIssues = (data: GroomingInfo) => {
      setGroomingInfo(data);
    };

    const handleUserDisconnected = (data: GroomingInfo) =>
      setGroomingInfo(data);

    const handleEncounteredError = (data: EncounteredError) => {
      if (data.id === ENCOUTERED_ERROR_TYPE.CONNECTION_ERROR) {
        setShowErrorPopup(true);
      }
      setEncounteredError(data);
    };

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

    socket.on("disconnect", () => {
      setShowErrorPopup(true);
    });

    socket.on("initialize", handleInitialize);
    socket.on("userDisconnected", handleUserDisconnected);
    socket.on("encounteredError", handleEncounteredError);
    socket.on("setIssues", setIssues);

    return () => {
      socket.off("initialize", handleInitialize);
      socket.off("userDisconnected", handleUserDisconnected);
      socket.off("encounteredError", handleEncounteredError);
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
    setShowErrorPopup,
    router,
    userInfo,
  ]);

  const handleEditButtonClick = () => {
    setEditVoteClicked(!editVoteClicked);
  };

  if (showNickNameForm) {
    return null;
  }

  if (encounteredError.id === ENCOUTERED_ERROR_TYPE.ROOM_EXPIRED) {
    notFound();
  }

  return (
    <div className="grooming-board">
      <section
        className={classNames("grooming-board__playground", {
          "story-point-mode": groomingInfo.mode === GroomingMode.PlanningPoker,
        })}
      >
        {!editVoteClicked &&
          groomingInfo.mode === GroomingMode.ScoreGrooming && (
            <GroomingBoardResult />
          )}
        {showVotingStick && (
          <div className="grooming-board__voting-sticks">
            {groomingInfo.metrics?.map((metric) => (
              <VotingStick
                key={metric.id}
                points={metric.points}
                name={metric.name}
                displayName={metric.displayName}
              />
            ))}
          </div>
        )}
        {!editVoteClicked && <MetricAverages />}
        {groomingInfo.isResultShown &&
          groomingInfo.mode === GroomingMode.ScoreGrooming && (
            <div className="grooming-board__toggle-button-wrapper">
              <button
                className={classNames(
                  "grooming-board__edit-vote-toggle-button",
                  {
                    clicked: editVoteClicked,
                  }
                )}
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
        <GroomingBoardJiraTable
          roomId={roomId}
        />
        {groomingInfo.mode === GroomingMode.ScoreGrooming && (
          <GroomingBoardActions
            roomId={roomId}
            setEditVoteClicked={setEditVoteClicked}
          />
        )}
        {!isGroomingInfoLoaded && <Loading />}
      </section>
      <GroomingBoardLogs
        roomId={roomId}
        setEditVoteClicked={setEditVoteClicked}
      />
      <GroomingBoardErrorPopup title="Connection lost !" roomId={roomId} />
    </div>
  );
};

export default GroomingBoard;
