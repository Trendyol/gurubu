import Image from "next/image";
import React, { useEffect } from "react";
import { useGroomingRoom } from "@/contexts/GroomingRoomContext";
import { useSocket } from "@/contexts/SocketContext";
import { GroomingInfo } from "@/shared/interfaces";
import { useRouter } from "next/navigation";

type Props = {
  roomId: string;
  closeModal: () => void;
};

export const LeaveRoom = ({ roomId, closeModal }: Props) => {
  const socket = useSocket();
  const router = useRouter();
  const { userInfo, setGroomingInfo } = useGroomingRoom();

  const handleRemoveUser = () => {
    localStorage.removeItem("lobby");
    socket.emit(
      "removeUser",
      roomId,
      userInfo.lobby.userID,
      userInfo.lobby.credentials
    );
  };

  useEffect(() => {
    const removeUser = (data: GroomingInfo, userId: string) => {
      if (userInfo.lobby.userID === userId) {
        router.push("/");
        setGroomingInfo({});
      } else {
        setGroomingInfo(data);
      }
    };

    socket.on("removeUser", removeUser);

    return () => {
      socket.off("removeUser", removeUser);
    };
  }, [router, socket, setGroomingInfo, userInfo]);

  return (
    <div className="leave-room">
      <div className="leave-room__error-sign">
        <Image
          src="/leave-room.svg"
          width={12}
          height={12}
          alt="Close Leave Room Modal"
        />
      </div>
      <h4>Leave the room</h4>
      <h5>
        Are you sure you want to leave the room? If you leave the room, you can
        enter with the same link as long as the session continues.
      </h5>
      <div className="leave-room__dialog-buttons">
        <button onClick={closeModal}>Cancel</button>
        <button onClick={handleRemoveUser}>Leave</button>
      </div>
    </div>
  );
};
