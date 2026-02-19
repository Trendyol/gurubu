"use client";

import { useState, useEffect } from "react";
import { PresentationElement } from "@/shared/interfaces";
import { IconX, IconPlus, IconTrash } from "@tabler/icons-react";

interface ChartDataPanelProps {
  element: PresentationElement;
  onUpdate: (updates: any) => void;
  onClose: () => void;
}

const ChartDataPanel = ({ element, onUpdate, onClose }: ChartDataPanelProps) => {
  const chartData = element.style?.chartData || { labels: ['A', 'B', 'C'], values: [10, 20, 30] };
  const [labels, setLabels] = useState<string[]>(chartData.labels || []);
  const [values, setValues] = useState<number[]>(chartData.values || []);

  useEffect(() => {
    const chartData = element.style?.chartData || { labels: ['A', 'B', 'C'], values: [10, 20, 30] };
    setLabels([...chartData.labels]);
    setValues([...chartData.values]);
  }, [element]);

  const handleAddRow = () => {
    const newLabels = [...labels, `Label ${labels.length + 1}`];
    const newValues = [...values, 0];
    setLabels(newLabels);
    setValues(newValues);
    onUpdate({ style: { ...element.style, chartData: { labels: newLabels, values: newValues } } });
  };

  const handleDeleteRow = (index: number) => {
    if (labels.length <= 1) return;
    const newLabels = labels.filter((_, i) => i !== index);
    const newValues = values.filter((_, i) => i !== index);
    setLabels(newLabels);
    setValues(newValues);
    onUpdate({ style: { ...element.style, chartData: { labels: newLabels, values: newValues } } });
  };

  const handleLabelChange = (index: number, value: string) => {
    const newLabels = [...labels];
    newLabels[index] = value;
    setLabels(newLabels);
    onUpdate({ style: { ...element.style, chartData: { labels: newLabels, values } } });
  };

  const handleValueChange = (index: number, value: number) => {
    const newValues = [...values];
    newValues[index] = value;
    setValues(newValues);
    onUpdate({ style: { ...element.style, chartData: { labels, values: newValues } } });
  };

  return (
    <div className="chart-data-panel" onClick={onClose}>
      <div className="chart-data-panel__content" onClick={(e) => e.stopPropagation()}>
        <div className="chart-data-panel__header">
          <h3>Edit Chart Data</h3>
          <button onClick={onClose} className="chart-data-panel__close">
            <IconX size={20} />
          </button>
        </div>

        <div className="chart-data-panel__body">
          <div className="chart-data-panel__table">
            <div className="chart-data-panel__table-header">
              <div>Label</div>
              <div>Value</div>
              <div></div>
            </div>
            {labels.map((label, index) => (
              <div key={index} className="chart-data-panel__table-row">
                <input
                  type="text"
                  value={label}
                  onChange={(e) => handleLabelChange(index, e.target.value)}
                  className="chart-data-panel__input"
                />
                <input
                  type="number"
                  value={values[index]}
                  onChange={(e) => handleValueChange(index, parseFloat(e.target.value) || 0)}
                  className="chart-data-panel__input"
                />
                <button
                  onClick={() => handleDeleteRow(index)}
                  disabled={labels.length <= 1}
                  className="chart-data-panel__delete-btn"
                >
                  <IconTrash size={16} />
                </button>
              </div>
            ))}
          </div>

          <button onClick={handleAddRow} className="chart-data-panel__add-btn">
            <IconPlus size={16} />
            Add Row
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChartDataPanel;
