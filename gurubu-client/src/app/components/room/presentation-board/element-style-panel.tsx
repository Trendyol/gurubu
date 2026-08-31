"use client";

import { useState, useEffect } from "react";
import { PresentationElement } from "@/shared/interfaces";

interface ElementStylePanelProps {
  element: PresentationElement | null;
  onUpdate: (updates: any) => void;
}

const FONT_FAMILIES = [
  'Arial',
  'Georgia',
  'Times New Roman',
  'Courier New',
  'Verdana',
  'Helvetica',
  'Comic Sans MS',
  'Impact',
  'Trebuchet MS',
];

const FONT_SIZES = [12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72];

const COLORS = [
  '#000000', '#333333', '#666666', '#999999', '#CCCCCC', '#FFFFFF',
  '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
  '#FFA500', '#800080', '#FFC0CB', '#A52A2A', '#008000', '#000080',
];

const ElementStylePanel = ({ element, onUpdate }: ElementStylePanelProps) => {
  const [fontFamily, setFontFamily] = useState(element?.style?.fontFamily || 'Arial');
  const [fontSize, setFontSize] = useState(element?.style?.fontSize || 24);
  const [fontWeight, setFontWeight] = useState(element?.style?.fontWeight || 'normal');
  const [color, setColor] = useState(element?.style?.color || '#000000');

  useEffect(() => {
    if (element) {
      setFontFamily(element.style?.fontFamily || 'Arial');
      setFontSize(element.style?.fontSize || 24);
      setFontWeight(element.style?.fontWeight || 'normal');
      setColor(element.style?.color || '#000000');
    }
  }, [element]);

  if (!element || (element.type !== 'text' && element.type !== 'heading')) {
    return null;
  }

  const handleFontFamilyChange = (newFontFamily: string) => {
    setFontFamily(newFontFamily);
    onUpdate({ style: { ...element.style, fontFamily: newFontFamily } });
  };

  const handleFontSizeChange = (newFontSize: number) => {
    setFontSize(newFontSize);
    onUpdate({ style: { ...element.style, fontSize: newFontSize } });
  };

  const handleFontWeightChange = (newFontWeight: string) => {
    setFontWeight(newFontWeight);
    onUpdate({ style: { ...element.style, fontWeight: newFontWeight } });
  };

  const handleColorChange = (newColor: string) => {
    setColor(newColor);
    onUpdate({ style: { ...element.style, color: newColor } });
  };

  return (
    <div className="element-style-panel">
      <div className="element-style-panel__header">
        <h3>Text Style</h3>
      </div>

      <div className="element-style-panel__section">
        <label>Font Family</label>
        <select
          value={fontFamily}
          onChange={(e) => handleFontFamilyChange(e.target.value)}
          className="element-style-panel__select"
        >
          {FONT_FAMILIES.map(font => (
            <option key={font} value={font}>{font}</option>
          ))}
        </select>
      </div>

      <div className="element-style-panel__section">
        <label>Font Size</label>
        <div className="element-style-panel__font-size-controls">
          <input
            type="number"
            value={fontSize}
            onChange={(e) => handleFontSizeChange(parseInt(e.target.value) || 24)}
            className="element-style-panel__input"
            min="8"
            max="200"
          />
          <select
            value={fontSize}
            onChange={(e) => handleFontSizeChange(parseInt(e.target.value))}
            className="element-style-panel__select"
          >
            {FONT_SIZES.map(size => (
              <option key={size} value={size}>{size}px</option>
            ))}
          </select>
        </div>
      </div>

      <div className="element-style-panel__section">
        <label>Font Weight</label>
        <div className="element-style-panel__button-group">
          <button
            className={`element-style-panel__button ${fontWeight === 'normal' ? 'active' : ''}`}
            onClick={() => handleFontWeightChange('normal')}
          >
            Normal
          </button>
          <button
            className={`element-style-panel__button ${fontWeight === 'bold' ? 'active' : ''}`}
            onClick={() => handleFontWeightChange('bold')}
          >
            Bold
          </button>
        </div>
      </div>

      <div className="element-style-panel__section">
        <label>Color</label>
        <div className="element-style-panel__color-picker">
          <input
            type="color"
            value={color}
            onChange={(e) => handleColorChange(e.target.value)}
            className="element-style-panel__color-input"
          />
          <div className="element-style-panel__color-grid">
            {COLORS.map(c => (
              <button
                key={c}
                className={`element-style-panel__color-swatch ${color === c ? 'active' : ''}`}
                style={{ backgroundColor: c }}
                onClick={() => handleColorChange(c)}
                title={c}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElementStylePanel;
