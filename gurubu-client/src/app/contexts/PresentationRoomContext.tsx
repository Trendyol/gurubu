"use client";

import React, { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { getCurrentPresentationLobby } from "@/shared/helpers/lobbyStorage";
import { PresentationInfo } from "@/shared/interfaces";

interface UserInfo {
  nickname: string;
  lobby: {
    userID: number;
    credentials: string;
    expiredAt: number;
  };
}

interface PresentationContextValues {
  userInfo: UserInfo;
  presentationInfo: PresentationInfo;
  setPresentationInfo: (info: PresentationInfo) => void;
  setUserInfo: (info: UserInfo) => void;
  showErrorPopup: boolean;
  setShowErrorPopup: (show: boolean) => void;
}

const PresentationRoomContext = createContext({} as PresentationContextValues);

export function usePresentationRoom() {
  return useContext(PresentationRoomContext);
}

interface PresentationRoomProviderProps {
  children: ReactNode;
  presentationId: string;
}

export function PresentationRoomProvider({ children, presentationId }: PresentationRoomProviderProps) {
  const [userInfo, setUserInfo] = useState({} as UserInfo);
  const [presentationInfo, setPresentationInfo] = useState({} as PresentationInfo);
  const [showErrorPopup, setShowErrorPopup] = useState(false);

  useEffect(() => {
    const nickname = localStorage.getItem("presentationNickname");
    const lobby = getCurrentPresentationLobby(presentationId);

    if (!nickname || !lobby) {
      return;
    }

    setUserInfo({
      nickname,
      lobby,
    });
  }, [presentationId]);

  const value = {
    userInfo,
    presentationInfo,
    setPresentationInfo,
    setUserInfo,
    showErrorPopup,
    setShowErrorPopup,
  };

  return (
    <PresentationRoomContext.Provider value={value}>
      {children}
    </PresentationRoomContext.Provider>
  );
}
