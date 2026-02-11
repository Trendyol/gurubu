const { 
  updateRetroUserSocket, 
  retroUserLeave,
  getCurrentRetroUser,
  getCurrentRetroUserWithSocket,
  updateRetroUserNickname
} = require("../utils/retroUsers");
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
  moveRetroCard,
  updateRetroNickname,
  groupRetroCards,
  renameCardGroup,
  ungroupCard,
  revealAllCards,
  revealUserCards
} = require("../utils/retros");

module.exports = (io) => {
  const joinRetroMiddleware = (socket, retroId, credentials) => {
    if (!io.adapter.rooms.get(retroId)?.has(socket.id)) {
      socket.join(retroId);
      updateRetroUserSocket(credentials, socket.id);
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

    socket.on("joinRetro", ({ nickname, retroId, lobby, avatarSeed }) => {
      socket.join(retroId);

      updateRetroUserSocket(lobby?.credentials, socket.id, avatarSeed);

      // Update participant's avatarSeed and connected status in retro data
      const { getRetro: getRetroUtil } = require("../utils/retros");
      const user = getCurrentRetroUser(lobby?.credentials, socket);

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
      const { getRetro: getRetroUtil } = require("../utils/retros");
      const user = getCurrentRetroUser(credentials, socket);

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

    socket.on("updateNickname", ({ retroId, credentials, newNickname }) => {
      joinRetroMiddleware(socket, retroId, credentials);
      
      // Update in retroUsers
      const userUpdateResult = updateRetroUserNickname(credentials, newNickname);
      
      if (!userUpdateResult) {
        io.to(socket.id).emit("encounteredError", {
          isSuccess: false,
          message: "Failed to update nickname"
        });
        return;
      }

      // Update in retro data
      const retroData = updateRetroNickname(retroId, userUpdateResult.userID, newNickname);
      
      if (!retroData) {
        io.to(socket.id).emit("encounteredError", {
          isSuccess: false,
          message: "Failed to update nickname in retro"
        });
        return;
      }

      // Broadcast to all users in the room
      io.to(retroId).emit("nicknameUpdated", {
        userID: userUpdateResult.userID,
        oldNickname: userUpdateResult.oldNickname,
        newNickname: newNickname,
        retroData: retroData
      });
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
      const user = getCurrentRetroUser(credentials, socket);

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

      // Get user BEFORE removing socket
      const user = getCurrentRetroUserWithSocket(socket.id);

      if (!user) return;

      const retroId = user.retroId;

      // Remove socket from user
      const isUserPermanentlyLeave = retroUserLeave(socket.id);

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
      const user = getCurrentRetroUser(credentials, socket);

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

    socket.on("updateAfkStatus", ({ retroId, credentials, isAfk }) => {
      joinRetroMiddleware(socket, retroId, credentials);
      const user = getCurrentRetroUser(credentials, socket);
      
      if (user) {
        const retroData = getRetro(retroId);
        if (retroData && retroData.participants && retroData.participants[user.userID]) {
          retroData.participants[user.userID].isAfk = isAfk;
        }
        
        io.to(retroId).emit("afkStatusUpdated", {
          userID: user.userID,
          isAfk: isAfk,
          retroData: getRetro(retroId)
        });
      }
    });

    socket.on("groupRetroCards", (retroId, data, credentials) => {
      joinRetroMiddleware(socket, retroId, credentials);
      const retroData = groupRetroCards(retroId, data.column, data.cardId1, data.cardId2);
      if (retroData) {
        io.to(retroId).emit("updateRetroCard", retroData);
      }
    });

    socket.on("renameCardGroup", (retroId, data, credentials) => {
      joinRetroMiddleware(socket, retroId, credentials);
      const retroData = renameCardGroup(retroId, data.groupId, data.name);
      if (retroData) {
        io.to(retroId).emit("updateRetroCard", retroData);
      }
    });

    socket.on("ungroupCard", (retroId, data, credentials) => {
      joinRetroMiddleware(socket, retroId, credentials);
      const retroData = ungroupCard(retroId, data.column, data.cardId);
      if (retroData) {
        io.to(retroId).emit("updateRetroCard", retroData);
      }
    });

    socket.on("revealAllCards", (retroId, credentials) => {
      joinRetroMiddleware(socket, retroId, credentials);
      const result = revealAllCards(retroId, credentials, socket);
      if (result?.isSuccess === false) {
        io.to(socket.id).emit("encounteredError", result);
        return;
      }
      io.to(retroId).emit("cardsRevealed", result);
    });

    socket.on("revealMyCards", (retroId, credentials) => {
      joinRetroMiddleware(socket, retroId, credentials);
      const result = revealUserCards(retroId, credentials, socket);
      if (result?.isSuccess === false) {
        io.to(socket.id).emit("encounteredError", result);
        return;
      }
      io.to(retroId).emit("userCardsRevealed", result);
    });

    socket.on("triggerConfetti", (retroId, credentials) => {
      joinRetroMiddleware(socket, retroId, credentials);
      // Broadcast confetti trigger to all users in the room
      io.to(retroId).emit("confettiTriggered");
    });
  });
};
