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
  const { roomStatus, setGroomingInfo, setUserVote, setEditVoteClicked } = useGroomingRoom();

  useEffect(() => {
    if (roomStatus === ROOM_STATUS.FOUND) {
      socket.connect();
    }
    // Clean up the socket connection when the component unmounts
    return () => {
      socket.disconnect();
    };
  }, [roomStatus]);

  useEffect(() => {
    const handleVoteSent = (data: GroomingInfo) => {
      setGroomingInfo(data);
    };

    const handleShowResults = (data: GroomingInfo) => setGroomingInfo(data);

    const handleResetVotes = (data: GroomingInfo) => {
      setUserVote({});
      setGroomingInfo(data);
      setEditVoteClicked(false);
    };

    socket.on("voteSent", handleVoteSent);
    socket.on("showResults", handleShowResults);
    socket.on("resetVotes", handleResetVotes);

    return () => {
      socket.off("voteSent", handleVoteSent);
      socket.off("showResults", handleShowResults);
      socket.off("resetVotes", handleResetVotes);
    };
  }, [setGroomingInfo, setEditVoteClicked, setUserVote])

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
}

type SocketProviderProps = {
  children: ReactNode;
};
