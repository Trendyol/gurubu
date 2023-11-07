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
