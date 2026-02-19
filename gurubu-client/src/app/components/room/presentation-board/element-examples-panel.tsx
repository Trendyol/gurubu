"use client";

import { useState } from "react";
import { usePresentationRoom } from "@/contexts/PresentationRoomContext";
import { usePresentationSocket } from "@/contexts/PresentationSocketContext";

interface ElementExample {
  name: string;
  description: string;
  elements: Array<{
    type: string;
    content: string;
    style: any;
    position: { x: number; y: number };
    size: { width: number; height: number };
  }>;
}

interface ElementExamplesPanelProps {
  presentationId: string;
  onClose: () => void;
}

const ElementExamplesPanel = ({ presentationId, onClose }: ElementExamplesPanelProps) => {
  const { presentationInfo, userInfo } = usePresentationRoom();
  const socket = usePresentationSocket();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const currentPage = presentationInfo?.pages?.[presentationInfo.currentPage || 0];
  const template = presentationInfo?.template;

  if (!template || !currentPage || !userInfo.lobby) return null;

  const examples: ElementExample[] = template.elementExamples || [];

  const handleInsertExample = (example: ElementExample) => {
    if (!userInfo.lobby || !currentPage) return;

    // Remove all existing elements from the page first
    const elementsToDelete = [...(currentPage.elements || [])];
    
    // Delete all existing elements
    elementsToDelete.forEach((element) => {
      socket.emit("deleteElement", presentationId, currentPage.id, element.id, userInfo.lobby.credentials);
    });

    // Add new elements after a short delay to ensure deletions are processed
    setTimeout(() => {
      example.elements.forEach((elementTemplate, index) => {
        const newElement = {
          id: Date.now().toString() + index + Math.random().toString(36).substr(2, 9),
          type: elementTemplate.type,
          content: elementTemplate.content,
          style: elementTemplate.style,
          position: elementTemplate.position,
          size: elementTemplate.size,
        };

        socket.emit("addElement", presentationId, currentPage.id, newElement, userInfo.lobby.credentials);
      });
    }, 150);

    onClose();
  };

  if (examples.length === 0) {
    return (
      <div className="element-examples-panel">
        <div className="element-examples-panel__header">
          <h3>Insert Examples</h3>
          <button onClick={onClose}>×</button>
        </div>
        <div className="element-examples-panel__empty">
          <p>No examples available for this template.</p>
        </div>
      </div>
    );
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="element-examples-panel" onClick={handleBackdropClick}>
      <div className="element-examples-panel__header">
        <h3>Insert Examples</h3>
        <button onClick={onClose} className="element-examples-panel__close">×</button>
      </div>

      <div className="element-examples-panel__content-wrapper" onClick={(e) => e.stopPropagation()}>
      <div className="element-examples-panel__content">
        {examples.map((example, index) => (
          <div
            key={index}
            className="element-examples-panel__example"
            onClick={() => handleInsertExample(example)}
          >
            <div className="element-examples-panel__example-preview">
              {example.elements.slice(0, 2).map((elem, idx) => (
                <div
                  key={idx}
                  className={`element-examples-panel__preview-element element-examples-panel__preview-element--${elem.type}`}
                  style={{
                    fontSize: elem.type === 'heading' ? '14px' : '10px',
                    fontWeight: elem.style?.fontWeight || 'normal',
                  }}
                >
                  {elem.type === 'heading' ? 'H' : elem.type === 'text' ? 'T' : elem.type === 'code' ? '</>' : '📄'}
                </div>
              ))}
            </div>
            <div className="element-examples-panel__example-info">
              <div className="element-examples-panel__example-name">{example.name}</div>
              <div className="element-examples-panel__example-description">{example.description}</div>
            </div>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
};

export default ElementExamplesPanel;
