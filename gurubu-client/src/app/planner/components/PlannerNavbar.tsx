'use client';

import React, { useState } from 'react';
import PlannerLogo from './PlannerLogo';
import { IconClipboardCheck, IconCopy } from '@tabler/icons-react';

const PlannerNavbar = () => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy URL: ', err);
      });
  };

  return (
    <nav className="gurubu-planner-navbar">
      <div className="gurubu-planner-navbar-content">
        <PlannerLogo />
        <div className="gurubu-planner-navbar-content-copy-link" onClick={handleCopyLink}>
          {copied ? (
            <IconClipboardCheck size={20} />
          ) : (
            <IconCopy size={20} />
          )}
          Link
        </div>
      </div>
    </nav>
  );
};

export default PlannerNavbar;
