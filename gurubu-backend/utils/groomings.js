const uuid = require("uuid");
const { userJoin, getCurrentUser, clearUser } = require("../utils/users");

const groomingMode = {
  0: [
    {
      id: 1,
      name: "storyPoint",
      points: ["1", "2", "3", "5", "8", "13", "21", "?"],
    },
  ],
  1: [
    {
      id: 1,
      name: "developmentEase",
      weight: 20,
      points: ["1", "2", "3", "4", "5", "?"],
    },
    {
      id: 2,
      name: "customerEffect",
      weight: 10,
      points: ["1", "2", "3", "4", "5", "?"],
    },
    {
      id: 3,
      name: "performance",
      weight: 30,
      points: ["1", "2", "3", "4", "5", "?"],
    },
    {
      id: 4,
      name: "security",
      weight: 10,
      points: ["1", "2", "3", "4", "5", "?"],
    },
    {
      id: 5,
      name: "maintanance",
      weight: 25,
      points: ["1", "2", "3", "4", "5", "?"],
    },
    {
      id: 6,
      name: "storyPoint",
      weight: 0,
      points: ["1", "2", "3", "5", "8", "13", "21", "?"],
    },
  ],
};

const rooms = [];
const groomings = {};

const generateNewRoom = (nickName, groomingType) => {
  const currentTime = new Date().getTime();
  const expireTime = currentTime + 3 * 60 * 60 * 1000;
  const roomID = uuid.v4();

  const user = userJoin(nickName, roomID);

  const newRoom = {
    roomID,
    createdAt: currentTime,
    expiredAt: expireTime,
  };

  user.isAdmin = true;
  user.connected = true;

  const { credentials, ...userWithoutCredentials } = user;

  groomings[roomID] = {
    totalParticipants: 1,
    mode: groomingType,
    participants: { [user.userID]: userWithoutCredentials },
    metrics: groomingMode[groomingType],
    score: 0,
    status: "ongoing",
    isResultShown: false,
  };

  rooms.push(newRoom);

  return {
    ...newRoom,
    userID: user.userID,
    credentials: user.credentials,
    isAdmin: user.isAdmin,
  };
};

const handleJoinRoom = (nickName, roomID) => {
  const user = userJoin(nickName, roomID);
  if (!user) {
    return;
  }

  user.isAdmin = false;
  user.connected = true;

  groomings[roomID] = {
    ...groomings[roomID],
    totalParticipants: user.userID + 1,
  };

  const { credentials, ...userWithoutCredentials } = user;

  groomings[roomID].participants[user.userID] = userWithoutCredentials;

  const room = rooms.find((room) => room.roomID === roomID);

  return {
    ...room,
    userID: user.userID,
    credentials: user.credentials,
    isAdmin: user.isAdmin,
  };
};

const leaveUserFromGrooming = (socketID) => {
  const user = getCurrentUser(socketID);
  if (!user) {
    return;
  }

  if (!groomings[user.roomID]) {
    return;
  }
  const userLobbyData = groomings[user.roomID].participants[user.userID];

  if (!user.sockets.length) {
    groomings[user.roomID].participants[user.userID] = {
      ...userLobbyData,
      connected: false,
    };
  }
  return user.roomID;
};

const updateParticipantsVote = (socketID, data) => {
  const user = getCurrentUser(socketID);
  if (!user) {
    return;
  }

  const userLobbyData = groomings[user.roomID].participants[user.userID];

  groomings[user.roomID].participants[user.userID] = {
    ...userLobbyData,
    votes: data,
  };

  groomings[user.roomID].score = calculateScore(
    groomings[user.roomID].mode,
    groomings[user.roomID].participants,
    user.roomID
  );

  return groomings[user.roomID];
};

const getGrooming = (roomID) => {
  return groomings[roomID];
};

