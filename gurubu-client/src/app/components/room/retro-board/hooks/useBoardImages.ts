"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const MAX_HEADER_IMAGE_SIZE_BYTES = 1024 * 1024; // 1MB
const MAX_HEADER_IMAGE_DIMENSION = 1200;

interface UseBoardImagesParams {
  socket: any;
  roomId: string;
  userInfo: any;
  canvasViewportRef: React.RefObject<HTMLDivElement | null>;
  pan: { x: number; y: number };
  zoomLevel: number;
}

export const useBoardImages = ({
  socket,
  roomId,
  userInfo,
  canvasViewportRef,
  pan,
  zoomLevel,
}: UseBoardImagesParams) => {
  const [boardImages, setBoardImages] = useState<Array<{id: string, src: string, x: number, y: number, width: number, height: number}>>([]);
  const [draggingImage, setDraggingImage] = useState<string | null>(null);
  const [resizingImage, setResizingImage] = useState<{id: string, startX: number, startY: number, startWidth: number, startHeight: number} | null>(null);
  const [dragOffset, setDragOffset] = useState<{x: number, y: number} | null>(null);
  const [columnHeaderImages, setColumnHeaderImages] = useState<Record<string, string | null>>({});
  const [columnHeaderImagePositions, setColumnHeaderImagePositions] = useState<Record<string, { x: number; y: number }>>({});

  const handleImageMouseDown = (e: React.MouseEvent, imageId: string) => {
    if ((e.target as HTMLElement).closest('.retro-board-image__remove') ||
        (e.target as HTMLElement).closest('.retro-board-image__resize-handle')) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    const image = boardImages.find(img => img.id === imageId);
    if (image) {
      setDraggingImage(imageId);
      const vpRect = canvasViewportRef.current?.getBoundingClientRect();
      const vpLeft = vpRect?.left || 0;
      const vpTop = vpRect?.top || 0;
      const canvasX = (e.clientX - vpLeft - pan.x) / zoomLevel;
      const canvasY = (e.clientY - vpTop - pan.y) / zoomLevel;
      setDragOffset({
        x: canvasX - image.x,
        y: canvasY - image.y
      });
    }
  };

  const handleImageMouseMove = (e: MouseEvent) => {
    if (!draggingImage || !dragOffset) return;

    const vpRect = canvasViewportRef.current?.getBoundingClientRect();
    const vpLeft = vpRect?.left || 0;
    const vpTop = vpRect?.top || 0;
    const canvasX = (e.clientX - vpLeft - pan.x) / zoomLevel;
    const canvasY = (e.clientY - vpTop - pan.y) / zoomLevel;
    const newX = canvasX - dragOffset.x;
    const newY = canvasY - dragOffset.y;

    setBoardImages(prevImages =>
      prevImages.map(img =>
        img.id === draggingImage ? { ...img, x: newX, y: newY } : img
      )
    );
  };

  const handleImageMouseUp = () => {
    if (draggingImage && userInfo.lobby) {
      setBoardImages(prevImages => {
        socket.emit("updateBoardImages", roomId, prevImages, userInfo.lobby.credentials);
        return prevImages;
      });
    }
    setDraggingImage(null);
    setDragOffset(null);
  };

  useEffect(() => {
    if (draggingImage) {
      window.addEventListener('mousemove', handleImageMouseMove);
      window.addEventListener('mouseup', handleImageMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleImageMouseMove);
        window.removeEventListener('mouseup', handleImageMouseUp);
      };
    }
  }, [draggingImage, dragOffset, boardImages, pan, zoomLevel]);

  const handleRemoveBoardImage = (imageId: string) => {
    const updatedImages = boardImages.filter(img => img.id !== imageId);
    setBoardImages(updatedImages);
    if (userInfo.lobby) {
      socket.emit("updateBoardImages", roomId, updatedImages, userInfo.lobby.credentials);
    }
  };

  const handleResizeStart = (e: React.MouseEvent, imageId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const image = boardImages.find(img => img.id === imageId);
    if (image) {
      setResizingImage({
        id: imageId,
        startX: e.clientX,
        startY: e.clientY,
        startWidth: image.width,
        startHeight: image.height
      });
    }
  };

  const handleResizeMove = (e: MouseEvent) => {
    if (!resizingImage) return;
    const deltaX = (e.clientX - resizingImage.startX) / zoomLevel;
    const aspectRatio = resizingImage.startWidth / resizingImage.startHeight;
    const newWidth = Math.max(100, resizingImage.startWidth + deltaX);
    const newHeight = newWidth / aspectRatio;

    setBoardImages(prevImages =>
      prevImages.map(img =>
        img.id === resizingImage.id ? { ...img, width: newWidth, height: newHeight } : img
      )
    );
  };

  const handleResizeEnd = () => {
    if (resizingImage && userInfo.lobby) {
      setBoardImages(prevImages => {
        socket.emit("updateBoardImages", roomId, prevImages, userInfo.lobby.credentials);
        return prevImages;
      });
    }
    setResizingImage(null);
  };

  useEffect(() => {
    if (resizingImage) {
      window.addEventListener('mousemove', handleResizeMove);
      window.addEventListener('mouseup', handleResizeEnd);
      return () => {
        window.removeEventListener('mousemove', handleResizeMove);
        window.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [resizingImage, boardImages]);

  const handleBoardImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const result = event.target?.result as string;
          const img = new Image();
          img.onload = () => {
            try {
              const maxSize = 300;
              let width = img.naturalWidth;
              let height = img.naturalHeight;
              if (width > maxSize || height > maxSize) {
                const ratio = Math.min(maxSize / width, maxSize / height);
                width = width * ratio;
                height = height * ratio;
              }
              const newImage = {
                id: Date.now().toString(),
                src: result,
                x: -99999,
                y: -99999,
                width,
                height
              };
              const updatedImages = [...boardImages, newImage];
              setBoardImages(updatedImages);
              if (userInfo.lobby) {
                socket.emit("updateBoardImages", roomId, updatedImages, userInfo.lobby.credentials);
              }
            } catch (err) {
              console.error("Board image process error:", err);
              toast.error("Failed to process image");
            }
          };
          img.onerror = () => toast.error("Invalid image file");
          img.src = result;
        } catch (err) {
          console.error("Board image load error:", err);
          toast.error("Failed to load image");
        }
      };
      reader.onerror = () => toast.error("Failed to read file");
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Board image upload error:", err);
      toast.error("Failed to upload image");
    }
    e.target.value = "";
  };

  const handleImageDragStart = (image: any, e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', image.id);
    return image;
  };

  const handleDropImageOnColumn = (e: React.DragEvent, image: any) => {
    const vpRect = canvasViewportRef.current?.getBoundingClientRect();
    if (!vpRect) return;
    const viewportX = e.clientX - vpRect.left;
    const viewportY = e.clientY - vpRect.top;
    const canvasX = (viewportX - pan.x) / zoomLevel;
    const canvasY = (viewportY - pan.y) / zoomLevel;
    const x = canvasX - image.width / 2;
    const y = canvasY - image.height / 2;

    const updatedImages = boardImages.map(img =>
      img.id === image.id ? { ...img, x, y } : img
    );

    setBoardImages(updatedImages);
    if (userInfo.lobby) {
      socket.emit("updateBoardImages", roomId, updatedImages, userInfo.lobby.credentials);
    }
  };

  const handleColumnHeaderImageUpload = (columnKey: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Tek image: zaten varsa yükleme (UI'da gizli ama yine de guard)
    if (columnHeaderImages[columnKey]) {
      toast.error("Only one image per column. Remove the current image first.");
      return;
    }

    if (file.size > MAX_HEADER_IMAGE_SIZE_BYTES) {
      toast.error("Image must be under 1MB");
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const result = event.target?.result as string;
          const img = new Image();
          img.onload = () => {
            try {
              let width = img.naturalWidth;
              let height = img.naturalHeight;
              if (width > MAX_HEADER_IMAGE_DIMENSION || height > MAX_HEADER_IMAGE_DIMENSION) {
                const ratio = Math.min(MAX_HEADER_IMAGE_DIMENSION / width, MAX_HEADER_IMAGE_DIMENSION / height);
                width = Math.round(width * ratio);
                height = Math.round(height * ratio);
                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                if (ctx) {
                  ctx.drawImage(img, 0, 0, width, height);
                  const resizedBase64 = canvas.toDataURL("image/jpeg", 0.85);
                  const updatedImages = { ...columnHeaderImages, [columnKey]: resizedBase64 };
                  setColumnHeaderImages(updatedImages);
                  if (userInfo.lobby) {
                    socket.emit("updateColumnHeaderImages", roomId, updatedImages, userInfo.lobby.credentials);
                  }
                } else {
                  const updatedImages = { ...columnHeaderImages, [columnKey]: result };
                  setColumnHeaderImages(updatedImages);
                  if (userInfo.lobby) {
                    socket.emit("updateColumnHeaderImages", roomId, updatedImages, userInfo.lobby.credentials);
                  }
                }
              } else {
                const updatedImages = { ...columnHeaderImages, [columnKey]: result };
                setColumnHeaderImages(updatedImages);
                if (userInfo.lobby) {
                  socket.emit("updateColumnHeaderImages", roomId, updatedImages, userInfo.lobby.credentials);
                }
              }
            } catch (err) {
              console.error("Header image process error:", err);
              toast.error("Failed to process image");
            }
          };
          img.onerror = () => toast.error("Invalid image file");
          img.src = result;
        } catch (err) {
          console.error("Header image load error:", err);
          toast.error("Failed to load image");
        }
      };
      reader.onerror = () => toast.error("Failed to read file");
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Header image upload error:", err);
      toast.error("Failed to upload image");
    }
    e.target.value = "";
  };

  const handleRemoveColumnHeaderImage = (columnKey: string) => {
    const updatedImages = { ...columnHeaderImages };
    delete updatedImages[columnKey];
    setColumnHeaderImages(updatedImages);
    if (userInfo.lobby) {
      socket.emit("updateColumnHeaderImages", roomId, updatedImages, userInfo.lobby.credentials);
    }
  };

  const handleColumnHeaderImagePositionUpdate = (columnKey: string, position: { x: number; y: number }) => {
    setColumnHeaderImagePositions(prev => ({ ...prev, [columnKey]: position }));
    if (userInfo.lobby) {
      socket.emit("updateColumnHeaderImagePosition", roomId, columnKey, position, userInfo.lobby.credentials);
    }
  };

  return {
    boardImages,
    setBoardImages,
    draggingImage,
    setDraggingImage,
    resizingImage,
    columnHeaderImages,
    setColumnHeaderImages,
    columnHeaderImagePositions,
    setColumnHeaderImagePositions,
    handleImageMouseDown,
    handleRemoveBoardImage,
    handleResizeStart,
    handleBoardImageUpload,
    handleImageDragStart,
    handleDropImageOnColumn,
    handleColumnHeaderImageUpload,
    handleRemoveColumnHeaderImage,
    handleColumnHeaderImagePositionUpdate,
  };
};
