const express = require("express");
const app = express();
const cors = require("cors");
const socketIO = require("socket.io");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const groomingSocket = require("./sockets/groomingSocket");
const retroSocket = require("./sockets/retroSocket");
const pTokenResolveMiddleware = require("./middlewares/pTokenResolveMiddleware");

const { cleanRoomsAndUsers } = require("./utils/groomings");
const { cleanRetros } = require("./utils/retros");

require("dotenv").config();

const corsOptions = {
  origin: process.env.CLIENT_URL,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cache-Control", "Pragma"]
};

app.use(bodyParser.json());
app.use(cookieParser());

const roomRoutes = require("./routes/roomRoutes");
const healthCheckRoute = require("./routes/healthCheckRoute");
const jiraRoutes = require("./routes/jiraRoutes");
const pRoutes = require("./routes/pRoutes");
const storyPointRoutes = require("./routes/storyPointRoutes");
const initialStoryPointRoutes = require("./routes/initialStoryPointRoutes");
const aiWorkflowRoutes = require("./routes/aiWorkflowRoutes");
const retroRoutes = require("./routes/retroRoutes");

app.use("/room", cors(corsOptions), roomRoutes);
app.use("/healthcheck", cors(corsOptions), healthCheckRoute);
app.use("/jira", cors(corsOptions), jiraRoutes);
app.use("/p", cors(corsOptions), pTokenResolveMiddleware, pRoutes);
app.use("/storypoint", cors(corsOptions), storyPointRoutes);
app.use("/initial-storypoint", cors(corsOptions), initialStoryPointRoutes);
app.use("/ai-workflow", cors(corsOptions), aiWorkflowRoutes);
app.use("/retro", cors(corsOptions), retroRoutes);

const PORT = process.env.PORT || 5001;
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
retroSocket(io);
cleanRoomsAndUsers();
cleanRetros();
