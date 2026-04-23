"use client";

import { use, useEffect, useState } from "react";
import { PresentationSocketProvider } from "@/contexts/PresentationSocketContext";
import { PresentationRoomProvider, usePresentationRoom } from "@/contexts/PresentationRoomContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LoaderProvider } from "@/contexts/LoaderContext";
import { ToastProvider } from "@/contexts/ToastContext";
import PresentationBoard from "@/components/room/presentation-board/presentation-board";
import PresentationNicknameForm from "@/components/room/presentation-board/presentation-nickname-form";
import PresentationErrorPage from "@/components/room/presentation-board/PresentationErrorPage";
import PresentationLoadingScreen from "@/components/room/presentation-board/PresentationLoadingScreen";
import { PresentationService } from "@/services/presentationService";
import { Toaster } from "react-hot-toast";
import "@/styles/room/style.scss";

const PresentationPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);
  
  return (
    <PresentationRoomProvider presentationId={id}>
      <PresentationSocketProvider>
        <ThemeProvider>
          <LoaderProvider>
            <ToastProvider>
              <PresentationContent presentationId={id} />
            </ToastProvider>
          </LoaderProvider>
        </ThemeProvider>
      </PresentationSocketProvider>
    </PresentationRoomProvider>
  );
};

const PresentationContent = ({ presentationId }: { presentationId: string }) => {
  const { userInfo } = usePresentationRoom();
  const [shouldShowNicknameForm, setShouldShowNicknameForm] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [presentationExists, setPresentationExists] = useState<boolean | null>(null);
  const [errorType, setErrorType] = useState<'not-found' | 'expired' | 'error'>('not-found');

  const checkPresentationExists = async () => {
    try {
      const presentationService = new PresentationService(process.env.NEXT_PUBLIC_API_URL || "");
      const result = await presentationService.getPresentation(presentationId);
      
      if (result && (result.presentationId || result.title)) {
        setPresentationExists(true);
        checkUserCredentials();
      } else {
        setPresentationExists(false);
        setErrorType('not-found');
        setIsChecking(false);
      }
    } catch (error: any) {
      setPresentationExists(false);
      
      if (error?.response?.status === 404) {
        setErrorType('not-found');
      } else {
        setErrorType('error');
      }
      
      setIsChecking(false);
    }
  };

  const checkUserCredentials = () => {
    const presentationLobby = localStorage.getItem("presentationLobby");
    const presentationNickname = localStorage.getItem("presentationNickname");
    
    if (presentationLobby && presentationNickname) {
      try {
        const lobby = JSON.parse(presentationLobby);
        if (lobby.state?.presentations?.[presentationId]) {
          // User has credentials for this presentation
          setShouldShowNicknameForm(false);
        } else {
          // User doesn't have credentials for this presentation
          setShouldShowNicknameForm(true);
        }
      } catch (error) {
        console.error("Error parsing presentationLobby:", error);
        setShouldShowNicknameForm(true);
      }
    } else {
      // No lobby or nickname found
      setShouldShowNicknameForm(true);
    }
    
    setIsChecking(false);
  };

  useEffect(() => {
    checkPresentationExists();
  }, [presentationId]);

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
        <PresentationLoadingScreen />
      </>
    );
  }

  if (presentationExists === false) {
    return (
      <>
        <Toaster />
        <PresentationErrorPage type={errorType} />
      </>
    );
  }

  if (shouldShowNicknameForm) {
    return (
      <>
        <Toaster />
        <main className="grooming-room">
          <PresentationNicknameForm presentationId={presentationId} onJoinSuccess={handleJoinSuccess} />
        </main>
      </>
    );
  }

  return (
    <>
      <Toaster />
      <main className="grooming-room">
        <PresentationBoard presentationId={presentationId} />
      </main>
    </>
  );
};

export default PresentationPage;
