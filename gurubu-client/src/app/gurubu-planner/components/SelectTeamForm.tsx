"use client";

import { useState, useEffect } from "react";
import { useLoader } from "@/contexts/LoaderContext";
import { PService } from "@/services/pService";
import { JiraService } from "@/services/jiraService";
import { Board } from "@/shared/interfaces";
import { Dropdown, DropdownOption } from "../../../ui-kit/dropdown";
import { useSearchParams } from "next/navigation";
import { usePlanner } from "@/contexts/PlannerContext";

type Props = {
  closeModal?: () => void;
};

export const SelectTeamForm = ({
  closeModal,
}: Props) => {
  const {
    setSprints,
    handleRefresh,
    setLoading,
    selectTeam
  } = usePlanner();

  const [teams, setTeams] = useState<string[]>([]);
  const [assignees, setAssignees] = useState<string[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedJiraBoardId, setSelectedJiraBoardId] = useState<string>("");
  const { setShowLoader } = useLoader();
  const searchParams = useSearchParams();

  const pService = new PService(process.env.NEXT_PUBLIC_API_URL || "");
  const jiraService = new JiraService(process.env.NEXT_PUBLIC_API_URL || "");

  useEffect(() => {
    fetchTeams();

    const initializeFormFromUrl = () => {
      const teamFromUrl = searchParams.get('team');
      const boardFromUrl = searchParams.get('board');
      
      if (teamFromUrl) {
        setSelectedTeam(teamFromUrl);
        
        (async () => {
          try {
            const organisationResponse = await pService.getOrganization(teamFromUrl);
            
            if (organisationResponse.isSuccess && organisationResponse.data) {
              const { developer, qa } = organisationResponse.data.metadata;
              const teamAssignees = [...developer, ...qa];
              
              setAssignees(teamAssignees);
              
              const boardsResponse = await jiraService.getBoardsByProjectKey(
                organisationResponse.data.metadata["jira-projects"][0].key
              );
              
              if (boardsResponse.isSuccess && boardsResponse.data) {
                setBoards(boardsResponse.data);
                
                if (boardFromUrl) {
                  setSelectedJiraBoardId(boardFromUrl);
                }
              }
            }
          } catch (error) {
            console.error("Error fetching team data from URL params:", error);
          }
        })();
      }
    };

    const isInitialRender = !selectedTeam;
    if (isInitialRender) {
      initializeFormFromUrl();
    }
  }, []);
  
  const fetchTeams = async () => {
    try {
      const response = await pService.getOrganizations();
      if (response.isSuccess && response.data) {
        setTeams(response.data);
      }
    } catch (error) {
      console.error("Error fetching teams:", error);
    }
  };

  const handleTeamSelect = async (option: DropdownOption) => {
    if (!option?.value) return;
    setSelectedTeam(option.value);
    handleTeamSelectionAndFetchData(option.value);
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
    if (!selectedTeam || !selectedJiraBoardId) {
      console.error("Can't save: missing team or board selection");
      return;
    }
    
    try {
      if (closeModal) {
        closeModal();
      }
      
      await selectTeam(selectedTeam, selectedJiraBoardId);
      
      window.location.reload();
    } catch (error) {
      console.error("Error in handleSaveSelections:", error);
    }
  };

  const handleTeamSelectionAndFetchData = async (teamName: string) => {
    if (!teamName) return;
    
    setSelectedTeam(teamName);
    setShowLoader(true);

    try {
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
        } else {
          console.warn("No boards found for the selected team");
          setBoards([]);
          setSelectedJiraBoardId("");
        }
      } else {
        console.error("Failed to fetch organization data:", organisationResponse);
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
