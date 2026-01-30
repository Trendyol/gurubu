import React from 'react';
import ProjectCard from './ProjectCard';
import { IconRefresh } from '@tabler/icons-react';

export default function RetrospectiveCard() {
  const retrospectiveIcon = (
    <div className="icon-container orange">
      <IconRefresh size={26} stroke={1.5} />
    </div>
  );

  return (
    <ProjectCard
      icon={retrospectiveIcon}
      title="Team Retrospective"
      description="Reflect on your team's performance with structured retrospective boards. Share what went well, what could be improved, and define action items."
      buttonText="Start Retrospective"
      buttonLink="/create/retro"
      bgColor="orange"
    />
  );
}
