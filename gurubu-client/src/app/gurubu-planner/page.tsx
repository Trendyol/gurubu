"use client";

import React from "react";
import "@/styles/gurubu-planner/style.scss";
import PlannerNavbar from "./components/PlannerNavbar";
import SprintDropdown from "./components/SprintDropdown";
import { IconRefresh } from "@tabler/icons-react";
import { Sprint } from "./components/SprintDropdown";
import { PlannerContent } from "./components/PlannerContent";
import { LoaderProvider } from "@/contexts/LoaderContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { IconUsers } from "@tabler/icons-react";
import { useSearchParams } from "next/navigation";

const AUTO_REFRESH_INTERVAL = 15; // seconds

export default function GurubuPlanner() {
  const searchParams = useSearchParams();
  const [selectedSprint, setSelectedSprint] = React.useState<Sprint | null>(null);
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);
  const [lastUpdate, setLastUpdate] = React.useState<Date | null>(null);
  const [nextUpdateIn, setNextUpdateIn] = React.useState(AUTO_REFRESH_INTERVAL);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [sprints, setSprints] = React.useState<Sprint[]>([]);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = React.useState(true);
  const [showTeamSelect, setShowTeamSelect] = React.useState(false);
  const [hasTeamSelected, setHasTeamSelected] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleLoading = (isLoading: boolean) => {
    setLoading(isLoading);
  };

  const handleSetSprints = (sprint: Sprint[]) => {
    setSprints(sprint);
  };

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
    setLastUpdate(new Date());
    setNextUpdateIn(AUTO_REFRESH_INTERVAL);
  };

  const handleAutoRefreshToggle = () => {
    const newState = !autoRefreshEnabled;
    setAutoRefreshEnabled(newState);
    if (newState) {
      setNextUpdateIn(AUTO_REFRESH_INTERVAL);
    }
  };

  React.useEffect(() => {
    const updateHasTeamSelected = () => {
      const hasLocalStorageTeam = !!localStorage.getItem('JIRA_DEFAULT_ASSIGNEES');
      const teamFromUrl = searchParams.get('team');
      const boardFromUrl = searchParams.get('board');
      
      // URL'den gelen takım ve board varsa, hemen geçerli takım seçilmiş gibi davran
      // Bu ilk yüklemede takım seçili görünmesini sağlar
      if (teamFromUrl && boardFromUrl) {
        setHasTeamSelected(true);
        return;
      }
      
      // URL'den gelen takım bilgisi varsa, sadece assignees listesi varsa geçerli kabul et
      let hasValidTeam = hasLocalStorageTeam;
      
      // Geçerli URL takımı kontrolü - hem URL'de takım olacak hem de localStorage'da ilgili veriler bulunacak
      if (teamFromUrl) {
        const storedTeamName = localStorage.getItem('JIRA_TEAM_NAME');
        
        // Takım adı URL ile localStorage'da aynı mı kontrol et
        if (storedTeamName === teamFromUrl && hasLocalStorageTeam) {
          hasValidTeam = true;
        }
      }
      
      console.log("hasValidTeam:", hasValidTeam, "teamFromUrl:", teamFromUrl, "hasLocalStorageTeam:", hasLocalStorageTeam);
      setHasTeamSelected(hasValidTeam);
    };
  
    updateHasTeamSelected();
    window.addEventListener('storage', updateHasTeamSelected);
    return () => {
      window.removeEventListener("storage", updateHasTeamSelected);
    };
  }, [showTeamSelect, searchParams]);

  const handleTeamSelectClick = () => {
    setShowTeamSelect(true);
  };

  const handleCloseTeamSelect = () => {
    setShowTeamSelect(false);
  };

  React.useEffect(() => {
    if (hasTeamSelected) {
      handleRefresh();
    }
  }, [hasTeamSelected]);

  React.useEffect(() => {
    if (!autoRefreshEnabled) return;

    const intervalId = setInterval(() => {
      handleRefresh();
    }, AUTO_REFRESH_INTERVAL * 1000);

    return () => clearInterval(intervalId);
  }, [autoRefreshEnabled]);

  React.useEffect(() => {
    if (!autoRefreshEnabled) {
      setNextUpdateIn(0);
      return;
    }

    const timerId = setInterval(() => {
      setNextUpdateIn((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timerId);
  }, [autoRefreshEnabled]);

  const formatUpdateInfo = () => {
    if (!lastUpdate) return "";

    const minutesAgo = Math.floor(
      (new Date().getTime() - lastUpdate.getTime()) / 1000 / 60
    );
    if (minutesAgo < 1) {
      return "Updated just now";
    }
    return `Updated ${minutesAgo}m ago`;
  };

  return (
    <LoaderProvider>
      <ToastProvider>
        <PlannerNavbar />
        <main className="gurubu-planner-container">
          <div className="gurubu-planner-content">
            <div className="gurubu-planner-card">
              {hasTeamSelected && (
                <div className="gurubu-planner-controls">
                  <div className="gurubu-planner-controls-left">
                  <SprintDropdown
                    sprints={sprints}
                    setSprints={handleSetSprints}
                    selectedSprint={selectedSprint}
                    onSprintSelect={setSelectedSprint}
                  />
                  <button
                    className="select-team-button"
                    onClick={handleTeamSelectClick}
                  >
                    <IconUsers size={20} />
                      {hasTeamSelected ? 'Change Team' : 'Select Team'}
                    </button>
                  </div>
                  <div className="gurubu-planner-controls-right">
                    <div className="update-info">
                      <span className="last-update">{formatUpdateInfo()}</span>
                      {autoRefreshEnabled && (
                        <span className="next-update">
                          Next update in {nextUpdateIn}s
                        </span>
                      )}
                    </div>
                    <button
                      className="auto-refresh-toggle"
                      onClick={handleAutoRefreshToggle}
                    >
                      {autoRefreshEnabled
                        ? "Stop Auto Refresh"
                        : "Enable Auto Refresh"}
                    </button>
                    <button
                      className={`gurubu-planner-sync-button ${
                        isRefreshing ? "is-refreshing" : ""
                      }`}
                      onClick={handleRefresh}
                      title="Sync data"
                      disabled={isRefreshing}
                    >
                      <IconRefresh size={18} className="sync-icon" />
                      <span>Sync</span>
                    </button>
                  </div>
                </div>
              )}
              <PlannerContent
                setSprints={handleSetSprints}
                handleRefresh={handleRefresh}
                selectedSprintId={selectedSprint?.id || null}
                refreshTrigger={refreshTrigger}
                selectedSprint={selectedSprint}
                onSprintSelect={setSelectedSprint}
                showTeamSelect={showTeamSelect}
                handleCloseTeamSelect={handleCloseTeamSelect}
                handleTeamSelectClick={handleTeamSelectClick}
                hasTeamSelected={hasTeamSelected}
                loading={loading}
                setLoading={handleLoading}
              />
              <div className="gurubu-planner-footer">
                Developed with ❤️ by GuruBu Developers
              </div>
            </div>
          </div>
        </main>
      </ToastProvider>
    </LoaderProvider>
  );
}
