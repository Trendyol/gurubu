import React, { ReactNode } from 'react';
import Link from 'next/link';

interface ProjectCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  bgColor: 'blue' | 'purple' | 'orange';
}

export default function ProjectCard({
  icon,
  title,
  description,
  buttonText,
  buttonLink,
  bgColor,
}: ProjectCardProps) {
  const cardClass = bgColor === 'blue' ? 'blue-card' : bgColor === 'orange' ? 'orange-card' : 'purple-card';
  
  return (
    <Link href={buttonLink} className="card-link">
      <div className={`project-card ${cardClass}`}>
        <div className="project-card__icon">
          {icon}
        </div>
        
        <h2 className="project-card__title">{title}</h2>
        
        <p className="project-card__description">
          {description}
        </p>
        
        <div className="project-card__button">
          {buttonText} <span className="arrow">→</span>
        </div>
      </div>
    </Link>
  );
} 