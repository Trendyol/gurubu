import React, { ReactNode, createContext, useContext, useEffect } from "react";
import io, { Socket } from "socket.io-client";

const presentationSocket = io(`${process.env.NEXT_PUBLIC_API_URL}/presentation` || "", {
  autoConnect: false,
});

const PresentationSocketContext = createContext<Socket>(presentationSocket);

export function usePresentationSocket() {
  return useContext(PresentationSocketContext);
}

export function PresentationSocketProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    presentationSocket.connect();

    return () => {
      presentationSocket.disconnect();
    };
  }, []);

  return (
    <PresentationSocketContext.Provider value={presentationSocket}>
      {children}
    </PresentationSocketContext.Provider>
  );
}
