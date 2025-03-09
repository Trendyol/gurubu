import React, { useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useGroomingRoom } from "@/contexts/GroomingRoomContext";

interface GurubuAITooltipProps {
  message: string;
  isVisible: boolean;
  anchorRef: React.RefObject<HTMLElement>;
  onClose: () => void;
}

const GurubuAITooltip = ({ message, isVisible, anchorRef, onClose }: GurubuAITooltipProps) => {
  const { jiraSidebarExpanded } = useGroomingRoom();
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    const updatePosition = () => {
      if (!isVisible || !anchorRef.current || !tooltipRef.current) return;

      const anchorRect = anchorRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();

      requestAnimationFrame(() => {
        setTooltipPosition({
          top: anchorRect.top + (anchorRect.height / 2) - (tooltipRect.height / 2) + window.scrollY,
          left: jiraSidebarExpanded 
            ? anchorRect.right + 16 + window.scrollX // Sağ tarafta göster
            : anchorRect.left - tooltipRect.width - 16 + window.scrollX // Sol tarafta göster
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
  }, [isVisible, message, anchorRef, mounted, jiraSidebarExpanded]);

  if (!mounted || !isVisible || !message) return null;

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
            {message}
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default GurubuAITooltip; 