require("dotenv").config();

const { init } = require("@fixify/agent");

if (process.env.FIXIFY_API_KEY) {
  init({
    apiKey: process.env.FIXIFY_API_KEY,
    serverUrl: "https://fixifyserver-production.up.railway.app",
    collectInterval: 5000,
    traceEnabled: true,
    logEnabled: true,
    slowThreshold: 100,
    profilingEnabled: true,
    profileDuration: 5000,
    profileCooldown: 300000,
  });
}

const express = require("express");
const app = express();
const cors = require("cors");
const socketIO = require("socket.io");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const groomingSocket = require("./sockets/groomingSocket");
const retroSocket = require("./sockets/retroSocket");
const presentationSocket = require("./sockets/presentationSocket");
const pTokenResolveMiddleware = require("./middlewares/pTokenResolveMiddleware");

const { cleanRoomsAndUsers } = require("./utils/groomings");
const { cleanRetros } = require("./utils/retros");
const { cleanPresentations } = require("./utils/presentations");

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
const presentationRoutes = require("./routes/presentationRoutes");
const codeExecutionRoutes = require("./routes/codeExecutionRoutes");

app.use("/room", cors(corsOptions), roomRoutes);
app.use("/healthcheck", cors(corsOptions), healthCheckRoute);
app.use("/jira", cors(corsOptions), jiraRoutes);
app.use("/p", cors(corsOptions), pTokenResolveMiddleware, pRoutes);
app.use("/storypoint", cors(corsOptions), storyPointRoutes);
app.use("/initial-storypoint", cors(corsOptions), initialStoryPointRoutes);
app.use("/ai-workflow", cors(corsOptions), aiWorkflowRoutes);
app.use("/retro", cors(corsOptions), retroRoutes);
app.use("/presentation", cors(corsOptions), presentationRoutes);
app.use("/code", cors(corsOptions), codeExecutionRoutes);

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

// Separate namespaces for grooming, retro, and presentation
const groomingNamespace = io.of("/grooming");
const retroNamespace = io.of("/retro");
const presentationNamespace = io.of("/presentation");

groomingSocket(groomingNamespace);
retroSocket(retroNamespace);
presentationSocket(presentationNamespace);
cleanRoomsAndUsers();
cleanRetros();
cleanPresentations();
