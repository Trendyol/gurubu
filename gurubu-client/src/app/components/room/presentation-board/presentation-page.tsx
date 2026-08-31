"use client";

import { PresentationPage as PresentationPageType } from "@/shared/interfaces";
import { motion, AnimatePresence } from "framer-motion";
import HeadingElement from "../presentation-elements/HeadingElement";
import TextElement from "../presentation-elements/TextElement";
import ImageElement from "../presentation-elements/ImageElement";
import CodeElement from "../presentation-elements/CodeElement";
import VideoElement from "../presentation-elements/VideoElement";
import ChartElement from "../presentation-elements/ChartElement";
import TableElement from "../presentation-elements/TableElement";
import JsonElement from "../presentation-elements/JsonElement";

interface PresentationPageProps {
  page: PresentationPageType;
  isEditing?: boolean;
  selectedElementId?: string | null;
  onSelectElement?: (id: string | null) => void;
  onUpdateElement?: (elementId: string, updates: any) => void;
  onContextMenu?: (elementId: string, x: number, y: number) => void;
  onEditChartData?: (elementId: string) => void;
  onEditTableData?: (elementId: string) => void;
  pageKey?: string | number;
  presentationId?: string;
}

const getTransitionVariants = (type: string) => {
  switch (type) {
    case 'slide':
      return {
        initial: { x: '100%', opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: '-100%', opacity: 0 },
        transition: { duration: 0.5, ease: 'easeInOut' },
      };
    case 'slide-up':
      return {
        initial: { y: '100%', opacity: 0 },
        animate: { y: 0, opacity: 1 },
        exit: { y: '-100%', opacity: 0 },
        transition: { duration: 0.5, ease: 'easeInOut' },
      };
    case 'slide-down':
      return {
        initial: { y: '-100%', opacity: 0 },
        animate: { y: 0, opacity: 1 },
        exit: { y: '100%', opacity: 0 },
        transition: { duration: 0.5, ease: 'easeInOut' },
      };
    case 'zoom':
      return {
        initial: { scale: 0.8, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        exit: { scale: 1.2, opacity: 0 },
        transition: { duration: 0.4, ease: 'easeInOut' },
      };
    case 'zoom-in':
      return {
        initial: { scale: 0.5, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        exit: { scale: 0.5, opacity: 0 },
        transition: { duration: 0.4, ease: 'easeInOut' },
      };
    case 'zoom-out':
      return {
        initial: { scale: 1.5, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        exit: { scale: 1.5, opacity: 0 },
        transition: { duration: 0.4, ease: 'easeInOut' },
      };
    case 'rotate':
      return {
        initial: { rotate: -180, opacity: 0 },
        animate: { rotate: 0, opacity: 1 },
        exit: { rotate: 180, opacity: 0 },
        transition: { duration: 0.6, ease: 'easeInOut' },
      };
    case 'flip':
      return {
        initial: { rotateY: -90, opacity: 0 },
        animate: { rotateY: 0, opacity: 1 },
        exit: { rotateY: 90, opacity: 0 },
        transition: { duration: 0.6, ease: 'easeInOut' },
      };
    case 'cube':
      return {
        initial: { rotateX: -90, opacity: 0 },
        animate: { rotateX: 0, opacity: 1 },
        exit: { rotateX: 90, opacity: 0 },
        transition: { duration: 0.6, ease: 'easeInOut' },
      };
    case 'blur':
      return {
        initial: { filter: 'blur(20px)', opacity: 0 },
        animate: { filter: 'blur(0px)', opacity: 1 },
        exit: { filter: 'blur(20px)', opacity: 0 },
        transition: { duration: 0.5, ease: 'easeInOut' },
      };
    case 'fade':
    default:
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.4, ease: 'easeInOut' },
      };
  }
};

const getElementAnimation = (animation: any) => {
  if (!animation) return {};
  
  const variants: any = {
    initial: {},
    animate: {},
  };

  switch (animation.type) {
    case 'fade-in':
      variants.initial = { opacity: 0 };
      variants.animate = { opacity: 1 };
      break;
    case 'slide-in':
      variants.initial = { x: -50, opacity: 0 };
      variants.animate = { x: 0, opacity: 1 };
      break;
    case 'zoom-in':
      variants.initial = { scale: 0, opacity: 0 };
      variants.animate = { scale: 1, opacity: 1 };
      break;
    default:
      return {};
  }

  return {
    variants,
    transition: {
      duration: animation.duration ? animation.duration / 1000 : 0.5,
      delay: animation.delay ? animation.delay / 1000 : 0,
    },
  };
};

const PresentationPage = ({ page, isEditing = false, selectedElementId, onSelectElement, onUpdateElement, onContextMenu, onEditChartData, onEditTableData, pageKey, presentationId }: PresentationPageProps) => {
  const renderElement = (element: any, index: number) => {
    const isSelected = selectedElementId === element.id;
    
    const commonProps = {
      element: element,
      isEditing,
      isSelected,
      onSelect: () => onSelectElement?.(element.id),
      onUpdate: (updates: any) => onUpdateElement?.(element.id, updates),
      onContextMenu: isEditing && onContextMenu ? (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onContextMenu(element.id, e.clientX, e.clientY);
      } : undefined,
      zIndex: element.zIndex !== undefined ? element.zIndex : index + 1000, // Use element zIndex or fallback to index
    };
    
    switch (element.type) {
      case 'heading':
        return <HeadingElement key={element.id} {...commonProps} />;
      case 'text':
        return <TextElement key={element.id} {...commonProps} />;
      case 'image':
        return <ImageElement key={element.id} {...commonProps} pageId={page.id} />;
      case 'code':
        return <CodeElement key={element.id} {...commonProps} pageId={page.id} presentationId={presentationId} />;
      case 'video':
        return <VideoElement key={element.id} {...commonProps} pageId={page.id} />;
      case 'gif':
      case 'animation':
        return <ImageElement key={element.id} {...commonProps} pageId={page.id} />;
      case 'chart':
        return <ChartElement key={element.id} {...commonProps} onEditData={onEditChartData ? () => onEditChartData(element.id) : undefined} pageId={page.id} presentationId={presentationId} />;
      case 'table':
        return <TableElement key={element.id} {...commonProps} onEditData={onEditTableData ? () => onEditTableData(element.id) : undefined} pageId={page.id} presentationId={presentationId} />;
      case 'json':
        return <JsonElement key={element.id} {...commonProps} pageId={page.id} />;
      default:
        return null;
    }
  };

  const transitionType = page.transition?.type || 'fade';
  const transitionVariants = getTransitionVariants(transitionType);

  const GRID_SIZE = 10; // Grid size in pixels

  const pageContent = (
    <div
      className="presentation-page"
      data-page-id={page.id}
      style={{
        backgroundColor: page.background?.gradient ? undefined : (page.background?.color || '#ffffff'),
        backgroundImage: page.background?.gradient 
          ? undefined 
          : page.background?.image 
            ? `url(${page.background.image})` 
            : undefined,
        background: page.background?.gradient || page.background?.color || '#ffffff',
        position: 'relative',
      }}
      data-grid-size={GRID_SIZE}
    >
      {page.elements.map((element, index) => {
        const elementKey = `${page.id}-${element.id}-${index}`;
        
        if (!isEditing && element.animation) {
          const elementAnimation = getElementAnimation(element.animation);
          if (elementAnimation.variants) {
            return (
              <motion.div
                key={elementKey}
                initial={elementAnimation.variants.initial}
                animate={elementAnimation.variants.animate}
                transition={elementAnimation.transition}
                style={{ 
                  position: 'absolute',
                  left: `${element.position.x}px`,
                  top: `${element.position.y}px`,
                  width: `${element.size.width}px`,
                  height: `${element.size.height}px`,
                  zIndex: index,
                }}
              >
                {renderElement(element, index)}
              </motion.div>
            );
          }
        }
        
        return renderElement(element, index);
      })}
    </div>
  );

  if (isEditing) {
    return pageContent;
  }

  return (
    <motion.div
      key={`page-${page.id}-${pageKey || ''}`}
      initial={transitionVariants.initial}
      animate={transitionVariants.animate}
      exit={transitionVariants.exit}
      transition={{ duration: (page.transition?.duration || 500) / 1000 }}
      style={{ width: '100%', height: '100%' }}
    >
      {pageContent}
    </motion.div>
  );
};

export default PresentationPage;
