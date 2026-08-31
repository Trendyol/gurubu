import { PresentationInfo } from "@/shared/interfaces";

export const exportPresentationToPDF = async (presentationInfo: PresentationInfo) => {
  // This would require a PDF library like jsPDF or html2pdf
  // For now, we'll use browser's print functionality
  window.print();
};

export const exportPresentationToPNG = async (presentationInfo: PresentationInfo, pageIndex?: number) => {
  const pagesToExport = pageIndex !== undefined 
    ? [presentationInfo.pages[pageIndex]]
    : presentationInfo.pages;

  for (let i = 0; i < pagesToExport.length; i++) {
    const page = pagesToExport[i];
    const pageElement = document.querySelector(`[data-page-id="${page.id}"]`) as HTMLElement;
    
    if (!pageElement) continue;

    // Use html2canvas or similar library
    // For now, we'll create a simple canvas approach
    const canvas = document.createElement('canvas');
    canvas.width = 1920;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.fillStyle = page.background?.color || '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw elements (simplified - would need proper rendering)
      // This is a placeholder - would need html2canvas library
    }

    // Download the image
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `presentation-page-${pageIndex !== undefined ? pageIndex + 1 : i + 1}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }
    });
  }
};

export const copyPresentationLink = (presentationId: string) => {
  const url = `${window.location.origin}/presentation/${presentationId}`;
  navigator.clipboard.writeText(url);
  return url;
};
