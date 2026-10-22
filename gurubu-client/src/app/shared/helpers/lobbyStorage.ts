export const checkUserJoinedLobbyBefore = (roomId: string) => {
  if (typeof window !== "undefined") {
    const lobby = JSON.parse(localStorage.getItem("lobby") || "{}");
    if (!Object.keys(lobby).length) {
      return false;
    }

    if (!lobby.state.rooms[roomId]?.userID?.toString()) {
      return false;
    }

    return true;
  }

  return false;
};

export const getCurrentLobby = (roomId: string) => {
  clearExpiredRooms();
  if (typeof window !== "undefined") {
    const lobby = JSON.parse(localStorage.getItem("lobby") || "{}");
    if (!Object.keys(lobby).length) {
      return null;
    }

    return lobby.state.rooms[roomId];
  }
};

// The nickname belongs to the room, not to the browser: joining a second
// room must not change the name shown in the first one (#23). Falls back to
// the legacy global key for users whose lobby predates per-room nicknames.
export const getCurrentNickname = (roomId: string) => {
  if (typeof window === "undefined") {
    return "";
  }

  const lobby = getCurrentLobby(roomId);
  return lobby?.nickname || localStorage.getItem("nickname") || "";
};

export const setCurrentNickname = (roomId: string, nickname: string) => {
  if (typeof window === "undefined") {
    return;
  }

  const lobby = JSON.parse(localStorage.getItem("lobby") || "{}");
  if (!lobby.state?.rooms?.[roomId]) {
    return;
  }

  lobby.state.rooms[roomId].nickname = nickname;
  localStorage.setItem("lobby", JSON.stringify(lobby));
};

function clearExpiredRooms() {
  const currentTime = new Date().getTime();
  if (typeof window !== "undefined") {
    const lobby = JSON.parse(localStorage.getItem("lobby") || "{}");
    if (!Object.keys(lobby).length) {
      return null;
    }

    Object.keys(lobby.state.rooms).forEach((roomKey) => {
      if (lobby.state.rooms[roomKey].expiredAt < currentTime) {
        delete lobby.state.rooms[roomKey];
      }
    });

    localStorage.setItem("lobby", JSON.stringify(lobby));
  }
}
