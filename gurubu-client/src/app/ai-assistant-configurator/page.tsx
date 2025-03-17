"use client";

import React from "react";
import { IconRefresh, IconSearch } from "@tabler/icons-react";
import {
  InitialStoryPointService,
  ProgressUpdate,
  InitialStoryPointResponse,
  InitialStoryPointIssue,
} from "../services/initialStoryPointService";
import BoardSelector from "./components/BoardSelector";
import InitialStoryPointsTable from "./components/InitialStoryPointsTable";
import ProgressBar from "./components/ProgressBar";
import "@/styles/ai-assistant-configurator/style.scss";

export default function AIAssistantConfigurator() {
  const [selectedBoardId, setSelectedBoardId] = React.useState<string | null>(
    null
  );
  const [loading, setLoading] = React.useState(false);
  const [progressVisible, setProgressVisible] = React.useState(false);
  const [progress, setProgress] = React.useState<ProgressUpdate | null>(null);
  const [issuesMap, setIssuesMap] = React.useState<
    Map<string, InitialStoryPointIssue>
  >(new Map());
  const [data, setData] = React.useState<InitialStoryPointResponse | null>(
    null
  );
  const [searchTerm, setSearchTerm] = React.useState("");

  const initialStoryPointService = React.useMemo(() => {
    return new InitialStoryPointService(
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
    );
  }, []);

  const eventSourceCleanupRef = React.useRef<(() => void) | null>(null);

  const handleBoardSelect = (boardId: string) => {
    setSelectedBoardId(boardId);
    setData(null);
    setIssuesMap(new Map());
    setProgress(null);
    setProgressVisible(false);
  };

  const handleFetchWithProgress = () => {
    if (!selectedBoardId) {
      return;
    }

    setData(null);
    setIssuesMap(new Map());

    setProgress({
      total: 100,
      processed: 0,
      currentRange: { start: 0, end: 0 },
      status: "in_progress",
      newIssues: [],
    });
    setProgressVisible(true);
    setLoading(true);

    if (eventSourceCleanupRef.current) {
      eventSourceCleanupRef.current();
      eventSourceCleanupRef.current = null;
    }

    const cleanup = initialStoryPointService.streamInitialStoryPoints(
      selectedBoardId,
      (progressData) => {
        setProgress(progressData);

        if (progressData.newIssues && progressData.newIssues.length > 0) {
          setIssuesMap((prevMap) => {
            const newMap = new Map(prevMap);
            progressData.newIssues.forEach((issue) => {
              newMap.set(issue.key, issue);
            });
            return newMap;
          });
        }
      },
      (finalProgress) => {
        setProgress(finalProgress);

        if (finalProgress.newIssues && finalProgress.newIssues.length > 0) {
          setIssuesMap((prevMap) => {
            const newMap = new Map(prevMap);
            finalProgress.newIssues.forEach((issue) => {
              newMap.set(issue.key, issue);
            });
            return newMap;
          });
        }

        setLoading(false);
      },
      (error) => {
        console.error("Error during streaming:", error);
        setLoading(false);
      }
    );

    eventSourceCleanupRef.current = cleanup;
  };

  React.useEffect(() => {
    if (issuesMap.size > 0) {
      const issues = Array.from(issuesMap.values());
      setData({
        total: progress?.total || issues.length,
        issues,
      });
    }
  }, [issuesMap, progress?.total]);

  const filteredData = React.useMemo(() => {
    if (!data || !searchTerm.trim()) {
      return data;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    return {
      ...data,
      issues: data.issues.filter(
        (issue) =>
          issue.key.toLowerCase().includes(lowerSearchTerm) ||
          issue.summary.toLowerCase().includes(lowerSearchTerm)
      ),
    };
  }, [data, searchTerm]);

  React.useEffect(() => {
    return () => {
      if (eventSourceCleanupRef.current) {
        eventSourceCleanupRef.current();
      }
    };
  }, []);

  return (
    <div className="initial-story-points">
      <div className="page-header-card">
        <h1>GuruBu AI Assistant Configurator</h1>
        <p>Create your unique assistant with your own board data!</p>
      </div>

      <div className="control-card">
        <div className="card-header">
          <h2>Select Board</h2>
        </div>
        <div className="card-content control-content">
          <BoardSelector onBoardSelect={handleBoardSelect} />
          <button
            className="fetch-button"
            onClick={handleFetchWithProgress}
            disabled={!selectedBoardId || loading}
          >
            <IconRefresh size={16} />
            {loading ? "Processing..." : "Fetch Board Issues"}
          </button>
        </div>
      </div>

      {progressVisible && progress && (
        <div className={`progress-card status-${progress.status}`}>
          <div className="card-header">
            <h2>Processing Data</h2>
          </div>
          <div className="card-content">
            <ProgressBar
              total={progress.total}
              processed={progress.processed}
              status={progress.status}
            />
          </div>
        </div>
      )}

      {data && data.issues.length > 0 && (
        <div className="results-card">
          <div className="card-header">
            <h2>
              {progress?.status === "completed"
                ? `Analysis Results (${data.total} issues)`
                : `Processing... (${data.issues.length} of ${
                    progress?.total ?? "?"
                  } issues)`}
            </h2>
            <div className="card-actions">
              <div className="search-box">
                <IconSearch size={20} />
                <input
                  type="text"
                  placeholder="Search issues..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="results-content">
            <InitialStoryPointsTable
              data={filteredData || { total: 0, issues: [] }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
