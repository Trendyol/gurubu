"use client";

import { useState, useEffect, useCallback } from "react";
import { usePresentationRoom } from "@/contexts/PresentationRoomContext";
import { usePresentationSocket } from "@/contexts/PresentationSocketContext";
import PresentationToolbar from "./presentation-toolbar";
import PresentationPage from "./presentation-page";
import PresentationProgress from "./presentation-progress";
import PresentationPageThumbnails from "./presentation-page-thumbnails";
import PresentationCamera from "./presentation-camera";
import ElementStylePanel from "./element-style-panel";
import PresentationMode from "./presentation-mode";
import ElementExamplesPanel from "./element-examples-panel";
import PageBackgroundPanel from "./page-background-panel";
import PageTransitionPanel from "./page-transition-panel";
import GifAnimationLibrary from "./gif-animation-library";
import ElementContextMenu from "./element-context-menu";
import ThemePanel, { ThemeConfig } from "./theme-panel";
import ImportPanel from "./import-panel";
import ChartDataPanel from "./chart-data-panel";
import TableDataPanel from "./table-data-panel";

interface PresentationEditorProps {
  presentationId: string;
}

const PresentationEditor = ({ presentationId }: PresentationEditorProps) => {
  const { presentationInfo, userInfo } = usePresentationRoom();
  const socket = usePresentationSocket();
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [showExamplesPanel, setShowExamplesPanel] = useState(false);
  const [showBackgroundPanel, setShowBackgroundPanel] = useState(false);
  const [showTransitionPanel, setShowTransitionPanel] = useState(false);
  const [showGifLibrary, setShowGifLibrary] = useState(false);
  const [pendingGifType, setPendingGifType] = useState<'gif' | 'animation' | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; elementId: string } | null>(null);
  const [showThemePanel, setShowThemePanel] = useState(false);
  const [showImportPanel, setShowImportPanel] = useState(false);
  const [showChartDataPanel, setShowChartDataPanel] = useState(false);
  const [showTableDataPanel, setShowTableDataPanel] = useState(false);

  const currentPage = presentationInfo?.pages?.[presentationInfo.currentPage || 0];

  // Auto-switch to new page when page is added
  useEffect(() => {
    if (presentationInfo?.pages && presentationInfo.currentPage !== undefined) {
      // Page was added, currentPage should already be updated by backend
    }
  }, [presentationInfo?.pages?.length]);

  const handleAddElement = (type: 'heading' | 'text' | 'code' | 'image' | 'video' | 'gif' | 'animation' | 'chart' | 'table' | 'json') => {
    if (!userInfo.lobby || !currentPage) return;

    // For GIF and animation, show library instead
    if (type === 'gif' || type === 'animation') {
      setPendingGifType(type);
      setShowGifLibrary(true);
      return;
    }

    const newElement = {
      id: Date.now().toString(),
      type,
      content: type === 'heading' ? 'New Heading' : 
               type === 'text' ? 'New Text' : 
               type === 'code' ? 'console.log("Hello, World!");' : 
               type === 'json' ? '{\n  "message": "Hello, World!"\n}' :
               type === 'chart' ? '' : 
               type === 'table' ? '' : '',
      style: {
        fontFamily: 'Arial',
        fontSize: type === 'heading' ? 48 : 24,
        fontWeight: type === 'heading' ? 'bold' : 'normal',
        color: '#000000',
        language: type === 'code' ? 'javascript' : undefined,
        chartType: type === 'chart' ? 'bar' : undefined,
        chartData: type === 'chart' ? { labels: ['A', 'B', 'C'], values: [10, 20, 30] } : undefined,
        tableData: type === 'table' ? [
          ['Header 1', 'Header 2', 'Header 3'],
          ['Row 1 Col 1', 'Row 1 Col 2', 'Row 1 Col 3'],
          ['Row 2 Col 1', 'Row 2 Col 2', 'Row 2 Col 3'],
        ] : undefined,
      },
      position: { x: 100, y: 100 },
      size: { 
        width: type === 'code' || type === 'json' ? 600 : type === 'chart' || type === 'table' ? 500 : type === 'image' || type === 'video' ? 400 : 400, 
        height: type === 'heading' ? 80 : type === 'code' || type === 'json' ? 300 : type === 'chart' || type === 'table' ? 300 : type === 'image' || type === 'video' ? 300 : 200 
      },
    };

    socket.emit("addElement", presentationId, currentPage.id, newElement, userInfo.lobby.credentials);
  };

  const handleGifSelect = (url: string, type: 'gif' | 'animation') => {
    if (!userInfo.lobby || !currentPage) return;

    const newElement = {
      id: Date.now().toString(),
      type,
      content: url,
      style: {},
      position: { x: 100, y: 100 },
      size: { width: 400, height: 300 },
    };

    socket.emit("addElement", presentationId, currentPage.id, newElement, userInfo.lobby.credentials);
  };


  const handlePreviousPage = () => {
    if (!userInfo.lobby || !presentationInfo) return;
    const newIndex = Math.max(0, (presentationInfo.currentPage || 0) - 1);
    socket.emit("setCurrentPage", presentationId, newIndex, userInfo.lobby.credentials);
  };

  const handleNextPage = () => {
    if (!userInfo.lobby || !presentationInfo) return;
    const newIndex = Math.min(
      presentationInfo.pages.length - 1,
      (presentationInfo.currentPage || 0) + 1
    );
    socket.emit("setCurrentPage", presentationId, newIndex, userInfo.lobby.credentials);
  };

  const handleUpdateElement = (elementId: string, updates: any) => {
    if (!userInfo.lobby || !currentPage) return;
    socket.emit("updateElement", presentationId, currentPage.id, elementId, updates, userInfo.lobby.credentials);
  };

  const selectedElement = currentPage?.elements?.find(el => el.id === selectedElementId) || null;

  const handleDeleteElement = useCallback(() => {
    if (!userInfo.lobby || !currentPage || !selectedElementId) return;
    socket.emit("deleteElement", presentationId, currentPage.id, selectedElementId, userInfo.lobby.credentials);
    setSelectedElementId(null);
    setContextMenu(null);
  }, [userInfo.lobby, currentPage, selectedElementId, presentationId, socket]);

  const handleDuplicateElement = () => {
    if (!userInfo.lobby || !currentPage || !selectedElementId) return;
    const element = currentPage.elements.find(el => el.id === selectedElementId);
    if (!element) return;

    const duplicatedElement = {
      ...element,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      position: {
        x: element.position.x + 20,
        y: element.position.y + 20,
      },
    };

    socket.emit("addElement", presentationId, currentPage.id, duplicatedElement, userInfo.lobby.credentials);
    setContextMenu(null);
  };

  const handleChangeElementOrder = (direction: 'front' | 'forward' | 'backward' | 'back') => {
    if (!userInfo.lobby || !currentPage || !selectedElementId) return;
    
    const elementIndex = currentPage.elements.findIndex(el => el.id === selectedElementId);
    if (elementIndex === -1) return;

    const newElements = [...currentPage.elements];
    const [element] = newElements.splice(elementIndex, 1);

    let newIndex: number;
    switch (direction) {
      case 'front':
        newIndex = newElements.length;
        break;
      case 'forward':
        newIndex = Math.min(elementIndex + 1, newElements.length);
        break;
      case 'backward':
        newIndex = Math.max(elementIndex - 1, 0);
        break;
      case 'back':
        newIndex = 0;
        break;
      default:
        return;
    }

    newElements.splice(newIndex, 0, element);

    // Update page with reordered elements
    socket.emit("updatePage", presentationId, currentPage.id, { elements: newElements }, userInfo.lobby.credentials);
    setContextMenu(null);
  };

  const handleApplyTheme = useCallback((theme: ThemeConfig) => {
    if (!userInfo.lobby || !presentationInfo) return;

    // Apply theme to all pages - batch updates
    presentationInfo.pages.forEach((page, index) => {
      const isCoverPage = index === 0;
      const background = isCoverPage ? theme.coverPage.background : theme.contentPage.background;
      
      setTimeout(() => {
        socket.emit("updatePage", presentationId, page.id, { 
          background,
          themeId: theme.id,
          themeCoverPage: theme.coverPage,
          themeContentPage: theme.contentPage
        }, userInfo.lobby!.credentials);
      }, index * 50); // Small delay between updates
    });
  }, [userInfo.lobby, presentationInfo, presentationId, socket]);

  const handleEnterPresentationMode = useCallback(() => {
    setIsPresentationMode(true);
  }, []);

  const handleShowExamples = useCallback(() => {
    setShowExamplesPanel(true);
  }, []);

  const handleShowBackgroundEditor = useCallback(() => {
    setShowBackgroundPanel(true);
  }, []);

  const handleShowTransitionEditor = useCallback(() => {
    setShowTransitionPanel(true);
  }, []);

  const handleShowThemePanel = useCallback(() => {
    setShowThemePanel(true);
  }, []);

  // Delete element with Delete or Backspace key
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't delete if user is typing in an input field
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || 
          target.tagName === 'TEXTAREA' || 
          target.isContentEditable) {
        return;
      }
      
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElementId && userInfo.lobby) {
        e.preventDefault();
        handleDeleteElement();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedElementId, userInfo.lobby, handleDeleteElement]);

  // Show presentation mode if enabled
  if (isPresentationMode) {
    return (
      <PresentationMode
        presentationId={presentationId}
        onExit={() => setIsPresentationMode(false)}
      />
    );
  }

  return (
    <div className="presentation-editor">
      <PresentationToolbar
        onAddElement={handleAddElement}
        presentationId={presentationId}
        onEnterPresentationMode={handleEnterPresentationMode}
        onShowExamples={handleShowExamples}
        onShowBackgroundEditor={handleShowBackgroundEditor}
        onShowTransitionEditor={handleShowTransitionEditor}
        onShowThemePanel={handleShowThemePanel}
        onImportPresentation={() => setShowImportPanel(true)}
      />
      
      <div className="presentation-editor__main">
        <div 
          className="presentation-editor__canvas"
          onClick={(e) => {
            // Click on canvas (not on element) deselects element
            if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('presentation-page')) {
              setSelectedElementId(null);
            }
          }}
        >
          {currentPage && (
            <PresentationPage
              key={`edit-${currentPage.id}-${presentationInfo.currentPage}`}
              page={currentPage}
              isEditing={true}
              selectedElementId={selectedElementId}
              onSelectElement={setSelectedElementId}
              onUpdateElement={handleUpdateElement}
              onContextMenu={(elementId, x, y) => {
                setContextMenu({ elementId, x, y });
                setSelectedElementId(elementId);
              }}
              onEditChartData={(elementId) => {
                setSelectedElementId(elementId);
                setShowChartDataPanel(true);
              }}
              onEditTableData={(elementId) => {
                setSelectedElementId(elementId);
                setShowTableDataPanel(true);
              }}
              pageKey={presentationInfo.currentPage}
              presentationId={presentationId}
            />
          )}
        </div>

        <PresentationPageThumbnails presentationId={presentationId} />

        <PresentationProgress
          currentPage={presentationInfo?.currentPage || 0}
          totalPages={presentationInfo?.pages?.length || 0}
          onPreviousPage={handlePreviousPage}
          onNextPage={handleNextPage}
        />
      </div>

      <PresentationCamera presentationId={presentationId} />

      {selectedElement && selectedElement.type !== 'chart' && selectedElement.type !== 'table' && (
        <ElementStylePanel
          element={selectedElement}
          onUpdate={(updates) => handleUpdateElement(selectedElementId!, updates)}
        />
      )}

      {selectedElement && selectedElement.type === 'chart' && showChartDataPanel && (
        <ChartDataPanel
          element={selectedElement}
          onUpdate={(updates) => handleUpdateElement(selectedElementId!, updates)}
          onClose={() => setShowChartDataPanel(false)}
        />
      )}

      {selectedElement && selectedElement.type === 'table' && showTableDataPanel && (
        <TableDataPanel
          element={selectedElement}
          onUpdate={(updates) => handleUpdateElement(selectedElementId!, updates)}
          onClose={() => setShowTableDataPanel(false)}
        />
      )}

      {showExamplesPanel && (
        <ElementExamplesPanel
          presentationId={presentationId}
          onClose={() => setShowExamplesPanel(false)}
        />
      )}

      {showBackgroundPanel && currentPage && (
        <PageBackgroundPanel
          presentationId={presentationId}
          pageId={currentPage.id}
          onClose={() => setShowBackgroundPanel(false)}
        />
      )}

      {showTransitionPanel && currentPage && (
        <PageTransitionPanel
          presentationId={presentationId}
          pageId={currentPage.id}
          onClose={() => setShowTransitionPanel(false)}
        />
      )}

      {showGifLibrary && pendingGifType && (
        <GifAnimationLibrary
          onSelect={(url) => {
            handleGifSelect(url, pendingGifType);
            setShowGifLibrary(false);
            setPendingGifType(null);
          }}
          onClose={() => {
            setShowGifLibrary(false);
            setPendingGifType(null);
          }}
        />
      )}

      {contextMenu && contextMenu.elementId === selectedElementId && (
        <ElementContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onBringToFront={() => handleChangeElementOrder('front')}
          onSendToBack={() => handleChangeElementOrder('back')}
          onBringForward={() => handleChangeElementOrder('forward')}
          onSendBackward={() => handleChangeElementOrder('backward')}
          onDuplicate={handleDuplicateElement}
          onDelete={handleDeleteElement}
        />
      )}

      {showThemePanel && (
        <ThemePanel
          onClose={() => setShowThemePanel(false)}
          onApplyTheme={handleApplyTheme}
        />
      )}

      {showImportPanel && (
        <ImportPanel
          onClose={() => setShowImportPanel(false)}
          onImport={async (importedData) => {
            if (!userInfo.lobby || !presentationInfo) return;
            
            // Import pages one by one
            if (importedData.pages && importedData.pages.length > 0) {
              // Clear existing pages except first one, or add to existing
              for (let i = 0; i < importedData.pages.length; i++) {
                const page = importedData.pages[i];
                if (i === 0) {
                  // Update first page
                  socket.emit("updatePage", presentationId, presentationInfo.pages[0]?.id || '', {
                    elements: page.elements,
                    background: page.background,
                    transition: page.transition,
                  }, userInfo.lobby.credentials);
                } else {
                  // Add new pages
                  const prevPageId = i === 1 ? presentationInfo.pages[0]?.id : importedData.pages[i - 1]?.id;
                  socket.emit("addPage", presentationId, prevPageId, userInfo.lobby.credentials);
                  // Wait a bit then update the new page
                  setTimeout(() => {
                    // The backend will create a new page, we'll update it after it's created
                  }, 100);
                }
              }
            }
          }}
        />
      )}
    </div>
  );
};

export default PresentationEditor;
