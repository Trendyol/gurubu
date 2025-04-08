"use client";

import React, { useState } from 'react';
import PlannerTable from './PlannerTable';
import { SelectTeamForm } from './SelectTeamForm';
import { Sprint } from '../components/SprintDropdown';
import { Modal } from '@/components/common/modal';
import { IconUsers } from '@tabler/icons-react';

interface PlannerContentProps {
  setSprints: (sprint: Sprint[]) => void;
  selectedSprintId: number | null;
  refreshTrigger: number;
  handleRefresh: () => void;
  selectedSprint: Sprint | null;
  onSprintSelect: (sprint: Sprint | null) => void;
  showTeamSelect: boolean;
  handleCloseTeamSelect: () => void;
  handleTeamSelectClick: () => void;
  hasTeamSelected: boolean;
  loading: boolean;
  setLoading: (value: boolean) => void;
  selectedTeam: string | null;
}

export const PlannerContent: React.FC<PlannerContentProps> = ({
  setSprints,
  selectedSprintId,
  refreshTrigger,
  handleRefresh,
  showTeamSelect,
  handleCloseTeamSelect,
  handleTeamSelectClick,
  hasTeamSelected,
  loading,
  setLoading,
  selectedTeam
}) => {
  const [hasEmptyTeam, setHasEmptyTeam] = useState(false);

  const handleEmptyTeam = (isEmpty: boolean) => {
    setHasEmptyTeam(isEmpty);
  };

  return (
    <div className="gurubu-planner-content">
      {selectedTeam && (
        <div className="selected-team-title">Selected Team: {selectedTeam}</div>
      )}
      <Modal isOpen={showTeamSelect} onClose={handleCloseTeamSelect}>
        <SelectTeamForm
          setSprints={setSprints}
          handleRefresh={handleRefresh}
          closeModal={handleCloseTeamSelect}
          setLoading={setLoading}
        />
      </Modal>

      {!hasTeamSelected ? (
        <EmptyStateMessage 
          title="No Team Selected"
          message="Please select a team to view sprint statistics"
          onButtonClick={handleTeamSelectClick}
        />
      ) : hasEmptyTeam ? (
        <EmptyStateMessage 
          title="Selected Team Has No Members"
          message="The selected team has no members. Please select a different team."
          onButtonClick={handleTeamSelectClick}
        />
      ) : (
        <PlannerTable
          selectedSprintId={selectedSprintId}
          refreshTrigger={refreshTrigger}
          loading={loading}
          setLoading={setLoading}
          onEmptyTeam={handleEmptyTeam}
        />
      )}
    </div>
  );
};

const EmptyStateMessage = ({ 
  title, 
  message, 
  onButtonClick 
}: { 
  title: string; 
  message: string; 
  onButtonClick: () => void;
}) => (
  <div className="no-team-message">
    <IconUsers size={48} />
    <h3>{title}</h3>
    <p>{message}</p>
    <button onClick={onButtonClick}>Select Team</button>
  </div>
);
