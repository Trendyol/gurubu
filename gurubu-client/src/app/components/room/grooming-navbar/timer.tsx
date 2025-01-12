import { useState, useEffect, useRef } from "react";
import {
  IconAlarm,
  IconPlayerPlay,
  IconPlayerPause,
  IconRefresh,
} from "@tabler/icons-react";
import { useSocket } from "@/contexts/SocketContext";
import { useGroomingRoom } from "@/contexts/GroomingRoomContext";
import classNames from "classnames";

interface Props {
  roomId: string;
}

const TIME_OPTIONS = [
  { label: "+1", minutes: 1 },
  { label: "+5", minutes: 5 },
  { label: "+10", minutes: 10 },
  { label: "+30", minutes: 30 },
];

const Timer = ({ roomId }: Props) => {
  const [showOptions, setShowOptions] = useState(false);
  const [localTimeLeft, setLocalTimeLeft] = useState(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const timerRef = useRef<HTMLDivElement>(null);
  const socket = useSocket();
  const { groomingInfo, userInfo } = useGroomingRoom();
  const isRunning = groomingInfo?.timer?.isRunning;
  const timeLeft = groomingInfo?.timer?.timeLeft ?? 0;
  const startTime = groomingInfo?.timer?.startTime ?? null;

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const calculateTimeLeft = () => {
    if (startTime && isRunning) {
      const elapsed = Math.floor(
        (Date.now() - new Date(startTime).getTime()) / 1000
      );
      return Math.max(timeLeft - elapsed, 0);
    }
    return timeLeft;
  };

  const addTime = (minutes: number) => {
    if (localTimeLeft + minutes * 60 > 3600) {
      return;
    }
    socket.emit(
      "updateTimer",
      roomId,
      {
        isRunning,
        timeLeft: timeLeft + minutes * 60,
        startTime: isRunning ? startTime : null,
      },
      userInfo.lobby?.credentials
    );
  };

  const toggleTimer = () => {
    const currentStartTime = isRunning ? null : new Date().toISOString();

    socket.emit(
      "updateTimer",
      roomId,
      {
        isRunning: !isRunning,
        timeLeft: isRunning ? localTimeLeft : calculateTimeLeft(),
        startTime: currentStartTime,
      },
      userInfo.lobby.credentials
    );
  };

  const resetTimer = () => {
    socket.emit(
      "updateTimer",
      roomId,
      {
        isRunning: false,
        timeLeft: 0,
        startTime: null,
      },
      userInfo.lobby.credentials
    );
  };

  useEffect(() => {
    if (isRunning) {
      const calculatedTimeLeft = calculateTimeLeft();
      setLocalTimeLeft(calculatedTimeLeft);

      if (intervalId) {
        clearInterval(intervalId);
      }
      const id = setInterval(() => {
        setLocalTimeLeft((prev) => {
          if (prev <= 0) {
            clearInterval(id);
            socket.emit(
              "updateTimer",
              roomId,
              {
                isRunning: false,
                timeLeft: 0,
                startTime: null,
              },
              userInfo.lobby.credentials
            );
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      setIntervalId(id);
    } else {
      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }
      setLocalTimeLeft(timeLeft);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isRunning, timeLeft, startTime]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        timerRef.current &&
        !timerRef.current.contains(event.target as Node)
      ) {
        setShowOptions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className={classNames("timer-container", {
        "is-locale-time-left": Boolean(localTimeLeft),
      })}
      ref={timerRef}
    >
      <button
        className="timer-trigger"
        onClick={() => setShowOptions(!showOptions)}
      >
        <IconAlarm size={26} />
        {Boolean(localTimeLeft) && <span>{formatTime(localTimeLeft)}</span>}
      </button>

      {showOptions && (
        <div className="timer-dropdown">
          <div className="timer-options">
            {TIME_OPTIONS.map((option) => (
              <button
                key={option.minutes}
                className="timer-option"
                onClick={() => addTime(option.minutes)}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="timer-controls">
            <button
              className={`timer-control ${!localTimeLeft ? "disabled" : ""}`}
              onClick={toggleTimer}
              disabled={!localTimeLeft}
            >
              {isRunning ? (
                <IconPlayerPause size={16} />
              ) : (
                <IconPlayerPlay size={16} />
              )}
            </button>
            <button
              className={`timer-control ${!localTimeLeft ? "disabled" : ""}`}
              onClick={resetTimer}
              disabled={!localTimeLeft}
            >
              <IconRefresh size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Timer;
