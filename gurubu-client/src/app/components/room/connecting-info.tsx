import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { RoomService } from "../../services/roomService";
import { ROOM_STATUS } from "../../room/[id]/enums";
import { useGroomingRoom } from "../../contexts/GroomingRoomContext";

interface IProps {
  roomId: string;
}

const ConnectingInfo = ({ roomId }: IProps) => {
  const { roomStatus, setRoomStatus } = useGroomingRoom();

  const roomService = new RoomService(process.env.NEXT_PUBLIC_API_URL || "");

  const fetchRoomId = async () => {
    const response = await roomService.getRoom(roomId);
    if (!response.isSuccess) {
      setRoomStatus(ROOM_STATUS.NOT_FOUND);
      return;
    }

    setRoomStatus(ROOM_STATUS.FOUND);
  };

  useEffect(() => {
    fetchRoomId();
  }, []);

  if (roomStatus === ROOM_STATUS.NOT_FOUND) {
    notFound();
  }

  if (roomStatus === ROOM_STATUS.FOUND) {
    return null;
  }

  return (
    <div className="connecting-info">
      <p className="connecting-info__message">Connecting to the room...</p>
    </div>
  );
};

export default ConnectingInfo;
