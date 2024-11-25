import { IconSnowflake } from '@tabler/icons-react';

interface SnowToggleProps {
  isActive: boolean;
  onToggle: () => void;
}

const SnowToggleButton = ({ isActive, onToggle }: SnowToggleProps) => {
  return (
    <button 
      className={`snow-toggle-button ${isActive ? 'active' : ''}`}
      onClick={onToggle}
    >
      <IconSnowflake size={20} />
      {isActive ? 'Stop Snow' : 'Happy New Year!'}
    </button>
  );
};

export default SnowToggleButton;