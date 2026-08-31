// Grid utilities for presentation elements
export const GRID_SIZE = 10; // Grid size in pixels

export const snapToGrid = (value: number): number => {
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
};

export const snapPositionToGrid = (position: { x: number; y: number }): { x: number; y: number } => {
  return {
    x: snapToGrid(position.x),
    y: snapToGrid(position.y),
  };
};
