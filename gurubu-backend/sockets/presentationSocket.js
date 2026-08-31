const { 
  updatePresentationUserSocket, 
  presentationUserLeave,
  getCurrentPresentationUser,
  getCurrentPresentationUserWithSocket,
} = require("../utils/presentationUsers");
const {
  getPresentation,
  leaveUserFromPresentation,
  updatePresentationPage,
  addPresentationPage,
  deletePresentationPage,
  reorderPresentationPages,
  addPresentationElement,
  updatePresentationElement,
  deletePresentationElement,
  setCurrentPage,
} = require("../utils/presentations");

module.exports = (io) => {
  const joinPresentationMiddleware = (socket, presentationId, credentials) => {
    if (!io.adapter.rooms.get(presentationId)?.has(socket.id)) {
      socket.join(presentationId);
      updatePresentationUserSocket(credentials, socket.id);
    }
  };

  // Heartbeat tracking
  const heartbeats = new Map();
  const HEARTBEAT_TIMEOUT = 35000; // 35 seconds

  // Check for stale connections every 10 seconds
  setInterval(() => {
    const now = Date.now();
    heartbeats.forEach((lastBeat, socketId) => {
      if (now - lastBeat > HEARTBEAT_TIMEOUT) {
        const socket = io.sockets.get(socketId);
        if (socket) {
          console.log(`Force disconnecting stale socket: ${socketId}`);
          socket.disconnect(true);
        }
        heartbeats.delete(socketId);
      }
    });
  }, 10000);

  io.on("connection", (socket) => {
    heartbeats.set(socket.id, Date.now());

    socket.on("joinPresentation", ({ nickname, presentationId, lobby, avatarSeed }) => {
      socket.join(presentationId);

      updatePresentationUserSocket(lobby?.credentials, socket.id, avatarSeed);

      // Update participant's avatarSeed and connected status in presentation data
      const { getPresentation: getPresentationUtil } = require("../utils/presentations");
      const user = getCurrentPresentationUser(lobby?.credentials, socket);

      if (user) {
        const presentationData = getPresentationUtil(presentationId);
        if (presentationData && presentationData.participants && presentationData.participants[user.userID]) {
          presentationData.participants[user.userID].avatarSeed = avatarSeed;
          presentationData.participants[user.userID].connected = true;
        }
      }

      const presentationData = getPresentation(presentationId);
      io.to(presentationId).emit("initializePresentation", presentationData);
    });

    socket.on("updatePage", (presentationId, pageId, updates, credentials) => {
      joinPresentationMiddleware(socket, presentationId, credentials);
      const result = updatePresentationPage(presentationId, pageId, updates, credentials, socket);
      if(result?.isSuccess === false){
        io.to(socket.id).emit("encounteredError", result);
        return;
      }
      io.to(presentationId).emit("pageUpdated", result);
    });

    socket.on("addPage", (presentationId, afterPageId, credentials) => {
      joinPresentationMiddleware(socket, presentationId, credentials);
      const result = addPresentationPage(presentationId, afterPageId, credentials, socket);
      if(result?.isSuccess === false){
        io.to(socket.id).emit("encounteredError", result);
        return;
      }
      io.to(presentationId).emit("pageAdded", result);
    });

    socket.on("deletePage", (presentationId, pageId, credentials) => {
      joinPresentationMiddleware(socket, presentationId, credentials);
      const result = deletePresentationPage(presentationId, pageId, credentials, socket);
      if(result?.isSuccess === false){
        io.to(socket.id).emit("encounteredError", result);
        return;
      }
      io.to(presentationId).emit("pageDeleted", result);
    });

    socket.on("reorderPages", (presentationId, newOrder, credentials) => {
      joinPresentationMiddleware(socket, presentationId, credentials);
      const result = reorderPresentationPages(presentationId, newOrder, credentials, socket);
      if(result?.isSuccess === false){
        io.to(socket.id).emit("encounteredError", result);
        return;
      }
      io.to(presentationId).emit("pagesReordered", result);
    });

    socket.on("addElement", (presentationId, pageId, element, credentials) => {
      joinPresentationMiddleware(socket, presentationId, credentials);
      const result = addPresentationElement(presentationId, pageId, element, credentials, socket);
      if(result?.isSuccess === false){
        io.to(socket.id).emit("encounteredError", result);
        return;
      }
      io.to(presentationId).emit("elementAdded", result);
    });

    socket.on("updateElement", (presentationId, pageId, elementId, updates, credentials) => {
      joinPresentationMiddleware(socket, presentationId, credentials);
      const result = updatePresentationElement(presentationId, pageId, elementId, updates, credentials, socket);
      if(result?.isSuccess === false){
        io.to(socket.id).emit("encounteredError", result);
        return;
      }
      io.to(presentationId).emit("elementUpdated", result);
    });

    socket.on("deleteElement", (presentationId, pageId, elementId, credentials) => {
      joinPresentationMiddleware(socket, presentationId, credentials);
      const result = deletePresentationElement(presentationId, pageId, elementId, credentials, socket);
      if(result?.isSuccess === false){
        io.to(socket.id).emit("encounteredError", result);
        return;
      }
      io.to(presentationId).emit("elementDeleted", result);
    });

    socket.on("setCurrentPage", (presentationId, pageIndex, credentials) => {
      joinPresentationMiddleware(socket, presentationId, credentials);
      const result = setCurrentPage(presentationId, pageIndex, credentials, socket);
      if(result?.isSuccess === false){
        io.to(socket.id).emit("encounteredError", result);
        return;
      }
      io.to(presentationId).emit("currentPageChanged", result);
    });

    socket.on("heartbeat", () => {
      heartbeats.set(socket.id, Date.now());
    });

    socket.on("cursorMove", (presentationId, data, credentials) => {
      joinPresentationMiddleware(socket, presentationId, credentials);
      // Get user info from credentials
      const user = getCurrentPresentationUser(credentials, socket);

      // Broadcast cursor position to all other users in the room
      socket.to(presentationId).emit("cursorMove", {
        userId: user?.userID || socket.id,
        x: data.x,
        y: data.y,
        nickname: user?.nickname || "Anonymous",
        avatarSeed: user?.avatarSeed || ""
      });
    });

    socket.on("disconnect", (reason) => {
      heartbeats.delete(socket.id);

      // Get user BEFORE removing socket
      const user = getCurrentPresentationUserWithSocket(socket.id);

      if (!user) return;

      const presentationId = user.presentationId;

      // Remove socket from user
      const isUserPermanentlyLeave = presentationUserLeave(socket.id);

      // Update presentation data based on remaining sockets
      if (isUserPermanentlyLeave) {
        // Mark user as disconnected in presentation
        leaveUserFromPresentation(user);

        // Notify all users
        const updatedPresentationData = getPresentation(presentationId);

        io.to(presentationId).emit("cursorLeave", { userId: user.userID });
        io.to(presentationId).emit("userDisconnectedPresentation", updatedPresentationData);
      }
    });
  });
};
