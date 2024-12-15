import { useGroomingRoom } from "@/contexts/GroomingRoomContext";
import { useSocket } from "@/contexts/SocketContext";
import { JiraService } from "@/services/jiraService";
import { convertJiraToMarkdown } from "@/shared/helpers/convertJiraMarkdown";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { marked } from "marked";
import React, { useState } from "react";

interface IProps {
  roomId: string;
  customFieldName: string;
}

const GroomingBoardJiraTable = ({ roomId, customFieldName }: IProps) => {
  const { userInfo, groomingInfo } = useGroomingRoom();
  const socket = useSocket();

  const [currentIssueIndex, setCurrentIssueIndex] = useState(0);

  const jiraService = new JiraService(process.env.NEXT_PUBLIC_API_URL || "");

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
  };

  const handleNextIssue = () => {
    if (currentIssueIndex < groomingInfo.issues.length - 1) {
      const nextIssueIndex = currentIssueIndex + 1;
      setCurrentIssueIndex(nextIssueIndex);
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
      setCurrentIssueIndex(prevIssueIndex);
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

  if (!(groomingInfo.issues && groomingInfo.issues.length > 0)) {
    return null;
  }

  return (
    <section className="grooming-board-jira-table-container">
      <div className="grooming-board-jira-table-header">
        <h2>Jira Table</h2>
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
              disabled={currentIssueIndex === groomingInfo.issues.length - 1}
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
