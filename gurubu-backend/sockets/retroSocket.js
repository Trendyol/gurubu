const { updateUserSocket, userLeave } = require("../utils/users");
const {
  getRetro,
  leaveUserFromRetro,
  addRetroCard,
  updateRetroCard,
  deleteRetroCard,
  updateRetroTimer,
  updateRetroMusic,
  updateBoardImages,
  updateColumnHeaderImages,
  voteCard,
  moveRetroCard
} = require("../utils/retros");

module.exports = (io) => {
  const joinRetroMiddleware = (socket, retroId, credentials) => {
    if (!io.sockets.adapter.rooms.get(retroId)?.has(socket.id)) {
      socket.join(retroId);
      updateUserSocket(credentials, socket.id);
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
        const socket = io.sockets.sockets.get(socketId);
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

    socket.on("joinRetro", ({ nickname, retroId, lobby, avatarSeed }) => {
      socket.join(retroId);

      updateUserSocket(lobby?.credentials, socket.id, avatarSeed);

      // Update participant's avatarSeed and connected status in retro data
      const { getCurrentUser } = require("../utils/users");
      const { getRetro: getRetroUtil } = require("../utils/retros");
      const user = getCurrentUser(lobby?.credentials, socket);

      if (user) {
        const retroData = getRetroUtil(retroId);
        if (retroData && retroData.participants && retroData.participants[user.userID]) {
          retroData.participants[user.userID].avatarSeed = avatarSeed;
          retroData.participants[user.userID].connected = true;
        }
      }

      const retroData = getRetro(retroId);
      io.to(retroId).emit("initializeRetro", retroData);
    });

    socket.on("addRetroCard", (retroId, column, cardData, credentials) => {
      joinRetroMiddleware(socket, retroId, credentials);
      const data = { column, ...cardData };
      const result = addRetroCard(data, credentials, retroId, socket);
      if(result?.isSuccess === false){
        io.to(socket.id).emit("encounteredError", result);
        return;
      }

      // Broadcast card update to all users
      io.to(retroId).emit("addRetroCard", result.retroData);

      // Send mention notifications to mentioned users
      if (result.mentions && result.mentions.length > 0) {
        const retroData = getRetro(retroId);
        if (retroData && retroData.participants) {
          result.mentions.forEach(mentionedNickname => {
            // Find user by nickname
            const mentionedUser = Object.values(retroData.participants).find(
              p => p.nickname.toLowerCase() === mentionedNickname
            );

            if (mentionedUser && mentionedUser.sockets) {
              // Send notification to all sockets of mentioned user
              mentionedUser.sockets.forEach(socketId => {
                io.to(socketId).emit("mentioned", {
                  cardId: result.cardId,
                  column: result.column,
                  mentionedBy: result.author,
                  text: data.text,
                  type: 'new'
                });
              });
            }
          });
        }
      }
    });

    socket.on("updateRetroCard", (retroId, column, cardId, updateData, credentials) => {
      joinRetroMiddleware(socket, retroId, credentials);
      const data = { column, cardId, ...updateData };
      const result = updateRetroCard(data, credentials, retroId, socket);
      if(result?.isSuccess === false){
        io.to(socket.id).emit("encounteredError", result);
        return;
      }

      // Broadcast card update to all users
      io.to(retroId).emit("updateRetroCard", result.retroData);

      // Send mention notifications to mentioned users
      if (result.mentions && result.mentions.length > 0) {
        const retroData = getRetro(retroId);
        if (retroData && retroData.participants) {
          result.mentions.forEach(mentionedNickname => {
            // Find user by nickname
            const mentionedUser = Object.values(retroData.participants).find(
              p => p.nickname.toLowerCase() === mentionedNickname
            );

            if (mentionedUser && mentionedUser.sockets) {
              // Send notification to all sockets of mentioned user
              mentionedUser.sockets.forEach(socketId => {
                io.to(socketId).emit("mentioned", {
                  cardId: result.cardId,
                  column: result.column,
                  mentionedBy: result.author,
                  text: data.text,
                  type: 'update'
                });
              });
            }
          });
        }
      }
    });

    socket.on("deleteRetroCard", (retroId, column, cardId, credentials) => {
      joinRetroMiddleware(socket, retroId, credentials);
      const data = { column, cardId };
      const result = deleteRetroCard(data, credentials, retroId, socket);
      if(result?.isSuccess === false){
        io.to(socket.id).emit("encounteredError", result);
        return;
      }
      io.to(retroId).emit("deleteRetroCard", result);
    });

    socket.on("updateRetroTimer", (retroId, data, credentials) => {
      joinRetroMiddleware(socket, retroId, credentials);
      const result = updateRetroTimer(data, credentials, retroId, socket);
      if(result?.isSuccess === false){
        io.to(socket.id).emit("encounteredError", result);
        return;
      }
      io.to(retroId).emit("updateRetroTimer", result);
    });

    socket.on("updateRetroMusic", (retroId, data, credentials) => {
      joinRetroMiddleware(socket, retroId, credentials);
      const result = updateRetroMusic(data, credentials, retroId, socket);
      if(result?.isSuccess === false){
        io.to(socket.id).emit("encounteredError", result);
        return;
      }
      io.to(retroId).emit("updateRetroMusic", result);
    });

    socket.on("updateAvatar", ({ retroId, credentials, avatarSeed }) => {
      joinRetroMiddleware(socket, retroId, credentials);
      const { getCurrentUser } = require("../utils/users");
      const { getRetro: getRetroUtil } = require("../utils/retros");
      const user = getCurrentUser(credentials, socket);

      if (user) {
        // Update user's avatarSeed
        user.avatarSeed = avatarSeed;

        // Update in retro data
        const retroData = getRetroUtil(retroId);
        if (retroData && retroData.participants && retroData.participants[user.userID]) {
          retroData.participants[user.userID].avatarSeed = avatarSeed;
        }

        // Broadcast to all users in the room
        io.to(retroId).emit("avatarUpdated", {
          userID: user.userID,
          avatarSeed: avatarSeed,
          retroData: getRetro(retroId)
        });
      }
    });

    socket.on("updateNickname", ({ retroId, credentials, nickname }) => {
      joinRetroMiddleware(socket, retroId, credentials);
      const { getCurrentUser } = require("../utils/users");
      const { getRetro: getRetroUtil } = require("../utils/retros");
      const user = getCurrentUser(credentials, socket);

      if (user && nickname && nickname.trim()) {
        const trimmedNickname = nickname.trim();

        // Update user's nickname
        user.nickname = trimmedNickname;

        // Update in retro data
        const retroData = getRetroUtil(retroId);
        if (retroData && retroData.participants && retroData.participants[user.userID]) {
          retroData.participants[user.userID].nickname = trimmedNickname;
        }

        // Broadcast to all users in the room
        io.to(retroId).emit("nicknameUpdated", {
          userID: user.userID,
          nickname: trimmedNickname,
          retroData: getRetro(retroId)
        });
      }
    });

    socket.on("updateBoardImages", (retroId, data, credentials) => {
      joinRetroMiddleware(socket, retroId, credentials);
      const result = updateBoardImages(data, credentials, retroId, socket);
      if(result?.isSuccess === false){
        io.to(socket.id).emit("encounteredError", result);
        return;
      }
      io.to(retroId).emit("boardImagesUpdated", result);
    });

    socket.on("updateColumnHeaderImages", (retroId, data, credentials) => {
      joinRetroMiddleware(socket, retroId, credentials);
      const result = updateColumnHeaderImages(data, credentials, retroId, socket);
      if(result?.isSuccess === false){
        io.to(socket.id).emit("encounteredError", result);
        return;
      }
      io.to(retroId).emit("columnHeaderImagesUpdated", result);
    });

    socket.on("heartbeat", () => {
      heartbeats.set(socket.id, Date.now());
    });

    socket.on("cursorMove", (retroId, data, credentials) => {
      joinRetroMiddleware(socket, retroId, credentials);
      // Get user info from credentials
      const { getCurrentUser } = require("../utils/users");
      const user = getCurrentUser(credentials, socket);

      // Broadcast cursor position to all other users in the room
      socket.to(retroId).emit("cursorMove", {
        userId: user?.userID || socket.id,
        x: data.x,
        y: data.y,
        nickname: user?.nickname || "Anonymous",
        avatarSeed: user?.avatarSeed || ""
      });
    });

    socket.on("disconnect", (reason) => {
      heartbeats.delete(socket.id);

      const { getCurrentUser, getCurrentUserWithSocket } = require("../utils/users");

      // TODO: Fix disconnect detection - users are not being marked as disconnected properly
      // Issue: connected flag is not being set to false consistently
      // Need to investigate why frontend still shows disconnected users

      // Get user BEFORE removing socket
      const user = getCurrentUserWithSocket(socket.id);

      if (!user) return;

      const retroId = user.roomID;

      // Remove socket from user
      const isUserPermanentlyLeave = userLeave(socket.id);

      // Update retro data based on remaining sockets
      if (isUserPermanentlyLeave) {
        // Mark user as disconnected in retro
        leaveUserFromRetro(user);

        // Notify all users
        const updatedRetroData = getRetro(retroId);

        io.to(retroId).emit("cursorLeave", { userId: user.userID });
        io.to(retroId).emit("userDisconnectedRetro", updatedRetroData);
      }
    });

    socket.on("voteRetroCard", (retroId, data, credentials) => {
      const { getCurrentUser } = require("../utils/users");
      const user = getCurrentUser(credentials, socket);

      if (!user) return;

      joinRetroMiddleware(socket, retroId, credentials);
      const retroData = voteCard(retroId, data.column, data.cardId, user.userID);

      if (retroData) {
        io.to(retroId).emit("updateRetroCard", retroData);
      }
    });

    socket.on("moveRetroCard", (retroId, data, credentials) => {
      joinRetroMiddleware(socket, retroId, credentials);

      const retroData = moveRetroCard(retroId, data.sourceColumn, data.targetColumn, data.cardId);

      if (retroData) {
        io.to(retroId).emit("updateRetroCard", retroData);
      }
    });
  });
};
