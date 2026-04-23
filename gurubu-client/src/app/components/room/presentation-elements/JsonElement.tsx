"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { PresentationElement } from "@/shared/interfaces";
import ResizeHandles from "../presentation-board/resize-handles";
import { snapToGrid } from "@/utils/gridUtils";
import Editor from "@monaco-editor/react";
import { IconCode, IconCopy, IconCheck } from "@tabler/icons-react";

interface JsonElementProps {
  element: PresentationElement;
  isEditing?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
  onUpdate?: (updates: any) => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  zIndex?: number;
  pageId: string;
}

const JsonElement = ({ element, isEditing = false, isSelected = false, onSelect, onUpdate, onContextMenu, zIndex, pageId }: JsonElementProps) => {
  const [jsonContent, setJsonContent] = useState<string>(element.content || '{}');
  const [isValid, setIsValid] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [copied, setCopied] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<any>(null);

  // Validate and beautify JSON
  const validateAndBeautify = useCallback((content: string) => {
    try {
      const parsed = JSON.parse(content);
      const beautified = JSON.stringify(parsed, null, 2);
      setIsValid(true);
      setError("");
      return beautified;
    } catch (err: any) {
      setIsValid(false);
      setError(err.message || "Invalid JSON");
      return content;
    }
  }, []);

  useEffect(() => {
    const beautified = validateAndBeautify(jsonContent);
    if (beautified !== jsonContent && isValid) {
      setJsonContent(beautified);
    }
  }, []);

  const handleEditorChange = useCallback((value: string | undefined) => {
    if (value !== undefined) {
      const beautified = validateAndBeautify(value);
      setJsonContent(beautified);
      
      // Update element content
      if (onUpdate && isValid) {
        onUpdate({ content: beautified });
      }
    }
  }, [validateAndBeautify, isValid, onUpdate]);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!isEditing) return;
    const target = e.target as HTMLElement;
    if (target.closest('.monaco-editor') || 
        target.closest('button')) return;
    onSelect?.();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isEditing) return;
    const target = e.target as HTMLElement;
    if (target.closest('.monaco-editor') || 
        target.closest('button')) return;
    e.preventDefault();
    e.stopPropagation();
    
    if (!isSelected) {
      onSelect?.();
    }
    
    const pageElement = elementRef.current?.closest('.presentation-page');
    const pageRect = pageElement?.getBoundingClientRect();
    
    if (pageRect) {
      const mouseX = e.clientX - pageRect.left;
      const mouseY = e.clientY - pageRect.top;
      
      setDragStartPos({ x: mouseX, y: mouseY });
      setDragOffset({
        x: mouseX - element.position.x,
        y: mouseY - element.position.y,
      });
      setIsMouseDown(true);
    }
  };

  useEffect(() => {
    if (!isDragging && !isMouseDown) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isMouseDown || !isSelected) return;
      
      const pageElement = elementRef.current?.closest('.presentation-page');
      if (!pageElement) return;
      
      const pageRect = pageElement.getBoundingClientRect();
      const currentX = e.clientX - pageRect.left;
      const currentY = e.clientY - pageRect.top;
      
      if (!isDragging) {
        const deltaX = Math.abs(currentX - dragStartPos.x);
        const deltaY = Math.abs(currentY - dragStartPos.y);
        
        if (deltaX > 5 || deltaY > 5) {
          setIsDragging(true);
        } else {
          return;
        }
      }
      
      if (isDragging) {
        const rawX = currentX - dragOffset.x;
        const rawY = currentY - dragOffset.y;
        
        const snappedX = snapToGrid(rawX);
        const snappedY = snapToGrid(rawY);
        
        const padding = 10;
        const constrainedX = Math.max(padding, Math.min(snappedX, pageRect.width - element.size.width - padding));
        const constrainedY = Math.max(padding, Math.min(snappedY, pageRect.height - element.size.height - padding));
        
        if (constrainedX !== element.position.x || constrainedY !== element.position.y) {
          onUpdate?.({
            position: {
              x: constrainedX,
              y: constrainedY,
            }
          });
        }
      }
    };

    const handleMouseUp = () => {
      setIsMouseDown(false);
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isMouseDown, isSelected, dragOffset, dragStartPos, element.size, element.position, onUpdate]);

  const handleResize = (newSize: { width: number; height: number }, newPosition?: { x: number; y: number }) => {
    const updates: any = { 
      size: {
        width: snapToGrid(newSize.width),
        height: snapToGrid(newSize.height),
      }
    };
    if (newPosition) {
      updates.position = {
        x: snapToGrid(newPosition.x),
        y: snapToGrid(newPosition.y),
      };
    }
    onUpdate?.(updates);
    
    setTimeout(() => {
      editorRef.current?.layout();
    }, 100);
  };

  if (isEditing) {
    return (
      <div
        ref={elementRef}
        className={`json-element ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''} ${!isValid ? 'invalid' : ''}`}
        style={{
          position: 'absolute',
          left: `${element.position.x}px`,
          top: `${element.position.y}px`,
          width: `${element.size.width}px`,
          height: `${element.size.height}px`,
          cursor: isDragging ? 'grabbing' : 'default',
          zIndex: zIndex !== undefined ? zIndex : 'auto',
        }}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onContextMenu={onContextMenu}
      >
        <div className="json-element__header">
          <div className="json-element__header-left">
            <IconCode size={16} />
            <span>JSON Beautifier</span>
            {!isValid && (
              <span className="json-element__error-indicator" title={error}>
                Invalid JSON
              </span>
            )}
          </div>
          <div className="json-element__header-right">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCopy();
              }}
              className="json-element__copy-btn"
              title="Copy JSON"
            >
              {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
            </button>
          </div>
        </div>

        <div className="json-element__editor-wrapper">
          <Editor
            height="100%"
            language="json"
            value={jsonContent}
            theme="vs-dark"
            onChange={handleEditorChange}
            onMount={(editor) => {
              editorRef.current = editor;
              editor.updateOptions({
                fontSize: 14,
                wordWrap: 'on',
                minimap: { enabled: false },
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                insertSpaces: true,
                formatOnPaste: true,
                formatOnType: true,
                readOnly: !isEditing,
              });
            }}
            options={{
              fontSize: 14,
              wordWrap: 'on',
              minimap: { enabled: false },
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              insertSpaces: true,
              formatOnPaste: true,
              formatOnType: true,
              readOnly: !isEditing,
            }}
          />
        </div>

        {error && !isValid && (
          <div className="json-element__error-panel">
            <strong>Error:</strong>
            <pre>{error}</pre>
          </div>
        )}

        {isSelected && (
          <ResizeHandles
            elementRef={elementRef as React.RefObject<HTMLElement>}
            elementSize={element.size}
            elementPosition={element.position}
            onResize={handleResize}
          />
        )}
      </div>
    );
  }

  return (
    <div
      ref={elementRef}
      className={`json-element ${isSelected ? 'selected' : ''}`}
      style={{
        position: 'absolute',
        left: `${element.position.x}px`,
        top: `${element.position.y}px`,
        width: `${element.size.width}px`,
        height: `${element.size.height}px`,
        zIndex: zIndex !== undefined ? zIndex : 'auto',
      }}
    >
      <div className="json-element__display">
        <Editor
          height="100%"
          language="json"
          value={element.content}
          theme="vs-dark"
          options={{
            readOnly: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            fontSize: 12,
            lineNumbers: 'off',
            wordWrap: 'on',
          }}
        />
      </div>
    </div>
  );
};

export default JsonElement;