const calculateScore = (mode, participants, roomID) => {
  if (mode === "0") {
    let totalVoter = 0;
    let totalStoryPoint = 0;
    Object.keys(participants).forEach((participantKey) => {
      if (
        participants[participantKey].votes &&
        Object.keys(participants[participantKey].votes).length
      ) {
        const storyPoint = Number(
          participants[participantKey].votes.storyPoint
        );
        if (storyPoint) {
          totalVoter++;
          totalStoryPoint += storyPoint;
        }
      }
    });

    return findClosestFibonacci(totalStoryPoint / totalVoter).toFixed(2);
  }

  if (mode === "1") {
    let metricAverages = {};

    groomings[roomID].metrics.forEach((metric) => {
      metricAverages[metric.name] = {
        total: 0,
        average: 0,
        missingVotes: 0,
      };
    });

    Object.keys(metricAverages).forEach((metricName) => {
      Object.keys(participants).forEach((participantKey) => {
        if (!participants[participantKey].votes) {
          metricAverages[metricName].missingVotes++;
        }
        if (
          (participants[participantKey].votes &&
            !participants[participantKey].votes[metricName]) ||
          !participants[participantKey].connected
        ) {
          metricAverages[metricName].missingVotes++;
        }

        if (
          (participants[participantKey].votes &&
            participants[participantKey].votes[metricName]) === "?"
        ) {
          metricAverages[metricName].missingVotes++;
        }

        if (
          participants[participantKey].votes &&
          Number(participants[participantKey].votes[metricName]) &&
          participants[participantKey].connected
        ) {
          metricAverages[metricName].total += Number(
            participants[participantKey].votes[metricName]
          );
        }
      });
    });

    let averageTotal = 0;

    for (const metricKey in metricAverages) {
      const metric = metricAverages[metricKey];
      const total = metric.total;
      const missingVotes = metric.missingVotes;
      const participantCount = Object.keys(participants).length;

      if (metricKey === "storyPoint") {
        metric.average =
          participantCount - missingVotes === 0
            ? 0
            : findClosestFibonacci(total / (participantCount - missingVotes));
        continue;
      }

      metric.average =
        participantCount - missingVotes === 0
          ? 0
          : (total / (participantCount - missingVotes)).toFixed(2);
    }

    const scoreMetricLength = Object.keys(metricAverages).filter(
      (key) => key !== "storyPoint"
    ).length;

    Object.keys(metricAverages).forEach((metricAveragesKey) => {
      if (metricAveragesKey !== "storyPoint") {
        averageTotal += Number(metricAverages[metricAveragesKey].average);
      }
    });

    groomings[roomID].metricAverages = metricAverages;

    const score = (averageTotal / scoreMetricLength) * 25 - 25;
    return score.toFixed(2);
  }
};

const getResults = (socketID) => {
  const user = getCurrentUser(socketID);
  if (!user) {
    return;
  }

  groomings[user.roomID].isResultShown = true;

  return groomings[user.roomID];
};

const resetVotes = (socketID) => {
  const user = getCurrentUser(socketID);
  if (!user) {
    return;
  }

  groomings[user.roomID].isResultShown = false;
  groomings[user.roomID].score = 0;
  delete groomings[user.roomID].metricAverages;

  Object.keys(groomings[user.roomID].participants).forEach((participantKey) => {
    if (groomings[user.roomID].participants[participantKey].votes) {
      groomings[user.roomID].participants[participantKey].votes = {};
    }
  });

  return groomings[user.roomID];
};

const getRooms = () => {
  return rooms;
};

const checkRoomExistance = (roomId) => {
  return rooms.some((room) => room.roomID === roomId);
};

function findClosestFibonacci(number) {
  if (number <= 0) {
    return 0;
  }

  let prevFibonacci = 0;
  let currentFibonacci = 1;

  while (currentFibonacci <= number) {
    const nextFibonacci = prevFibonacci + currentFibonacci;
    prevFibonacci = currentFibonacci;
    currentFibonacci = nextFibonacci;
  }

  if (Math.abs(number - prevFibonacci) < Math.abs(number - currentFibonacci)) {
    return prevFibonacci;
  } else {
    return currentFibonacci;
  }
}

const cleanRoomsAndUsers = () => {
  setInterval(() => {
    const currentTime = new Date().getTime();
    rooms.forEach((room) => {
      if (room.expiredAt < currentTime) {
        const indexToRemove = rooms.findIndex(
          (indexToRemoveRoom) => indexToRemoveRoom.roomID === room.roomID
        );
        rooms.splice(indexToRemove, 1);
        delete groomings[room.roomID];
        clearUser(room.roomID);
      }
    });
  }, 60000 * 10); // work every 10 minutes
};

module.exports = {
  checkRoomExistance,
  generateNewRoom,
  getRooms,
  handleJoinRoom,
  getGrooming,
  leaveUserFromGrooming,
  updateParticipantsVote,
  getResults,
  resetVotes,
  cleanRoomsAndUsers,
};
