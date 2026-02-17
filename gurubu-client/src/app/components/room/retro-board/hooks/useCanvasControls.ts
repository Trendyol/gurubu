"use client";

import { useState, useRef, useEffect } from "react";

interface UseCanvasControlsParams {
  templateReady: boolean;
}

export const useCanvasControls = ({ templateReady }: UseCanvasControlsParams) => {
  const canvasViewportRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const panOriginRef = useRef({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState(0.66);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const panRef = useRef(pan);
  const zoomRef = useRef(zoomLevel);
  const isPanningRef = useRef(isPanning);

  useEffect(() => { panRef.current = pan; }, [pan]);
  useEffect(() => { zoomRef.current = zoomLevel; }, [zoomLevel]);
  useEffect(() => { isPanningRef.current = isPanning; }, [isPanning]);

  // Center canvas on first load
  const hasCenteredRef = useRef(false);
  useEffect(() => {
    if (!templateReady || !canvasViewportRef.current || hasCenteredRef.current) return;
    hasCenteredRef.current = true;
    const vp = canvasViewportRef.current;
    const rect = vp.getBoundingClientRect();
    const initialZoom = 0.66;
    const offsetX = (rect.width * (1 - initialZoom)) / 2;
    const offsetY = (rect.height * (1 - initialZoom)) / 2;
    setPan({ x: offsetX, y: offsetY });
  }, [templateReady]);

  // Zoom toward center of viewport
  const zoomTowardCenter = (newZoom: number) => {
    const vp = canvasViewportRef.current;
    if (!vp) { setZoomLevel(newZoom); return; }
    const rect = vp.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const sf = newZoom / zoomLevel;
    setPan(prev => ({
      x: cx - sf * (cx - prev.x),
      y: cy - sf * (cy - prev.y),
    }));
    setZoomLevel(newZoom);
  };

  const handleZoomIn = () => zoomTowardCenter(Math.min(zoomLevel * 1.2, 3));
  const handleZoomOut = () => zoomTowardCenter(Math.max(zoomLevel / 1.2, 0.2));
  const handleZoomReset = () => {
    setZoomLevel(1);
    setPan({ x: 0, y: 0 });
  };

  // Wheel handler: two-finger scroll → PAN, pinch/ctrl+scroll → ZOOM
  useEffect(() => {
    const vp = canvasViewportRef.current;
    if (!vp) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      if (e.ctrlKey || e.metaKey) {
        const rect = vp.getBoundingClientRect();
        const cx = e.clientX - rect.left;
        const cy = e.clientY - rect.top;
        const delta = -e.deltaY * 0.01;

        setZoomLevel(prevZoom => {
          const newZoom = Math.min(3, Math.max(0.2, prevZoom * (1 + delta)));
          const sf = newZoom / prevZoom;
          setPan(prevPan => ({
            x: cx - sf * (cx - prevPan.x),
            y: cy - sf * (cy - prevPan.y),
          }));
          return newZoom;
        });
      } else {
        setPan(prev => ({
          x: prev.x - e.deltaX,
          y: prev.y - e.deltaY,
        }));
      }
    };

    vp.addEventListener('wheel', handleWheel, { passive: false });
    return () => vp.removeEventListener('wheel', handleWheel);
  }, [templateReady]);

  // Canvas panning via mouse drag
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.closest('.retro-card') ||
      target.closest('button') ||
      target.closest('label') ||
      target.closest('.retro-column__new-card') ||
      target.closest('.retro-sidebar') ||
      target.closest('.retro-action-panel') ||
      target.closest('input') ||
      target.closest('textarea') ||
      target.closest('.retro-board-image') ||
      target.closest('.retro-column__header-image--repositioning') ||
      target.closest('.retro-column__add-btn')
    ) {
      return;
    }

    setIsPanning(true);
    panStartRef.current = { x: e.clientX, y: e.clientY };
    panOriginRef.current = { x: pan.x, y: pan.y };
    e.preventDefault();
  };

  useEffect(() => {
    if (!isPanning) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPan({
        x: panOriginRef.current.x + (e.clientX - panStartRef.current.x),
        y: panOriginRef.current.y + (e.clientY - panStartRef.current.y),
      });
    };

    const handleMouseUp = () => setIsPanning(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isPanning]);

  return {
    canvasViewportRef,
    isPanning,
    zoomLevel,
    pan,
    setPan,
    panRef,
    zoomRef,
    isPanningRef,
    handleZoomIn,
    handleZoomOut,
    handleZoomReset,
    handleCanvasMouseDown,
  };
};
