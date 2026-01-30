const uuid = require("uuid");
const { tokenizeNickname } = require("../utils/tokenizeNickname");

let users = [];

// Join user to grooming room
function userJoin(nickname, roomID) {
  const defaultUserID = 0;
  const totalUsersNumber = getRoomUsers(roomID).length;

  const userID = totalUsersNumber > 0 ? totalUsersNumber : defaultUserID;
  const credentials = tokenizeNickname(`${nickname}${uuid.v4()}`);

  const sockets = [];

  const user = {
    userID,
    credentials,
    nickname,
    roomID,
    sockets,
  };

  users.push(user);

  return user;
}

function updateUserSocket(credentials, socketID, avatarSeed) {
  const user = users.find((user) => user.credentials === credentials);
  if (!user) {
    return;
  }
  if (!user.sockets.includes(socketID)) {
    user.sockets.push(socketID);
  }

  user.connected = true;
  if (avatarSeed) {
    user.avatarSeed = avatarSeed;
  }
}

// Get current user
function getCurrentUser(credentials, socket) {
  let user = users.find((user) => user.credentials === credentials);
  if (user) {
    return user;
  }
  console.log("This user could not found with credentials", credentials, users);
  if (socket) {
    user = getCurrentUserWithSocket(socket.id);
    if(user){
      console.log("This user found with socket id.", user);
    }
    return user;
  }
  return undefined;
}

function getCurrentUserWithSocket(socketID) {
  return users.find((user) => user.sockets.includes(socketID));
}

// User leaves grooming room
function userLeave(socketID) {
  const user = getCurrentUserWithSocket(socketID);

  if (!user) {
    return false;
  }

  const index = user.sockets.findIndex(
    (userSocketID) => userSocketID === socketID
  );

  if (index !== -1) {
    user.sockets.splice(index, 1);
  }

  // Return true if user has no more sockets (completely disconnected)
  return user.sockets.length === 0;
}

// Get room users
function getRoomUsers(roomID) {
  return users.filter((user) => user.roomID === roomID);
}

function clearUser(roomId) {
  users = users.filter(user => user.roomID !== roomId);
}

function logUsers() {
  setInterval(() => {
    console.log(users);
  }, 10000);
}

module.exports = {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
  updateUserSocket,
  clearUser,
  getCurrentUserWithSocket,
  logUsers,
};
