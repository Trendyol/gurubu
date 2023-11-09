const { updateUserSocket, userLeave } = require("../utils/users");
const {
  getGrooming,
  leaveUserFromGrooming,
  updateParticipantsVote,
  getResults,
  resetVotes
} = require("../utils/groomings");

module.exports = (io) => {
  io.on("connection", (socket) => {

    socket.on("joinRoom", ({ nickname, roomID, lobby }) => {
      console.log(`A user connected with nickname ${nickname} to room ${roomID}`);
      socket.join(roomID);

      updateUserSocket(lobby.credentials, socket.id);

      io.to(roomID).emit("initialize", getGrooming(roomID));
    });

    socket.on("userVote", (data, roomID) => {
      io.to(roomID).emit("voteSent", updateParticipantsVote(socket.id, data));
    });

    socket.on("showResults", (roomID) => {
      io.to(roomID).emit("showResults", getResults(socket.id));
    });

    socket.on("resetVotes", (roomID) => {
      io.to(roomID).emit("resetVotes", resetVotes(socket.id));
    });

    socket.on("disconnect", () => {
      const roomID = leaveUserFromGrooming(socket.id);
      const isUserPermanentlyLeave = userLeave(socket.id);

      if (isUserPermanentlyLeave) {
        socket.broadcast
          .to(roomID)
          .emit("userDisconnected", getGrooming(roomID));
      }
      console.log("A user disconnected");
    });
  });
};
