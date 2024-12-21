import Image from "next/image";
import classNames from "classnames";
import VotingStick from "./voting-stick";
import MetricAverages from "./metric-averages";
import GroomingBoardParticipants from "./grooming-board-participants";
import GroomingBoardErrorPopup from "./grooming-board-error-popup";
import GroomingBoardJiraTable from "./grooming-board-jira-table";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { useSocket } from "@/contexts/SocketContext";
import {
  checkUserJoinedLobbyBefore,
  getCurrentLobby,
} from "@/shared/helpers/lobbyStorage";
import { useGroomingRoom } from "@/contexts/GroomingRoomContext";
import { IconEdit, IconReportAnalytics } from "@tabler/icons-react";
import { ROOM_STATUS } from "../../room/[id]/enums";
import { EncounteredError, GroomingInfo } from "@/shared/interfaces";
import { ENCOUTERED_ERROR_TYPE, GroomingMode } from "@/shared/enums";
import { MetricToggleTooltip } from "../metricToggle/metricToggleTooltip";
import { StoryPointCustomFieldForm } from "@/components/room/story-point-custom-field";
import { Modal } from "../common/modal";
import GroomingBoardResult from "./grooming-board-result";
import GroomingBoardResultV2 from "./grooming-board-result-v2";
import Feedback from "./feedback";

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
  const [customFieldName, setCustomFieldName] = useState(
    process.env.NEXT_PUBLIC_STORY_POINT_CUSTOM_FIELD || ""
  );
  const [hoveredMetric, setHoveredMetric] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

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

  const closeModal = () => {
    setModalOpen(false);
  };
  const toggleTooltipHover = (metricId?: number | null) => {
    setHoveredMetric(metricId ?? null);
  };

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

    const handleVoteSent = (data: GroomingInfo) => {
      setGroomingInfo(data);
    };

    const handleShowResults = (data: GroomingInfo) => setGroomingInfo(data);

    const handleUpdateNickName = (data: GroomingInfo) => setGroomingInfo(data);

    const setIssues = (data: GroomingInfo) => {
      setGroomingInfo(data);
    };

    const handleResetVotes = (data: GroomingInfo) => {
      setUserVote({});
      setGroomingInfo(data);
      setEditVoteClicked(false);
    };

    const removeUser = (data: GroomingInfo, userId: string) => {
      if (userInfo.lobby.userID === userId) {
        router.push("/");
        setGroomingInfo({});
      } else {
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

    socket.on("disconnect", (reason) => {
      setShowErrorPopup(true);
    });

    socket.on("initialize", handleInitialize);
    socket.on("voteSent", handleVoteSent);
    socket.on("showResults", handleShowResults);
    socket.on("updateNickName", handleUpdateNickName);
    socket.on("resetVotes", handleResetVotes);
    socket.on("userDisconnected", handleUserDisconnected);
    socket.on("encounteredError", handleEncounteredError);
    socket.on("removeUser", removeUser);
    socket.on("setIssues", setIssues);

    return () => {
      socket.off("initialize", handleInitialize);
      socket.off("voteSent", handleVoteSent);
      socket.off("showResults", handleShowResults);
      socket.off("updateNickName", handleUpdateNickName);
      socket.off("resetVotes", handleResetVotes);
      socket.off("userDisconnected", handleUserDisconnected);
      socket.off("encounteredError", handleEncounteredError);
      socket.off("removeUser", removeUser);
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
                id={metric.id}
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
        {!editVoteClicked &&
          groomingInfo.mode === GroomingMode.PlanningPoker && (
            <GroomingBoardResultV2 />
          )}
        <GroomingBoardJiraTable
          roomId={roomId}
          customFieldName={customFieldName}
        />
        {userInfo.lobby?.isAdmin &&
          isGroomingInfoLoaded &&
          groomingInfo.mode === GroomingMode.ScoreGrooming && (
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
                  <Image
                    priority
                    src="/right-arrow.svg"
                    alt="right-arrow"
                    width={20}
                    height={20}
                  />
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
                <div className="grooming-board__participants-text">
                  <span>Participants</span>
                </div>
                {groomingInfo.metrics?.map((metric) => (
                  <li
                    key={metric.id}
                    onMouseEnter={() => toggleTooltipHover(metric.id)}
                    onMouseLeave={() => toggleTooltipHover(null)}
                  >
                    {metric.displayName}
                    {hoveredMetric === metric.id && (
                      <MetricToggleTooltip text={metric.text} />
                    )}
                  </li>
                ))}
              </ul>
              <GroomingBoardParticipants />
              <Feedback />
              {userInfo.lobby?.isAdmin &&
                isGroomingInfoLoaded &&
                groomingInfo.mode === GroomingMode.PlanningPoker && (
                  <div
                    className={classNames("grooming-board__actions-wrapper", {
                      "story-point-mode":
                        groomingInfo.mode === GroomingMode.PlanningPoker,
                    })}
                  >
                    <button
                      className={classNames(
                        "grooming-board__show-result-button",
                        {
                          disabled: groomingInfo.isResultShown,
                        }
                      )}
                      onClick={handleShowResultsClick}
                    >
                      Show Results
                      {!groomingInfo.isResultShown && (
                        <Image
                          priority
                          src="/right-arrow.svg"
                          alt="right-arrow"
                          width={20}
                          height={20}
                        />
                      )}
                    </button>
                    <button
                      className="grooming-board__reset-votes-button"
                      onClick={handleResetVotesClick}
                    >
                      Reset Votes
                    </button>
                  </div>
                )}
            </>
          )}
          {!isGroomingInfoLoaded && renderLoading()}
        </>
      </section>
      <GroomingBoardErrorPopup title="Connection lost !" roomId={roomId} />
      <Modal isOpen={modalOpen} onClose={closeModal}>
        <StoryPointCustomFieldForm
          customFieldName={customFieldName}
          setCustomFieldName={setCustomFieldName}
          closeModal={closeModal}
        />
      </Modal>
    </div>
  );
};

export default GroomingBoard;
