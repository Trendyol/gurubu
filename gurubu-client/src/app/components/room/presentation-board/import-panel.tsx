"use client";

import { useState, useRef } from "react";
import { IconX, IconUpload, IconFile } from "@tabler/icons-react";
import { importPresentation, detectFileFormat, ImportOptions } from "@/utils/presentationImport";
import { PresentationInfo } from "@/shared/interfaces";
import toast from "react-hot-toast";

interface ImportPanelProps {
  onClose: () => void;
  onImport: (data: Partial<PresentationInfo>) => void;
}

const ImportPanel = ({ onClose, onImport }: ImportPanelProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);

  const handleFileSelect = async (file: File) => {
    setImporting(true);
    try {
      const format = detectFileFormat(file.name) || 'json';
      
      const importedData = await importPresentation(file, { format });
      
      if (importedData) {
        onImport(importedData);
        toast.success('Presentation imported successfully!');
        onClose();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to import presentation');
      console.error('Import error:', error);
    } finally {
      setImporting(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="import-panel" onClick={onClose}>
      <div className="import-panel__content" onClick={(e) => e.stopPropagation()}>
        <div className="import-panel__header">
          <h3>Import Presentation</h3>
          <button className="import-panel__close" onClick={onClose}>
            <IconX size={20} />
          </button>
        </div>

        <div className="import-panel__body">
          <div
            className={`import-panel__dropzone ${isDragging ? 'dragging' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={handleClick}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.pptx,.pdf"
              onChange={handleFileInputChange}
              style={{ display: 'none' }}
            />
            <IconUpload size={48} />
            <p className="import-panel__dropzone-text">
              {importing ? 'Importing...' : 'Drop file here or click to browse'}
            </p>
            <p className="import-panel__dropzone-hint">
              Supported formats: JSON, PPTX, PDF, Canva JSON
            </p>
          </div>

          <div className="import-panel__info">
            <h4>Supported Formats:</h4>
            <ul>
              <li>
                <IconFile size={16} />
                <span><strong>JSON:</strong> Native format (recommended)</span>
              </li>
              <li>
                <IconFile size={16} />
                <span><strong>PPTX:</strong> PowerPoint presentations</span>
              </li>
              <li>
                <IconFile size={16} />
                <span><strong>PDF:</strong> PDF documents</span>
              </li>
              <li>
                <IconFile size={16} />
                <span><strong>Canva:</strong> Canva JSON exports</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportPanel;
