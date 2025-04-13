"use client";

import React from "react";
import "@/styles/gurubu-planner/style.scss";
import PlannerNavbar from "./components/PlannerNavbar";
import SprintDropdown from "./components/SprintDropdown";
import { IconRefresh } from "@tabler/icons-react";
import { PlannerContent } from "./components/PlannerContent";
import { LoaderProvider } from "@/contexts/LoaderContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { IconUsers } from "@tabler/icons-react";
import { PlannerProvider, usePlanner } from "@/contexts/PlannerContext";
import AnnouncementBanner from "../components/common/announcement-banner";
const AUTO_REFRESH_INTERVAL = 15;

export default function GurubuPlanner() {
  return (
    <LoaderProvider>
      <ToastProvider>
        <PlannerProvider>
          <AnnouncementBanner />
          <PlannerNavbar />
          <PlannerContentWrapper />
        </PlannerProvider>
      </ToastProvider>
    </LoaderProvider>
  );
}

function PlannerContentWrapper() {
  const {
    selectedSprint,
    setSelectedSprint,
    refreshTrigger,
    handleRefresh,
    sprints,
    setSprints,
    hasTeamSelected,
    showTeamSelect,
    setShowTeamSelect,
  } = usePlanner();

  const [lastUpdate, setLastUpdate] = React.useState<Date | null>(null);
  const [nextUpdateIn, setNextUpdateIn] = React.useState(AUTO_REFRESH_INTERVAL);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = React.useState(true);

  const refreshData = () => {
    handleRefresh();
    setLastUpdate(new Date());
    setNextUpdateIn(AUTO_REFRESH_INTERVAL);
  };

  const handleSetSprints = (newSprints: any[]) => {
    setSprints(newSprints);
  };

  const handleAutoRefreshToggle = () => {
    const newState = !autoRefreshEnabled;
    setAutoRefreshEnabled(newState);
    if (newState) {
      setNextUpdateIn(AUTO_REFRESH_INTERVAL);
    }
  };

  const handleTeamSelectClick = () => {
    setShowTeamSelect(true);
  };

  React.useEffect(() => {
    if (hasTeamSelected) {
      refreshData();
    }
  }, [hasTeamSelected]);

  React.useEffect(() => {
    if (!autoRefreshEnabled) return;

    const intervalId = setInterval(() => {
      refreshData();
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
                  onClick={refreshData}
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
            selectedSprintId={selectedSprint?.id || null}
          />
          <div className="gurubu-planner-footer">
            Developed with ❤️ by GuruBu Developers
          </div>
        </div>
      </div>
    </main>
  );
}
