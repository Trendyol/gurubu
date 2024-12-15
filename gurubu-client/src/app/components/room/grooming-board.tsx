import { useEffect, useState } from "react";
import classNames from "classnames";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { notFound } from "next/navigation";
import { useSocket } from "@/contexts/SocketContext";
import { checkUserJoinedLobbyBefore, getCurrentLobby } from "@/shared/helpers/lobbyStorage";
import { useGroomingRoom } from "@/contexts/GroomingRoomContext";
import VotingStick from "./voting-stick";
import MetricAverages from "./metric-averages";
import GroomingBoardParticipants from "./grooming-board-participants";
import { IconEdit, IconReportAnalytics } from "@tabler/icons-react";
import { ROOM_STATUS } from "../../room/[id]/enums";
import { EncounteredError, GroomingInfo, Issue } from "@/shared/interfaces";
import { ENCOUTERED_ERROR_TYPE, GroomingMode } from "@/shared/enums";
import GroomingBoardErrorPopup from "./grooming-board-error-popup";
import { MetricToggleTooltip } from "../metricToggle/metricToggleTooltip";
import { JiraService } from "@/services/jiraService";
import { StoryPointCustomFieldForm } from "@/components/room/story-point-custom-field";
import { Modal } from "../common/modal";


interface IProps {
  roomId: string;
  showNickNameForm: boolean;
  setShowNickNameForm: (value: boolean) => void;
}

const GroomingBoard = ({ roomId, showNickNameForm, setShowNickNameForm }: IProps) => {
  const socket = useSocket();
  const router = useRouter();
  const [editVoteClicked, setEditVoteClicked] = useState(false);
  const [currentIssueIndex, setCurrentIssueIndex] = useState(0);
  const [customFieldName, setCustomFieldName] = useState("");
  const [hoveredMetric, setHoveredMetric] = useState<number | null>(null);
  const jiraService = new JiraService(process.env.NEXT_PUBLIC_API_URL || "");
  type ModalType = "storyPointCustomField" | null;
  const [selectedModal, setSelectedModal] = useState<ModalType>(null);

  const [modalOpen, setModalOpen] = useState(false);

  const openModal = (modalType: ModalType) => {
    setModalOpen(true);
    setSelectedModal(modalType);
  };

  const closeModal = () => {
    setModalOpen(false);
  };
  const toggleTooltipHover = (metricId?: number | null) => {
    setHoveredMetric(metricId ?? null);
  };
  const {
    userInfo,
    setGroomingInfo,
    groomingInfo,
    setUserVote,
    roomStatus,
    setEncounteredError,
    encounteredError,
    setShowErrorPopup
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

    const handleUserDisconnected = (data: GroomingInfo) => setGroomingInfo(data);

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

    socket.on('disconnect', (reason) => {
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
    userInfo
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
  const handleNextIssue = () => {
    if (currentIssueIndex < groomingInfo.issues.length - 1) {
      const nextIssueIndex = currentIssueIndex + 1;
      setCurrentIssueIndex(nextIssueIndex);
      const updatedIssues = groomingInfo.issues.map((issue, index) => ({
        ...issue,
        selected: index === nextIssueIndex
      }));
      socket.emit("setIssues", roomId, updatedIssues, userInfo.lobby.credentials);
      socket.emit("resetVotes", roomId, userInfo.lobby.credentials);
    }
  };

  const handlePrevIssue = () => {
    if (currentIssueIndex > 0) {
      const prevIssueIndex = currentIssueIndex - 1;
      setCurrentIssueIndex(prevIssueIndex);
      const updatedIssues = groomingInfo.issues.map((issue, index) => ({
        ...issue,
        selected: index === prevIssueIndex
      }));
      socket.emit("setIssues", roomId, updatedIssues, userInfo.lobby.credentials);
      socket.emit("resetVotes", roomId, userInfo.lobby.credentials);
    }
  };

  const handleSetVote = async () => {
    if (groomingInfo.isResultShown && groomingInfo.issues.length > 0) {
      const selectedIssue = groomingInfo.issues.find(issue => issue.selected);
      if (selectedIssue && customFieldName != "") {
        const selectedIssueId = selectedIssue.id;
        var response = await jiraService.setEstimation(selectedIssueId, groomingInfo.score, customFieldName);
        if (response.isSuccess) {
          selectedIssue.point = groomingInfo.score.toString();
          socket.emit("setIssues", roomId, groomingInfo.issues, userInfo.lobby.credentials);
        }
      }
    }
  };



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
              onClick={handleEditButtonClick}>
              {editVoteClicked ? "Back to Results" : "Edit Vote"}
              {editVoteClicked ? <IconReportAnalytics width={16} /> : <IconEdit width={16} />}
            </button>
          </div>
        )}{groomingInfo.issues && groomingInfo.issues.length > 0 && (
          <section className="grooming-board__issues-section">
            <>
              <table className="grooming-board__issues-table">
                <thead>
                  <tr>
                    <th>Issue</th>
                    <th>Summary</th>
                    <th>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {groomingInfo.issues.map(issue => issue.selected && (
                    <tr key={issue.id}>
                      <td className="grooming-board__issue-column">
                        <a href={issue.url} target="_blank" className="grooming-board__issue-link">
                          {issue.key}
                        </a>
                      </td>
                      <td>{issue.summary}</td>
                      <td>{issue.point}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {userInfo.lobby?.isAdmin && (
                <div className="grooming-board__navigation-buttons">
                  {groomingInfo.mode === GroomingMode.PlanningPoker && (
                    <div>
                      <button
                        className="grooming-board__set-votes-button"
                        onClick={handleSetVote}
                        disabled={customFieldName == ""}>
                        Set Vote
                      </button>
                      <button className="grooming-navbar__import-jira-issues" onClick={() => openModal("storyPointCustomField")}>
                        Set story point field
                      </button>
                    </div>
                  )}
                  <button className="grooming-board__navigation-button" onClick={handlePrevIssue} disabled={currentIssueIndex === 0}>
                    Previous
                  </button>
                  <button className="grooming-board__navigation-button" onClick={handleNextIssue} disabled={currentIssueIndex === groomingInfo.issues.length - 1}>
                    Next
                  </button>
                </div>)}
            </>
          </section>
        )}
        {userInfo.lobby?.isAdmin && isGroomingInfoLoaded && (
          <div className="grooming-board__actions-wrapper">
            <button className="grooming-board__reset-votes-button" onClick={handleResetVotesClick}>
              Reset Votes
            </button>
            <button
              className={classNames("grooming-board__show-result-button", {
                disabled: groomingInfo.isResultShown,
              })}
              onClick={handleShowResultsClick}>
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
                <div className="grooming-board__participants-text">
                  <span>Participants</span></div>
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
            </>
          )}
          {!isGroomingInfoLoaded && renderLoading()}
        </>
      </section>
      <GroomingBoardErrorPopup title="Connection lost !" roomId={roomId} />
      <Modal isOpen={modalOpen} onClose={closeModal}>
        <StoryPointCustomFieldForm customFieldName={customFieldName} setCustomFieldName={setCustomFieldName} closeModal={closeModal} />
      </Modal>
    </div>
  );
};

export default GroomingBoard;
