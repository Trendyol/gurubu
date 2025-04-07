"use client";

import { useState, useCallback, useEffect } from "react";
import { useLoader } from "@/contexts/LoaderContext";
import { PService } from "@/services/pService";
import { JiraService } from "@/services/jiraService";
import { Board } from "@/shared/interfaces";
import { Sprint } from "../components/SprintDropdown";
import { Dropdown, DropdownOption } from "../../../ui-kit/dropdown";
import { Assignee } from "types/pandora";

type Props = {
  handleRefresh: () => void;
  closeModal?: () => void;
  setSprints: (sprint: any[]) => void;
  setLoading: (value: boolean) => void;
};

export interface SprintResponse {
  maxResults: number;
  startAt: number;
  isLast: boolean;
  values: Sprint[];
}

export const SelectTeamForm = ({
  handleRefresh,
  closeModal,
  setSprints,
  setLoading,
}: Props) => {
  const [teams, setTeams] = useState<string[]>([]);
  const [assignees, setAssignees] = useState<string[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedJiraBoardId, setSelectedJiraBoardId] = useState<string>("");
  const { setShowLoader } = useLoader();

  const pService = new PService(process.env.NEXT_PUBLIC_API_URL || "");
  const jiraService = new JiraService(process.env.NEXT_PUBLIC_API_URL || "");

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleTeamSelect = async (option: DropdownOption) => {
    if (!option?.value) return;
    setSelectedTeam(option.value);
    setShowLoader(true);

    const organisationResponse = await pService.getOrganization(option.value);

    if (organisationResponse.isSuccess && organisationResponse.data) {
      const { developer, qa } = organisationResponse.data.metadata;

      setAssignees([...developer, ...qa]);

      const boardsResponse = await jiraService.getBoardsByProjectKey(
        organisationResponse.data.metadata["jira-projects"][0].key
      );

      if (boardsResponse.isSuccess && boardsResponse.data) {
        setBoards(boardsResponse.data);
      }
    }

    setShowLoader(false);
  };

  const fetchTeams = async () => {
    const response = await pService.getOrganizations();
    if (response.isSuccess && response.data) setTeams(response.data);
  };

  const handleBoardSelect = async (option: DropdownOption) => {
    setSelectedJiraBoardId(option.value);
  };

  const handleClearForm = () => {
    setSelectedTeam("");
    setSelectedJiraBoardId("");
    setBoards([]);
  };

  const handleSaveSelections = async () => {
    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/jira/${selectedJiraBoardId}/future`
      );
      const data: SprintResponse = await response.json();
      setSprints(data.values);
      localStorage.setItem("JIRA_DEFAULT_ASSIGNEES", JSON.stringify(assignees));
      localStorage.setItem("JIRA_BOARD", selectedJiraBoardId);
      handleClearForm();
      handleRefresh();
      if (closeModal) {
        closeModal();
      }
    } catch (error) {
      console.error("Error fetching future sprints:", error);
    }
  };

  return (
    <form className="select-team-form">
      <h3 className="select-team-form__title">Team & Board Selection</h3>
      <div className="select-team-form__items">
        <Dropdown
          placeholder="Select your team"
          options={teams.map((team) => ({
            label: team,
            value: team,
          }))}
          value={selectedTeam}
          onChange={handleTeamSelect}
        />
        <Dropdown
          disabled={!selectedTeam || !boards.length}
          placeholder="Select your board"
          options={boards.map((board) => ({
            label: board.name,
            value: board.id,
          }))}
          value={selectedJiraBoardId}
          onChange={handleBoardSelect}
        />
      </div>
      <div className="select-team-form__actions">
        <button
          type="button"
          onClick={handleSaveSelections}
          disabled={!selectedJiraBoardId || !selectedTeam}
        >
          Save
        </button>
        <button type="button" onClick={handleClearForm}>
          Clear
        </button>
      </div>
    </form>
  );
};
