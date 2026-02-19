"use client";

import { useState, useCallback } from "react";
import { usePresentationRoom } from "@/contexts/PresentationRoomContext";
import { exportPresentationToPDF, exportPresentationToPNG, copyPresentationLink } from "@/utils/presentationUtils";
import toast from "react-hot-toast";
import {
  IconPlus,
  IconPhoto,
  IconVideo,
  IconCode,
  IconSlideshow,
  IconPalette,
  IconStars,
  IconShare,
  IconFile,
  IconUpload,
} from "@tabler/icons-react";
import ElementsSidebar from "./elements-sidebar";

interface PresentationToolbarProps {
  onAddElement: (type: 'heading' | 'text' | 'code' | 'image' | 'video' | 'gif' | 'animation' | 'chart' | 'table') => void;
  presentationId: string;
  onEnterPresentationMode?: () => void;
  onShowExamples?: () => void;
  onShowBackgroundEditor?: () => void;
  onShowTransitionEditor?: () => void;
  onShowThemePanel?: () => void;
  onImportPresentation?: () => void;
}

const PresentationToolbar = ({ onAddElement, presentationId, onEnterPresentationMode, onShowExamples, onShowBackgroundEditor, onShowTransitionEditor, onShowThemePanel, onImportPresentation }: PresentationToolbarProps) => {
  const { presentationInfo } = usePresentationRoom();
  const [isElementsSidebarOpen, setIsElementsSidebarOpen] = useState(false);

  const handleOpenSidebar = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Use setTimeout to ensure state update happens after event handling
    setTimeout(() => {
      setIsElementsSidebarOpen(true);
    }, 0);
  }, []);

  const handleCloseSidebar = useCallback(() => {
    setIsElementsSidebarOpen(false);
  }, []);

  const handleExportPDF = useCallback(() => {
    if (!presentationInfo) return;
    exportPresentationToPDF(presentationInfo);
    toast.success("Opening print dialog for PDF export");
  }, [presentationInfo]);

  const handleExportPNG = useCallback(() => {
    if (!presentationInfo) return;
    exportPresentationToPNG(presentationInfo);
    toast.success("Exporting pages as PNG...");
  }, [presentationInfo]);

  const handleShareLink = useCallback(() => {
    const url = copyPresentationLink(presentationId);
    toast.success("Link copied to clipboard!");
  }, [presentationId]);

  return (
    <>
      <div className="presentation-toolbar">
        <div className="presentation-toolbar__icons">
          <button
            className="presentation-toolbar__icon"
            onClick={handleOpenSidebar}
            title="Add Element"
          >
            <IconPlus size={20} />
          </button>

          {onShowBackgroundEditor && (
            <button
              className="presentation-toolbar__icon"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setTimeout(() => onShowBackgroundEditor(), 0);
              }}
              title="Background"
            >
              <IconPalette size={20} />
            </button>
          )}

          {onShowTransitionEditor && (
            <button
              className="presentation-toolbar__icon"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setTimeout(() => onShowTransitionEditor(), 0);
              }}
              title="Transition"
            >
              <IconStars size={20} />
            </button>
          )}

          {onShowThemePanel && (
            <button
              className="presentation-toolbar__icon"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setTimeout(() => onShowThemePanel(), 0);
              }}
              title="Theme"
            >
              <IconPalette size={20} />
            </button>
          )}

          {onShowExamples && (
            <button
              className="presentation-toolbar__icon"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setTimeout(() => onShowExamples(), 0);
              }}
              title="Examples"
            >
              <IconSlideshow size={20} />
            </button>
          )}

          <div className="presentation-toolbar__divider" />

          {onImportPresentation && (
            <button
              className="presentation-toolbar__icon"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onImportPresentation();
              }}
              title="Import Presentation"
            >
              <IconUpload size={20} />
            </button>
          )}

          <button
            className="presentation-toolbar__icon"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleExportPDF();
            }}
            title="Export PDF"
          >
            <IconFile size={20} />
          </button>

          <button
            className="presentation-toolbar__icon"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleExportPNG();
            }}
            title="Export PNG"
          >
            <IconPhoto size={20} />
          </button>

          <button
            className="presentation-toolbar__icon"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleShareLink();
            }}
            title="Share Link"
          >
            <IconShare size={20} />
          </button>

          <div className="presentation-toolbar__divider" />

          {onEnterPresentationMode && (
            <button
              className="presentation-toolbar__icon presentation-toolbar__icon--primary"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEnterPresentationMode();
              }}
              title="Start Presentation"
            >
              <IconSlideshow size={20} />
            </button>
          )}
        </div>
      </div>

      <ElementsSidebar
        isOpen={isElementsSidebarOpen}
        onClose={handleCloseSidebar}
        onAddElement={onAddElement}
      />
    </>
  );
};

export default PresentationToolbar;
