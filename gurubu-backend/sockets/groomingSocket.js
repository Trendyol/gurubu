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
    console.log("A user connected", socket.id);

    socket.on("joinRoom", ({ nickname, roomID, lobby }) => {
      socket.join(roomID);

      const isDuplicate = updateUserSocket(lobby.credentials, socket.id);

      socket.emit("welcomeMessage", `${nickname} welcome to the Gurubu!`);
      io.to(roomID).emit("initialize", getGrooming(roomID));
      if (!isDuplicate) {
        socket.broadcast
          .to(roomID)
          .emit("welcomeMessage", `${nickname} joined BOOM !`);
      }
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
