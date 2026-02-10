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

// Retro Dashboard - save retro history for persistent access
export interface RetroHistoryItem {
  retroId: string;
  title: string;
  createdAt: number;
  templateId?: string;
  started?: boolean;
}

export const saveRetroToHistory = (retroId: string, title: string, templateId?: string, started?: boolean) => {
  if (typeof window === 'undefined') return;
  
  const history: RetroHistoryItem[] = JSON.parse(localStorage.getItem("retroHistory") || "[]");
  
  // Check if already exists
  const existingIndex = history.findIndex(item => item.retroId === retroId);
  if (existingIndex >= 0) {
    // Update existing entry
    history[existingIndex].title = title;
    history[existingIndex].templateId = templateId;
    if (started !== undefined) {
      history[existingIndex].started = started;
    }
  } else {
    // Add new entry
    history.unshift({
      retroId,
      title,
      createdAt: Date.now(),
      templateId,
      started: started || false,
    });
  }

  // Keep only last 50 items
  const trimmed = history.slice(0, 50);
  localStorage.setItem("retroHistory", JSON.stringify(trimmed));
};

export const markRetroStarted = (retroId: string) => {
  if (typeof window === 'undefined') return;
  
  const history: RetroHistoryItem[] = JSON.parse(localStorage.getItem("retroHistory") || "[]");
  const item = history.find(h => h.retroId === retroId);
  if (item) {
    item.started = true;
    localStorage.setItem("retroHistory", JSON.stringify(history));
  }
};

export const getRetroHistory = (): RetroHistoryItem[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    return JSON.parse(localStorage.getItem("retroHistory") || "[]");
  } catch {
    return [];
  }
};

export const removeRetroFromHistory = (retroId: string) => {
  if (typeof window === 'undefined') return;
  
  const history: RetroHistoryItem[] = JSON.parse(localStorage.getItem("retroHistory") || "[]");
  const filtered = history.filter(item => item.retroId !== retroId);
  localStorage.setItem("retroHistory", JSON.stringify(filtered));
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
