"use client";

import { useState, useEffect } from "react";
import { PresentationElement } from "@/shared/interfaces";
import { IconX, IconPlus, IconTrash } from "@tabler/icons-react";

interface TableDataPanelProps {
  element: PresentationElement;
  onUpdate: (updates: any) => void;
  onClose: () => void;
}

const TableDataPanel = ({ element, onUpdate, onClose }: TableDataPanelProps) => {
  const tableData = element.style?.tableData || [
    ['Header 1', 'Header 2', 'Header 3'],
    ['Row 1 Col 1', 'Row 1 Col 2', 'Row 1 Col 3'],
  ];
  const [data, setData] = useState<string[][]>(tableData.map(row => [...row]));

  useEffect(() => {
    const tableData = element.style?.tableData || [
      ['Header 1', 'Header 2', 'Header 3'],
      ['Row 1 Col 1', 'Row 1 Col 2', 'Row 1 Col 3'],
    ];
    setData(tableData.map(row => [...row]));
  }, [element]);

  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    const newData = data.map((row, rIdx) =>
      rIdx === rowIndex
        ? row.map((cell, cIdx) => (cIdx === colIndex ? value : cell))
        : row
    );
    setData(newData);
    onUpdate({ style: { ...element.style, tableData: newData } });
  };

  const handleAddRow = () => {
    const newRow = Array(data[0]?.length || 3).fill('');
    const newData = [...data, newRow];
    setData(newData);
    onUpdate({ style: { ...element.style, tableData: newData } });
  };

  const handleDeleteRow = (rowIndex: number) => {
    if (data.length <= 1) return;
    const newData = data.filter((_, i) => i !== rowIndex);
    setData(newData);
    onUpdate({ style: { ...element.style, tableData: newData } });
  };

  const handleAddColumn = () => {
    const newData = data.map(row => [...row, '']);
    setData(newData);
    onUpdate({ style: { ...element.style, tableData: newData } });
  };

  const handleDeleteColumn = (colIndex: number) => {
    if (data[0]?.length <= 1) return;
    const newData = data.map(row => row.filter((_, i) => i !== colIndex));
    setData(newData);
    onUpdate({ style: { ...element.style, tableData: newData } });
  };

  return (
    <div className="table-data-panel" onClick={onClose}>
      <div className="table-data-panel__content" onClick={(e) => e.stopPropagation()}>
        <div className="table-data-panel__header">
          <h3>Edit Table</h3>
          <button onClick={onClose} className="table-data-panel__close">
            <IconX size={20} />
          </button>
        </div>

        <div className="table-data-panel__body">
          <div className="table-data-panel__controls">
            <button onClick={handleAddRow} className="table-data-panel__btn">
              <IconPlus size={16} />
              Add Row
            </button>
            <button onClick={handleAddColumn} className="table-data-panel__btn">
              <IconPlus size={16} />
              Add Column
            </button>
          </div>

          <div className="table-data-panel__table-wrapper">
            <table className="table-data-panel__table">
              <thead>
                <tr>
                  {data[0]?.map((_, colIndex) => (
                    <th key={colIndex}>
                      <div className="table-data-panel__header-cell">
                        <input
                          type="text"
                          value={data[0][colIndex]}
                          onChange={(e) => handleCellChange(0, colIndex, e.target.value)}
                          className="table-data-panel__input"
                        />
                        <button
                          onClick={() => handleDeleteColumn(colIndex)}
                          disabled={data[0]?.length <= 1}
                          className="table-data-panel__delete-btn"
                        >
                          <IconTrash size={14} />
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.slice(1).map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, colIndex) => (
                      <td key={colIndex}>
                        <input
                          type="text"
                          value={cell}
                          onChange={(e) => handleCellChange(rowIndex + 1, colIndex, e.target.value)}
                          className="table-data-panel__input"
                        />
                      </td>
                    ))}
                    <td className="table-data-panel__actions">
                      <button
                        onClick={() => handleDeleteRow(rowIndex + 1)}
                        disabled={data.length <= 1}
                        className="table-data-panel__delete-btn"
                      >
                        <IconTrash size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableDataPanel;
