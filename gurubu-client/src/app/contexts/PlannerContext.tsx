import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useSearchParams } from "next/navigation";
import { Sprint } from "../planner/components/SprintDropdown";
import { PService } from "@/services/pService";
import { JiraService } from "@/services/jiraService";

interface PlannerContextType {
  selectedSprint: Sprint | null;
  setSelectedSprint: (sprint: Sprint | null) => void;
  hasTeamSelected: boolean;
  selectedTeam: string | null;
  refreshTrigger: number;
  handleRefresh: () => void;
  showTeamSelect: boolean;
  setShowTeamSelect: (show: boolean) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  sprints: Sprint[];
  setSprints: (sprints: Sprint[]) => void;
  selectTeam: (teamName: string, boardId: string) => Promise<void>;
  hasEmptyTeam: boolean;
  setHasEmptyTeam: (isEmpty: boolean) => void;
}

interface PlannerProviderProps {
  children: ReactNode;
}

const PlannerContext = createContext<PlannerContextType | null>(null);

export const PlannerProvider: React.FC<PlannerProviderProps> = ({ children }) => {
  const searchParams = useSearchParams();
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [showTeamSelect, setShowTeamSelect] = useState(false);
  const [hasTeamSelected, setHasTeamSelected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [hasEmptyTeam, setHasEmptyTeam] = useState(false);

  const pService = new PService(process.env.NEXT_PUBLIC_API_URL || "");
  const jiraService = new JiraService(process.env.NEXT_PUBLIC_API_URL || "");

  const handleRefresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const selectTeam = useCallback(async (teamName: string, boardId: string) => {
    setLoading(true);
    
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('team', teamName);
      url.searchParams.set('board', boardId);
      window.history.pushState({}, '', url.toString());
      
      setSelectedTeam(teamName);
      setHasTeamSelected(true);
      
      const organisationResponse = await pService.getOrganization(teamName);
      
      if (organisationResponse.isSuccess && organisationResponse.data) {
        const { developer, qa } = organisationResponse.data.metadata;
        const teamAssignees = [...developer, ...qa];
        
        localStorage.setItem('JIRA_DEFAULT_ASSIGNEE_LIST', JSON.stringify(teamAssignees));
        localStorage.setItem('JIRA_TEAM_NAME', teamName);
        localStorage.setItem('JIRA_BOARD', boardId);
        
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/jira/${boardId}/future`,
          {
            credentials: 'include',
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          setSprints(data.values);
        }
        
        setHasEmptyTeam(teamAssignees.length === 0);
      } else {
        localStorage.setItem('JIRA_TEAM_NAME', teamName);
        localStorage.setItem('JIRA_BOARD', boardId);
        localStorage.setItem('JIRA_DEFAULT_ASSIGNEE_LIST', JSON.stringify([]));
        
        setHasEmptyTeam(true);
      }
      
      handleRefresh();
    } catch (error) {
      console.error("Error in selectTeam:", error);
      localStorage.setItem('JIRA_TEAM_NAME', teamName);
      localStorage.setItem('JIRA_BOARD', boardId);
      setHasEmptyTeam(true);
    } finally {
      setLoading(false);
    }
  }, [pService, handleRefresh]);

  useEffect(() => {
    const updateTeamStatus = () => {
      const teamFromUrl = searchParams.get('team');
      const boardFromUrl = searchParams.get('board');
      const storedTeamName = localStorage.getItem('JIRA_TEAM_NAME');
      const hasAssignees = !!localStorage.getItem('JIRA_DEFAULT_ASSIGNEE_LIST');
      
      if (teamFromUrl && boardFromUrl) {
        setSelectedTeam(teamFromUrl);
        setHasTeamSelected(true);
        
        if (storedTeamName !== teamFromUrl || !hasAssignees) {
          (async () => {
            try {
              await selectTeam(teamFromUrl, boardFromUrl);
            } catch (error) {
              console.error("Error fetching team data from URL:", error);
            }
          })();
        }
      } else if (storedTeamName && hasAssignees) {
        setSelectedTeam(storedTeamName);
        setHasTeamSelected(true);
      } else {
        setHasTeamSelected(false);
        setSelectedTeam(null);
      }
    };
    
    updateTeamStatus();
    window.addEventListener('storage', updateTeamStatus);
    
    return () => {
      window.removeEventListener('storage', updateTeamStatus);
    };
  }, [searchParams, selectTeam]);

  const contextValue: PlannerContextType = {
    selectedSprint,
    setSelectedSprint,
    hasTeamSelected,
    selectedTeam,
    refreshTrigger,
    handleRefresh,
    showTeamSelect,
    setShowTeamSelect,
    loading,
    setLoading,
    sprints,
    setSprints,
    selectTeam,
    hasEmptyTeam,
    setHasEmptyTeam
  };

  return (
    <PlannerContext.Provider value={contextValue}>
      {children}
    </PlannerContext.Provider>
  );
};

export const usePlanner = (): PlannerContextType => {
  const context = useContext(PlannerContext);
  if (!context) {
    throw new Error("usePlanner must be used within a PlannerProvider");
  }
  return context;
}; 