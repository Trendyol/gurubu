import React, { ReactNode, createContext, useContext, useEffect } from "react";
import io from "socket.io-client";
import { useGroomingRoom } from "./GroomingRoomContext";
import { ROOM_STATUS } from "../../app/room/[id]/enums";

const socket = io(process.env.NEXT_PUBLIC_API_URL || "", {
  autoConnect: false,
});
const SocketContext = createContext(socket);

export function useSocket() {
  return useContext(SocketContext);
}

export function SocketProvider({ children }: SocketProviderProps) {
  const { roomStatus } = useGroomingRoom();
  useEffect(() => {
    if (roomStatus === ROOM_STATUS.FOUND) {
      socket.connect();
    }
    // Clean up the socket connection when the component unmounts
    return () => {
      socket.disconnect();
    };
  }, [roomStatus]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}

type SocketProviderProps = {
  children: ReactNode;
};
