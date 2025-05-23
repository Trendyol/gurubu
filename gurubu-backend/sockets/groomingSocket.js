const { updateUserSocket, userLeave } = require("../utils/users");
const {
  getGrooming,
  leaveUserFromGrooming,
  updateParticipantsVote,
  getResults,
  resetVotes,
  updateNickName,
  removeUserFromOngoingGrooming,
  setIssues,
  updateTimer,
  updateAvatar,
  setGurubuAI,
  updateProfilePicture
} = require("../utils/groomings");

module.exports = (io) => {
  const joinRoomMiddleware = (socket, roomID, credentials) => {
    if (!io.sockets.adapter.rooms.get(roomID)?.has(socket.id)) {
      socket.join(roomID);
      updateUserSocket(credentials, socket.id);
    }
  };
  io.on("connection", (socket) => {
    socket.on("joinRoom", ({ nickname, roomID, lobby }) => {
      console.log(`A user connected with nickname ${nickname} to room ${roomID}`);
      socket.join(roomID);

      updateUserSocket(lobby?.credentials, socket.id);
      io.to(roomID).emit("initialize", getGrooming(roomID));
    });

    socket.on("userVote", (data, roomID, credentials) => {
      joinRoomMiddleware(socket, roomID, credentials);
      const result = updateParticipantsVote(data, credentials, roomID, socket);
      if(result?.isSuccess === false){
        io.to(socket.id).emit("encounteredError", result);
        return;
      }
      io.to(roomID).emit("voteSent", result);
    });

    socket.on("showResults", (roomID, credentials) => {
      joinRoomMiddleware(socket, roomID, credentials);
      const result = getResults(credentials, roomID, socket);
      if(result?.isSuccess === false){
        io.to(socket.id).emit("encounteredError", result);
        return;
      }
      io.to(roomID).emit("showResults", result);
    });

    socket.on("resetVotes", (roomID, credentials) => {
      joinRoomMiddleware(socket, roomID, credentials);
      const result = resetVotes(credentials, roomID, socket);
      if(result?.isSuccess === false){
        io.to(socket.id).emit("encounteredError", result);
        return;
      }
      io.to(roomID).emit("resetVotes", result);
    });

    socket.on("updateNickName", (roomID, newNickName, credentials) => {
      joinRoomMiddleware(socket, roomID, credentials);
      const result = updateNickName(credentials, newNickName, roomID, socket);
      if(result?.isSuccess === false){
        io.to(socket.id).emit("encounteredError", result);
        return;
      }
      io.to(roomID).emit("updateNickName", result);
    });

    socket.on("setIssues", (roomID, data, credentials) => {
      joinRoomMiddleware(socket, roomID, credentials);
      const result = setIssues(data, credentials, roomID, socket);
      if(result?.isSuccess === false){
        io.to(socket.id).emit("encounteredError", result);
        return;
      }
      io.to(roomID).emit("setIssues", result);
    });

    socket.on("setGurubuAI", (roomID, data, credentials) => {
      joinRoomMiddleware(socket, roomID, credentials);
      const result = setGurubuAI(data, credentials, roomID, socket);
      if(result?.isSuccess === false){
        io.to(socket.id).emit("encounteredError", result);
        return;
      }
      io.to(roomID).emit("setGurubuAI", result);
    });

    socket.on("updateTimer", (roomID, data, credentials) => {
      joinRoomMiddleware(socket, roomID, credentials);
      const result = updateTimer(data, credentials, roomID, socket);
      if(result?.isSuccess === false){
        io.to(socket.id).emit("encounteredError", result);
        return;
      }
      io.to(roomID).emit("updateTimer", result);
    });

    socket.on("updateAvatar", (roomID, data, credentials) => {
      joinRoomMiddleware(socket, roomID, credentials);
      const result = updateAvatar(data, credentials, roomID, socket);
      if(result?.isSuccess === false){
        io.to(socket.id).emit("encounteredError", result);
        return;
      }
      io.to(roomID).emit("updateAvatar", result);
    });

    socket.on("updateProfilePicture", (roomID, data, credentials) => {
      joinRoomMiddleware(socket, roomID, credentials);
      const result = updateProfilePicture(data, credentials, roomID, socket);
      if(result?.isSuccess === false){
        io.to(socket.id).emit("encounteredError", result);
        return;
      }
      io.to(roomID).emit("updateProfilePicture", result);
    });

    socket.on("disconnect", (reason) => {
      const roomID = leaveUserFromGrooming(socket.id);
      const isUserPermanentlyLeave = userLeave(socket.id);

      if (isUserPermanentlyLeave) {
        io.to(roomID).emit("userDisconnected", getGrooming(roomID));
        console.log("A user disconnected, reason:", reason);
      }
    });

    socket.on("removeUser", (roomID, userID, credentials) => {
      // joinRoomMiddleware(socket, roomID, credentials);

      const isUserPermanentlyLeave = userLeave(socket.id);

      removeUserFromOngoingGrooming(roomID, userID);
      if (isUserPermanentlyLeave) {
        io.to(roomID).emit("removeUser", getGrooming(roomID), userID);
      }
    });
  });
};
