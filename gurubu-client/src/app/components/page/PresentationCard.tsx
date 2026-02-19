import React from 'react';
import ProjectCard from './ProjectCard';
import { IconSlideshow } from '@tabler/icons-react';

export default function PresentationCard() {
  const presentationIcon = (
    <div className="icon-container purple">
      <IconSlideshow size={26} stroke={1.5} />
    </div>
  );

  return (
    <ProjectCard
      icon={presentationIcon}
      title="Interactive Presentations"
      description="Create interactive presentations with code execution, animations, and rich media. Build engaging slides with templates, real-time collaboration, and export options."
      buttonText="Create Presentation"
      buttonLink="/presentation/dashboard"
      bgColor="purple"
    />
  );
}
