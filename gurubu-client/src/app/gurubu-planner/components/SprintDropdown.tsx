"use client";

import React, { useEffect, useState, useRef } from "react";
import { IconChevronDown } from "@tabler/icons-react";

export interface Sprint {
  id: number;
  state: string;
  name: string;
  startDate?: string;
  endDate?: string;
  completeDate?: string;
  originBoardId: number;
  goal: string;
}

export interface SprintResponse {
  maxResults: number;
  startAt: number;
  isLast: boolean;
  values: Sprint[];
}

interface SprintDropdownProps {
  sprints: Sprint[];
  setSprints: (sprints: Sprint[]) => void;
  selectedSprint: Sprint | null;
  onSprintSelect: (sprint: Sprint | null) => void;
}

const SprintDropdown: React.FC<SprintDropdownProps> = ({
  selectedSprint,
  onSprintSelect,
  sprints,
  setSprints,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const boardId = localStorage.getItem("JIRA_BOARD");

    const fetchSprints = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/jira/${boardId}/future`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch sprints");
        }
        const data: SprintResponse = await response.json();
        setSprints(data.values);

        // Only select first sprint on initial load
        if (data.values.length > 0 && !selectedSprint && !sprints.length) {
          onSprintSelect(data.values[0]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSprints();
  }, []); // Remove selectedSprint from dependencies

  useEffect(() => {
    if (sprints?.length) {
      onSprintSelect(sprints[0]);
    }
  }, [sprints]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatSprintDate = (sprint: Sprint) => {
    if (sprint.startDate && sprint.endDate) {
      return `${new Date(sprint.startDate).toLocaleDateString()} - ${new Date(
        sprint.endDate
      ).toLocaleDateString()}`;
    }
    return "";
  };

  if (isLoading) {
    return (
      <div className="gurubu-planner-dropdown-loading">Loading sprints...</div>
    );
  }

  if (error) {
    return <div className="gurubu-planner-dropdown-error">{error}</div>;
  }

  return (
    <div className="gurubu-planner-dropdown" ref={dropdownRef}>
      <div
        className="gurubu-planner-dropdown-header"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="gurubu-planner-dropdown-selected">
          {selectedSprint ? (
            <>
              <span className="sprint-name">{selectedSprint.name}</span>
              <span className="sprint-date">
                {formatSprintDate(selectedSprint)}
              </span>
            </>
          ) : (
            "Select a Sprint"
          )}
        </span>
        <IconChevronDown
          size={18}
          className={`gurubu-planner-dropdown-arrow ${isOpen ? "open" : ""}`}
        />
      </div>
      {isOpen && (
        <div className="gurubu-planner-dropdown-menu">
          {sprints.map((sprint) => (
            <div
              key={sprint.id}
              className={`gurubu-planner-dropdown-item ${
                selectedSprint?.id === sprint.id ? "selected" : ""
              }`}
              onClick={() => {
                onSprintSelect(sprint);
                setIsOpen(false);
              }}
            >
              <span className="sprint-name">{sprint.name}</span>
              <span className="sprint-date">{formatSprintDate(sprint)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SprintDropdown;
