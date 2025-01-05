import React from "react";
import { useGroomingRoom } from "@/contexts/GroomingRoomContext";
import { useSocket } from "@/contexts/SocketContext";
import { JiraService } from "@/services/jiraService";
import { convertJiraToMarkdown } from "@/shared/helpers/convertJiraMarkdown";
import {
  IconChevronLeft,
  IconChevronRight,
  IconRefresh,
} from "@tabler/icons-react";
import { marked } from "marked";
import { useLoader } from "@/contexts/LoaderContext";
import { useToast } from "@/contexts/ToastContext";

interface IProps {
  roomId: string;
}

const GroomingBoardJiraTable = ({ roomId }: IProps) => {
  const {
    userInfo,
    groomingInfo,
    currentJiraIssueIndex,
    setCurrentJiraIssueIndex,
  } = useGroomingRoom();
  const socket = useSocket();
  const { setShowLoader } = useLoader();
  const { showSuccessToast } = useToast();

  const jiraService = new JiraService(process.env.NEXT_PUBLIC_API_URL || "");
  const customFieldName =
    process.env.NEXT_PUBLIC_STORY_POINT_CUSTOM_FIELD ?? "";

  const selectedIssueIndex = groomingInfo.issues?.findIndex(
    (issue) => issue.selected
  );

  const renderer = new marked.Renderer();
  renderer.link = ({
    href,
    title,
    tokens,
  }: {
    href: string;
    title?: string | null;
    tokens: any[];
  }) => {
    const text = marked.Parser.parse(tokens);
    return `<a href="${href}" target="_blank" title="${
      title || ""
    }">${text}</a>`;
  };

  const formattedDescription = marked.parse(
    convertJiraToMarkdown(
      groomingInfo.issues?.[selectedIssueIndex]?.description
    ),
    { renderer }
  );

  const handleSetVote = async () => {
    setShowLoader(true);
    if (groomingInfo.isResultShown && groomingInfo.issues.length > 0) {
      const selectedIssue = groomingInfo.issues.find((issue) => issue.selected);
      if (selectedIssue && customFieldName != "") {
        const selectedIssueId = selectedIssue.id;
        var response = await jiraService.setEstimation(
          selectedIssueId,
          groomingInfo.score,
          customFieldName
        );
        if (response.isSuccess) {
          showSuccessToast(
            "Set Vote Success",
            "You can continue to next task.",
            "top-right"
          );
          selectedIssue.point = groomingInfo.score.toString();
          socket.emit(
            "setIssues",
            roomId,
            groomingInfo.issues,
            userInfo.lobby.credentials
          );
        }
      }
    }
    setShowLoader(false);
  };

  const handleNextIssue = () => {
    if (currentJiraIssueIndex < groomingInfo.issues.length - 1) {
      const nextIssueIndex = currentJiraIssueIndex + 1;
      setCurrentJiraIssueIndex(nextIssueIndex);
      const updatedIssues = groomingInfo.issues.map((issue, index) => ({
        ...issue,
        selected: index === nextIssueIndex,
      }));
      socket.emit(
        "setIssues",
        roomId,
        updatedIssues,
        userInfo.lobby.credentials
      );
      socket.emit("resetVotes", roomId, userInfo.lobby.credentials);
    }
  };

  const handlePrevIssue = () => {
    if (selectedIssueIndex > 0) {
      const prevIssueIndex = selectedIssueIndex - 1;
      setCurrentJiraIssueIndex(prevIssueIndex);
      const updatedIssues = groomingInfo.issues.map((issue, index) => ({
        ...issue,
        selected: index === prevIssueIndex,
      }));
      socket.emit(
        "setIssues",
        roomId,
        updatedIssues,
        userInfo.lobby.credentials
      );
      socket.emit("resetVotes", roomId, userInfo.lobby.credentials);
    }
  };

  const handleSelectIssue = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const targetValue = event.target.value;
    const newSelectedIssueIndex = groomingInfo.issues.findIndex(
      (issue) => issue.key === targetValue
    );
    setCurrentJiraIssueIndex(newSelectedIssueIndex);
    const updatedIssues = groomingInfo.issues.map((issue, index) => ({
      ...issue,
      selected: index === newSelectedIssueIndex,
    }));
    socket.emit("setIssues", roomId, updatedIssues, userInfo.lobby.credentials);
    socket.emit("resetVotes", roomId, userInfo.lobby.credentials);
  };

  const handleSyncIssues = async () => {
    setShowLoader(true);
    const customFieldName = localStorage.getItem(
      "story_points_custom_field_name"
    );
    const selectedSprint = localStorage.getItem("selectedSprint");
    if (selectedSprint) {
      var response = await jiraService.getSprintIssues(
        selectedSprint,
        customFieldName!
      );
      if (response.isSuccess && response.data) {
        showSuccessToast(
          "Sync Task Success",
          "Tasks sync with Jira successfully!",
          "top-right"
        );
        response.data[currentJiraIssueIndex].selected = true;
        socket.emit(
          "setIssues",
          roomId,
          response.data,
          userInfo.lobby.credentials
        );
      }
    }
    setShowLoader(false);
  };

  if (!(groomingInfo.issues && groomingInfo.issues.length > 0)) {
    return null;
  }

  return (
    <section className="grooming-board-jira-table-container">
      <div className="grooming-board-jira-table-header">
        <div className="grooming-board-jira-table-title-container">
          <h2>Jira Table</h2>
          {userInfo.lobby?.isAdmin && (
            <div
              className="grooming-board-jira-table-sync-task-icon"
              title="Sync Task"
            >
              <IconRefresh onClick={handleSyncIssues} />
            </div>
          )}
        </div>
        {userInfo.lobby?.isAdmin && (
          <select
            id="board issue"
            name="board issue"
            className="grooming-board-jira-table-header-select-button"
            onChange={handleSelectIssue}
            value={groomingInfo.issues[currentJiraIssueIndex]?.key}
            disabled={!groomingInfo.issues?.length}
          >
            {groomingInfo.issues.map((issue) => (
              <option key={issue.key} value={issue.key}>
                {issue.key} {issue.summary}
              </option>
            ))}
          </select>
        )}
      </div>
      <table className="grooming-board-jira-table">
        <thead>
          <tr>
            <th>Issue</th>
            <th>Summary</th>
            <th>Points</th>
          </tr>
        </thead>
        <tbody>
          {groomingInfo.issues.map(
            (issue) =>
              issue.selected && (
                <tr key={issue.id}>
                  <td>
                    <a
                      href={issue.url}
                      target="_blank"
                      className="grooming-board-jira-table-issue-link"
                    >
                      {issue.key}
                    </a>
                  </td>
                  <td>{issue.summary}</td>
                  <td>{issue.point}</td>
                </tr>
              )
          )}
        </tbody>
      </table>
      <div
        className="grooming-board-jira-issue-description"
        dangerouslySetInnerHTML={{ __html: formattedDescription }}
      />
      {userInfo.lobby?.isAdmin && (
        <div className="grooming-board-jira-table-footer">
          <div className="grooming-board-jira-table-navigation">
            <button
              className="grooming-board-jira-table-button grooming-board-jira-table-button--secondary"
              onClick={handlePrevIssue}
              disabled={selectedIssueIndex === 0}
            >
              <IconChevronLeft size={16} />
              Previous
            </button>
            <button
              className="grooming-board-jira-table-button grooming-board-jira-table-button--secondary"
              onClick={handleNextIssue}
              disabled={
                currentJiraIssueIndex === groomingInfo.issues.length - 1
              }
            >
              Next
              <IconChevronRight size={16} />
            </button>
          </div>
          <div className="grooming-board-jira-table-vote">
            <button
              className="grooming-board-jira-table-button grooming-board-jira-table-button--primary"
              onClick={handleSetVote}
            >
              Set Vote
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default GroomingBoardJiraTable;
