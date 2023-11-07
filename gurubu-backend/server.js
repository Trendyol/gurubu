const express = require("express");
const app = express();
const cors = require("cors");
const socketIO = require("socket.io");
const bodyParser = require("body-parser");
const groomingSocket = require("./sockets/groomingSocket");

const { cleanRoomsAndUsers } = require("./utils/groomings");

require("dotenv").config();

const corsOptions = {
  origin: process.env.CLIENT_URL,
};

app.use(bodyParser.json());

const roomRoutes = require("./routes/roomRoutes");
app.use("/room", cors(corsOptions), roomRoutes);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const io = socketIO(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});
groomingSocket(io);
cleanRoomsAndUsers();
