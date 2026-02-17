"use client";

import { useEffect, useState } from "react";
import { IconPlayerPlay, IconPlayerPause, IconRefresh } from "@tabler/icons-react";

interface IProps {
  timer: {
    timeLeft: number;
    isRunning: boolean;
    startTime: number | null;
  };
  isOwner: boolean;
  onTimerUpdate: (timer: { timeLeft: number; isRunning: boolean; startTime: number | null }) => void;
}

const RetroTimerV2 = ({ timer, isOwner, onTimerUpdate }: IProps) => {
  const [displayTime, setDisplayTime] = useState(timer.timeLeft);
  const [customMinutes, setCustomMinutes] = useState(5);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [isAlarmPlaying, setIsAlarmPlaying] = useState(false);

  const playAlarm = () => {
    setIsAlarmPlaying(true);
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    const playTone = (frequency: number, startTime: number, duration: number) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.15, startTime + 0.05);
      gainNode.gain.linearRampToValueAtTime(0, startTime + duration);
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };

    const now = audioContext.currentTime;
    playTone(523.25, now, 0.3);
    playTone(659.25, now + 0.15, 0.3);
    playTone(783.99, now + 0.3, 0.4);

    setTimeout(() => setIsAlarmPlaying(false), 800);
  };

  useEffect(() => {
    if (timer.isRunning && timer.startTime) {
      const updateTimer = () => {
        const elapsed = Math.floor((Date.now() - timer.startTime!) / 1000);
        const remaining = Math.max(0, timer.timeLeft - elapsed);
        setDisplayTime(remaining);

        if (remaining === 0 && isOwner && !isAlarmPlaying) {
          onTimerUpdate({ timeLeft: 0, isRunning: false, startTime: null });
          playAlarm();
        }
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    } else {
      setDisplayTime(timer.timeLeft);
    }
  }, [timer.isRunning, timer.startTime, timer.timeLeft, isOwner, onTimerUpdate, isAlarmPlaying]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStart = () => {
    if (!isOwner || displayTime === 0) return;
    onTimerUpdate({ timeLeft: displayTime, isRunning: true, startTime: Date.now() });
  };

  const handlePause = () => {
    if (!isOwner) return;
    onTimerUpdate({ timeLeft: displayTime, isRunning: false, startTime: null });
  };

  const handleReset = () => {
    if (!isOwner) return;
    onTimerUpdate({ timeLeft: 0, isRunning: false, startTime: null });
  };

  const handleSetTime = (minutes: number) => {
    if (!isOwner) return;
    onTimerUpdate({ timeLeft: minutes * 60, isRunning: false, startTime: null });
  };

  const handleCustomTime = () => {
    if (!isOwner || customMinutes < 1 || customMinutes > 60) return;
    handleSetTime(customMinutes);
    setShowCustomInput(false);
  };

  const isWarning = displayTime <= 10 && displayTime > 0;
  const isFinished = displayTime === 0;

  useEffect(() => {
    if (!isOwner && displayTime === 0 && !isAlarmPlaying) {
      playAlarm();
    }
  }, [displayTime, isAlarmPlaying, isOwner]);

  if (isOwner) {
    return (
      <div className="retro-timer-v2 retro-timer-v2--owner">
        {/* Time badge - always visible for owner, styled when running */}
        <div className={`retro-timer-v2__badge ${timer.isRunning ? 'retro-timer-v2__badge--running' : ''} ${isWarning ? 'retro-timer-v2__badge--warning' : ''} ${isFinished ? 'retro-timer-v2__badge--finished' : ''}`}>
          <span className="retro-timer-v2__badge-time">{formatTime(displayTime)}</span>
        </div>

        {/* Controls inline */}
        {timer.isRunning ? (
          <button className="retro-timer-v2__btn retro-timer-v2__btn--pause" onClick={handlePause} title="Pause">
            <IconPlayerPause size={16} />
          </button>
        ) : (
          <button className="retro-timer-v2__btn retro-timer-v2__btn--play" onClick={handleStart} disabled={displayTime === 0} title="Start">
            <IconPlayerPlay size={16} />
          </button>
        )}
        <button className="retro-timer-v2__btn retro-timer-v2__btn--reset" onClick={handleReset} title="Reset">
          <IconRefresh size={16} />
        </button>

        <div className="retro-timer-v2__presets">
          <button className="retro-timer-v2__preset" onClick={() => handleSetTime(5)}>5m</button>
          <button className="retro-timer-v2__preset" onClick={() => handleSetTime(10)}>10m</button>
          <button className="retro-timer-v2__preset" onClick={() => handleSetTime(15)}>15m</button>
          <button className="retro-timer-v2__preset" onClick={() => setShowCustomInput(!showCustomInput)}>+</button>
        </div>

        {showCustomInput && (
          <div className="retro-timer-v2__custom">
            <input
              className="retro-timer-v2__input"
              type="number"
              min="1"
              max="60"
              value={customMinutes}
              onChange={(e) => setCustomMinutes(Number(e.target.value))}
              placeholder="min"
            />
            <button className="retro-timer-v2__set-btn" onClick={handleCustomTime}>Set</button>
          </div>
        )}
      </div>
    );
  }

  if (!timer.isRunning) {
    return null;
  }

  return (
    <div className="retro-timer-v2 retro-timer-v2--user">
      <div className={`retro-timer-v2__badge retro-timer-v2__badge--running ${isWarning ? 'retro-timer-v2__badge--warning' : ''} ${isFinished ? 'retro-timer-v2__badge--finished' : ''}`}>
        <span className="retro-timer-v2__badge-time">{formatTime(displayTime)}</span>
      </div>
    </div>
  );
};

export default RetroTimerV2;
