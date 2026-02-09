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
      csvRows.push(`"${col.title}","${card.text}",${card.voteCount || 0},"${author}"`);
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
