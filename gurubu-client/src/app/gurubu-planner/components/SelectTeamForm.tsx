'use client';

import { useState, useCallback } from "react";
import debounce from "lodash.debounce";
import { useLoader } from "@/contexts/LoaderContext";
import { PService } from "@/services/pService";
import { JiraService } from "@/services/jiraService";
import { Board } from "@/shared/interfaces";
import { Sprint } from '../components/SprintDropdown';
import { Assignee } from "types/planner";

type Props = {
  handleRefresh: () => void;
  closeModal?: () => void;
  setSprints: (sprint: Sprint[]) => void;
  setLoading: (value: boolean) => void;
  handleTeamSelectionName: (name: string) => void;
};

export interface SprintResponse {
  maxResults: number;
  startAt: number;
  isLast: boolean;
  values: Sprint[];
}

export const SelectTeamForm = ({ handleRefresh, closeModal, setSprints, setLoading, handleTeamSelectionName }: Props) => {
  const [teamSearch, setTeamSearch] = useState<string>("");
  const [teams, setTeams] = useState<string[]>([]);
  const [assignees, setAssignees] = useState<Record<string, Assignee>>({});
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [boardSearch, setBoardSearch] = useState<string>("");
  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<string>("");
  const { setShowLoader } = useLoader();

  const pService = new PService(process.env.NEXT_PUBLIC_API_URL || "");
  const jiraService = new JiraService(process.env.NEXT_PUBLIC_API_URL || "");

  const searchTeams = async (query: string) => {
    if (!query) {
      setTeams([]);
      return;
    }

    setShowLoader(true);
    try {
      const response = await pService.searchOrganizations(query);
      if (response.isSuccess && response.data) {
        setTeams(response.data);
        // TODO: Bi toaster ekleyelim burlara
      }
    } catch (error) {
      // TODO: Bi toaster ekleyelim burlara
    }
    setShowLoader(false);
  };

  const debouncedSearch = useCallback(
    debounce((query: string) => searchTeams(query), 800),
    []
  );

  const handleTeamSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTeamSearch(value);
    debouncedSearch(value);
  };

  const handleTeamSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedTeam(value);
    handleTeamSelectionName(value);
    if (!value) return;

    setShowLoader(true);
    try {
      const response = await pService.getOrganizationDetails(value);
      if (response.isSuccess && response.data) {
        setAssignees(response.data);
      }
      // TODO: Bi toaster ekleyelim burlara
    } catch (error) {
// TODO: Bi toaster ekleyelim burlara
    }

    setShowLoader(false);
  };

  // Board search handling
  const debouncedBoardSearch = useCallback(
    debounce((board: string) => {
      fetchBoards(board);
    }, 500),
    []
  );

  const handleBoardSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    setBoardSearch(value);
    setSelectedBoard("");
    setBoards([]);
    if (value) {
      debouncedBoardSearch(value);
    }
  };

  const fetchBoards = async (searchQuery: string) => {
    setShowLoader(true);
    try {
      const response = await jiraService.searchBoards(searchQuery);
      if (response.isSuccess && response.data) {
        setBoards(response.data);
      } 
      // TODO: Bi toaster ekleyelim burlara
    } catch (error) {
      // TODO: Bi toaster ekleyelim burlara
    }
    setShowLoader(false);
  };

  const handleBoardSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedBoard(value);
  };
  

  const handleClearForm = () => {
    setTeamSearch("");
    setSelectedTeam("");
    setTeams([]);
    setBoardSearch("");
    setSelectedBoard("");
    setBoards([]);
  };

  const handleSaveSelections = async () => {
    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jira/${selectedBoard}/future`);
      const data: SprintResponse = await response.json();
      setSprints(data.values);
      localStorage.setItem('JIRA_DEFAULT_ASSIGNEES', JSON.stringify(assignees));
      localStorage.setItem('JIRA_BOARD', selectedBoard);
      handleClearForm();
      handleRefresh();
      if (closeModal) {
        closeModal();
      }
    } catch (error) {
      console.error('Error fetching future sprints:', error);
    }
  };

  return (
    <form className="select-team-form">
      <h3>Team & Board Selection</h3>
      <div className="select-team-form__section">
        <div className="select-team-form__row">
          <input
            placeholder="Enter your team name (Storefront Web etc.)"
            id="teamSearch"
            name="teamSearch"
            onChange={handleTeamSearchChange}
            value={teamSearch}
          />
        </div>

        <div className="select-team-form__row">
          <select
            id="team"
            name="team"
            onChange={handleTeamSelect}
            value={selectedTeam}
            disabled={!teams.length}
          >
            <option value="">Select your team</option>
            {teams.map((team) => (
              <option key={team} value={team}>
                {team}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Board Selection */}
      <div className="select-team-form__section">
        <div className="select-team-form__row">
          <input
            placeholder="Enter your board name (SFWC, SFWD etc.)"
            id="boardSearch"
            name="boardSearch"
            onChange={handleBoardSearchChange}
            value={boardSearch}
            disabled={!selectedTeam}
          />
        </div>

        <div className="select-team-form__row">
          <select
            id="board"
            name="board"
            onChange={handleBoardSelect}
            value={selectedBoard}
            disabled={!boards.length}
          >
            <option value="">Select a board</option>
            {boards.map((board) => (
              <option key={board.id} value={board.id}>
                {board.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="select-team-form__row select-team-form__actions">
        <button type="button" onClick={handleSaveSelections} disabled={!selectedBoard || !selectedTeam}>
          Save
        </button>
        <button type="button" onClick={handleClearForm}>
          Clear
        </button>
      </div>
    </form>
  );
};
