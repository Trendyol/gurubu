import { RoomService } from '../../services/roomService';

export const handleRoomJoin = async (
  nickname: string,
  isFastJoin: boolean = false,
  roomId?: string,
  isAdmin?: boolean
): Promise<void> => {
  const trimmedNickName = nickname.trim();
  if (trimmedNickName === "" || !roomId) {
    return;
  }
  
  localStorage.setItem("nickname", trimmedNickName);
  const payload = { nickName: trimmedNickName, isAdmin };
  const roomService = new RoomService(process.env.NEXT_PUBLIC_API_URL || "");
  const response = await roomService.join(roomId, payload);

  if (!response) {
    return;
  }

  let lobby = JSON.parse(localStorage.getItem("lobby") || "{}");

  if (!Object.keys(lobby).length) {
    const lobbyContent = {
      state: {
        rooms: {
          [response.roomID]: response,
        },
      },
    };
    lobby = lobbyContent;
    localStorage.setItem("lobby", JSON.stringify(lobbyContent));
  }

  lobby.state.rooms[response.roomID] = response;
  localStorage.setItem("lobby", JSON.stringify(lobby));

  const url = `/room/${response.roomID}${isFastJoin ? '?isFastJoin=true' : ''}`;
  window.location.assign(url);
};