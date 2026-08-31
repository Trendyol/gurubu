"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { PresentationElement } from "@/shared/interfaces";
import { usePresentationRoom } from "@/contexts/PresentationRoomContext";
import { usePresentationSocket } from "@/contexts/PresentationSocketContext";
import ResizeHandles from "../presentation-board/resize-handles";
import { snapToGrid } from "@/utils/gridUtils";
import { getHelloWorldExample } from "@/utils/codeExamples";
import Editor from "@monaco-editor/react";
import { IconPlayerPlay, IconCode, IconSettings } from "@tabler/icons-react";
import * as monaco from "monaco-editor";
import type { editor } from "monaco-editor";

interface CodeElementProps {
  element: PresentationElement;
  isEditing?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
  onUpdate?: (updates: any) => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  zIndex?: number;
  pageId: string;
  presentationId?: string;
}

// Language to Monaco language mapping
const LANGUAGE_MAP: Record<string, string> = {
  javascript: 'javascript',
  typescript: 'typescript',
  python: 'python',
  html: 'html',
};

const CodeElement = ({ element, isEditing = false, isSelected = false, onSelect, onUpdate, onContextMenu, zIndex, pageId, presentationId }: CodeElementProps) => {
  const [output, setOutput] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [htmlPreview, setHtmlPreview] = useState<string>("");
  const [isRunning, setIsRunning] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [showSettings, setShowSettings] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [theme, setTheme] = useState<'vs-dark' | 'vs' | 'hc-black'>('vs-dark');
  const [wordWrap, setWordWrap] = useState<'on' | 'off'>('on');
  const [minimap, setMinimap] = useState(false);
  const [lineNumbers, setLineNumbers] = useState<'on' | 'off'>('on');
  const [pendingContent, setPendingContent] = useState<string>(element.content);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);
  const { presentationInfo, userInfo } = usePresentationRoom();
  const socket = usePresentationSocket();
  // Ensure only supported languages are used, fallback to javascript
  const rawLanguage = element.style?.language || 'javascript';
  const language = LANGUAGE_MAP[rawLanguage] ? rawLanguage : 'javascript';
  const monacoLanguage = LANGUAGE_MAP[language] || 'javascript';

  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
    
    // Configure editor options
    editor.updateOptions({
      fontSize,
      wordWrap: wordWrap,
      minimap: { enabled: minimap },
      lineNumbers: lineNumbers,
      scrollBeyondLastLine: false,
      automaticLayout: true,
      tabSize: 2,
      insertSpaces: true,
      formatOnPaste: true,
      formatOnType: true,
      suggestOnTriggerCharacters: true,
      quickSuggestions: true,
      acceptSuggestionOnEnter: 'on',
      acceptSuggestionOnCommitCharacter: true,
      snippetSuggestions: 'top',
      wordBasedSuggestions: 'matchingDocuments',
      parameterHints: { enabled: true },
      hover: { enabled: true },
      colorDecorators: true,
      bracketPairColorization: { enabled: true },
      guides: {
        bracketPairs: true,
        indentation: true,
      },
    });

    // Add custom keybindings
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      executeCode();
    });
    
    // Add format shortcut
    editor.addCommand(monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF, () => {
      editor.getAction('editor.action.formatDocument')?.run();
    });
  };

  useEffect(() => {
    setPendingContent(element.content);
  }, [element.content]);

  useEffect(() => {
    if (!isEditing || !userInfo.lobby || !presentationId) return;
    
    const timer = setTimeout(() => {
      if (pendingContent !== element.content) {
        socket.emit("updateElement", 
          presentationId,
          pageId,
          element.id,
          { content: pendingContent },
          userInfo.lobby.credentials
        );
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [pendingContent, isEditing, userInfo.lobby, presentationId, pageId, element.id, element.content, socket]);

  const handleEditorChange = useCallback((value: string | undefined) => {
    if (value !== undefined) {
      setPendingContent(value);
    }
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    if (!isEditing) return;
    const target = e.target as HTMLElement;
    if (target.closest('.monaco-editor') || 
        target.closest('button') ||
        target.closest('select') ||
        target.closest('.code-element__settings-panel')) return;
    onSelect?.();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isEditing) return;
    const target = e.target as HTMLElement;
    if (target.closest('.monaco-editor') || 
        target.closest('button') ||
        target.closest('select') ||
        target.closest('.code-element__settings-panel')) return;
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

  const executeCode = async () => {
    const contentToExecute = pendingContent || element.content;
    if (!contentToExecute || isRunning) return;
    
    setIsRunning(true);
    setOutput("");
    setError("");
    setHtmlPreview("");

    try {
      if (language === 'javascript' || language === 'typescript') {
        const outputs: string[] = [];
        const originalConsoleLog = console.log;
        
        console.log = (...args: any[]) => {
          outputs.push(args.map(a => {
            if (typeof a === 'object') {
              try {
                return JSON.stringify(a, null, 2);
              } catch {
                return String(a);
              }
            }
            return String(a);
          }).join(' '));
        };

        try {
          const func = new Function(contentToExecute);
          const result = func();
          
          if (outputs.length === 0 && result !== undefined) {
            outputs.push(String(result));
          }
        } catch (execError: any) {
          setError(execError.message || "Execution error");
          return;
        } finally {
          console.log = originalConsoleLog;
        }
        
        setOutput(outputs.join('\n') || 'No output');
      } else if (language === 'python') {
        // Python execution via backend API
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
          const response = await fetch(`${apiUrl}/code/execute`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              language: 'python',
              code: contentToExecute,
              timeout: 5000
            })
          });

          const result = await response.json();
          
          if (result.success) {
            setOutput(result.output || 'No output');
            if (result.error) {
              setError(result.error);
            }
          } else {
            setError(result.error || 'Execution failed');
          }
        } catch (fetchError: any) {
          setError(fetchError.message || 'Failed to execute Python code');
        }
      } else if (language === 'html') {
        // HTML preview render
        setHtmlPreview(contentToExecute);
        setOutput("HTML rendered in preview below");
      }
    } catch (err: any) {
      setError(err.message || "Execution error");
    } finally {
      setIsRunning(false);
    }
  };

  const handleLanguageChange = (newLanguage: string) => {
    if (userInfo.lobby && presentationId) {
      const helloWorldCode = getHelloWorldExample(newLanguage);
      socket.emit("updateElement",
        presentationId,
        pageId,
        element.id,
        { 
          style: { ...element.style, language: newLanguage },
          content: helloWorldCode
        },
        userInfo.lobby.credentials
      );
    }
  };

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
    
    // Trigger editor layout update
    setTimeout(() => {
      editorRef.current?.layout();
    }, 100);
  };

  const formatCode = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument')?.run();
    }
  };

  if (isEditing) {
    return (
      <div
        ref={elementRef}
        className={`code-element ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''}`}
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
        <div className="code-element__header">
          <div className="code-element__header-left">
            <IconCode size={16} />
            <select
              value={language}
              onChange={(e) => {
                e.stopPropagation();
                handleLanguageChange(e.target.value);
              }}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              className="code-element__language-select"
            >
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python</option>
              <option value="html">HTML/CSS</option>
            </select>
            {presentationInfo?.pages && presentationInfo.pages.length > 1 && (
              <select
                value={element.style?.referencedPageId || ''}
                onChange={(e) => {
                  e.stopPropagation();
                  if (userInfo.lobby && presentationId) {
                    socket.emit("updateElement",
                      presentationId,
                      pageId,
                      element.id,
                      { 
                        style: { ...element.style, referencedPageId: e.target.value || undefined }
                      },
                      userInfo.lobby.credentials
                    );
                  }
                }}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                title="Reference Page"
                className="code-element__page-reference"
              >
                <option value="">No reference</option>
                {presentationInfo.pages.map((page, index) => (
                  page.id !== pageId && (
                    <option key={page.id} value={page.id}>
                      Page {index + 1}
                    </option>
                  )
                ))}
              </select>
            )}
          </div>
          <div className="code-element__header-right">
            <button
              onClick={(e) => {
                e.stopPropagation();
                formatCode();
              }}
              className="code-element__format-btn"
              title="Format Code (Shift+Alt+F)"
            >
              Format
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowSettings(!showSettings);
              }}
              className={`code-element__settings-btn ${showSettings ? 'active' : ''}`}
              title="Editor Settings"
            >
              <IconSettings size={16} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                executeCode();
              }}
              disabled={isRunning}
              className="code-element__run-btn"
              title="Run Code (Ctrl+Enter)"
            >
              <IconPlayerPlay size={14} />
              {isRunning ? "Running..." : "Run"}
            </button>
          </div>
        </div>

        {showSettings && (
          <div className="code-element__settings-panel" onClick={(e) => e.stopPropagation()}>
            <div className="code-element__settings-row">
              <label>Font Size</label>
              <input
                type="number"
                min="10"
                max="24"
                value={fontSize}
                onChange={(e) => {
                  const size = parseInt(e.target.value) || 14;
                  setFontSize(size);
                  editorRef.current?.updateOptions({ fontSize: size });
                }}
              />
            </div>
            <div className="code-element__settings-row">
              <label>Theme</label>
              <select
                value={theme}
                onChange={(e) => {
                  const newTheme = e.target.value as 'vs-dark' | 'vs' | 'hc-black';
                  setTheme(newTheme);
                }}
              >
                <option value="vs-dark">Dark</option>
                <option value="vs">Light</option>
                <option value="hc-black">High Contrast</option>
              </select>
            </div>
            <div className="code-element__settings-row">
              <label>
                <input
                  type="checkbox"
                  checked={wordWrap === 'on'}
                  onChange={(e) => {
                    const wrap = e.target.checked ? 'on' : 'off';
                    setWordWrap(wrap);
                    editorRef.current?.updateOptions({ wordWrap: wrap });
                  }}
                />
                Word Wrap
              </label>
            </div>
            <div className="code-element__settings-row">
              <label>
                <input
                  type="checkbox"
                  checked={minimap}
                  onChange={(e) => {
                    setMinimap(e.target.checked);
                    editorRef.current?.updateOptions({ minimap: { enabled: e.target.checked } });
                  }}
                />
                Minimap
              </label>
            </div>
            <div className="code-element__settings-row">
              <label>
                <input
                  type="checkbox"
                  checked={lineNumbers === 'on'}
                  onChange={(e) => {
                    const lines = e.target.checked ? 'on' : 'off';
                    setLineNumbers(lines);
                    editorRef.current?.updateOptions({ lineNumbers: lines });
                  }}
                />
                Line Numbers
              </label>
            </div>
          </div>
        )}

        <div className="code-element__editor-wrapper">
          <Editor
            height="100%"
            language={monacoLanguage}
            value={pendingContent}
            theme={theme}
            onChange={handleEditorChange}
            onMount={handleEditorDidMount}
            loading={<div className="code-element__loading">Loading editor...</div>}
            options={{
              fontSize,
              wordWrap: wordWrap,
              minimap: { enabled: minimap },
              lineNumbers: lineNumbers,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              insertSpaces: true,
              formatOnPaste: true,
              formatOnType: true,
              suggestOnTriggerCharacters: true,
              quickSuggestions: true,
              acceptSuggestionOnEnter: 'on',
              acceptSuggestionOnCommitCharacter: true,
              snippetSuggestions: 'top',
              wordBasedSuggestions: 'matchingDocuments',
              parameterHints: { enabled: true },
              hover: { enabled: true },
              colorDecorators: true,
              bracketPairColorization: { enabled: true },
              guides: {
                bracketPairs: true,
                indentation: true,
              },
              readOnly: !isEditing,
            }}
          />
        </div>

        {(output || error || htmlPreview) && (
          <div className="code-element__output-panel">
            {htmlPreview && (
              <div className="code-element__html-preview">
                <strong>Preview:</strong>
                <iframe
                  srcDoc={htmlPreview}
                  style={{
                    width: '100%',
                    height: '300px',
                    border: '1px solid #333',
                    borderRadius: '4px',
                    backgroundColor: '#fff'
                  }}
                  sandbox="allow-scripts"
                  title="HTML Preview"
                />
              </div>
            )}
            {output && (
              <div className="code-element__output">
                <strong>Output:</strong>
                <pre>{output}</pre>
              </div>
            )}
            {error && (
              <div className="code-element__error">
                <strong>Error:</strong>
                <pre>{error}</pre>
              </div>
            )}
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
      className={`code-element ${isSelected ? 'selected' : ''}`}
      style={{
        position: 'absolute',
        left: `${element.position.x}px`,
        top: `${element.position.y}px`,
        width: `${element.size.width}px`,
        height: `${element.size.height}px`,
        zIndex: zIndex !== undefined ? zIndex : 'auto',
      }}
    >
      <div className="code-element__display">
        <Editor
          height="100%"
          language={monacoLanguage}
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

export default CodeElement;
