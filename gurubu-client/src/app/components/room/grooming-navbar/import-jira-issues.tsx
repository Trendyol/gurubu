import { useState, useEffect, useCallback } from "react";
import { JiraService } from "@/services/jiraService";
import { useSocket } from "@/contexts/SocketContext";
import { useGroomingRoom } from "@/contexts/GroomingRoomContext";
import { debounce } from 'lodash';
import { useLoader } from "@/contexts/LoaderContext";
import { useToast } from "@/contexts/ToastContext";

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
  const { currentJiraIssueIndex } = useGroomingRoom();
  const { showFailureToast, showSuccessToast } = useToast();

  const { setShowLoader } = useLoader();

  const jiraService = new JiraService(process.env.NEXT_PUBLIC_API_URL || "");

  const {
    userInfo
  } = useGroomingRoom();

  useEffect(() => {
    const retrieveFromLocalStorage = (key: string, setter: (value: string) => void) => {
      const storedValue = localStorage.getItem(key);
      if (storedValue) setter(JSON.parse(storedValue));
    };
    retrieveFromLocalStorage("jiraUrl", setJiraUrl);
    retrieveFromLocalStorage("token", setToken);
    retrieveFromLocalStorage("username", setUsername);
  }, []);

  useEffect(() => {
    if(process.env.NEXT_PUBLIC_JIRA_URL){
      setJiraUrl(process.env.NEXT_PUBLIC_JIRA_URL)
    }
  }, []);

  const handleInputChange = (setState: (value: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    setState(value);
    localStorage.setItem(e.target.name, JSON.stringify(value));
  };

  const debouncedChangeHandler = useCallback(
    debounce((board: string) => {
      fetchBoards(board);
    }, 1500),
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
      showSuccessToast("Jira Boards Found", "You can select the board you want", "top-center");
      setBoards(response.data);
    } else {
      showFailureToast("Search Board Error", "Try to search different board", "top-center");
    }
    setShowLoader(false);
  };

  const fetchSprints = async (boardId: string) => {
    setShowLoader(true);
    var response = await jiraService.getSprints(boardId);
    if (response.isSuccess && response.data) {
      showSuccessToast("Sprints Found Successfully", "You can select the sprint you want", "top-center");
      setSprints(response.data);
    } else {
      showFailureToast("Get Sprint Error", "Try to search different sprint", "top-center");
    }
    setShowLoader(false);
  };

  const handleImportIssues = async () => {
    setShowLoader(true);
    const customFieldName = localStorage.getItem("story_points_custom_field_name");
    var response = await jiraService.getSprintIssues(selectedSprint, customFieldName!);
    if (response.isSuccess && response.data) {
      showSuccessToast("Import Jira Success", "Jira Issues Imported Successfully! You can check the board from the sidebar.", "top-center");
      response.data[currentJiraIssueIndex].selected = true;
      socket.emit("setIssues", roomId, response.data, userInfo.lobby.credentials);
      closeModal();
    } else {
      showFailureToast("Import Jira Fail", "Try again later or check your form", "top-center");
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
          type="text"
          placeholder="Jira Url"
          name="jiraUrl"
          value={jiraUrl}
          onChange={handleInputChange(setJiraUrl)}
          disabled={!!process.env.NEXT_PUBLIC_JIRA_URL}
        />
      </div>
      <div className="import-jira-issues__row">
        <input
          type="text"
          placeholder="Username"
          name="username"
          value={username}
          onChange={handleInputChange(setUsername)}
        />
        <input
          type="password"
          placeholder="API Token"
          name="token"
          value={token}
          onChange={handleInputChange(setToken)}
        />
      </div>

      <div className="import-jira-issues__row">
        <input
          placeholder="Board"
          id="boardSearch"
          name="boardSearch"
          onChange={handleBoardSearchChange}
          value={boardSearch}
          disabled={!username || !token}
        />
      </div>

      <div className="import-jira-issues__row">
        <select id="board" name="board" onChange={handleBoardChange} value={selectedBoard} disabled={!boards.length}>
          <option value="">Select</option>
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
          <option value="">Select</option>
          {sprints.map((sprint) => (
            <option key={sprint.id} value={sprint.id}>
              {sprint.name}
            </option>
          ))}
        </select>
      </div>

      <div className="import-jira-issues__row">
        <button type="button" onClick={handleImportIssues} disabled={!selectedSprint}>
          Import
        </button>
        <button type="button" onClick={handleClearForm}>
          Clear
        </button>
      </div>
    </form>
  );
};
