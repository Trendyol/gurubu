import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { createAvatar } from "@dicebear/core";
import { avataaars } from "@dicebear/collection";
import { useSocket } from "./SocketContext";
import { useGroomingRoom } from "./GroomingRoomContext";
import { Avatar } from "@/shared/interfaces";

interface AvatarContextType {
  createAvatarSvg: (value: Avatar) => string;
  updateAvatar: (value: Avatar) => void;
  avatar: string;
  setAvatar: (value: string) => void;
  avatarOptions: any;
  setAvatarOptions: any;
  initializeAvatarOptions: () => Avatar;
  regenerateAvatarOptions: () => { seed: string };
}

const AvatarContext = createContext<AvatarContextType>({} as AvatarContextType);

export const useAvatar = () => {
  const context = useContext(AvatarContext);
  if (!context) {
    throw new Error("useAvatar must be used within an AvatarProvider");
  }
  return context;
};

interface AvatarProviderProps {
  children: React.ReactNode;
}

export const AvatarProvider = ({ children }: AvatarProviderProps) => {
  const socket = useSocket();
  const { userInfo } = useGroomingRoom();
  const [avatarOptions, setAvatarOptions] = useState({});
  const [avatar, setAvatar] = useState<string>("");

  const initializeAvatarOptions = useCallback(() => {
    try {
      const localAvatarOptions = localStorage.getItem("avatarOptions");
      if (localAvatarOptions) {
        const parsedOptions = JSON.parse(localAvatarOptions);
        setAvatarOptions(parsedOptions);
        return parsedOptions;
      }
    } catch (error) {
      console.error("Error parsing avatar options:", error);
    }

    const generatedSeed = Math.random().toString(36).substring(2);
    const newOptions = { seed: generatedSeed };
    setAvatarOptions(newOptions);
    localStorage.setItem("avatarOptions", JSON.stringify(newOptions));
    return newOptions;
  }, []);

  const regenerateAvatarOptions = useCallback(() => {
    const generatedSeed = Math.random().toString(36).substring(2);
    const newOptions = { seed: generatedSeed };
    return newOptions;
  }, []);

  const createAvatarSvg = useCallback((options: Avatar) => {
    const avatar = createAvatar(avataaars, { ...options, mouth: ["smile"] });
    return avatar.toString();
  }, []);

  const updateAvatar = useCallback(
    (options: Avatar) => {
      if(!userInfo.lobby?.roomID || !userInfo.lobby?.credentials) {
        return;
      }
      socket.emit(
        "updateAvatar",
        userInfo.lobby?.roomID,
        options,
        userInfo.lobby?.credentials
      );
    },
    [socket, userInfo.lobby?.roomID, userInfo.lobby?.credentials]
  );

  const contextValue = useMemo(
    () => ({
      createAvatarSvg,
      updateAvatar,
      avatar,
      setAvatar,
      avatarOptions,
      setAvatarOptions,
      initializeAvatarOptions,
      regenerateAvatarOptions,
    }),
    [
      createAvatarSvg,
      updateAvatar,
      avatar,
      avatarOptions,
      initializeAvatarOptions,
      regenerateAvatarOptions,
    ]
  );

  return (
    <AvatarContext.Provider value={contextValue}>
      {children}
    </AvatarContext.Provider>
  );
};
