'use client';

import React from 'react';
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
}

export const PlannerContent: React.FC<PlannerContentProps> = ({ 
  setSprints,
  selectedSprintId, 
  refreshTrigger, 
  handleRefresh,
  selectedSprint,
  onSprintSelect,
  showTeamSelect,
  handleCloseTeamSelect,
  handleTeamSelectClick,
  hasTeamSelected,
  loading,
  setLoading
}) => {
  return (
    <div className="gurubu-planner-content">
      <Modal isOpen={showTeamSelect} onClose={handleCloseTeamSelect}>
        <SelectTeamForm 
          setSprints={setSprints}
          handleRefresh={handleRefresh} 
          closeModal={handleCloseTeamSelect}
          setLoading={setLoading}
        />
      </Modal>

      {!hasTeamSelected ? (
        <div className="no-team-message">
          <IconUsers size={48} />
          <h3>No Team Selected</h3>
          <p>Please select a team to view sprint statistics</p>
          <button onClick={handleTeamSelectClick}>Select Team</button>
        </div>
      ) : (
        <PlannerTable 
          selectedSprintId={selectedSprintId}
          refreshTrigger={refreshTrigger}
          loading={loading}
          setLoading={setLoading}
        />
      )}
    </div>
  );
};
