'use client';

import React from 'react';
import "@/styles/gurubu-planner/style.scss";
import PlannerNavbar from './components/PlannerNavbar';
import PlannerTable from './components/PlannerTable';
import SprintDropdown from './components/SprintDropdown';
import { IconRefresh } from '@tabler/icons-react';
import { Sprint } from './components/SprintDropdown';

const AUTO_REFRESH_INTERVAL = 15; // seconds

export default function GurubuPlanner() {
  const [selectedSprint, setSelectedSprint] = React.useState<Sprint | null>(null);
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);
  const [lastUpdate, setLastUpdate] = React.useState<Date | null>(null);
  const [nextUpdateIn, setNextUpdateIn] = React.useState(AUTO_REFRESH_INTERVAL);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
    setLastUpdate(new Date());
    setNextUpdateIn(AUTO_REFRESH_INTERVAL);
  };

  React.useEffect(() => {
    // Auto refresh every 15 seconds
    const intervalId = setInterval(() => {
      handleRefresh();
    }, AUTO_REFRESH_INTERVAL * 1000);

    return () => clearInterval(intervalId);
  }, []);

  React.useEffect(() => {
    // Update countdown timer every second
    const timerId = setInterval(() => {
      setNextUpdateIn(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timerId);
  }, []);

  const formatUpdateInfo = () => {
    if (!lastUpdate) return '';
    
    const minutesAgo = Math.floor((new Date().getTime() - lastUpdate.getTime()) / 1000 / 60);
    if (minutesAgo < 1) {
      return 'Updated just now';
    }
    return `Updated ${minutesAgo}m ago`;
  };

  return (
    <>
      <PlannerNavbar />
      <main className="gurubu-planner-container">
        <div className="gurubu-planner-content">
          <div className="gurubu-planner-card">
            <div className="gurubu-planner-controls">
              <SprintDropdown 
                selectedSprint={selectedSprint} 
                onSprintSelect={setSelectedSprint} 
              />
              <div className="gurubu-planner-controls-right">
                <div className="update-info">
                  <span className="last-update">{formatUpdateInfo()}</span>
                  <span className="next-update">Next update in {nextUpdateIn}s</span>
                </div>
                <button 
                  className={`gurubu-planner-sync-button ${isRefreshing ? 'is-refreshing' : ''}`}
                  onClick={handleRefresh}
                  title="Sync data"
                  disabled={isRefreshing}
                >
                  <IconRefresh size={18} className="sync-icon" />
                  <span>Sync</span>
                </button>
              </div>
            </div>
            <PlannerTable 
              selectedSprintId={selectedSprint?.id || null}
              refreshTrigger={refreshTrigger}
              onLoadingChange={setIsRefreshing}
            />
            <div className="gurubu-planner-footer">
              Developed with ❤️ by GuruBu Developers
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
