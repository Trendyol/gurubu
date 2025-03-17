'use client';

import React from 'react';
import { Board } from '@/shared/interfaces';
import { JiraService } from '../../services/jiraService';
import { IconSearch } from '@tabler/icons-react';

interface BoardSelectorProps {
  onBoardSelect: (boardId: string) => void;
}

export default function BoardSelector({ onBoardSelect }: BoardSelectorProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [boards, setBoards] = React.useState<Board[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [selectedBoardId, setSelectedBoardId] = React.useState<string | null>(null);
  
  const jiraService = React.useMemo(() => {
    return new JiraService(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');
  }, []);
  
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await jiraService.searchBoards(searchTerm);
      if (response.isSuccess && response.data) {
        setBoards(response.data);
      } else {
        setError('Failed to fetch boards');
      }
    } catch (error) {
      setError('Error searching for boards');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  const handleBoardSelect = (boardId: string) => {
    setSelectedBoardId(boardId);
    onBoardSelect(boardId);
  };
  
  return (
    <div className="board-selector">
      <div className="search-container">
        <input
          type="text"
          placeholder="Search for a board..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        <button 
          onClick={handleSearch}
          disabled={!searchTerm.trim() || loading}
        >
          <IconSearch size={18} style={{ display: 'inline-block' }} /> 
          <span>{loading ? 'Searching...' : 'Search'}</span>
        </button>
      </div>
      
      {error && <p className="error-message">{error}</p>}
      
      {boards.length > 0 && (
        <div className="boards-list">
          <p>Select a board:</p>
          <div className="boards-grid">
            {boards.map((board) => (
              <div
                key={board.id}
                className={`board-item ${selectedBoardId === board.id ? 'selected' : ''}`}
                onClick={() => handleBoardSelect(board.id)}
              >
                {board.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 