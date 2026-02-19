const uuid = require("uuid");
const { tokenizeNickname } = require("../utils/tokenizeNickname");

let presentationUsers = [];

// Join user to presentation room
function presentationUserJoin(nickname, presentationId) {
  const defaultUserID = 0;
  const totalUsersNumber = getPresentationRoomUsers(presentationId).length;

  const userID = totalUsersNumber > 0 ? totalUsersNumber : defaultUserID;
  const credentials = tokenizeNickname(`presentation-${nickname}${uuid.v4()}`);

  const sockets = [];

  const user = {
    userID,
    credentials,
    nickname,
    presentationId,
    sockets,
    connected: true,
  };

  presentationUsers.push(user);

  return user;
}

function updatePresentationUserSocket(credentials, socketID, avatarSeed) {
  const user = presentationUsers.find((user) => user.credentials === credentials);
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

// Get current presentation user
function getCurrentPresentationUser(credentials, socket) {
  let user = presentationUsers.find((user) => user.credentials === credentials);
  if (user) {
    return user;
  }
  console.log("This presentation user could not found with credentials", credentials, presentationUsers);
  if (socket) {
    user = getCurrentPresentationUserWithSocket(socket.id);
    if(user){
      console.log("This presentation user found with socket id.", user);
    }
    return user;
  }
  return undefined;
}

function getCurrentPresentationUserWithSocket(socketID) {
  return presentationUsers.find((user) => user.sockets.includes(socketID));
}

// User leaves presentation room
function presentationUserLeave(socketID) {
  const user = getCurrentPresentationUserWithSocket(socketID);

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

// Get presentation room users
function getPresentationRoomUsers(presentationId) {
  return presentationUsers.filter((user) => user.presentationId === presentationId);
}

function clearPresentationUser(presentationId) {
  presentationUsers = presentationUsers.filter(user => user.presentationId !== presentationId);
}

function updatePresentationUserNickname(credentials, newNickname) {
  const user = presentationUsers.find((user) => user.credentials === credentials);
  if (!user) {
    return null;
  }
  
  const oldNickname = user.nickname;
  user.nickname = newNickname;
  
  return {
    userID: user.userID,
    oldNickname,
    newNickname,
    presentationId: user.presentationId,
  };
}

module.exports = {
  presentationUserJoin,
  getCurrentPresentationUser,
  presentationUserLeave,
  getPresentationRoomUsers,
  updatePresentationUserSocket,
  clearPresentationUser,
  getCurrentPresentationUserWithSocket,
  updatePresentationUserNickname,
};
