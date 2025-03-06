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
}

const GroomingRoomContext = createContext({} as GroomingContextValues);

export function useGroomingRoom() {
  return useContext(GroomingRoomContext);
}

export function GroomingRoomProvider({ children, roomId }: GroomingRoomProviderProps) {
  const [roomStatus, setRoomStatus] = useState(ROOM_STATUS.CHECKING);
  const [userInfo, setUserinfo] = useState({lobby: {isAdmin: true },nickname: "Armagan"} as any);
  const [groomingInfo, setGroomingInfo] = useState({
    "mode": "0",
    "participants": {
      "0": {
        "userID": 0,
        "nickname": "Armagan",
        "roomID": "e44fabf2-fe3f-4115-885e-117d7d6355bf",
        "sockets": [
          "ZvbLDqyZZdoZ47lqAAAH"
        ],
        "isAdmin": true,
        "connected": true,
        "avatar": {
          "seed": "xie3wsmnu9",
          "scale": 150
        },
        "votes": {
          "storyPoint": "2"
        }
      },
      "1": {
        "userID": 1,
        "nickname": "HelloFigma",
        "roomID": "e44fabf2-fe3f-4115-885e-117d7d6355bf",
        "sockets": [
          "NcA0GdSQRLhyWPbKAAAF"
        ],
        "isAdmin": false,
        "connected": true,
        "avatar": {
          "seed": "yzrl7syjjdc"
        },
        "votes": {
          "storyPoint": "3"
        }
      }
    },
    "metrics": [
      {
        "id": 1,
        "name": "storyPoint",
        "displayName": "Story Point",
        "points": [
          "0.5",
          "1",
          "2",
          "3",
          "5",
          "8",
          "13",
          "21",
          "?",
          "break"
        ],
        "text": "Story point of task"
      }
    ],
    "score": "3.00",
    "status": "ongoing",
    "isResultShown": true,
    "issues": [],
    "timer": {
      "timeLeft": 0,
      "isRunning": false
    }
  } as any);
  const [userVote, setUserVote] = useState({} as UserVote);
  const [encounteredError, setEncounteredError] = useState({} as EncounteredError);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [editVoteClicked, setEditVoteClicked] = useState(false);
  const [currentJiraIssueIndex, setCurrentJiraIssueIndex] = useState(0);
  const [jiraSidebarExpanded, setJiraSidebarExpanded] = useState(false);
  const [isAnnouncementBannerVisible, setIsAnnouncementBannerVisible] = useState(true);

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
      setIsAnnouncementBannerVisible
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
      setIsAnnouncementBannerVisible
    ]
  );
  return <GroomingRoomContext.Provider value={values}>{children}</GroomingRoomContext.Provider>;
}

type GroomingRoomProviderProps = {
  children: ReactNode;
  roomId: string;
};
