import debounce from "lodash.debounce";
import { useState, useEffect, useCallback } from "react";
import { JiraService } from "@/services/jiraService";
import { agentEstimationService } from "@/services/agentEstimationService";
import { isAgentEstimationActive } from "@/shared/featureFlags";
import { useSocket } from "@/contexts/SocketContext";
import { useGroomingRoom } from "@/contexts/GroomingRoomContext";
import { useLoader } from "@/contexts/LoaderContext";
import { useToast } from "@/contexts/ToastContext";
import { IconSparkles } from "@tabler/icons-react";

type Props = {
  roomId: string;
  closeModal: () => void;
};

export const ImportJiraIssuesForm = ({ roomId, closeModal }: Props) => {
  const socket = useSocket();
  const [jiraUrl, setJiraUrl] = useState<string>("");
  const [token, setToken] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [boardSearch, setBoardSearch] = useState<string>("");
  const [selectedBoard, setSelectedBoard] = useState<string>("");
  const [boards, setBoards] = useState<{ id: string; name: string }[]>([]);
  const [selectedSprint, setSelectedSprint] = useState<string>("");
  const [sprints, setSprints] = useState<{ id: string; name: string }[]>([]);
  const {
    currentJiraIssueIndex,
    userInfo,
    setAgentGuideStatus,
  } = useGroomingRoom();
  const { showFailureToast, showSuccessToast } = useToast();
  const agentEstimationActive = isAgentEstimationActive(userInfo?.nickname);

  const { setShowLoader } = useLoader();

  const jiraService = new JiraService(process.env.NEXT_PUBLIC_API_URL || "");
  const jiraIssueImporterHelp =
    process.env.NEXT_PUBLIC_JIRA_ISSUE_IMPORTER_HELP || "";

  useEffect(() => {
    const retrieveFromLocalStorage = (
      key: string,
      setter: (value: string) => void
    ) => {
      const storedValue = localStorage.getItem(key);
      if (storedValue) setter(JSON.parse(storedValue));
    };
    retrieveFromLocalStorage("jiraUrl", setJiraUrl);
    retrieveFromLocalStorage("token", setToken);
    retrieveFromLocalStorage("username", setUsername);
  }, []);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_JIRA_URL) {
      setJiraUrl(process.env.NEXT_PUBLIC_JIRA_URL);
    }
  }, []);

  const debouncedChangeHandler = useCallback(
    debounce((board: string) => {
      fetchBoards(board);
    }, 800),
    []
  );

  const handleBoardSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    var board = e.target.value.trim();
    setBoardSearch(board);
    setSelectedBoard("");
    setBoards([]);
    setSelectedSprint("");
    setSprints([]);
    if (board) {
      debouncedChangeHandler(board);
    }
  };

  const handleBoardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedBoardId = e.target.value;
    setSelectedBoard(selectedBoardId);
    fetchSprints(selectedBoardId);
  };

  const handleSprintChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSprint(e.target.value);
    localStorage.setItem("selectedSprint", e.target.value);
  };

  const fetchBoards = async (searchQuery: string) => {
    setShowLoader(true);
    var response = await jiraService.searchBoards(searchQuery);
    if (response.isSuccess && response.data) {
      showSuccessToast(
        "Jira Boards Found",
        "You can select the board you want",
        "top-center"
      );
      setBoards(response.data);

      if (agentEstimationActive && searchQuery.trim()) {
        const projectKey = searchQuery.trim().toUpperCase();
        const status = await agentEstimationService.prepareSkill(projectKey);
        setAgentGuideStatus(status);
      }
    } else {
      showFailureToast(
        "Search Board Error",
        "Try to search different board",
        "top-center"
      );
    }
    setShowLoader(false);
  };

  const fetchSprints = async (boardId: string) => {
    setShowLoader(true);
    var response = await jiraService.getSprints(boardId);
    if (response.isSuccess && response.data) {
      showSuccessToast(
        "Sprints Found Successfully",
        "You can select the sprint you want",
        "top-center"
      );
      setSprints(response.data);
    } else {
      showFailureToast(
        "Get Sprint Error",
        "Try to search different sprint",
        "top-center"
      );
    }
    setShowLoader(false);
  };

  const handleImportIssues = async () => {
    if (!selectedSprint) {
      showFailureToast(
        "Sprint Required",
        "Please select a sprint first",
        "top-center"
      );
      return;
    }
    setShowLoader(true);
    var response = await jiraService.getSprintIssues(
      selectedSprint,
    );
    if (response.isSuccess && response.data) {
      showSuccessToast(
        "Import Jira Success",
        "Jira Issues Imported Successfully! You can check the board from the sidebar.",
        "top-center"
      );
      if(response.data[currentJiraIssueIndex]){
        response.data[currentJiraIssueIndex].selected = true;
      }

      const selectedBoardName = boards.find(board => board.id === Number(selectedBoard) as any)?.name || "";
      
      socket.emit(
        "setIssues",
        roomId,
        response.data,
        userInfo.lobby.credentials
      );
      socket.emit(
        "setGurubuAI",
        roomId,
        {
          selectedBoardName,
          projectName: (boardSearch.trim() || selectedBoardName).toUpperCase(),
        },
        userInfo.lobby.credentials
      );
      closeModal();
    } else {
      showFailureToast(
        "Import Jira Fail",
        "Try again later or check your form",
        "top-center"
      );
    }
    setShowLoader(false);
  };

  const handleClearForm = () => {
    setJiraUrl("");
    setToken("");
    setUsername("");
    setBoardSearch("");
    setSelectedBoard("");
    setBoards([]);
    setSelectedSprint("");
    setSprints([]);
    localStorage.removeItem("jiraUrl");
    localStorage.removeItem("username");
    localStorage.removeItem("token");
    localStorage.removeItem("story_points_custom_field_name");
  };

  return (
    <form onSubmit={handleImportIssues} className="import-jira-issues">
      <h3>Jira Sprint Issue Importer</h3>
      <div className="import-jira-issues__row">
        <input
          placeholder="Enter your board name (SFWC, SFWD etc.)"
          id="boardSearch"
          name="boardSearch"
          onChange={handleBoardSearchChange}
          value={boardSearch}
        />
      </div>

      <div className="import-jira-issues__row">
        <select
          id="board"
          name="board"
          onChange={handleBoardChange}
          value={selectedBoard}
          disabled={!boards.length}
        >
          <option value="">Select the board</option>
          {boards.map((board) => (
            <option key={board.id} value={board.id}>
              {board.name}
            </option>
          ))}
        </select>
      </div>

      <div className="import-jira-issues__row">
        <select
          id="sprint"
          name="sprint"
          onChange={handleSprintChange}
          value={selectedSprint}
          disabled={!sprints.length}
        >
          <option value="">Select the sprint</option>
          {sprints.map((sprint) => (
            <option key={sprint.id} value={sprint.id}>
              {sprint.name}
            </option>
          ))}
        </select>
      </div>

      {agentEstimationActive && (
        <div className="import-jira-issues__ai-info">
          <div className="import-jira-issues__ai-info-header">
            <IconSparkles size={18} className="import-jira-issues__ai-info-icon" />
            <span className="import-jira-issues__ai-info-title">
              AI estimation for this project
            </span>
            <span className="import-jira-issues__ai-info-badge">
              Ready on first use
            </span>
          </div>
          <p className="import-jira-issues__ai-info-text">
            If an AI skill already exists for the selected project, it will be
            reused. Otherwise, GuruBu will create one automatically the first
            time this project uses AI estimation.
          </p>
        </div>
      )}

      <div className="import-jira-issues__row">
        <button
          type="button"
          onClick={handleImportIssues}
        >
          Import
        </button>
        <button type="button" onClick={handleClearForm}>
          Clear
        </button>
      </div>
    </form>
  );
};
