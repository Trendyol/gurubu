import { useGroomingRoom } from "@/contexts/GroomingRoomContext";

interface IssueSummaryProps {
  issueSummary?: string;
}

const IssueSummary = ({ issueSummary }: IssueSummaryProps) => {
  const { jiraSidebarExpanded, setJiraSidebarExpanded } = useGroomingRoom();

  if (!issueSummary) {
    return null;
  }

  return (
    <div className="grooming-board__issue-summary" onClick={() => setJiraSidebarExpanded(!jiraSidebarExpanded)}>
      <div className="grooming-board__issue-summary-header">
        <h3 className="grooming-board__issue-summary-title">Current Issue</h3>
        <button
          className="grooming-board__show-details-button"
        >
          {jiraSidebarExpanded ? 'Hide Details' : 'Show Details'}
        </button>
      </div>
      <p className="grooming-board__issue-summary-text">{issueSummary}</p>
    </div>
  );
};

export default IssueSummary;
