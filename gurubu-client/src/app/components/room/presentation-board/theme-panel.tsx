"use client";

import { useState } from "react";
import { IconX } from "@tabler/icons-react";

interface ThemePanelProps {
  onClose: () => void;
  onApplyTheme: (theme: ThemeConfig) => void;
}

export interface ThemeConfig {
  id: string;
  name: string;
  coverPage: {
    background: {
      color?: string;
      gradient?: string;
      image?: string;
      pattern?: string;
    };
    fontFamily?: string;
    textColor?: string;
  };
  contentPage: {
    background: {
      color?: string;
      gradient?: string;
      image?: string;
      pattern?: string;
    };
    fontFamily?: string;
    textColor?: string;
  };
}

const PRESET_THEMES: ThemeConfig[] = [
  {
    id: 'modern-blue',
    name: 'Modern Blue',
    coverPage: {
      background: {
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      },
    },
    contentPage: {
      background: {
        color: '#ffffff',
      },
    },
  },
  {
    id: 'warm-sunset',
    name: 'Warm Sunset',
    coverPage: {
      background: {
        gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      },
    },
    contentPage: {
      background: {
        color: '#fff5f5',
      },
    },
  },
  {
    id: 'ocean-breeze',
    name: 'Ocean Breeze',
    coverPage: {
      background: {
        gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      },
    },
    contentPage: {
      background: {
        color: '#f0f9ff',
      },
    },
  },
  {
    id: 'forest-green',
    name: 'Forest Green',
    coverPage: {
      background: {
        gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
      },
    },
    contentPage: {
      background: {
        color: '#f0fdf4',
      },
    },
  },
  {
    id: 'dark-elegant',
    name: 'Dark Elegant',
    coverPage: {
      background: {
        gradient: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
      },
    },
    contentPage: {
      background: {
        color: '#1a1a1a',
      },
    },
  },
  {
    id: 'minimal-white',
    name: 'Minimal White',
    coverPage: {
      background: {
        color: '#ffffff',
      },
    },
    contentPage: {
      background: {
        color: '#fafafa',
      },
    },
  },
  {
    id: 'geometric-modern',
    name: 'Geometric Modern',
    coverPage: {
      background: {
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        pattern: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)',
      },
      fontFamily: 'Inter, sans-serif',
      textColor: '#ffffff',
    },
    contentPage: {
      background: {
        color: '#ffffff',
        pattern: 'linear-gradient(90deg, rgba(102,126,234,0.05) 0%, transparent 100%)',
      },
      fontFamily: 'Inter, sans-serif',
      textColor: '#333333',
    },
  },
  {
    id: 'tech-grid',
    name: 'Tech Grid',
    coverPage: {
      background: {
        gradient: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
        pattern: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)',
      },
      fontFamily: 'Roboto Mono, monospace',
      textColor: '#ffffff',
    },
    contentPage: {
      background: {
        color: '#f5f7fa',
        pattern: 'repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(30,60,114,0.03) 20px, rgba(30,60,114,0.03) 21px)',
      },
      fontFamily: 'Roboto Mono, monospace',
      textColor: '#1e3c72',
    },
  },
  {
    id: 'creative-splash',
    name: 'Creative Splash',
    coverPage: {
      background: {
        gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #4facfe 100%)',
        pattern: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 50%), radial-gradient(circle at 70% 70%, rgba(255,255,255,0.15) 0%, transparent 50%)',
      },
      fontFamily: 'Poppins, sans-serif',
      textColor: '#ffffff',
    },
    contentPage: {
      background: {
        color: '#ffffff',
        pattern: 'linear-gradient(45deg, rgba(240,147,251,0.05) 25%, transparent 25%, transparent 75%, rgba(240,147,251,0.05) 75%), linear-gradient(45deg, rgba(240,147,251,0.05) 25%, transparent 25%, transparent 75%, rgba(240,147,251,0.05) 75%)',
        backgroundSize: '40px 40px',
        backgroundPosition: '0 0, 20px 20px',
      },
      fontFamily: 'Poppins, sans-serif',
      textColor: '#333333',
    },
  },
  {
    id: 'elegant-dots',
    name: 'Elegant Dots',
    coverPage: {
      background: {
        gradient: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
        pattern: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
        backgroundSize: '30px 30px',
      },
      fontFamily: 'Playfair Display, serif',
      textColor: '#ffffff',
    },
    contentPage: {
      background: {
        color: '#f8f9fa',
        pattern: 'radial-gradient(circle, rgba(44,62,80,0.05) 1px, transparent 1px)',
        backgroundSize: '25px 25px',
      },
      fontFamily: 'Playfair Display, serif',
      textColor: '#2c3e50',
    },
  },
  {
    id: 'nature-inspired',
    name: 'Nature Inspired',
    coverPage: {
      background: {
        gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
        pattern: 'radial-gradient(ellipse at top, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(ellipse at bottom, rgba(17,153,142,0.2) 0%, transparent 50%)',
      },
      fontFamily: 'Montserrat, sans-serif',
      textColor: '#ffffff',
    },
    contentPage: {
      background: {
        color: '#f0fdf4',
        pattern: 'linear-gradient(180deg, rgba(17,153,142,0.03) 0%, transparent 100%)',
      },
      fontFamily: 'Montserrat, sans-serif',
      textColor: '#11998e',
    },
  },
];

const ThemePanel = ({ onClose, onApplyTheme }: ThemePanelProps) => {
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);

  const handleApplyTheme = () => {
    if (!selectedTheme) return;
    const theme = PRESET_THEMES.find(t => t.id === selectedTheme);
    if (theme) {
      onApplyTheme(theme);
      onClose();
    }
  };

  return (
    <div className="theme-panel" onClick={onClose}>
      <div className="theme-panel__content" onClick={(e) => e.stopPropagation()}>
        <div className="theme-panel__header">
          <h3>Apply Theme</h3>
          <button className="theme-panel__close" onClick={onClose}>
            <IconX size={20} />
          </button>
        </div>

        <div className="theme-panel__body">
          <p className="theme-panel__description">
            Select a theme to apply to all pages. The cover page and content pages will have different designs.
          </p>

          <div className="theme-panel__themes">
            {PRESET_THEMES.map((theme) => (
              <div
                key={theme.id}
                className={`theme-panel__theme-card ${selectedTheme === theme.id ? 'selected' : ''}`}
                onClick={() => setSelectedTheme(theme.id)}
              >
                <div className="theme-panel__theme-preview">
                  <div
                    className="theme-panel__theme-cover"
                    style={{
                      background: theme.coverPage.background.gradient || theme.coverPage.background.color || '#ffffff',
                    }}
                  />
                  <div
                    className="theme-panel__theme-content"
                    style={{
                      background: theme.contentPage.background.gradient || theme.contentPage.background.color || '#ffffff',
                    }}
                  />
                </div>
                <div className="theme-panel__theme-name">{theme.name}</div>
              </div>
            ))}
          </div>

          <div className="theme-panel__actions">
            <button className="theme-panel__cancel" onClick={onClose}>
              Cancel
            </button>
            <button
              className="theme-panel__apply"
              onClick={handleApplyTheme}
              disabled={!selectedTheme}
            >
              Apply Theme
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemePanel;
