import Image from "next/image";
import { useGroomingRoom } from "@/contexts/GroomingRoomContext";
import { useSocket } from "@/contexts/SocketContext";
import React from "react";

type Props = {
  roomId: string;
  closeModal: () => void;
};

export const LeaveRoom = ({ roomId, closeModal }: Props) => {
  const socket = useSocket();
  const { userInfo } = useGroomingRoom();

  const handleRemoveUser = async () => {
    socket.emit("removeUser", roomId, userInfo.lobby.userID, userInfo.lobby.credentials);
  };
  return (
    <div className="leave-room">
      <div className="leave-room__error-sign">
        <Image src="/leave-room.svg" width={12} height={12} alt="Close Leave Room Modal" />
      </div>
      <h4>Leave the room</h4>
      <h5>
        Are you sure you want to leave the room? If you leave the room, you can enter with the same
        link as long as the session continues.
      </h5>
      <div className="leave-room__dialog-buttons">
        <button onClick={closeModal}>Cancel</button>
        <button onClick={handleRemoveUser}>Leave</button>
      </div>
    </div>
  );
};
