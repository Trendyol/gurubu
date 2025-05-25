"use client";

import React, { ReactNode, createContext, useContext, useEffect, useMemo, useState } from "react";
import { ROOM_STATUS } from "@/room/[id]/enums";
import { getCurrentLobby } from "@/shared/helpers/lobbyStorage";
import { EncounteredError, GroomingInfo, UserInfo, UserVote } from "@/shared/interfaces";

interface GroomingContextValues {
  roomStatus: keyof typeof ROOM_STATUS;
  setRoomStatus: Function;
  userInfo: UserInfo;
  groomingInfo: GroomingInfo;
  setGroomingInfo: Function;
  userVote: UserVote;
  setUserVote: Function;
  setUserinfo: Function;
  encounteredError: EncounteredError;
  setEncounteredError: Function;
  showErrorPopup: boolean;
  setShowErrorPopup: Function;
  editVoteClicked: boolean;
  setEditVoteClicked: Function;
  currentJiraIssueIndex: number;
  setCurrentJiraIssueIndex: (value: number) => void;
  jiraSidebarExpanded: boolean;
  setJiraSidebarExpanded: (value: boolean) => void;
  isAnnouncementBannerVisible: boolean;
  setIsAnnouncementBannerVisible: (value: boolean) => void;
  pProfileStorage: {
    isSelected: boolean;
    isLoginClicked: boolean;
    isConsentGiven: boolean;
  };
  setPProfileStorage: (value: { isSelected: boolean; isLoginClicked: boolean; isConsentGiven: boolean; }) => void;
}

const GroomingRoomContext = createContext({} as GroomingContextValues);

export function useGroomingRoom() {
  return useContext(GroomingRoomContext);
}

export function GroomingRoomProvider({ children, roomId }: GroomingRoomProviderProps) {
  const [roomStatus, setRoomStatus] = useState(ROOM_STATUS.CHECKING);
  const [userInfo, setUserinfo] = useState({} as UserInfo);
  const [groomingInfo, setGroomingInfo] = useState({} as GroomingInfo);
  const [userVote, setUserVote] = useState({} as UserVote);
  const [encounteredError, setEncounteredError] = useState({} as EncounteredError);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [editVoteClicked, setEditVoteClicked] = useState(false);
  const [currentJiraIssueIndex, setCurrentJiraIssueIndex] = useState(0);
  const [jiraSidebarExpanded, setJiraSidebarExpanded] = useState(false);
  const [isAnnouncementBannerVisible, setIsAnnouncementBannerVisible] = useState(true);
  const [pProfileStorage, setPProfileStorage] = useState({
    isSelected: false,
    isLoginClicked: false,
    isConsentGiven: false,
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const pProfileData = JSON.parse(localStorage.getItem("pProfile") || "{}");
      
      setPProfileStorage(prev => ({
        ...prev,
        isConsentGiven: pProfileData.isConsentGiven ?? false
      }));
    }
  }, []);

  useEffect(() => {
    const nickname = localStorage.getItem("nickname");
    const lobby = getCurrentLobby(roomId);

    if (!nickname || !lobby) {
      return;
    }

    setUserinfo({
      nickname,
      lobby,
    });
  }, [roomId]);

  const values = useMemo(
    () => ({
      roomStatus,
      setRoomStatus,
      userInfo,
      groomingInfo,
      setGroomingInfo,
      userVote,
      setUserVote,
      setUserinfo,
      encounteredError,
      setEncounteredError,
      showErrorPopup,
      setShowErrorPopup,
      editVoteClicked,
      setEditVoteClicked,
      currentJiraIssueIndex,
      setCurrentJiraIssueIndex,
      jiraSidebarExpanded,
      setJiraSidebarExpanded,
      isAnnouncementBannerVisible,
      setIsAnnouncementBannerVisible,
      pProfileStorage,
      setPProfileStorage
    }),
    [
      roomStatus,
      setRoomStatus,
      userInfo,
      groomingInfo,
      setGroomingInfo,
      userVote,
      setUserVote,
      setUserinfo,
      encounteredError,
      setEncounteredError,
      showErrorPopup,
      setShowErrorPopup,
      editVoteClicked,
      setEditVoteClicked,
      currentJiraIssueIndex,
      setCurrentJiraIssueIndex,
      jiraSidebarExpanded,
      setJiraSidebarExpanded,
      isAnnouncementBannerVisible,
      setIsAnnouncementBannerVisible,
      pProfileStorage,
      setPProfileStorage
    ]
  );
  return <GroomingRoomContext.Provider value={values}>{children}</GroomingRoomContext.Provider>;
}

type GroomingRoomProviderProps = {
  children: ReactNode;
  roomId: string;
};
