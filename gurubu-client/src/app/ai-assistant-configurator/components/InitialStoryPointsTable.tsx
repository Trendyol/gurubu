'use client';

import React from 'react';
import { InitialStoryPointResponse } from '../../services/initialStoryPointService';
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import DOMPurify from 'dompurify';

interface InitialStoryPointsTableProps {
  data: InitialStoryPointResponse;
}

export default function InitialStoryPointsTable({ data }: InitialStoryPointsTableProps) {
  const [selectedIssue, setSelectedIssue] = React.useState<string | null>(null);
  const [expandedIssue, setExpandedIssue] = React.useState<string | null>(null);
  
  const stats = React.useMemo(() => {
    const changed = data.issues.filter(issue => 
      issue.initialStoryPoint !== null && 
      issue.storyPoint !== null && 
      issue.initialStoryPoint !== issue.storyPoint
    ).length;
    
    const increased = data.issues.filter(issue => 
      issue.initialStoryPoint !== null && 
      issue.storyPoint !== null && 
      issue.storyPoint > issue.initialStoryPoint
    ).length;
    
    const decreased = data.issues.filter(issue => 
      issue.initialStoryPoint !== null && 
      issue.storyPoint !== null && 
      issue.storyPoint < issue.initialStoryPoint
    ).length;
    
    const withoutInitial = data.issues.filter(issue => issue.initialStoryPoint === null).length;
    
    return { changed, increased, decreased, withoutInitial };
  }, [data]);
  
  const handleRowClick = (key: string) => {
    if (selectedIssue === key) {
      setSelectedIssue(null);
    } else {
      setSelectedIssue(key);
    }
    
    if (expandedIssue === key) {
      setExpandedIssue(null);
    } else {
      setExpandedIssue(key);
    }
  };
  
  const selectedIssueData = React.useMemo(() => {
    if (!selectedIssue) return null;
    return data.issues.find(issue => issue.key === selectedIssue) || null;
  }, [selectedIssue, data.issues]);
  
  const renderChangeIndicator = (initialPoints: number | null, currentPoints: number | null) => {
    if (initialPoints === null || currentPoints === null) {
      return null;
    }
    
    if (initialPoints < currentPoints) {
      return <span className="change-indicator increased">↑</span>;
    } else if (initialPoints > currentPoints) {
      return <span className="change-indicator decreased">↓</span>;
    } else {
      return <span className="change-indicator unchanged">→</span>;
    }
  };
  
  const sanitizeHTML = (html: string) => {
    return DOMPurify.sanitize(html);
  };
  
  return (
    <div className="initial-story-points-table-container">
      {data.issues.length > 0 && (
        <div className="stats-container">
          <div className="stat-item">
            <span className="stat-value">{stats.changed}</span>
            <span className="stat-label">Changed</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats.increased}</span>
            <span className="stat-label">Increased</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats.decreased}</span>
            <span className="stat-label">Decreased</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats.withoutInitial}</span>
            <span className="stat-label">No Initial Points</span>
          </div>
        </div>
      )}
      
      <div className="table-scroll-container">
        <table className="initial-story-points-table">
          <thead>
            <tr>
              <th className="expand-column"></th>
              <th>Key</th>
              <th>Summary</th>
              <th>Initial Points</th>
              <th>Current Points</th>
              <th>Change</th>
            </tr>
          </thead>
          <tbody>
            {data.issues.length === 0 ? (
              <tr>
                <td colSpan={6} className="empty-message">No issues found</td>
              </tr>
            ) : (
              data.issues.map(issue => (
                <React.Fragment key={issue.key}>
                  <tr 
                    className={`${selectedIssue === issue.key ? 'selected' : ''} ${expandedIssue === issue.key ? 'expanded' : ''}`}
                    onClick={() => handleRowClick(issue.key)}
                  >
                    <td className="expand-cell">
                      {expandedIssue === issue.key ? 
                        <IconChevronDown size={16} /> : 
                        <IconChevronRight size={16} />
                      }
                    </td>
                    <td>{issue.key}</td>
                    <td className="summary-cell">{issue.summary}</td>
                    <td className="point-cell">{issue.initialStoryPoint ?? '-'}</td>
                    <td className="point-cell">{issue.storyPoint ?? '-'}</td>
                    <td className="change-cell">
                      {renderChangeIndicator(issue.initialStoryPoint, issue.storyPoint)}
                    </td>
                  </tr>
                  {expandedIssue === issue.key && (
                    <tr className="description-row">
                      <td colSpan={6}>
                        <div className="row-description">
                          <h4>Description</h4>
                          <div className="description-content">
                            {issue.description ? (
                              <div dangerouslySetInnerHTML={{ __html: sanitizeHTML(issue.description) }} />
                            ) : (
                              <p className="no-description">No description available</p>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {selectedIssueData && (
        <div className="issue-details">
          <h3>{selectedIssueData.key} - {selectedIssueData.summary}</h3>
          <div className="points-comparison">
            <div className="point-box">
              <span className="point-label">Initial Points</span>
              <span className="point-value">{selectedIssueData.initialStoryPoint ?? '-'}</span>
            </div>
            <div className="change-arrow">
              {renderChangeIndicator(selectedIssueData.initialStoryPoint, selectedIssueData.storyPoint)}
            </div>
            <div className="point-box">
              <span className="point-label">Current Points</span>
              <span className="point-value">{selectedIssueData.storyPoint ?? '-'}</span>
            </div>
          </div>
          
          <div className="description-container">
            <h4>Description</h4>
            <div className="description-content">
              {selectedIssueData.description ? (
                <div dangerouslySetInnerHTML={{ __html: sanitizeHTML(selectedIssueData.description) }} />
              ) : (
                <p className="no-description">No description available</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 