'use client';

import React from 'react';
import { Assignee } from '../../types/planner';
import { IconUserFilled } from '@tabler/icons-react';

interface AssigneeStatistics {
  assignee: Assignee;
  totalStoryPoints: number;
  totalPairStoryPoints: number;
  totalTestStoryPoints: number;
  pairedTasks: Array<{
    key: string;
    storyPoint: number;
    mainAssignee: Assignee;
  }>;
  testTasks: Array<{
    key: string;
    testStoryPoint: number;
  }>;
  assignedTasks: Array<{
    key: string;
    storyPoint: number;
  }>;
}

interface SprintStatisticsResponse {
  sprintId: number;
  statistics: AssigneeStatistics[];
  totalStoryPoints: number;
  totalTestStoryPoints: number;
}

interface PlannerTableProps {
  selectedSprintId: number | null;
  refreshTrigger: number;
  onLoadingChange?: (isLoading: boolean) => void;
}

const LoadingSkeleton = () => {
  return (
    <>
      <div className="gurubu-planner-table-header">
        <div className="header-cell">Assignee</div>
        <div className="header-cell">Tasks Count</div>
        <div className="header-cell">Story Points</div>
        <div className="header-cell">Pair Story Points</div>
        <div className="header-cell">Test Story Points</div>
      </div>
      <div className="gurubu-planner-table-body">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="table-row skeleton-row">
            <div className="body-cell">
              <div className="assignee-info">
                <div className="assignee-avatar skeleton" />
                <div className="skeleton-text" />
              </div>
            </div>
            <div className="body-cell">
              <div className="skeleton-text" />
            </div>
            <div className="body-cell">
              <div className="skeleton-text" />
            </div>
            <div className="body-cell">
              <div className="skeleton-text" />
            </div>
            <div className="body-cell">
              <div className="skeleton-text" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

const PlannerTable: React.FC<PlannerTableProps> = ({ 
  selectedSprintId, 
  refreshTrigger,
  onLoadingChange 
}) => {
  const [statistics, setStatistics] = React.useState<SprintStatisticsResponse | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchControllerRef = React.useRef<AbortController | null>(null);

  React.useEffect(() => {
    const fetchStatistics = async () => {
      if (!selectedSprintId) {
        setStatistics(null);
        return;
      }

      // Cancel any in-flight request
      if (fetchControllerRef.current) {
        fetchControllerRef.current.abort();
      }

      // Create new abort controller for this request
      const controller = new AbortController();
      fetchControllerRef.current = controller;

      setIsLoading(true);
      onLoadingChange?.(true);
      setError(null);

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/jira/${selectedSprintId}/statistics`,
          { 
            signal: controller.signal,
            headers: {
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
          }
        );
        if (!response.ok) {
          throw new Error('Failed to fetch sprint statistics');
        }
        const data: SprintStatisticsResponse = await response.json();
        setStatistics(data);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
        onLoadingChange?.(false);
        if (controller === fetchControllerRef.current) {
          fetchControllerRef.current = null;
        }
      }
    };

    fetchStatistics();

    return () => {
      if (fetchControllerRef.current) {
        fetchControllerRef.current.abort();
        fetchControllerRef.current = null;
      }
    };
  }, [selectedSprintId, refreshTrigger]);

  return (
    <div className="gurubu-planner-table">
      {isLoading ? (
        <LoadingSkeleton />
      ) : error ? (
        <div className="gurubu-planner-table-error">
          {error}
        </div>
      ) : statistics ? (
        <div>
          <div className="gurubu-planner-table-header">
            <div className="header-cell">Assignee</div>
            <div className="header-cell">Tasks Count</div>
            <div className="header-cell">Story Points</div>
            <div className="header-cell">Pair Story Points</div>
            <div className="header-cell">Test Story Points</div>
          </div>
          <div className="gurubu-planner-table-body">
            {statistics.statistics.map((stat, index) => (
              <div key={index} className="table-row">
                <div className="body-cell">
                  <div className="assignee-info">
                    <IconUserFilled size={24} className="assignee-avatar" />
                    <span>{stat.assignee.name}</span>
                  </div>
                </div>
                <div className="body-cell">{stat.assignedTasks.length || stat.testTasks.length }</div>
                <div className="body-cell">{stat.totalStoryPoints}</div>
                <div className="body-cell">{stat.totalPairStoryPoints}</div>
                <div className="body-cell">{stat.totalTestStoryPoints}</div>
              </div>
            ))}
            <div className="table-row total-row">
              <div className="body-cell">Total</div>
              <div className="body-cell">-</div>
              <div className="body-cell">{statistics.totalStoryPoints}</div>
              <div className="body-cell">-</div>
              <div className="body-cell">{statistics.totalTestStoryPoints}</div>
            </div>
          </div>
        </div>
      ) : (
        <LoadingSkeleton />
      )}
    </div>
  );
};

export default PlannerTable;
