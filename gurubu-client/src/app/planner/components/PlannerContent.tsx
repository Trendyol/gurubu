"use client";

import React from 'react';
import PlannerTable from './PlannerTable';
import { SelectTeamForm } from './SelectTeamForm';
import { Modal } from '@/components/common/modal';
import { IconUsers } from '@tabler/icons-react';
import { usePlanner } from '@/contexts/PlannerContext';

interface PlannerContentProps {
  selectedSprintId: number | null;
}

export const PlannerContent: React.FC<PlannerContentProps> = ({
  selectedSprintId
}) => {
  const {
    hasTeamSelected,
    selectedTeam,
    showTeamSelect,
    setShowTeamSelect,
    hasEmptyTeam,
  } = usePlanner();

  const handleCloseTeamSelect = () => {
    setShowTeamSelect(false);
  };

  const handleTeamSelectClick = () => {
    setShowTeamSelect(true);
  };

  return (
    <div className="gurubu-planner-content">
      {selectedTeam && (
        <div className="selected-team-title">Selected Team: {selectedTeam}</div>
      )}
      <Modal isOpen={showTeamSelect} onClose={handleCloseTeamSelect}>
        <SelectTeamForm
          closeModal={handleCloseTeamSelect}
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
