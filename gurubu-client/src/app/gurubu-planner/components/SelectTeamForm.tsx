"use client";

import { useState, useCallback, useEffect } from "react";
import { useLoader } from "@/contexts/LoaderContext";
import { PService } from "@/services/pService";
import { JiraService } from "@/services/jiraService";
import { Board } from "@/shared/interfaces";
import { Sprint } from "../components/SprintDropdown";
import { Dropdown, DropdownOption } from "../../../ui-kit/dropdown";
import { Assignee } from "types/pandora";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

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
  const searchParams = useSearchParams();

  const router = useRouter();

  const pService = new PService(process.env.NEXT_PUBLIC_API_URL || "");
  const jiraService = new JiraService(process.env.NEXT_PUBLIC_API_URL || "");

  useEffect(() => {
    fetchTeams();
    const teamFromUrl = searchParams.get('team');
    const boardFromUrl = searchParams.get('board');
    
    if (teamFromUrl) {
      console.log("Setting team from URL:", teamFromUrl);
      setSelectedTeam(teamFromUrl);

      // URL'den takım geldiğinde hemen localStorage'a geçici olarak bilgiyi kaydet
      // bu ilk yüklemede takım görüntülenmesini sağlar
      localStorage.setItem('JIRA_TEAM_NAME', teamFromUrl);
      
      // Eğer localStorage'da henüz takım verisi yoksa, boş bir dizi ekle
      // bu sayede hasTeamSelected true olabilir
      if (!localStorage.getItem('JIRA_DEFAULT_ASSIGNEES')) {
        localStorage.setItem('JIRA_DEFAULT_ASSIGNEES', JSON.stringify([]));
      }
      
      if (boardFromUrl) {
        localStorage.setItem('JIRA_BOARD', boardFromUrl);
      }
      
      (async () => {
        try {
          const organisationResponse = await pService.getOrganization(teamFromUrl);
          
          if (organisationResponse.isSuccess && organisationResponse.data) {
            localStorage.removeItem('JIRA_TEAM_NAME');
            localStorage.removeItem('JIRA_DEFAULT_ASSIGNEES');
            
            const { developer, qa } = organisationResponse.data.metadata;
            const teamAssignees = [...developer, ...qa];
            
            setAssignees(teamAssignees);
            localStorage.setItem('JIRA_DEFAULT_ASSIGNEES', JSON.stringify(teamAssignees));
            localStorage.setItem('JIRA_TEAM_NAME', teamFromUrl);
            
            const boardsResponse = await jiraService.getBoardsByProjectKey(
              organisationResponse.data.metadata["jira-projects"][0].key
            );
            
            if (boardsResponse.isSuccess && boardsResponse.data) {
              setBoards(boardsResponse.data);
              
              if (boardFromUrl) {
                setSelectedJiraBoardId(boardFromUrl);
                localStorage.setItem('JIRA_BOARD', boardFromUrl);
                
                const response = await fetch(
                  `${process.env.NEXT_PUBLIC_API_URL}/jira/${boardFromUrl}/future`
                );
                const data = await response.json();
                setSprints(data.values);
                handleRefresh();
              }
            }
          }
        } catch (error) {
          console.error("Error fetching team data from URL params:", error);
        }
      })();
    }
  }, [searchParams]);

  const handleTeamSelect = async (option: DropdownOption) => {
    if (!option?.value) return;
    handleTeamSelectionAndFetchData(option.value);
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
      localStorage.setItem("JIRA_TEAM_NAME", selectedTeam);
      
      const url = new URL(window.location.href);
      url.searchParams.set('team', selectedTeam);
      url.searchParams.set('board', selectedJiraBoardId);
      window.history.pushState({}, '', url.toString());
      
      handleClearForm();
      handleRefresh();
      if (closeModal) {
        closeModal();
      }
      
      window.location.reload();
    } catch (error) {
      console.error("Error fetching future sprints:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBoardData = async (boardId: string) => {
    setLoading(true);
    try {
      console.log("Fetching data for board:", boardId);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/jira/${boardId}/future`
      );
      const data: SprintResponse = await response.json();
      setSprints(data.values);
      localStorage.setItem("JIRA_BOARD", boardId);
      handleRefresh();
      
      const teamFromUrl = searchParams.get('team');
      if (teamFromUrl) {
        const organisationResponse = await pService.getOrganization(teamFromUrl);
        if (organisationResponse.isSuccess && organisationResponse.data) {
          const { developer, qa } = organisationResponse.data.metadata;
          const teamAssignees = [...developer, ...qa];
          setAssignees(teamAssignees);
          localStorage.setItem("JIRA_DEFAULT_ASSIGNEES", JSON.stringify(teamAssignees));
        }
      }
    } catch (error) {
      console.error("Error fetching future sprints:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTeamSelectionAndFetchData = async (teamName: string) => {
    if (!teamName) return;
    
    setSelectedTeam(teamName);
    setShowLoader(true);

    try {
      console.log("Fetching details for team:", teamName);
      const organisationResponse = await pService.getOrganization(teamName);

      if (organisationResponse.isSuccess && organisationResponse.data) {
        const { developer, qa } = organisationResponse.data.metadata;
        const teamAssignees = [...developer, ...qa];
        setAssignees(teamAssignees);
        
        const boardsResponse = await jiraService.getBoardsByProjectKey(
          organisationResponse.data.metadata["jira-projects"][0].key
        );

        if (boardsResponse.isSuccess && boardsResponse.data) {
          setBoards(boardsResponse.data);
          
          const boardFromUrl = searchParams.get('board');
          if (boardFromUrl) {
            setSelectedJiraBoardId(boardFromUrl);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching team details:", error);
    } finally {
      setShowLoader(false);
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
