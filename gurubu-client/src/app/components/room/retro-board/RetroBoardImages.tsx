"use client";

interface BoardImage {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface RetroBoardImagesProps {
  images: BoardImage[];
  draggingImage: string | null;
  resizingImage: any;
  onImageMouseDown: (e: React.MouseEvent, imageId: string) => void;
  onRemoveImage: (imageId: string) => void;
  onResizeStart: (e: React.MouseEvent, imageId: string) => void;
}

const RetroBoardImages = ({
  images,
  draggingImage,
  resizingImage,
  onImageMouseDown,
  onRemoveImage,
  onResizeStart,
}: RetroBoardImagesProps) => {
  return (
    <>
      {images.map((image) => (
        <div
          key={image.id}
          className={`retro-board-image ${draggingImage === image.id ? "dragging" : ""} ${
            resizingImage?.id === image.id ? "resizing" : ""
          }`}
          style={{
            left: `${image.x}px`,
            top: `${image.y}px`,
            width: `${image.width}px`,
            height: `${image.height}px`,
          }}
          onMouseDown={(e) => onImageMouseDown(e, image.id)}
        >
          <img src={image.src} alt="Board" draggable={false} />
          <button
            className="retro-board-image__remove"
            onClick={() => onRemoveImage(image.id)}
            title="Remove"
          >
            ×
          </button>
          <div
            className="retro-board-image__resize-handle"
            onMouseDown={(e) => onResizeStart(e, image.id)}
          />
        </div>
      ))}
    </>
  );
};

export default RetroBoardImages;
