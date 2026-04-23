"use client";

import { useState, useEffect } from "react";
import { IconSearch, IconX } from "@tabler/icons-react";

interface GifAnimationLibraryProps {
  onSelect: (url: string, type: 'gif' | 'animation') => void;
  onClose: () => void;
}

// Popular GIF/Animation libraries
const GIF_LIBRARIES = [
  {
    name: "Giphy",
    url: "https://giphy.com",
    api: "https://api.giphy.com/v1/gifs",
    searchUrl: "https://giphy.com/search",
  },
  {
    name: "Tenor",
    url: "https://tenor.com",
    api: "https://api.tenor.com/v1",
    searchUrl: "https://tenor.com/search",
  },
];

const ANIMATION_LIBRARIES = [
  {
    name: "Lottie Files",
    url: "https://lottiefiles.com",
    description: "JSON animations",
  },
  {
    name: "Animate.css",
    url: "https://animate.style",
    description: "CSS animations",
  },
];

const POPULAR_GIFS = [
  { name: "Loading", url: "https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif" },
  { name: "Success", url: "https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif" },
  { name: "Error", url: "https://media.giphy.com/media/l0HlBO7eyXzSZkJri/giphy.gif" },
  { name: "Celebration", url: "https://media.giphy.com/media/26u4cqiYI30juCOGY/giphy.gif" },
];

const GifAnimationLibrary = ({ onSelect, onClose }: GifAnimationLibraryProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<'gif' | 'animation'>('gif');
  const [customUrl, setCustomUrl] = useState("");
  const [searchResults, setSearchResults] = useState<Array<{ url: string; title: string }>>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleUrlSubmit = () => {
    if (customUrl.trim()) {
      onSelect(customUrl.trim(), selectedType);
      onClose();
    }
  };

  const searchGifs = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      // Use Giphy public API with better quality settings
      const response = await fetch(
        `https://api.giphy.com/v1/gifs/search?api_key=dc6zaTOxFJmzC&q=${encodeURIComponent(query)}&limit=24&rating=g&lang=en&bundle=messaging_non_clips`
      );
      
      if (!response.ok) {
        throw new Error('GIF search failed');
      }
      
      const result = await response.json();
      
      if (result.data && result.data.length > 0) {
        // Filter out low quality or inappropriate GIFs
        const gifs = result.data
          .filter((gif: any) => {
            // Filter out very small or low quality GIFs
            const height = gif.images?.fixed_height?.height || 0;
            return height >= 200 && gif.rating === 'g';
          })
          .map((gif: any) => ({
            url: gif.images.fixed_height.url || gif.images.original.url,
            title: (gif.title || gif.slug || 'GIF').replace(/GIF|gif/g, '').trim() || 'GIF',
            preview: gif.images.preview_gif?.url || gif.images.fixed_height_small.url,
            width: gif.images.fixed_height.width,
            height: gif.images.fixed_height.height,
          }))
          .slice(0, 20); // Limit to 20 results
        setSearchResults(gifs);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('GIF search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(() => {
      searchGifs(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <div className="gif-animation-library" onClick={handleBackdropClick}>
      <div className="gif-animation-library__content-wrapper" onClick={(e) => e.stopPropagation()}>
        <div className="gif-animation-library__header">
          <h3>Add {selectedType === 'gif' ? 'GIF' : 'Animation'}</h3>
          <button onClick={onClose} className="gif-animation-library__close">×</button>
        </div>

        <div className="gif-animation-library__content">
          <div className="gif-animation-library__type-toggle">
            <button
              className={selectedType === 'gif' ? 'active' : ''}
              onClick={() => setSelectedType('gif')}
            >
              GIF
            </button>
            <button
              className={selectedType === 'animation' ? 'active' : ''}
              onClick={() => setSelectedType('animation')}
            >
              Animation
            </button>
          </div>

          <div className="gif-animation-library__section">
            <label>Enter URL</label>
            <div className="gif-animation-library__url-input">
              <input
                type="text"
                placeholder={`Paste ${selectedType === 'gif' ? 'GIF' : 'animation'} URL here`}
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleUrlSubmit();
                  }
                }}
              />
              <button onClick={handleUrlSubmit} disabled={!customUrl.trim()}>
                Add
              </button>
            </div>
          </div>

          {selectedType === 'gif' && (
            <>
              <div className="gif-animation-library__section">
                <label>Search GIFs</label>
                <div className="gif-animation-library__search">
                  <div className="gif-animation-library__search-input">
                    <IconSearch size={18} />
                    <input
                      type="text"
                      placeholder="Search for GIFs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          searchGifs(searchQuery);
                        }
                      }}
                    />
                    {searchQuery && (
                      <button
                        className="gif-animation-library__clear-search"
                        onClick={() => {
                          setSearchQuery("");
                          setSearchResults([]);
                        }}
                      >
                        <IconX size={16} />
                      </button>
                    )}
                  </div>
                  {isSearching && (
                    <div className="gif-animation-library__loading">Searching...</div>
                  )}
                </div>
              </div>

              {searchResults.length > 0 && (
                <div className="gif-animation-library__section">
                  <label>Search Results ({searchResults.length})</label>
                  <div className="gif-animation-library__gif-grid">
                    {searchResults.map((gif, index) => (
                      <div
                        key={index}
                        className="gif-animation-library__gif-item"
                        onClick={() => {
                          onSelect(gif.url, 'gif');
                          onClose();
                        }}
                        title={gif.title}
                      >
                        <div className="gif-animation-library__gif-preview">
                          <img src={gif.preview || gif.url} alt={gif.title} loading="lazy" />
                        </div>
                        <span>{gif.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!isSearching && searchQuery && searchResults.length === 0 && (
                <div className="gif-animation-library__no-results">
                  <p>No GIFs found for "{searchQuery}"</p>
                  <p className="gif-animation-library__hint">Try a different search term</p>
                </div>
              )}

              {!searchQuery && (
                <div className="gif-animation-library__section">
                  <label>Popular GIFs</label>
                  <div className="gif-animation-library__gif-grid">
                    {POPULAR_GIFS.map((gif, index) => (
                      <div
                        key={index}
                        className="gif-animation-library__gif-item"
                        onClick={() => {
                          onSelect(gif.url, 'gif');
                          onClose();
                        }}
                      >
                        <img src={gif.url} alt={gif.name} />
                        <span>{gif.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="gif-animation-library__section">
                <label>GIF Libraries</label>
                <div className="gif-animation-library__library-list">
                  {GIF_LIBRARIES.map((lib, index) => (
                    <a
                      key={index}
                      href={lib.searchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="gif-animation-library__library-item"
                    >
                      <span>{lib.name}</span>
                      <span>→</span>
                    </a>
                  ))}
                </div>
              </div>
            </>
          )}

          {selectedType === 'animation' && (
            <div className="gif-animation-library__section">
              <label>Animation Libraries</label>
              <div className="gif-animation-library__library-list">
                {ANIMATION_LIBRARIES.map((lib, index) => (
                  <a
                    key={index}
                    href={lib.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="gif-animation-library__library-item"
                  >
                    <div>
                      <span>{lib.name}</span>
                      <span className="gif-animation-library__library-description">{lib.description}</span>
                    </div>
                    <span>→</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GifAnimationLibrary;
