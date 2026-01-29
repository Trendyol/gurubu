"use client";

import { use, useEffect, useState } from "react";
import { SocketProvider } from "@/contexts/SocketContext";
import { RetroRoomProvider, useRetroRoom } from "@/contexts/RetroRoomContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LoaderProvider } from "@/contexts/LoaderContext";
import { ToastProvider } from "@/contexts/ToastContext";
import RetroBoard from "@/components/room/retro-board/retro-board";
import RetroNicknameForm from "@/components/room/retro-board/retro-nickname-form";
import { Toaster } from "react-hot-toast";
import "@/styles/room/style.scss";

const RetroPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);
  
  return (
    <RetroRoomProvider retroId={id}>
      <SocketProvider>
        <ThemeProvider>
          <LoaderProvider>
            <ToastProvider>
              <RetroContent retroId={id} />
            </ToastProvider>
          </LoaderProvider>
        </ThemeProvider>
      </SocketProvider>
    </RetroRoomProvider>
  );
};

const RetroContent = ({ retroId }: { retroId: string }) => {
  const { userInfo } = useRetroRoom();
  const [shouldShowNicknameForm, setShouldShowNicknameForm] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const checkUserCredentials = () => {
    const retroLobby = localStorage.getItem("retroLobby");
    const nickname = localStorage.getItem("nickname");
    
    if (retroLobby && nickname) {
      try {
        const lobby = JSON.parse(retroLobby);
        if (lobby.state?.retros?.[retroId]) {
          // User has credentials for this retro
          setShouldShowNicknameForm(false);
        } else {
          // User doesn't have credentials for this retro
          setShouldShowNicknameForm(true);
        }
      } catch (error) {
        console.error("Error parsing retroLobby:", error);
        setShouldShowNicknameForm(true);
      }
    } else {
      // No lobby or nickname found
      setShouldShowNicknameForm(true);
    }
    
    setIsChecking(false);
  };

  useEffect(() => {
    checkUserCredentials();
  }, [retroId]);

  // Also check when userInfo changes (after successful join)
  useEffect(() => {
    if (userInfo?.lobby && userInfo?.nickname) {
      setShouldShowNicknameForm(false);
    }
  }, [userInfo]);

  const handleJoinSuccess = () => {
    // Re-check credentials after successful join
    checkUserCredentials();
  };

  if (isChecking) {
    return (
      <>
        <Toaster />
        <main className="grooming-room">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <p>Loading...</p>
          </div>
        </main>
      </>
    );
  }

  if (shouldShowNicknameForm) {
    return (
      <>
        <Toaster />
        <main className="grooming-room">
          <RetroNicknameForm retroId={retroId} onJoinSuccess={handleJoinSuccess} />
        </main>
      </>
    );
  }

  return (
    <>
      <Toaster />
      <main className="grooming-room">
        <RetroBoard roomId={retroId} />
      </main>
    </>
  );
};

export default RetroPage;
