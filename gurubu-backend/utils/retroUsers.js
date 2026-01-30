const uuid = require("uuid");
const { tokenizeNickname } = require("../utils/tokenizeNickname");

let retroUsers = [];

// Join user to retro room
function retroUserJoin(nickname, retroId) {
  const defaultUserID = 0;
  const totalUsersNumber = getRetroRoomUsers(retroId).length;

  const userID = totalUsersNumber > 0 ? totalUsersNumber : defaultUserID;
  const credentials = tokenizeNickname(`retro-${nickname}${uuid.v4()}`);

  const sockets = [];

  const user = {
    userID,
    credentials,
    nickname,
    retroId,
    sockets,
    connected: true,
  };

  retroUsers.push(user);

  return user;
}

function updateRetroUserSocket(credentials, socketID, avatarSeed) {
  const user = retroUsers.find((user) => user.credentials === credentials);
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

// Get current retro user
function getCurrentRetroUser(credentials, socket) {
  let user = retroUsers.find((user) => user.credentials === credentials);
  if (user) {
    return user;
  }
  console.log("This retro user could not found with credentials", credentials, retroUsers);
  if (socket) {
    user = getCurrentRetroUserWithSocket(socket.id);
    if(user){
      console.log("This retro user found with socket id.", user);
    }
    return user;
  }
  return undefined;
}

function getCurrentRetroUserWithSocket(socketID) {
  return retroUsers.find((user) => user.sockets.includes(socketID));
}

// User leaves retro room
function retroUserLeave(socketID) {
  const user = getCurrentRetroUserWithSocket(socketID);

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

// Get retro room users
function getRetroRoomUsers(retroId) {
  return retroUsers.filter((user) => user.retroId === retroId);
}

function clearRetroUser(retroId) {
  retroUsers = retroUsers.filter(user => user.retroId !== retroId);
}

function updateRetroUserNickname(credentials, newNickname) {
  const user = retroUsers.find((user) => user.credentials === credentials);
  if (!user) {
    return null;
  }
  
  const oldNickname = user.nickname;
  user.nickname = newNickname;
  
  return {
    userID: user.userID,
    oldNickname,
    newNickname,
    retroId: user.retroId,
  };
}

function logRetroUsers() {
  setInterval(() => {
    console.log("Retro Users:", retroUsers);
  }, 10000);
}

module.exports = {
  retroUserJoin,
  getCurrentRetroUser,
  retroUserLeave,
  getRetroRoomUsers,
  updateRetroUserSocket,
  clearRetroUser,
  getCurrentRetroUserWithSocket,
  updateRetroUserNickname,
  logRetroUsers,
};
