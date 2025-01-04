import classNames from "classnames";
import VotingStick from "./voting-stick";
import MetricAverages from "./metric-averages";
import GroomingBoardErrorPopup from "./grooming-board-error-popup";
import GroomingBoardResult from "./grooming-board-result";
import GroomingBoardLogs from "./grooming-board-logs";
import GroomingBoardActions from "./grooming-board-actions";
import Loading from "../loading";
import {
  checkUserJoinedLobbyBefore,
  getCurrentLobby,
} from "@/shared/helpers/lobbyStorage";
import { useEffect } from "react";
import { useRouter, notFound } from "next/navigation";
import { useSocket } from "@/contexts/SocketContext";
import { useGroomingRoom } from "@/contexts/GroomingRoomContext";
import { IconEdit, IconReportAnalytics } from "@tabler/icons-react";
import { ROOM_STATUS } from "../../../room/[id]/enums";
import { EncounteredError, GroomingInfo } from "@/shared/interfaces";
import { ENCOUTERED_ERROR_TYPE, GroomingMode } from "@/shared/enums";
import { useLoader } from "@/contexts/LoaderContext";
import VotingStickV2 from "./voting-stick-v2";

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

  const {
    userInfo,
    setGroomingInfo,
    groomingInfo,
    setUserVote,
    roomStatus,
    setEncounteredError,
    encounteredError,
    setShowErrorPopup,
    editVoteClicked,
    setEditVoteClicked,
  } = useGroomingRoom();

  const { showLoader } = useLoader();

  const isGroomingInfoLoaded = Boolean(Object.keys(groomingInfo).length);
  const showVotingStick =
    (editVoteClicked ||
      !groomingInfo.isResultShown ||
      groomingInfo.mode === GroomingMode.PlanningPoker) &&
    isGroomingInfoLoaded;
  const isScoreGrooming = groomingInfo.mode === GroomingMode.ScoreGrooming;
  const isPlanningPoker = groomingInfo.mode === GroomingMode.PlanningPoker;

  useEffect(() => {
    const handleInitialize = (data: GroomingInfo) => {
      if (data?.participants[lobby.userID]) {
        setUserVote(data.participants[lobby.userID].votes);
        setGroomingInfo(data);
      }
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

  if (!isGroomingInfoLoaded && roomStatus !== ROOM_STATUS.CHECKING) {
    return <Loading />;
  }

  return (
    <div className="grooming-board">
      {showLoader && <Loading />}
      <section
        className={classNames("grooming-board__playground", {
          "story-point-mode": isPlanningPoker,
        })}
      >
        {!editVoteClicked && isScoreGrooming && <GroomingBoardResult />}
        {showVotingStick && isScoreGrooming && (
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
        {showVotingStick && isPlanningPoker && (
          <div className="grooming-board__voting-sticks">
            {groomingInfo.metrics?.map((metric) => (
              <VotingStickV2
                key={metric.id}
                points={metric.points}
                name={metric.name}
              />
            ))}
          </div>
        )}
        {!editVoteClicked && <MetricAverages />}
        {groomingInfo.isResultShown && isScoreGrooming && (
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
        {isScoreGrooming && <GroomingBoardActions roomId={roomId} />}
      </section>
      <GroomingBoardLogs roomId={roomId} />
      <GroomingBoardErrorPopup title="Connection lost !" roomId={roomId} />
    </div>
  );
};

export default GroomingBoard;
