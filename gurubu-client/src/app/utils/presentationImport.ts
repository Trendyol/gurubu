import { PresentationInfo, PresentationPage, PresentationElement } from "@/shared/interfaces";

export interface ImportOptions {
  format: 'json' | 'pptx' | 'pdf' | 'canva';
}

/**
 * Import presentation from various formats
 */
export async function importPresentation(
  file: File,
  options: ImportOptions
): Promise<Partial<PresentationInfo> | null> {
  try {
    switch (options.format) {
      case 'json':
        return await importFromJSON(file);
      case 'pptx':
        return await importFromPPTX(file);
      case 'pdf':
        return await importFromPDF(file);
      case 'canva':
        return await importFromCanva(file);
      default:
        throw new Error(`Unsupported format: ${options.format}`);
    }
  } catch (error) {
    console.error('Import error:', error);
    throw error;
  }
}

/**
 * Import from JSON format (our native format)
 */
async function importFromJSON(file: File): Promise<Partial<PresentationInfo>> {
  const text = await file.text();
  const data = JSON.parse(text);
  
  // Validate and transform the data
  if (data.pages && Array.isArray(data.pages)) {
    return {
      pages: data.pages.map((page: any, index: number) => ({
        id: page.id || `page-${Date.now()}-${index}`,
        order: page.order ?? index,
        elements: (page.elements || []).map((el: any, elIndex: number) => ({
          id: el.id || `element-${Date.now()}-${index}-${elIndex}`,
          type: el.type || 'text',
          content: el.content || '',
          style: el.style || {},
          position: el.position || { x: 100, y: 100 },
          size: el.size || { width: 200, height: 100 },
          animation: el.animation,
        })),
        background: page.background || { color: '#ffffff' },
        transition: page.transition || { type: 'fade', duration: 500 },
      })),
      title: data.title || 'Imported Presentation',
    };
  }
  
  throw new Error('Invalid JSON format');
}

/**
 * Import from PowerPoint PPTX format
 * Note: This is a simplified implementation. Full PPTX parsing would require a library like pptxgenjs
 */
async function importFromPPTX(file: File): Promise<Partial<PresentationInfo>> {
  // For now, we'll convert PPTX to JSON using a simplified approach
  // In production, you'd want to use a library like 'pptxgenjs' or 'officegen'
  throw new Error('PPTX import not yet implemented. Please export as JSON first.');
}

/**
 * Import from PDF format
 * Note: This would require PDF parsing libraries
 */
async function importFromPDF(file: File): Promise<Partial<PresentationInfo>> {
  // PDF import would require libraries like pdf.js or pdf-parse
  throw new Error('PDF import not yet implemented. Please export as JSON first.');
}

/**
 * Import from Canva export format
 */
async function importFromCanva(file: File): Promise<Partial<PresentationInfo>> {
  // Canva exports are typically PDF or PNG
  // For a more complete implementation, you'd parse Canva's JSON export format
  const text = await file.text();
  try {
    const canvaData = JSON.parse(text);
    
    // Transform Canva format to our format
    if (canvaData.pages || canvaData.slides) {
      const pages = (canvaData.pages || canvaData.slides || []).map((slide: any, index: number) => {
        const elements: PresentationElement[] = [];
        
        // Convert Canva elements to our format
        if (slide.elements) {
          slide.elements.forEach((el: any) => {
            const element: PresentationElement = {
              id: `element-${Date.now()}-${index}-${elements.length}`,
              type: mapCanvaElementType(el.type),
              content: el.text || el.url || '',
              style: {
                fontSize: el.fontSize || 16,
                color: el.color || '#000000',
                fontFamily: el.fontFamily || 'Arial',
              },
              position: {
                x: el.x || 100,
                y: el.y || 100,
              },
              size: {
                width: el.width || 200,
                height: el.height || 100,
              },
            };
            elements.push(element);
          });
        }
        
        return {
          id: `page-${Date.now()}-${index}`,
          order: index,
          elements,
          background: {
            color: slide.backgroundColor || '#ffffff',
            gradient: slide.backgroundGradient,
          },
          transition: { type: 'fade', duration: 500 },
        };
      });
      
      return {
        pages,
        title: canvaData.title || 'Imported from Canva',
      };
    }
  } catch (e) {
    // Not JSON, might be PDF or image
    throw new Error('Canva import: Please export as JSON format from Canva');
  }
  
  throw new Error('Invalid Canva format');
}

function mapCanvaElementType(canvaType: string): PresentationElement['type'] {
  const typeMap: Record<string, PresentationElement['type']> = {
    'text': 'text',
    'heading': 'heading',
    'image': 'image',
    'video': 'video',
    'shape': 'image', // Convert shapes to images
  };
  
  return typeMap[canvaType] || 'text';
}

/**
 * Detect file format from file extension
 */
export function detectFileFormat(fileName: string): ImportOptions['format'] | null {
  const ext = fileName.toLowerCase().split('.').pop();
  
  switch (ext) {
    case 'json':
      return 'json';
    case 'pptx':
      return 'pptx';
    case 'pdf':
      return 'pdf';
    case 'canva':
    case 'canva-json':
      return 'canva';
    default:
      return null;
  }
}
