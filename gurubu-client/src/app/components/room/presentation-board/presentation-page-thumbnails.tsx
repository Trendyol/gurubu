"use client";

import React from "react";
import { PresentationInfo } from "@/shared/interfaces";
import { usePresentationRoom } from "@/contexts/PresentationRoomContext";
import { usePresentationSocket } from "@/contexts/PresentationSocketContext";

interface PresentationPageThumbnailsProps {
  presentationId: string;
}

const PresentationPageThumbnails = ({ presentationId }: PresentationPageThumbnailsProps) => {
  const { presentationInfo, userInfo } = usePresentationRoom();
  const socket = usePresentationSocket();

  const handlePageClick = (pageIndex: number) => {
    if (!userInfo.lobby) return;
    socket.emit("setCurrentPage", presentationId, pageIndex, userInfo.lobby.credentials);
  };

  const handleDeletePage = (pageId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userInfo.lobby || !presentationInfo) return;
    if (presentationInfo.pages.length <= 1) return;
    
    const confirmDelete = window.confirm("Are you sure you want to delete this page?");
    if (confirmDelete) {
      socket.emit("deletePage", presentationId, pageId, userInfo.lobby.credentials);
    }
  };

  const handleAddPage = (afterPageId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userInfo.lobby || !presentationInfo) return;
    socket.emit("addPage", presentationId, afterPageId, userInfo.lobby.credentials);
  };

  if (!presentationInfo?.pages) return null;

  const isOwner = userInfo.lobby && presentationInfo.owner === Number(userInfo.lobby.userID);

  return (
    <div className="presentation-page-thumbnails">
      <div className="presentation-page-thumbnails__container">
        {presentationInfo.pages.map((page, index) => {
          const isCurrentPage = index === (presentationInfo.currentPage || 0);
          return (
            <React.Fragment key={page.id}>
              <div
                className={`presentation-page-thumbnail ${isCurrentPage ? 'active' : ''}`}
                onClick={() => handlePageClick(index)}
              >
                <div className="presentation-page-thumbnail__preview">
                  <div
                    className="presentation-page-thumbnail__content"
                    style={{
                      backgroundColor: page.background?.gradient ? undefined : (page.background?.color || '#ffffff'),
                      background: page.background?.gradient || page.background?.color || '#ffffff',
                    }}
                  >
                    {page.elements.map((element) => {
                      // Use actual page dimensions and thumbnail dimensions for proper scaling
                      const pageWidth = 960; // Standard page width
                      const pageHeight = 540; // Standard page height
                      const thumbWidth = 120; // Thumbnail width
                      const thumbHeight = 67.5; // Thumbnail height (16:9 ratio)
                      
                      const scaleX = thumbWidth / pageWidth;
                      const scaleY = thumbHeight / pageHeight;
                      
                      return (
                        <div
                          key={element.id}
                          className="presentation-page-thumbnail__element"
                          style={{
                            position: 'absolute',
                            left: `${element.position.x * scaleX}px`,
                            top: `${element.position.y * scaleY}px`,
                            width: `${element.size.width * scaleX}px`,
                            height: `${element.size.height * scaleY}px`,
                            fontSize: '6px',
                            overflow: 'hidden',
                            backgroundColor: element.type === 'text' || element.type === 'heading' ? 'transparent' : '#e0e0e0',
                            border: element.type === 'text' || element.type === 'heading' ? 'none' : '1px solid #ccc',
                            borderRadius: '2px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {element.type === 'heading' || element.type === 'text' ? (
                            <span style={{ 
                              fontSize: '5px', 
                              padding: '1px',
                              wordBreak: 'break-word',
                              lineHeight: '1.2',
                            }}>
                              {element.content.substring(0, 20)}
                            </span>
                          ) : element.type === 'image' || element.type === 'gif' || element.type === 'animation' ? (
                            element.content && element.content.startsWith('http') ? (
                              <img 
                                src={element.content} 
                                alt="" 
                                style={{ 
                                  width: '100%', 
                                  height: '100%', 
                                  objectFit: 'cover' 
                                }} 
                              />
                            ) : (
                              <span style={{ fontSize: '8px' }}>
                                {element.type === 'gif' ? '🎬' : element.type === 'animation' ? '✨' : '🖼️'}
                              </span>
                            )
                          ) : element.type === 'code' ? (
                            <span style={{ fontSize: '6px', fontFamily: 'monospace' }}>💻</span>
                          ) : element.type === 'video' ? (
                            <span style={{ fontSize: '8px' }}>🎥</span>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                  {isOwner && presentationInfo.pages.length > 1 && (
                    <button
                      className="presentation-page-thumbnail__delete"
                      onClick={(e) => handleDeletePage(page.id, e)}
                      title="Delete page"
                    >
                      ×
                    </button>
                  )}
                </div>
                <div className="presentation-page-thumbnail__info">
                  <span className="presentation-page-thumbnail__number">{index + 1}</span>
                </div>
              </div>
              {isOwner && (
                <button
                  className="presentation-page-thumbnail__add"
                  onClick={(e) => handleAddPage(page.id, e)}
                  title="Add page after this"
                >
                  +
                </button>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default PresentationPageThumbnails;
