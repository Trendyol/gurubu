"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SocketProvider, useSocket } from "@/contexts/SocketContext";
import { GroomingRoomProvider, useGroomingRoom } from "@/contexts/GroomingRoomContext";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import { LoaderProvider } from "@/contexts/LoaderContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { AvatarProvider } from "@/contexts/AvatarContext";
import Logo from "@/components/common/logo";
import VotingStick from "@/components/room/grooming-board/voting-stick";
import VotingStickV2 from "@/components/room/grooming-board/voting-stick-v2";
import Loading from "@/components/room/loading";
import { GroomingMode } from "@/shared/enums";
import { checkUserJoinedLobbyBefore, getCurrentLobby } from "@/shared/helpers/lobbyStorage";
import { GroomingInfo } from "@/shared/interfaces";
import { ROOM_STATUS } from "@/room/[id]/enums";
import "@/styles/voting-window/style.scss";

const VotingWindow = () => {
  const searchParams = useSearchParams();
  const roomId = searchParams.get("roomId");

  if (!roomId) {
    return (
      <div className="voting-window-error">
        <p>Room ID is required</p>
      </div>
    );
  }

  return (
    <GroomingRoomProvider roomId={roomId}>
      <SocketProvider>
        <ThemeProvider>
          <LoaderProvider>
            <ToastProvider>
              <AvatarProvider>
                <VotingWindowContent roomId={roomId} />
              </AvatarProvider>
            </ToastProvider>
          </LoaderProvider>
        </ThemeProvider>
      </SocketProvider>
    </GroomingRoomProvider>
  );
};

const VotingWindowContent = ({ roomId }: { roomId: string }) => {
  const socket = useSocket();
  const { groomingInfo, setUserVote, setGroomingInfo, setRoomStatus, roomStatus } = useGroomingRoom();
  const { currentTheme } = useTheme();
  const [isInitialized, setIsInitialized] = useState(false);

  const isGroomingInfoLoaded = Boolean(Object.keys(groomingInfo).length);
  const isScoreGrooming = groomingInfo.mode === GroomingMode.ScoreGrooming;
  const isPlanningPoker = groomingInfo.mode === GroomingMode.PlanningPoker;

  useEffect(() => {
    document.body.classList.add(`${currentTheme}-active`, "voting-window-body");
    return () => {
      document.body.classList.remove(`${currentTheme}-active`, "voting-window-body");
    };
  }, [currentTheme]);

  useEffect(() => {
    if (checkUserJoinedLobbyBefore(roomId)) {
      const lobby = getCurrentLobby(roomId);
      if (lobby) {
        setRoomStatus(ROOM_STATUS.FOUND);
      }
    }
  }, [roomId, setRoomStatus]);

  useEffect(() => {
    if (roomStatus !== ROOM_STATUS.FOUND) {
      return;
    }

    const handleInitialize = (data: GroomingInfo) => {
      const lobby = getCurrentLobby(roomId);
      if (lobby && data?.participants[lobby.userID]) {
        setUserVote(data.participants[lobby.userID].votes);
        setGroomingInfo(data);
      }
    };

    const handleUserDisconnected = (data: GroomingInfo) => {
      setGroomingInfo(data);
    };

    const handleVoteSent = (data: GroomingInfo) => {
      setGroomingInfo(data);
    };

    const handleShowResults = (data: GroomingInfo) => {
      setGroomingInfo(data);
    };

    const handleResetVotes = (data: GroomingInfo) => {
      setUserVote({});
      setGroomingInfo(data);
    };

    const nickname = localStorage.getItem("nickname");
    const lobby = getCurrentLobby(roomId);
    
    if (!lobby) {
      return;
    }

    socket.emit("joinRoom", {
      nickname,
      roomID: roomId,
      lobby,
    });

    socket.on("initialize", handleInitialize);
    socket.on("userDisconnected", handleUserDisconnected);
    socket.on("voteSent", handleVoteSent);
    socket.on("showResults", handleShowResults);
    socket.on("resetVotes", handleResetVotes);

    return () => {
      socket.off("initialize", handleInitialize);
      socket.off("userDisconnected", handleUserDisconnected);
      socket.off("voteSent", handleVoteSent);
      socket.off("showResults", handleShowResults);
      socket.off("resetVotes", handleResetVotes);
    };
  }, [roomId, socket, setUserVote, setGroomingInfo, roomStatus]);

  useEffect(() => {
    if (isGroomingInfoLoaded && !isInitialized) {
      setIsInitialized(true);
    }
  }, [isGroomingInfoLoaded, isInitialized]);

  if (!isGroomingInfoLoaded) {
    return (
      <div className="voting-window">
        <div className="voting-window__header">
          <Logo />
        </div>
        <div className="voting-window__loading">
          <Loading />
        </div>
      </div>
    );
  }

  return (
    <div className="voting-window">
      <div className="voting-window__header">
        <Logo />
        <p className="voting-window__subtitle">Vote privately while screen sharing</p>
      </div>

      <div className="voting-window__content">
        {isScoreGrooming && (
          <div className="voting-window__voting-sticks">
            {groomingInfo.metrics?.map((metric) => (
              <VotingStick
                key={metric.id}
                points={metric.points}
                name={metric.name}
                displayName={metric.displayName}
              />
            ))}
          </div>
        )}

        {isPlanningPoker && (
          <div className="voting-window__voting-sticks voting-window__voting-sticks--poker">
            {groomingInfo.metrics?.map((metric) => (
              <VotingStickV2
                key={metric.id}
                points={metric.points}
                name={metric.name}
              />
            ))}
          </div>
        )}
      </div>

      <div className="voting-window__footer">
        <p className="voting-window__hint">Your votes are synced with the main window</p>
      </div>
    </div>
  );
};

export default VotingWindow;

