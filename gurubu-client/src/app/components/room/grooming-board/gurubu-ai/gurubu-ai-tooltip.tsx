import React, { useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useGroomingRoom } from "@/contexts/GroomingRoomContext";

interface GurubuAITooltipProps {
  estimation: string;
  confidence?: string;
  reasoning?: {
    complexity: { explanation: string; level: string };
    effort: { explanation: string; level: string };
    risk: { explanation: string; level: string };
  };
  historicalComparison?: string;
  status?: string;
  splitRecommendation?: string | null;
  isVisible: boolean;
  anchorRef: React.RefObject<HTMLElement>;
  onClose: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const GurubuAITooltip = ({ 
  estimation, 
  confidence, 
  reasoning, 
  historicalComparison, 
  status, 
  splitRecommendation, 
  isVisible, 
  anchorRef, 
  onClose 
}: GurubuAITooltipProps) => {
  const { jiraSidebarExpanded } = useGroomingRoom();
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [expandedSections, setExpandedSections] = useState<{
    reasoning: boolean;
    historical: boolean;
    split: boolean;
  }>({
    reasoning: false,
    historical: false,
    split: false,
  });

  const toggleSection = (section: 'reasoning' | 'historical' | 'split') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getConfidenceBadgeClass = (conf?: string) => {
    if (!conf) return 'confidence-badge-medium';
    const normalized = conf.toLowerCase();
    if (normalized === 'high') return 'confidence-badge-high';
    if (normalized === 'low') return 'confidence-badge-low';
    return 'confidence-badge-medium';
  };

  const getLevelBadgeClass = (level?: string) => {
    if (!level) return 'level-badge-medium';
    const normalized = level.toLowerCase();
    if (normalized === 'high') return 'level-badge-high';
    if (normalized === 'low') return 'level-badge-low';
    return 'level-badge-medium';
  };

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    const updatePosition = () => {
      if (!isVisible || !anchorRef.current || !tooltipRef.current) return;

      const anchorRect = anchorRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      requestAnimationFrame(() => {
        let topPosition = anchorRect.top + window.scrollY;
        
        const availableSpaceBelow = viewportHeight - anchorRect.top;
        const tooltipHeight = tooltipRect.height;
        
        if (tooltipHeight > availableSpaceBelow && anchorRect.top > tooltipHeight) {
          topPosition = anchorRect.bottom - tooltipHeight + window.scrollY;
        }
        
        setTooltipPosition({
          top: topPosition,
          left: jiraSidebarExpanded 
            ? anchorRect.right + 16 + window.scrollX
            : anchorRect.left - tooltipRect.width - 16 + window.scrollX
        });
      });
    };

    if (mounted) {
      updatePosition();
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition);
      
      const timeoutId = setTimeout(updatePosition, 100);

      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition);
        clearTimeout(timeoutId);
      };
    }
  }, [isVisible, estimation, anchorRef, mounted, jiraSidebarExpanded, expandedSections]);

  if (!mounted || !isVisible || !estimation) return null;

  return createPortal(
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          ref={tooltipRef}
          className={`gurubu-ai-tooltip ${jiraSidebarExpanded ? 'left-arrow' : 'right-arrow'}`}
          initial={{ opacity: 0, x: jiraSidebarExpanded ? 10 : -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: jiraSidebarExpanded ? 10 : -10 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'absolute',
            top: tooltipPosition.top,
            left: tooltipPosition.left,
            visibility: tooltipPosition.top === 0 ? 'hidden' : 'visible'
          }}
        >
          <button className="close-button" onClick={onClose}>
            <Image src="/close-icon.svg" alt="Close" width={12} height={12} />
          </button>
          <div className="tooltip-content">
            <div className="estimation-header">
              <h3 className="estimation-value">Story Point: {estimation}</h3>
              {confidence && (
                <span className={`confidence-badge ${getConfidenceBadgeClass(confidence)}`}>
                  {confidence}
                </span>
              )}
            </div>

            {status && (
              <div className="status-indicator">
                <span className="status-label">Status:</span>
                <span className="status-value">{status}</span>
              </div>
            )}

            {reasoning && (
              <div className="expandable-section">
                <button 
                  className="section-header"
                  onClick={() => toggleSection('reasoning')}
                >
                  <span className={`chevron ${expandedSections.reasoning ? 'expanded' : ''}`}>▶</span>
                  <span>Reasoning</span>
                </button>
                {expandedSections.reasoning && (
                  <div className="section-content">
                    <div className="reasoning-item">
                      <div className="reasoning-header">
                        <strong>Complexity</strong>
                        <span className={`level-badge ${getLevelBadgeClass(reasoning.complexity.level)}`}>
                          {reasoning.complexity.level}
                        </span>
                      </div>
                      <p>{reasoning.complexity.explanation}</p>
                    </div>
                    <div className="reasoning-item">
                      <div className="reasoning-header">
                        <strong>Effort</strong>
                        <span className={`level-badge ${getLevelBadgeClass(reasoning.effort.level)}`}>
                          {reasoning.effort.level}
                        </span>
                      </div>
                      <p>{reasoning.effort.explanation}</p>
                    </div>
                    <div className="reasoning-item">
                      <div className="reasoning-header">
                        <strong>Risk</strong>
                        <span className={`level-badge ${getLevelBadgeClass(reasoning.risk.level)}`}>
                          {reasoning.risk.level}
                        </span>
                      </div>
                      <p>{reasoning.risk.explanation}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {historicalComparison && (
              <div className="expandable-section">
                <button 
                  className="section-header"
                  onClick={() => toggleSection('historical')}
                >
                  <span className={`chevron ${expandedSections.historical ? 'expanded' : ''}`}>▶</span>
                  <span>Historical Comparison</span>
                </button>
                {expandedSections.historical && (
                  <div className="section-content">
                    <p>{historicalComparison}</p>
                  </div>
                )}
              </div>
            )}

            {splitRecommendation && (
              <div className="expandable-section">
                <button 
                  className="section-header warning"
                  onClick={() => toggleSection('split')}
                >
                  <span className={`chevron ${expandedSections.split ? 'expanded' : ''}`}>▶</span>
                  <span>Split Recommendation</span>
                </button>
                {expandedSections.split && (
                  <div className="section-content warning-content">
                    <p>{splitRecommendation}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default GurubuAITooltip; 