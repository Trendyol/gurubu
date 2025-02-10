import React from 'react';
import { JiraPanelStyle } from '@/shared/interfaces';

interface Props {
  style: JiraPanelStyle;
  children: React.ReactNode;
}

export const JiraPanel: React.FC<Props> = ({ style, children }) => {
  const panelStyle = {
    border: `1px solid ${style.borderColor || '#dfe1e6'}`,
    borderRadius: '3px',
    marginBottom: '1rem'
  };

  const titleStyle = {
    padding: '0.7rem 1rem',
    backgroundColor: style.titleBgColor || '#f0f0f0',
    borderBottom: `1px solid ${style.borderColor || '#dfe1e6'}`,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontWeight: 500
  };

  const contentStyle = {
    padding: '1rem',
    backgroundColor: style.bgColor || 'white',
    ...(style.borderStyle === 'left-border' && {
      borderLeft: `2px solid ${style.borderColor || '#dfe1e6'}`
    })
  };

  return (
    <div style={panelStyle}>
      {style.title && (
        <div style={titleStyle}>
          {style.emoji && <span>{style.emoji}</span>}
          {style.title}
        </div>
      )}
      <div style={contentStyle}>
        {children}
      </div>
    </div>
  );
};

export default JiraPanel;
