'use client';

import React from 'react';
import { IconChartBar } from '@tabler/icons-react';

const PlannerLogo = () => {
  return (
    <div className="gurubu-planner-logo">
      <IconChartBar 
        size={24} 
        className="logo-icon"
        stroke={2}
      />
      <span className="gurubu-planner-logo-text">
        GuruBu Planner
        <span className="beta-badge">BETA</span>
      </span>
    </div>
  );
};

export default PlannerLogo;
