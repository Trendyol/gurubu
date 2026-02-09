"use client";

import { use, useEffect, useState } from "react";
import { RetroSocketProvider } from "@/contexts/RetroSocketContext";
import { RetroRoomProvider, useRetroRoom } from "@/contexts/RetroRoomContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LoaderProvider } from "@/contexts/LoaderContext";
import { ToastProvider } from "@/contexts/ToastContext";
import RetroBoard from "@/components/room/retro-board/retro-board";
import RetroNicknameForm from "@/components/room/retro-board/retro-nickname-form";
import RetroErrorPage from "@/components/room/retro-board/RetroErrorPage";
import RetroLoadingScreen from "@/components/room/retro-board/RetroLoadingScreen";
import { RetroService } from "@/services/retroService";
import { Toaster } from "react-hot-toast";
import "@/styles/room/style.scss";

const RetroPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);
  
  return (
    <RetroRoomProvider retroId={id}>
      <RetroSocketProvider>
        <ThemeProvider>
          <LoaderProvider>
            <ToastProvider>
              <RetroContent retroId={id} />
            </ToastProvider>
          </LoaderProvider>
        </ThemeProvider>
      </RetroSocketProvider>
    </RetroRoomProvider>
  );
};

const RetroContent = ({ retroId }: { retroId: string }) => {
  const { userInfo } = useRetroRoom();
  const [shouldShowNicknameForm, setShouldShowNicknameForm] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [retroExists, setRetroExists] = useState<boolean | null>(null);
  const [errorType, setErrorType] = useState<'not-found' | 'expired' | 'error'>('not-found');

  const checkRetroExists = async () => {
    try {
      const retroService = new RetroService(process.env.NEXT_PUBLIC_API_URL || "");
      const result = await retroService.getRetro(retroId);
      
      if (result && (result.retroId || result.title)) {
        setRetroExists(true);
        checkUserCredentials();
      } else {
        setRetroExists(false);
        setErrorType('not-found');
        setIsChecking(false);
      }
    } catch (error: any) {
      console.error("Error checking retro:", error);
      setRetroExists(false);
      
      // Check if it's a 404 (not found) or other error
      if (error?.response?.status === 404) {
        setErrorType('not-found');
      } else {
        setErrorType('error');
      }
      
      setIsChecking(false);
    }
  };

  const checkUserCredentials = () => {
    const retroLobby = localStorage.getItem("retroLobby");
    const retroNickname = localStorage.getItem("retroNickname");
    
    if (retroLobby && retroNickname) {
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
    checkRetroExists();
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
        <RetroLoadingScreen />
      </>
    );
  }

  if (retroExists === false) {
    return (
      <>
        <Toaster />
        <RetroErrorPage type={errorType} />
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
