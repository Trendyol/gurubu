import React, { useEffect, useMemo, useState } from "react";
import { useGroomingRoom } from "@/contexts/GroomingRoomContext";
import { JiraService } from "@/services/jiraService";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

type PrevIssue = {
  key: string;
  summary: string;
  issuetype?: string;
  status?: string;
  assignee?: string | null;
};

export const PreviousVotedTasks = () => {
  const { groomingInfo, userVote } = useGroomingRoom();
  const [issues, setIssues] = useState<PrevIssue[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  const jiraService = useMemo(
    () => new JiraService(process.env.NEXT_PUBLIC_API_URL || ""),
    []
  );

  const selectedIssue = groomingInfo.issues?.find((i) => i.selected);
  const projectKey = selectedIssue?.key?.split("-")?.[0] || "";
  const storyPointValue = userVote?.storyPoint;

  useEffect(() => {
    const fetchIssues = async () => {
      if (!projectKey || !storyPointValue) {
        setIssues([]);
        setIndex(0);
        return;
      }
      setLoading(true);
      const response = await jiraService.getIssuesByStoryPoints(
        projectKey,
        storyPointValue,
        50,
        false
      );
      if (response.isSuccess) {
        const filtered = (response.data || []).filter(
          (i: PrevIssue) => i.key !== selectedIssue?.key
        );
        setIssues(filtered);
        setIndex(0);
      } else {
        setIssues([]);
        setIndex(0);
      }
      setLoading(false);
    };
    fetchIssues();
  }, [projectKey, storyPointValue, selectedIssue?.key, jiraService]);

  if (!storyPointValue || (issues.length === 0 && !loading)) {
    return null;
  }

  const current = issues[index];

  const handlePrev = () => {
    setIndex((prev) => (prev === 0 ? issues.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setIndex((prev) => (prev === issues.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="previous-voted-tasks">
      <div className="pvt-shell">
        <div className="pvt-header">
          <div className="pvt-title">
            <span className="pvt-dot" />
            <span>Similar Story Point Given Tasks</span>
          </div>
          <div className="pvt-meta">
            <span className="pvt-pill">{storyPointValue}</span>
            {issues.length > 0 && (
              <span className="pvt-counter">
                {index + 1}/{issues.length}
              </span>
            )}
          </div>
        </div>

        <div className="pvt-slider">
          <button
            className="pvt-nav prev"
            onClick={handlePrev}
            aria-label="Previous"
            disabled={loading || issues.length <= 1}
          >
            <IconChevronLeft size={18} />
          </button>

          <div className="pvt-item">
            {loading ? (
              <div className="pvt-skeleton" />
            ) : (
              <>
                <div className="pvt-key-summary">
                  <a
                    href={`${process.env.NEXT_PUBLIC_JIRA_URL}/browse/${current?.key}`}
                    target="_blank"
                    rel="noreferrer"
                    className="pvt-key"
                  >
                    {current?.key}
                  </a>
                  <span className="pvt-summary">{current?.summary}</span>
                </div>
                <div className="pvt-tags">
                  {current?.issuetype ? (
                    <span className="pvt-tag type">{current.issuetype}</span>
                  ) : null}
                  {current?.status ? (
                    <span className="pvt-tag status">{current.status}</span>
                  ) : null}
                  {current?.assignee ? (
                    <span className="pvt-tag assignee">{current.assignee}</span>
                  ) : null}
                </div>
              </>
            )}
          </div>

          <button
            className="pvt-nav next"
            onClick={handleNext}
            aria-label="Next"
            disabled={loading || issues.length <= 1}
          >
            <IconChevronRight size={18} />
          </button>
        </div>

        {issues.length > 1 && !loading && (
          <div className="pvt-dots">
            {issues.map((_, i) => (
              <span key={i} className={i === index ? "active" : ""} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
