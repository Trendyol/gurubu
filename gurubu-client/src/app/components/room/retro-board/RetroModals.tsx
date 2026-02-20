"use client";

import React from "react";
import { sanitizeForInnerHTML } from "@/shared/utils/sanitizeHTML";

interface ImportedColumn {
  column: string;
  cards: Array<{ text: string; author?: string }>;
}

interface RetroModalsProps {
  // Import Modal
  showImportModal: boolean;
  importData: ImportedColumn[] | null;
  importColumnMapping: Record<string, string>;
  mainColumns: any[];
  sideColumns: any[];
  onImportColumnMappingChange: (mapping: Record<string, string>) => void;
  onConfirmImport: () => void;
  onCloseImportModal: () => void;

  // Previous Actions Modal
  showPreviousActions: boolean;
  previousActionItems: any;
  previousRetroTitle: string;
  onClosePreviousActions: () => void;

  // End Retro Modal
  showEndRetroModal: boolean;
  endRetroReport: string | null;
  retroTitle: string;
  isOwner: boolean;
  onEndRetroConfirm: () => void;
}

const RetroModals = ({
  showImportModal,
  importData,
  importColumnMapping,
  mainColumns,
  sideColumns,
  onImportColumnMappingChange,
  onConfirmImport,
  onCloseImportModal,
  showPreviousActions,
  previousActionItems,
  previousRetroTitle,
  onClosePreviousActions,
  showEndRetroModal,
  endRetroReport,
  retroTitle,
  isOwner,
  onEndRetroConfirm,
}: RetroModalsProps) => {
  return (
    <>
      {/* Import Modal */}
      {showImportModal && importData && (
        <div className="retro-import-modal__overlay" onClick={onCloseImportModal}>
          <div className="retro-import-modal" onClick={(e) => e.stopPropagation()}>
            <div className="retro-import-modal__header">
              <h3>Import Cards</h3>
              <button onClick={onCloseImportModal} className="retro-import-modal__close">×</button>
            </div>
            <div className="retro-import-modal__body">
              <p className="retro-import-modal__description">
                Map imported columns to your retro columns. {importData.reduce((sum, col) => sum + col.cards.length, 0)} cards found.
              </p>
              {importData.map((importCol) => (
                <div key={importCol.column} className="retro-import-modal__mapping">
                  <div className="retro-import-modal__source">
                    <span className="retro-import-modal__label">{importCol.column}</span>
                    <span className="retro-import-modal__count">{importCol.cards.length} cards</span>
                  </div>
                  <span className="retro-import-modal__arrow">→</span>
                  <select
                    className="retro-import-modal__select"
                    value={importColumnMapping[importCol.column] || ''}
                    onChange={(e) => onImportColumnMappingChange({
                      ...importColumnMapping,
                      [importCol.column]: e.target.value,
                    })}
                  >
                    <option value="">Skip</option>
                    {mainColumns.map((col: any) => (
                      <option key={col.key} value={col.key}>{col.title}</option>
                    ))}
                    {sideColumns.map((col: any) => (
                      <option key={col.key} value={col.key}>{col.title}</option>
                    ))}
                  </select>
                </div>
              ))}
              <div className="retro-import-modal__preview">
                <h4>Preview</h4>
                {importData.map((importCol) => {
                  const targetKey = importColumnMapping[importCol.column];
                  if (!targetKey) return null;
                  const targetCol = [...mainColumns, ...sideColumns].find((c: any) => c.key === targetKey);
                  return (
                    <div key={importCol.column} className="retro-import-modal__preview-group">
                      <span className="retro-import-modal__preview-target">{targetCol?.title || targetKey}:</span>
                      <div className="retro-import-modal__preview-cards">
                        {importCol.cards.slice(0, 3).map((card, i) => (
                          <span key={i} className="retro-import-modal__preview-card">{card.text.substring(0, 60)}{card.text.length > 60 ? '...' : ''}</span>
                        ))}
                        {importCol.cards.length > 3 && (
                          <span className="retro-import-modal__preview-more">+{importCol.cards.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="retro-import-modal__footer">
              <button className="retro-import-modal__btn retro-import-modal__btn--cancel" onClick={onCloseImportModal}>
                Cancel
              </button>
              <button className="retro-import-modal__btn retro-import-modal__btn--confirm" onClick={onConfirmImport}>
                Import {importData.reduce((sum, col) => sum + (importColumnMapping[col.column] ? col.cards.length : 0), 0)} Cards
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Previous Action Items Panel */}
      {showPreviousActions && previousActionItems && (
        <div className="retro-prev-actions__overlay" onClick={onClosePreviousActions}>
          <div className="retro-prev-actions" onClick={(e) => e.stopPropagation()}>
            <div className="retro-prev-actions__header">
              <div>
                <h3>Previous Action Items</h3>
                <span className="retro-prev-actions__subtitle">{previousRetroTitle}</span>
              </div>
              <button onClick={onClosePreviousActions} className="retro-prev-actions__close">×</button>
            </div>
            <div className="retro-prev-actions__body">
              {Object.entries(previousActionItems).map(([key, col]: [string, any]) => (
                <div key={key} className="retro-prev-actions__section">
                  <h4 className="retro-prev-actions__section-title">{col.title}</h4>
                  {col.cards.length === 0 ? (
                    <p className="retro-prev-actions__empty">No items</p>
                  ) : (
                    <ul className="retro-prev-actions__list">
                      {col.cards.map((card: any, index: number) => (
                        <li key={card.id || index} className="retro-prev-actions__item">
                          <span className="retro-prev-actions__number">{index + 1}</span>
                          <div className="retro-prev-actions__content">
                            <p className="retro-prev-actions__text">{card.text}</p>
                            {card.author && (
                              <span className="retro-prev-actions__author">{card.author}</span>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* End Retro Report Modal */}
      {showEndRetroModal && endRetroReport && (
        <div className="retro-end-modal__overlay" onClick={onEndRetroConfirm}>
          <div className="retro-end-modal" onClick={(e) => e.stopPropagation()}>
            <div className="retro-end-modal__header">
              <h2>Retro Completed</h2>
              <p className="retro-end-modal__subtitle">{retroTitle}</p>
            </div>
            <div className="retro-end-modal__body">
              <div 
                className="retro-end-modal__report" 
                dangerouslySetInnerHTML={sanitizeForInnerHTML(
                  endRetroReport
                    .replace(/\n/g, '<br/>')
                    .replace(/^# (.*?)(<br\/>)/gm, '<h3>$1</h3>')
                    .replace(/^## (.*?)(<br\/>)/gm, '<h4>$1</h4>')
                    .replace(/^### (.*?)(<br\/>)/gm, '<h5>$1</h5>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/^- (.*?)(<br\/>)/gm, '<div class="retro-end-modal__item">• $1</div>')
                )} 
              />
            </div>
            <div className="retro-end-modal__footer">
              <p className="retro-end-modal__note">This retro is now read-only. You can still view it but cannot add new cards.</p>
              <div className="retro-end-modal__actions">
                {isOwner && (
                  <button
                    className="retro-end-modal__btn retro-end-modal__btn--download"
                    onClick={() => {
                      const blob = new Blob([endRetroReport], { type: 'text/markdown' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${retroTitle || 'retro'}-report.md`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                  >
                    Download Report
                  </button>
                )}
                <button className="retro-end-modal__btn" onClick={onEndRetroConfirm}>
                  Go to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RetroModals;
