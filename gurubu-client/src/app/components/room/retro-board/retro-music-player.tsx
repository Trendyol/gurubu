"use client";

import { useEffect, useRef, useState } from "react";
import { IconPlayerPlay, IconPlayerPause, IconVolume, IconVolumeOff } from "@tabler/icons-react";

interface IProps {
  music: {
    isPlaying: boolean;
    url: string | null;
  };
  isOwner: boolean;
  onMusicUpdate: (music: { isPlaying: boolean; url: string | null }) => void;
}

const RetroMusicPlayer = ({ music, isOwner, onMusicUpdate }: IProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  
  // Initialize local volume from localStorage
  const [localVolume, setLocalVolume] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('retroMusicVolume');
      return saved ? Number(saved) : 50;
    }
    return 50;
  });
  
  const [prevMusicVolume, setPrevMusicVolume] = useState(localVolume);
  const [isYouTube, setIsYouTube] = useState(false);

  // Convert YouTube URL to embed URL
  const getYouTubeEmbedUrl = (url: string) => {
    const videoIdMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    if (videoIdMatch && videoIdMatch[1]) {
      return `https://www.youtube.com/embed/${videoIdMatch[1]}?autoplay=1&loop=1&playlist=${videoIdMatch[1]}`;
    }
    return null;
  };

  const processedUrl = music.url ? getYouTubeEmbedUrl(music.url) : null;

  useEffect(() => {
    const isYouTubeUrl = music.url && (music.url.includes('youtube.com') || music.url.includes('youtu.be'));
    setIsYouTube(!!isYouTubeUrl);

    if (!isYouTubeUrl && audioRef.current && music.url) {
      // Use local volume for playback
      audioRef.current.volume = localVolume / 100;
      
      if (music.isPlaying) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(err => console.error("Audio play error:", err));
        }
      } else {
        audioRef.current.pause();
      }
    }
  }, [music.isPlaying, music.url, localVolume]);

  const handlePlayPause = () => {
    if (!isOwner) return;
    
    if (!music.url) {
      setShowUrlInput(true);
      return;
    }

    onMusicUpdate({
      ...music,
      isPlaying: !music.isPlaying,
    });
  };

  // TODO: Add volume control improvements
  // - Add volume presets (25%, 50%, 75%, 100%)
  // - Better visual feedback on slider
  // - Consider adding volume boost option
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value);
    setLocalVolume(newVolume);
    
    // Update audio element immediately for local playback
    if (audioRef.current && !isYouTube) {
      audioRef.current.volume = newVolume / 100;
    }
    
    // Store in localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('retroMusicVolume', newVolume.toString());
    }
  };

  const handleSetUrl = () => {
    if (!isOwner || !urlInput.trim()) return;
    
    onMusicUpdate({
      url: urlInput,
      isPlaying: true,
    });
    setShowUrlInput(false);
    setUrlInput("");
  };

  // TODO: Improve mute/unmute functionality
  // - Add visual feedback for muted state
  // - Consider adding keyboard shortcuts (M for mute)
  // - Sync mute state across all users (optional)
  const handleMute = () => {
    const newVolume = localVolume === 0 ? (prevMusicVolume > 0 ? prevMusicVolume : 50) : 0;
    
    // Store previous volume before muting
    if (localVolume > 0) {
      setPrevMusicVolume(localVolume);
    }

    setLocalVolume(newVolume);
    
    // Update audio element immediately for local playback
    if (audioRef.current && !isYouTube) {
      audioRef.current.volume = newVolume / 100;
    }
    
    // Store in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('retroMusicVolume', newVolume.toString());
    }
  };

  return (
    <div className="retro-music-player">
      {music.url && !isYouTube && (
        <audio ref={audioRef} src={music.url} loop />
      )}
      
      {music.url && isYouTube && processedUrl && music.isPlaying && (
        <iframe
          ref={iframeRef}
          src={processedUrl}
          style={{ display: 'none' }}
          allow="autoplay; encrypted-media"
          title="YouTube Music Player"
        />
      )}

      <div className="retro-music-player__controls">
        {isOwner && (
          <>
            <button
              className="retro-music-player__btn"
              onClick={handlePlayPause}
              title={music.isPlaying ? "Pause" : "Play"}
            >
              {music.isPlaying ? (
                <IconPlayerPause size={20} />
              ) : (
                <IconPlayerPlay size={20} />
              )}
            </button>

            <button
              className="retro-music-player__btn"
              onClick={() => setShowUrlInput(true)}
              title="Change Music"
            >
              🎵
            </button>

            <button
              className="retro-music-player__btn"
              onClick={handleMute}
              title="Mute/Unmute"
            >
              {localVolume === 0 ? (
                <IconVolumeOff size={20} />
              ) : (
                <IconVolume size={20} />
              )}
            </button>

            <div className="retro-music-player__volume">
              <input
                type="range"
                min="0"
                max="100"
                value={localVolume}
                onChange={handleVolumeChange}
                className="retro-music-player__volume-slider"
              />
              <span className="retro-music-player__volume-value">{localVolume}%</span>
            </div>
          </>
        )}

        {!isOwner && music.isPlaying && (
          <div className="retro-music-player__user-controls">
            <div className="retro-music-player__status">
              <IconPlayerPlay size={16} />
              <span>Music playing</span>
            </div>
            <div className="retro-music-player__volume">
              <button
                className="retro-music-player__btn"
                onClick={handleMute}
                title="Mute/Unmute"
              >
                {localVolume === 0 ? (
                  <IconVolumeOff size={18} />
                ) : (
                  <IconVolume size={18} />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="100"
                value={localVolume}
                onChange={handleVolumeChange}
                className="retro-music-player__volume-slider"
              />
              <span className="retro-music-player__volume-value">{localVolume}%</span>
            </div>
          </div>
        )}
      </div>

      {isOwner && showUrlInput && (
        <div className="retro-music-player__url-input">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Enter music URL (YouTube, SoundCloud, etc.)"
            className="retro-music-player__input"
          />
          <div className="retro-music-player__url-actions">
            <button onClick={handleSetUrl}>Set Music</button>
            <button onClick={() => setShowUrlInput(false)}>Cancel</button>
          </div>
          <p className="retro-music-player__hint">
            Tip: Paste YouTube URL or direct audio file URLs (.mp3, .wav)
          </p>
        </div>
      )}

      {isOwner && !music.url && !music.isPlaying && !showUrlInput && (
        <button
          className="retro-music-player__add-music"
          onClick={() => setShowUrlInput(true)}
        >
          + Add Background Music
        </button>
      )}
    </div>
  );
};

export default RetroMusicPlayer;
