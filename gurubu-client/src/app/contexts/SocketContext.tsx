import React, { ReactNode, createContext, useContext, useEffect } from "react";
import io from "socket.io-client";
import { useGroomingRoom } from "./GroomingRoomContext";
import { ROOM_STATUS } from "@/room/[id]/enums";
import { GroomingInfo } from "@/shared/interfaces";

const socket = io(process.env.NEXT_PUBLIC_API_URL || "", {
  autoConnect: false,
});
const SocketContext = createContext(socket);

export function useSocket() {
  return useContext(SocketContext);
}

export function SocketProvider({ children }: SocketProviderProps) {
  // Try to get grooming context, but don't fail if it doesn't exist (for retro pages)
  let roomStatus: string | undefined = undefined;
  let setGroomingInfo: Function | undefined = undefined;
  let setUserVote: Function | undefined = undefined;
  let setEditVoteClicked: Function | undefined = undefined;
  
  try {
    const groomingContext = useGroomingRoom();
    roomStatus = groomingContext.roomStatus;
    setGroomingInfo = groomingContext.setGroomingInfo;
    setUserVote = groomingContext.setUserVote;
    setEditVoteClicked = groomingContext.setEditVoteClicked;
  } catch (e) {
    // Not in a grooming context, probably in retro
    console.debug("Not in grooming context, skipping grooming-specific setup");
  }

  useEffect(() => {
    // Connect socket for grooming rooms when status is FOUND, or always for retro
    if (!roomStatus || roomStatus === ROOM_STATUS.FOUND) {
      socket.connect();
    }
    // Clean up the socket connection when the component unmounts
    return () => {
      socket.disconnect();
    };
  }, [roomStatus]);

  useEffect(() => {
    // Only set up grooming-specific handlers if we have the context
    if (!setGroomingInfo) {
      return;
    }

    const handleVoteSent = (data: GroomingInfo) => {
      setGroomingInfo(data);
    };

    const setIssues = (data: GroomingInfo) => {
      setGroomingInfo(data);
    };

    const setGurubuAI = (data: GroomingInfo) => {
      setGroomingInfo(data);
    };

    const updateTimer = (data: GroomingInfo) => {
      setGroomingInfo(data);
    }

    const handleShowResults = (data: GroomingInfo) => setGroomingInfo(data);

    const handleResetVotes = (data: GroomingInfo) => {
      setUserVote?.({});
      setGroomingInfo(data);
      setEditVoteClicked?.(false);
    };

    const updateAvatar = (data: GroomingInfo) => {
      setGroomingInfo(data);
    }

    const updateProfilePicture = (data: GroomingInfo) => {
      setGroomingInfo(data);
    }

    socket.on("voteSent", handleVoteSent);
    socket.on("showResults", handleShowResults);
    socket.on("resetVotes", handleResetVotes);
    socket.on("setIssues", setIssues);
    socket.on("setGurubuAI", setGurubuAI);
    socket.on("updateTimer", updateTimer);
    socket.on("updateAvatar", updateAvatar);
    socket.on("updateProfilePicture", updateProfilePicture);

    return () => {
      socket.off("voteSent", handleVoteSent);
      socket.off("showResults", handleShowResults);
      socket.off("resetVotes", handleResetVotes);
      socket.off("setIssues", setIssues);
      socket.off("setGurubuAI", setGurubuAI);
      socket.off("updateTimer", updateTimer);
      socket.off("updateAvatar", updateAvatar);
      socket.off("updateProfilePicture", updateProfilePicture);
    };
  }, [setGroomingInfo, setEditVoteClicked, setUserVote])

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
}

type SocketProviderProps = {
  readonly children: ReactNode;
};
