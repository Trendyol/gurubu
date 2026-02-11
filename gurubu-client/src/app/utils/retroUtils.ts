import { toast } from "react-hot-toast";

/**
 * Copies the retro invite link to clipboard
 */
export const copyRetroInviteLink = (roomId: string) => {
  const inviteUrl = `${window.location.origin}/retro/${roomId}`;
  navigator.clipboard.writeText(inviteUrl);
  toast.success("Invite link copied to clipboard!", {
    duration: 2000,
    icon: '📋',
  });
};

/**
 * Exports retro board data to CSV format
 */
export const exportRetroToCSV = (
  mainColumns: any[],
  retroCards: Record<string, any[]>,
  participants: any[]
) => {
  const csvRows = ['Column,Card Text,Votes,Author'];
  
  mainColumns.forEach((col: any) => {
    const cards = retroCards[col.key] || [];
    cards.forEach((card: any) => {
      const author = participants.find(p => p.userID === card.authorId)?.nickname || 'Unknown';
      csvRows.push(`"${col.title}","${card.text.replace(/"/g, '""')}",${card.voteCount || 0},"${author}"`);
    });
  });

  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `retro-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);

  toast.success("CSV exported successfully!", {
    duration: 2000,
    icon: '📊',
  });
};

/**
 * Exports retro board data to PDF format
 */
export const exportRetroToPDF = (
  mainColumns: any[],
  retroCards: Record<string, any[]>,
  participants: any[],
  retroTitle: string
) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    toast.error("Pop-up blocked! Please allow pop-ups for this site.");
    return;
  }

  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${retroTitle} - Retro Export</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #2d3748; }
        h1 { font-size: 28px; margin-bottom: 8px; color: #1a202c; }
        .date { color: #718096; margin-bottom: 32px; font-size: 14px; }
        .column { margin-bottom: 32px; }
        .column-title { font-size: 20px; font-weight: 700; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; }
        .column-title--green { background: #d1fae5; color: #065f46; }
        .column-title--red { background: #fee2e2; color: #991b1b; }
        .column-title--blue { background: #dbeafe; color: #1e40af; }
        .card { padding: 12px 16px; margin-bottom: 8px; border-radius: 6px; border-left: 4px solid #e2e8f0; background: #f7fafc; }
        .card-text { font-size: 14px; line-height: 1.6; margin-bottom: 4px; }
        .card-meta { font-size: 12px; color: #718096; display: flex; gap: 12px; }
        .votes { color: #667eea; font-weight: 600; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <h1>${retroTitle}</h1>
      <div class="date">${new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
  `;

  mainColumns.forEach((col: any) => {
    const cards = retroCards[col.key] || [];
    const colorClass = col.color ? `column-title--${col.color}` : '';
    html += `<div class="column"><div class="column-title ${colorClass}">${col.title} (${cards.length})</div>`;
    
    cards.sort((a: any, b: any) => a.createdAt - b.createdAt).forEach((card: any) => {
      const author = participants.find(p => p.userID === card.authorId)?.nickname || 'Unknown';
      html += `
        <div class="card">
          <div class="card-text">${card.text.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
          <div class="card-meta">
            <span class="votes">👍 ${card.voteCount || 0}</span>
            <span>${author}</span>
          </div>
        </div>
      `;
    });
    
    html += `</div>`;
  });

  html += `</body></html>`;

  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.onload = () => {
    printWindow.print();
  };

  toast.success("PDF ready for printing!", {
    duration: 2000,
    icon: '📄',
  });
};

/**
 * Exports action items to PDF format
 */
export const exportActionItemsToPDF = (
  sideColumns: any[],
  retroCards: Record<string, any[]>,
  participants: any[],
  retroTitle: string
) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    toast.error("Pop-up blocked! Please allow pop-ups for this site.");
    return;
  }

  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${retroTitle} - Action Items</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #2d3748; }
        h1 { font-size: 28px; margin-bottom: 8px; color: #1a202c; }
        h2 { font-size: 20px; margin-bottom: 16px; color: #3b82f6; }
        .date { color: #718096; margin-bottom: 32px; font-size: 14px; }
        .item { padding: 12px 16px; margin-bottom: 8px; border-radius: 6px; border-left: 4px solid #3b82f6; background: #eff6ff; display: flex; align-items: flex-start; gap: 12px; }
        .item-number { font-weight: 700; color: #3b82f6; min-width: 24px; }
        .item-text { font-size: 14px; line-height: 1.6; flex: 1; }
        .item-author { font-size: 12px; color: #718096; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <h1>${retroTitle}</h1>
      <div class="date">Action Items - ${new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
  `;

  sideColumns.forEach((col: any) => {
    const cards = retroCards[col.key] || [];
    html += `<h2>${col.title}</h2>`;
    
    cards.sort((a: any, b: any) => a.createdAt - b.createdAt).forEach((card: any, index: number) => {
      const author = participants.find(p => p.userID === card.authorId)?.nickname || 'Unknown';
      html += `
        <div class="item">
          <span class="item-number">${index + 1}.</span>
          <div>
            <div class="item-text">${card.text.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
            <div class="item-author">Assigned by: ${author}</div>
          </div>
        </div>
      `;
    });
  });

  if (sideColumns.length === 0) {
    html += `<p style="color: #718096; font-style: italic;">No action items found.</p>`;
  }

  html += `</body></html>`;

  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.onload = () => {
    printWindow.print();
  };

  toast.success("Action items PDF ready!", {
    duration: 2000,
    icon: '📋',
  });
};
