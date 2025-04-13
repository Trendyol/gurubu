import React from 'react';
import ProjectCard from './ProjectCard';
import { IconLayoutGrid } from '@tabler/icons-react';

export default function PlanningPokerCard() {
  const planningPokerIcon = (
    <div className="icon-container purple">
      <IconLayoutGrid size={26} stroke={1.5} />
    </div>
  );

  return (
    <ProjectCard
      icon={planningPokerIcon}
      title="Planning Poker"
      description="Estimate user stories with your team. Make your estimation process more fun and efficient with Planning Poker. Experience real-time voting and instant results."
      buttonText="Start Estimating"
      buttonLink="/create/room"
      bgColor="purple"
    />
  );
} 