const { updateUserSocket, userLeave } = require("../utils/users");
const {
  getGrooming,
  leaveUserFromGrooming,
  updateParticipantsVote,
  getResults,
  resetVotes,
  updateNickName,
  removeUserFromOngoingGrooming,
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

      updateUserSocket(lobby.credentials, socket.id);
      io.to(roomID).emit("initialize", getGrooming(roomID));
    });

    socket.on("userVote", (data, roomID, credentials) => {
      joinRoomMiddleware(socket, roomID, credentials);
      io.to(roomID).emit("voteSent", updateParticipantsVote(data, credentials, roomID, socket));
    });

    socket.on("showResults", (roomID, credentials) => {
      joinRoomMiddleware(socket, roomID, credentials);
      io.to(roomID).emit("showResults", getResults(credentials, roomID, socket));
    });

    socket.on("resetVotes", (roomID, credentials) => {
      joinRoomMiddleware(socket, roomID, credentials);
      io.to(roomID).emit("resetVotes", resetVotes(credentials, roomID, socket));
    });

    socket.on("updateNickName", (roomID, newNickName, credentials) => {
      joinRoomMiddleware(socket, roomID, credentials);
      io.to(roomID).emit(
        "updateNickName",
        updateNickName(credentials, newNickName, roomID, socket)
      );
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
