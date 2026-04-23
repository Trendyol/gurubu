"use client";

import { useState } from "react";
import { IconX, IconCode, IconPhoto, IconVideo, IconPhoto as IconGif, IconChartBar, IconTable, IconBraces } from "@tabler/icons-react";

interface ElementsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onAddElement: (type: 'heading' | 'text' | 'code' | 'image' | 'video' | 'gif' | 'animation' | 'chart' | 'table' | 'json') => void;
}

const ElementsSidebar = ({ isOpen, onClose, onAddElement }: ElementsSidebarProps) => {
  const [activeCategory, setActiveCategory] = useState<'text' | 'media' | 'code'>('text');

  const textElements = [
    { type: 'heading' as const, label: 'Heading', icon: IconCode, description: 'Add a heading element' },
    { type: 'text' as const, label: 'Text', icon: IconCode, description: 'Add a text block' },
  ];

  const mediaElements = [
    { type: 'image' as const, label: 'Image', icon: IconPhoto, description: 'Add an image' },
    { type: 'video' as const, label: 'Video', icon: IconVideo, description: 'Add a video' },
    { type: 'gif' as const, label: 'GIF/Animation', icon: IconGif, description: 'Add a GIF or animation' },
  ];

  const codeElements = [
    { type: 'code' as const, label: 'Code Block', icon: IconCode, description: 'Add a code block' },
    { type: 'json' as const, label: 'JSON Beautifier', icon: IconBraces, description: 'Add a JSON beautifier' },
    { type: 'chart' as const, label: 'Chart', icon: IconChartBar, description: 'Add a chart' },
    { type: 'table' as const, label: 'Table', icon: IconTable, description: 'Add a table' },
  ];

  const currentElements = activeCategory === 'text' ? textElements : activeCategory === 'media' ? mediaElements : codeElements;

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="elements-sidebar__backdrop" 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClose();
        }}
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      />
      <div 
        className="elements-sidebar open"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="elements-sidebar__header">
          <h3>Add Element</h3>
          <button className="elements-sidebar__close" onClick={onClose}>
            <IconX size={20} />
          </button>
        </div>

        <div className="elements-sidebar__categories">
          <button
            className={`elements-sidebar__category ${activeCategory === 'text' ? 'active' : ''}`}
            onClick={() => setActiveCategory('text')}
          >
            <IconCode size={18} />
            <span>Text</span>
          </button>
          <button
            className={`elements-sidebar__category ${activeCategory === 'media' ? 'active' : ''}`}
            onClick={() => setActiveCategory('media')}
          >
            <IconPhoto size={18} />
            <span>Media</span>
          </button>
          <button
            className={`elements-sidebar__category ${activeCategory === 'code' ? 'active' : ''}`}
            onClick={() => setActiveCategory('code')}
          >
            <IconCode size={18} />
            <span>Code</span>
          </button>
        </div>

        <div className="elements-sidebar__content">
          {currentElements.map((element) => {
            const IconComponent = element.icon;
            if (!IconComponent) {
              console.error(`Icon component is undefined for element type: ${element.type}`);
              return null;
            }
            return (
              <button
                key={element.type}
                className="elements-sidebar__element"
                onClick={() => {
                  onAddElement(element.type);
                  onClose();
                }}
              >
                <div className="elements-sidebar__element-icon">
                  <IconComponent size={24} />
                </div>
                <div className="elements-sidebar__element-info">
                  <div className="elements-sidebar__element-label">{element.label}</div>
                  <div className="elements-sidebar__element-description">{element.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default ElementsSidebar;
