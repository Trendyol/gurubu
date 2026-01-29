"use client";

import React, { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { getCurrentRetroLobby } from "@/shared/helpers/lobbyStorage";
import { RetroInfo as RetroInfoType } from "@/shared/interfaces";

interface UserInfo {
  nickname: string;
  lobby: {
    userID: number;
    credentials: string;
    expiredAt: number;
  };
}

interface RetroContextValues {
  userInfo: UserInfo;
  retroInfo: RetroInfoType;
  setRetroInfo: (info: RetroInfoType) => void;
  setUserInfo: (info: UserInfo) => void;
}

const RetroRoomContext = createContext({} as RetroContextValues);

export function useRetroRoom() {
  return useContext(RetroRoomContext);
}

interface RetroRoomProviderProps {
  children: ReactNode;
  retroId: string;
}

export function RetroRoomProvider({ children, retroId }: RetroRoomProviderProps) {
  const [userInfo, setUserInfo] = useState({} as UserInfo);
  const [retroInfo, setRetroInfo] = useState({} as RetroInfoType);

  useEffect(() => {
    const nickname = localStorage.getItem("nickname");
    const lobby = getCurrentRetroLobby(retroId);

    if (!nickname || !lobby) {
      return;
    }

    setUserInfo({
      nickname,
      lobby,
    });
  }, [retroId]);

  const value = {
    userInfo,
    retroInfo,
    setRetroInfo,
    setUserInfo,
  };

  return (
    <RetroRoomContext.Provider value={value}>
      {children}
    </RetroRoomContext.Provider>
  );
}
