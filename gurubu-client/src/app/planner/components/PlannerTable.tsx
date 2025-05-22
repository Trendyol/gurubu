"use client";

import React from "react";
import { IconUserFilled } from "@tabler/icons-react";
import { usePlanner } from "@/contexts/PlannerContext";
import Image from "next/image";

interface AssigneeStatistics {
  assignee: string;
  assigneePicture: string | null;
  assigneeFullName: string | null;
  totalStoryPoints: number;
  totalPairStoryPoints: number;
  totalTestStoryPoints: number;
  pairedTasks: Array<{
    key: string;
    storyPoint: number;
    mainAssignee: string;
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
  totalAssignedStoryPoints: number;
}

interface PlannerTableProps {
  selectedSprintId: number | null;
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

const PlannerTable: React.FC<PlannerTableProps> = ({ selectedSprintId }) => {
  const { 
    refreshTrigger, 
    setLoading, 
    loading, 
    setHasEmptyTeam 
  } = usePlanner();
  
  const [statistics, setStatistics] = React.useState<SprintStatisticsResponse | null>(null);
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

      setLoading(true);
      setError(null);

      try {
        const assigneesData = localStorage.getItem("JIRA_DEFAULT_ASSIGNEE_LIST");
        if (!assigneesData) {
          setHasEmptyTeam(true);
          setLoading(false);
          return;
        }

        const assignees: string[] = JSON.parse(assigneesData);
        
        if (assignees.length === 0) {
          const teamFromUrl = new URL(window.location.href).searchParams.get('team');
          
          if (teamFromUrl) {
            return;
          } else {
            setHasEmptyTeam(true);
            setLoading(false);
            return;
          }
        }
        
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/jira/${selectedSprintId}/statistics`,
          {
            method: "POST",
            signal: controller.signal,
            credentials: 'include',
            headers: {
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ assignees }),
          },
        );
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Sprint statistics error:", errorData);
          throw new Error(
            errorData.error || "Failed to fetch sprint statistics"
          );
        }
        
        const data: SprintStatisticsResponse = await response.json();
        
        if (data.statistics.length === 0) {
          setHasEmptyTeam(true);
        } else {
          setHasEmptyTeam(false);
          setStatistics(data);
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
        if (fetchControllerRef.current === controller) {
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
  }, [selectedSprintId, refreshTrigger, setLoading, setHasEmptyTeam]);

  return (
    <div className="gurubu-planner-table">
      {loading ? (
        <LoadingSkeleton />
      ) : error ? (
        <div className="gurubu-planner-table-error">{error}</div>
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
                    {stat.assigneePicture ? (
                      <Image
                        src={stat.assigneePicture}
                        width={24}
                        height={24}
                        alt={stat.assignee}
                        className="assignee-avatar"
                      />
                    ) : (
                      <IconUserFilled size={24} className="assignee-avatar" />
                    )}
                    <span>{stat.assigneeFullName}</span>
                  </div>
                </div>
                <div className="body-cell">
                  {stat.assignedTasks.length || stat.testTasks.length}
                </div>
                <div className="body-cell">
                  <div className="story-points-container">
                    <div className="story-points-total">
                      {stat.totalStoryPoints}
                    </div>
                    {stat.assignedTasks.length > 1 && (
                      <div className="story-points-breakdown">
                        {stat.assignedTasks.map((task, taskIndex) => (
                          <div key={taskIndex} className="story-point-item">
                            {task.storyPoint}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="body-cell">
                  <div className="story-points-container">
                    <div className="story-points-total">
                      {stat.totalPairStoryPoints}
                    </div>
                    {stat.pairedTasks.length > 1 && (
                      <div className="story-points-breakdown">
                        {stat.pairedTasks.map((task, taskIndex) => (
                          <div key={taskIndex} className="story-point-item">
                            {task.storyPoint}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="body-cell">
                  <div className="story-points-container">
                    <div className="story-points-total">
                      {stat.totalTestStoryPoints}
                    </div>
                    {stat.testTasks.length > 1 && (
                      <div className="story-points-breakdown">
                        {stat.testTasks.map((task, taskIndex) => (
                          <div key={taskIndex} className="story-point-item">
                            {task.testStoryPoint}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div className="table-row total-row">
              <div className="body-cell">Total</div>
              <div className="body-cell">-</div>
              <div className="body-cell">
                <div className="story-points-container">
                  <div className="story-points-total">{`${statistics.totalAssignedStoryPoints} / ${statistics.totalStoryPoints}`}</div>
                </div>
              </div>
              <div className="body-cell">
                <div className="story-points-container">
                  <div className="story-points-total">-</div>
                </div>
              </div>
              <div className="body-cell">
                <div className="story-points-container">
                  <div className="story-points-total">
                    {statistics.totalTestStoryPoints}
                  </div>
                </div>
              </div>
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
