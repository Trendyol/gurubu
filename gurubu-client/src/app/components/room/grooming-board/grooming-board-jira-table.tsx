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
import { EstimateInput } from "./estimate-input";
import { JiraPanel } from "@/components/common/jira-panel";

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
  const testCustomFieldName =
    process.env.NEXT_PUBLIC_TEST_STORY_POINT_CUSTOM_FIELD ?? "";

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

  const [customVote, setCustomVote] = React.useState<string>("");
  const [testEstimate, setTestEstimate] = React.useState<string>("");

  const handleSetVote = async () => {
    setShowLoader(true);
    if (groomingInfo.issues.length > 0) {
      const selectedIssue = groomingInfo.issues.find((issue) => issue.selected);
      if (selectedIssue && customFieldName != "" && customVote) {
        const selectedIssueId = selectedIssue.id;
        var response = await jiraService.setEstimation(
          selectedIssueId,
          parseFloat(customVote),
          customFieldName
        );
        if (response.isSuccess) {
          showSuccessToast(
            "Set Vote Success",
            "You can continue to next task.",
            "top-right"
          );
          selectedIssue.point = customVote;
          socket.emit(
            "setIssues",
            roomId,
            groomingInfo.issues,
            userInfo.lobby.credentials
          );
          setCustomVote(""); // Reset the input after successful submission
        }
      }
    }
    setShowLoader(false);
  };

  const handleTestEstimateConfirm = async () => {
    setShowLoader(true);
    if (groomingInfo.issues.length > 0) {
      const selectedIssue = groomingInfo.issues.find((issue) => issue.selected);
      if (selectedIssue && testCustomFieldName != "" && testEstimate) {
        const selectedIssueId = selectedIssue.id;
        var response = await jiraService.setEstimation(
          selectedIssueId,
          parseFloat(testEstimate),
          testCustomFieldName
        );
        if (response.isSuccess) {
          showSuccessToast(
            "Set Test Estimate Success",
            "You can continue to next task.",
            "top-right"
          );
          selectedIssue.testPoint = testEstimate;
          socket.emit(
            "setIssues",
            roomId,
            groomingInfo.issues,
            userInfo.lobby.credentials
          );
          setTestEstimate(""); // Reset the input after successful submission
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
      socket.emit("resetVotes", roomId, userInfo.lobby?.credentials);
    }
  };

  const handlePreviousIssue = () => {
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
      socket.emit("resetVotes", roomId, userInfo.lobby?.credentials);
    }
  };

  const handleSelectIssue = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newSelectedIssueIndex = parseInt(event.target.value);
    setCurrentJiraIssueIndex(newSelectedIssueIndex);
    const updatedIssues = groomingInfo.issues.map((issue, index) => ({
      ...issue,
      selected: index === newSelectedIssueIndex,
    }));
    socket.emit("setIssues", roomId, updatedIssues, userInfo.lobby?.credentials);
    socket.emit("resetVotes", roomId, userInfo.lobby?.credentials);
  };

  const handleSyncJiraIssue = async () => {
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
        if(response.data[currentJiraIssueIndex]){
          response.data[currentJiraIssueIndex].selected = true;
        }
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

  const handleConfirm = async () => {
    await handleSetVote();
  };

  const handleTestEstimateConfirmAsync = async () => {
    await handleTestEstimateConfirm();
  };

  const renderDescriptionSections = (description: string) => {
    if (!description) {
      console.log('Description is empty');
      return null;
    }

    const panels: JSX.Element[] = [];

    // First try to parse panel format
    const panelRegex = /\{panel:([^}]+)\}([\s\S]*?)\{panel\}/g;
    let match;

    while ((match = panelRegex.exec(description)) !== null) {
      const attributes = match[1];
      const content = match[2];

      // Parse panel attributes
      const attrMap: Record<string, string> = {};
      attributes.split('|').forEach(attr => {
        const [key, value] = attr.split('=');
        if (key && value) {
          attrMap[key.trim()] = value.trim();
        }
      });

      const panelStyle = {
        title: attrMap.title?.replace(/^📈\s*/, '') || 'Description',
        emoji: attrMap.title?.match(/^(📈)/)?.[0] || '',
        titleBgColor: attrMap?.titleBGColor || '#f0f0f0',
        bgColor: attrMap?.bgColor,
        borderColor: attrMap?.borderColor || '#dfe1e6',
        borderStyle: attrMap?.borderStyle === 'solid' ? undefined : 'left-border' as const
      };

      panels.push(
        <JiraPanel key={attrMap.title || content.slice(0, 20)} style={panelStyle}>
          <div
            dangerouslySetInnerHTML={{
              __html: marked(convertJiraToMarkdown(content), { renderer })
            }}
          />
        </JiraPanel>
      );
    }

    // If no panels found, try to parse section headers
    if (panels.length === 0) {
      panels.push(
        <div
          key={description}
          className="issue-description"
          dangerouslySetInnerHTML={{ __html: formattedDescription }}
        />
      );
    }

    return panels.length > 0 ? <>{panels}</> : null;
  };

  if (!(groomingInfo.issues && groomingInfo.issues.length > 0)) {
    return null;
  }

  return (
    <section className="grooming-board-jira-table-container">
      <div className="grooming-board-jira-header">
        <div className="grooming-board-jira-top">
          <div className="navigation-left">
            <a href={groomingInfo.issues?.[selectedIssueIndex]?.url} target="_blank">
              {groomingInfo.issues?.[selectedIssueIndex]?.key || "No issue selected"}
            </a>
            {userInfo?.lobby?.isAdmin && (    
            <button
              className="sync-button"
              onClick={handleSyncJiraIssue}
              title="Sync Jira Issue"
            >
              <IconRefresh size={16} />
              <span>Sync</span>
            </button>
            )}
          </div>
        </div>

        <div className="grooming-board-jira-navigation">
          <select
            className="issue-select"
            value={selectedIssueIndex}
            onChange={(e) => handleSelectIssue(e)}
            disabled={!userInfo?.lobby?.isAdmin}
          >
            {groomingInfo.issues?.map((issue, index) => (
              <option key={issue.id} value={index}>
                {issue.key} - {issue.summary}
              </option>
            ))}
          </select>

        {userInfo?.lobby?.isAdmin && (    
          <div className="navigation-buttons">
            <button
              className="navigation-button"
              onClick={handlePreviousIssue}
              disabled={selectedIssueIndex === 0}
            >
              <IconChevronLeft size={16} />
            </button>
            <button
              className="navigation-button"
              onClick={handleNextIssue}
              disabled={
                selectedIssueIndex === (groomingInfo.issues?.length || 1) - 1
              }
            >
              <IconChevronRight size={16} />
            </button>
          </div>
        )}
        </div>
        <EstimateInput
          label="Story Estimate"
          value={customVote}
          onChange={setCustomVote}
          onConfirm={handleConfirm}
          onCancel={() => setCustomVote("")}
          defaultValue={groomingInfo.issues?.[selectedIssueIndex]?.point?.toString()}
        />
        <EstimateInput
          label="Story Test Estimate"
          placeholder="Enter test story point"
          value={testEstimate}
          onChange={setTestEstimate}
          onConfirm={handleTestEstimateConfirmAsync}
          onCancel={() => setTestEstimate("")}
          defaultValue={groomingInfo.issues?.[selectedIssueIndex]?.testPoint?.toString()}
        />
      </div>

      <div className="grooming-board-jira-content">
        {userInfo.lobby?.isAdmin && (
          <div className="issue-navigation">
            <select
              id="board issue"
              name="board issue"
              className="issue-select"
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
          </div>
        )}

        <div className="issue-details">
          {groomingInfo.issues.map(
            (issue) =>
              issue.selected && (
                <div key={issue.id} className="issue-item">
                  {issue.description && renderDescriptionSections(issue.description)}
                </div>
              )
          )}
        </div>
      </div>
    </section>
  );
};

export default GroomingBoardJiraTable;
