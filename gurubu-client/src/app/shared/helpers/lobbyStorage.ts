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

export const getCurrentRetroLobby = (retroId: string) => {
  clearExpiredRetros();
  if (typeof window !== "undefined") {
    const lobby = JSON.parse(localStorage.getItem("retroLobby") || "{}");
    if (!Object.keys(lobby).length) {
      return null;
    }

    return lobby.state.retros[retroId];
  }
};

function clearExpiredRetros() {
  const currentTime = new Date().getTime();
  if (typeof window !== "undefined") {
    const lobby = JSON.parse(localStorage.getItem("retroLobby") || "{}");
    if (!Object.keys(lobby).length) {
      return null;
    }

    Object.keys(lobby.state.retros).forEach((retroKey) => {
      if (lobby.state.retros[retroKey].expiredAt < currentTime) {
        delete lobby.state.retros[retroKey];
      }
    });

    localStorage.setItem("retroLobby", JSON.stringify(lobby));
  }
}

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
