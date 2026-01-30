import React, { ReactNode, createContext, useContext, useEffect } from "react";
import io, { Socket } from "socket.io-client";

const retroSocket = io(`${process.env.NEXT_PUBLIC_API_URL}/retro` || "", {
  autoConnect: false,
});

const RetroSocketContext = createContext<Socket>(retroSocket);

export function useRetroSocket() {
  return useContext(RetroSocketContext);
}

export function RetroSocketProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    retroSocket.connect();

    return () => {
      retroSocket.disconnect();
    };
  }, []);

  return (
    <RetroSocketContext.Provider value={retroSocket}>
      {children}
    </RetroSocketContext.Provider>
  );
}
