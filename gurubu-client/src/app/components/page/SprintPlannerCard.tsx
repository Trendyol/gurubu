import React from 'react';
import ProjectCard from './ProjectCard';
import { IconCalendarStats } from '@tabler/icons-react';

export default function SprintPlannerCard() {
  const sprintPlannerIcon = (
    <div className="icon-container blue">
      <IconCalendarStats size={26} stroke={1.5} />
    </div>
  );

  return (
    <ProjectCard
      icon={sprintPlannerIcon}
      title="Sprint Planner"
      description="Easily monitor task assignees and keep dynamic, real-time track of total points for developers and QAs — all in one seamless experience."
      buttonText="Start Sprint Planning"
      buttonLink="/planner"
      bgColor="blue"
    />
  );
} 