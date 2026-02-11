const uuid = require("uuid");
const { retroUserJoin, getCurrentRetroUser, getCurrentRetroUserWithSocket, clearRetroUser } = require("../utils/retroUsers");
const { getTemplate } = require("../config/retroTemplates");

let retros = {};
let retroRooms = [];

const handleErrors = (errorFunctionName, retroId, socket, isRetroExpired) => {
  if(!socket){
    console.log("Socket not found on handle join.", errorFunctionName, retroId);
    return null;
  }
  if ((retroRooms && !retroRooms.some(retro => retro.retroId === retroId)) || isRetroExpired) {
    console.log("Retro is expired or deleted, info shown to the user.", errorFunctionName, retroId);
    socket.emit("encounteredError", {
      id: 1,
      message: "Retro is expired or deleted.",
    });
    return {
      isSuccess: false,
      message: "Retro is expired or deleted."
    };
  }

  console.log("Something unexpected happen!");

  return {
    id: 3,
    isSuccess: false,
    message: "Your connection is lost. Connect again"
  }
};

const generateNewRetro = (nickName, title, templateId = 'what-went-well') => {
  const currentTime = new Date().getTime();
  const expireTime = currentTime + 24 * 60 * 60 * 1000; // 24 hours
  const retroId = uuid.v4();

  console.log("generateNewRetro:", { nickName, title, templateId, retroId, currentTime, expireTime });

  const user = retroUserJoin(nickName, retroId);
  const template = getTemplate(templateId);

  const newRetroRoom = {
    retroId,
    title: title || "Team Retrospective",
    templateId: template.id,
    createdAt: currentTime,
    expiredAt: expireTime,
  };

  user.isAdmin = true;
  user.connected = false; // Will be set to true when user joins via socket

  const { credentials, ...userWithoutCredentials } = user;

  // Initialize retroCards based on template columns
  const retroCards = {};
  const columnHeaderImages = {};
  template.columns.forEach(column => {
    retroCards[column.key] = [];
    columnHeaderImages[column.key] = null;
  });

  retros[retroId] = {
    title: title || "Team Retrospective",
    templateId: template.id,
    template: template,
    owner: user.userID,
    participants: { [user.userID]: userWithoutCredentials },
    retroCards: retroCards,
    timer: {
      timeLeft: 0,
      isRunning: false,
      startTime: null
    },
    music: {
      isPlaying: false,
      url: null
    },
    boardImages: [],
    columnHeaderImages: columnHeaderImages,
    cardsRevealed: false,
    status: "ongoing"
  };

  retroRooms.push(newRetroRoom);

  return {
    ...newRetroRoom,
    userID: user.userID,
    credentials: user.credentials,
    isAdmin: user.isAdmin,
  };
};

const handleJoinRetro = (nickName, retroId) => {
  const user = retroUserJoin(nickName, retroId);
  if (!user) {
    return handleErrors("handleJoinRetro", retroId);
  }

  user.connected = true;

  const { credentials, ...userWithoutCredentials } = user;

  if(!retros[retroId]){
    return handleErrors("handleJoinRetro", retroId);
  }
  if(!retros[retroId]?.participants){
    return handleErrors("handleJoinRetro", retroId);
  }

  // Check if user is the owner
  user.isAdmin = retros[retroId].owner === user.userID;

  retros[retroId].participants[user.userID] = userWithoutCredentials;

  const retroRoom = retroRooms.find((retro) => retro.retroId === retroId);

  return {
    ...retroRoom,
    userID: user.userID,
    credentials: user.credentials,
    isAdmin: user.isAdmin,
  };
};

const checkRetroExistance = (retroId) => {
  const isRetroExpired = checkIsRetroExpired(retroId);
  if (isRetroExpired) {
    return false;
  }
  return retroRooms.some((retro) => retro.retroId === retroId);
};

const checkIsRetroExpired = (retroId) => {
  const currentTime = new Date().getTime();
  const expiredRetroIds = retroRooms.filter(retro => retro.expiredAt < currentTime).map(retro => retro.retroId);
  return expiredRetroIds.includes(retroId);
};

const getRetro = (retroId) => {
  console.log("getRetro called with retroId:", retroId);
  console.log("Available retros:", Object.keys(retros));
  console.log("Retro data:", retros[retroId]);
  return retros[retroId];
};

const leaveUserFromRetro = (user) => {
  if (!user) {
    console.log("leaveUserFromRetro: No user provided");
    return;
  }

  if (!retros[user.retroId]) {
    console.log(`leaveUserFromRetro: Retro ${user.retroId} not found`);
    return;
  }

  const userRetroData = retros[user.retroId].participants[user.userID];
  if (!userRetroData) {
    console.log(`leaveUserFromRetro: User ${user.userID} not found in retro participants`);
    return;
  }

  // Mark user as disconnected
  retros[user.retroId].participants[user.userID] = {
    ...userRetroData,
    connected: false,
  };
  console.log(`User ${user.nickname} (${user.userID}) marked as disconnected in retro ${user.retroId}`);

  return user.retroId;
};

const extractMentions = (text) => {
  if (!text || typeof text !== 'string') return [];
  // Support Turkish characters: ğ, ü, ş, ı, ö, ç, Ğ, Ü, Ş, İ, Ö, Ç
  const mentionRegex = /@([a-zA-ZğüşıöçĞÜŞİÖÇ0-9_]+)/g;
  const matches = text.match(mentionRegex);
  return matches ? matches.map(m => m.substring(1).toLowerCase()) : [];
};

const addRetroCard = (data, credentials, retroId, socket) => {
  const user = getCurrentRetroUser(credentials, socket);
  const isRetroExpired = checkIsRetroExpired(retroId);
  if (!user || isRetroExpired) {
    return handleErrors("addRetroCard", retroId, socket, isRetroExpired);
  }

  const { column, text, image, color, isAnonymous } = data;
  console.log("🎨 addRetroCard - Received color:", color);
  
  // Extract mentions from text
  const mentions = extractMentions(text);
  
  const cardId = uuid.v4();
  const newCard = {
    id: cardId,
    text,
    image: image || null,
    color: color || null,
    author: user.nickname,
    authorId: user.userID,
    createdAt: new Date().getTime(),
    mentions: mentions,
    isAnonymous: isAnonymous || false,
  };
  console.log("🎨 addRetroCard - Created card with color:", newCard.color);
  console.log("👥 addRetroCard - Mentions found:", mentions);

  if (retros[user.retroId].retroCards && retros[user.retroId].retroCards[column]) {
    retros[user.retroId].retroCards[column].push(newCard);
  }

  return {
    retroData: retros[user.retroId],
    mentions: mentions,
    cardId: cardId,
    author: user.nickname,
    column: column
  };
};

const updateRetroCard = (data, credentials, retroId, socket) => {
  const user = getCurrentRetroUser(credentials, socket);
  const isRetroExpired = checkIsRetroExpired(retroId);
  if (!user || isRetroExpired) {
    return handleErrors("updateRetroCard", retroId, socket, isRetroExpired);
  }

  const { column, cardId, text, image, stamps, votes, voteCount } = data;

  // Extract mentions from updated text if text is provided
  const mentions = text ? extractMentions(text) : undefined;

  if (retros[user.retroId].retroCards && retros[user.retroId].retroCards[column]) {
    const cardIndex = retros[user.retroId].retroCards[column].findIndex(
      (card) => card.id === cardId
    );

    if (cardIndex !== -1) {
      const existingCard = retros[user.retroId].retroCards[column][cardIndex];
      retros[user.retroId].retroCards[column][cardIndex] = {
        ...existingCard,
        // Update text only if provided
        text: text !== undefined ? text : existingCard.text,
        // Update image only if provided
        image: image !== undefined ? image : existingCard.image,
        // PRESERVE COLOR - don't lose it on update!
        color: existingCard.color,
        // PRESERVE STAMPS - update if provided
        stamps: stamps !== undefined ? stamps : existingCard.stamps,
        // UPDATE MENTIONS only if text was updated
        mentions: mentions !== undefined ? mentions : existingCard.mentions,
        // UPDATE VOTES - ensure it's always an array
        votes: votes !== undefined ? (Array.isArray(votes) ? votes : []) : (Array.isArray(existingCard.votes) ? existingCard.votes : []),
        // UPDATE VOTE COUNT
        voteCount: voteCount !== undefined ? voteCount : (existingCard.voteCount || 0),
      };
    }
  }

  return {
    retroData: retros[user.retroId],
    mentions: mentions,
    cardId: cardId,
    author: user.nickname,
    column: column
  };
};

const deleteRetroCard = (data, credentials, retroId, socket) => {
  const user = getCurrentRetroUser(credentials, socket);
  const isRetroExpired = checkIsRetroExpired(retroId);
  if (!user || isRetroExpired) {
    return handleErrors("deleteRetroCard", retroId, socket, isRetroExpired);
  }

  const { column, cardId } = data;

  if (retros[user.retroId].retroCards && retros[user.retroId].retroCards[column]) {
    retros[user.retroId].retroCards[column] = retros[user.retroId].retroCards[
      column
    ].filter((card) => card.id !== cardId);
  }

  return retros[user.retroId];
};

const updateRetroTimer = (data, credentials, retroId, socket) => {
  const user = getCurrentRetroUser(credentials, socket);
  const isRetroExpired = checkIsRetroExpired(retroId);
  if (!user || isRetroExpired) {
    return handleErrors("updateRetroTimer", retroId, socket, isRetroExpired);
  }

  // Check if user is owner
  if (retros[user.retroId].owner !== user.userID) {
    return {
      isSuccess: false,
      message: "Only the retro owner can control the timer"
    };
  }

  retros[user.retroId].timer = data;

  return retros[user.retroId];
};

const updateRetroMusic = (data, credentials, retroId, socket) => {
  const user = getCurrentRetroUser(credentials, socket);
  const isRetroExpired = checkIsRetroExpired(retroId);
  if (!user || isRetroExpired) {
    return handleErrors("updateRetroMusic", retroId, socket, isRetroExpired);
  }

  // Check if user is owner
  if (retros[user.retroId].owner !== user.userID) {
    return {
      isSuccess: false,
      message: "Only the retro owner can control the music"
    };
  }

  retros[user.retroId].music = data;

  return retros[user.retroId];
};

const updateBoardImages = (data, credentials, retroId, socket) => {
  const user = getCurrentRetroUser(credentials, socket);
  const isRetroExpired = checkIsRetroExpired(retroId);
  if (!user || isRetroExpired) {
    return handleErrors("updateBoardImages", retroId, socket, isRetroExpired);
  }

  retros[user.retroId].boardImages = data;
  return retros[user.retroId];
};

const updateColumnHeaderImages = (data, credentials, retroId, socket) => {
  const user = getCurrentRetroUser(credentials, retroId, socket);
  const isRetroExpired = checkIsRetroExpired(retroId);
  if (!user || isRetroExpired) {
    return handleErrors("updateColumnHeaderImages", retroId, socket, isRetroExpired);
  }

  retros[user.retroId].columnHeaderImages = data;
  return retros[user.retroId];
};

const cleanRetros = () => {
  setInterval(() => {
    const currentTime = Date.now();

    // Get expired retro IDs before modifying arrays
    const expiredRetroIds = retroRooms.filter(retro => retro.expiredAt < currentTime).map(retro => retro.retroId);

    // Remove expired retros safely
    retroRooms = retroRooms.filter(retro => retro.expiredAt >= currentTime);

    // Remove expired retros from retros object
    expiredRetroIds.forEach(retroId => delete retros[retroId]);

    // Remove users in expired retros
    expiredRetroIds.forEach(clearRetroUser);
  }, 1000 * 60 * 60 * 12); // work every 12 hours
};

const voteCard = (retroId, column, cardId, userId) => {
  const retro = retros[retroId];
  if (!retro || !retro.retroCards[column]) {
    return null;
  }

  const card = retro.retroCards[column].find(c => c.id === cardId);
  if (!card) {
    return null;
  }

  // Initialize votes array if not exists
  if (!card.votes) {
    card.votes = [];
  }

  // Toggle vote
  const voteIndex = card.votes.indexOf(userId);
  if (voteIndex > -1) {
    // Remove vote
    card.votes.splice(voteIndex, 1);
  } else {
    // Add vote
    card.votes.push(userId);
  }

  // Update vote count
  card.voteCount = card.votes.length;

  return retro;
};

const moveRetroCard = (retroId, sourceColumn, targetColumn, cardId) => {
  const retro = retros[retroId];
  if (!retro || !retro.retroCards[sourceColumn] || !retro.retroCards[targetColumn]) {
    return null;
  }

  // Find and remove card from source column
  const cardIndex = retro.retroCards[sourceColumn].findIndex(c => c.id === cardId);
  if (cardIndex === -1) {
    return null;
  }

  const [card] = retro.retroCards[sourceColumn].splice(cardIndex, 1);

  // Add card to target column
  retro.retroCards[targetColumn].push(card);

  return retro;
};

const groupRetroCards = (retroId, column, cardId1, cardId2) => {
  const retro = retros[retroId];
  if (!retro || !retro.retroCards[column]) return null;

  if (!retro.cardGroups) retro.cardGroups = {};

  const cards = retro.retroCards[column];
  const card1 = cards.find(c => c.id === cardId1);
  const card2 = cards.find(c => c.id === cardId2);
  if (!card1 || !card2) return null;

  // Determine target groupId
  let targetGroupId;
  if (card2.groupId) {
    targetGroupId = card2.groupId;
  } else if (card1.groupId) {
    targetGroupId = card1.groupId;
  } else {
    targetGroupId = uuid.v4();
    retro.cardGroups[targetGroupId] = { name: '' };
  }

  card1.groupId = targetGroupId;
  card2.groupId = targetGroupId;
  if (!retro.cardGroups[targetGroupId]) {
    retro.cardGroups[targetGroupId] = { name: '' };
  }

  return retro;
};

const renameCardGroup = (retroId, groupId, newName) => {
  const retro = retros[retroId];
  if (!retro) return null;
  if (!retro.cardGroups) retro.cardGroups = {};
  if (!retro.cardGroups[groupId]) retro.cardGroups[groupId] = {};
  retro.cardGroups[groupId].name = newName;
  return retro;
};

const ungroupCard = (retroId, column, cardId) => {
  const retro = retros[retroId];
  if (!retro || !retro.retroCards[column]) return null;

  const cards = retro.retroCards[column];
  const card = cards.find(c => c.id === cardId);
  if (!card || !card.groupId) return null;

  const groupId = card.groupId;
  delete card.groupId;

  // If only 1 card left in group, ungroup it too and remove the group
  const remaining = cards.filter(c => c.groupId === groupId);
  if (remaining.length <= 1) {
    remaining.forEach(c => delete c.groupId);
    if (retro.cardGroups) delete retro.cardGroups[groupId];
  }

  return retro;
};

const updateRetroNickname = (retroId, userID, newNickname) => {
  const retro = retros[retroId];
  if (!retro || !retro.participants || !retro.participants[userID]) {
    return null;
  }

  // Update nickname in participants
  retro.participants[userID].nickname = newNickname;

  // Update nickname in all cards authored by this user
  Object.keys(retro.retroCards).forEach(columnKey => {
    retro.retroCards[columnKey].forEach(card => {
      if (card.authorId === userID) {
        card.author = newNickname;
      }
    });
  });

  return retro;
};

const getRetroParticipants = (retroId) => {
  const retro = retros[retroId];
  if (!retro || !retro.participants) return [];

  return Object.values(retro.participants)
    .filter(p => p.connected !== false)
    .map(p => ({
      nickname: p.nickname,
      avatarSeed: p.avatarSeed || '',
      isAfk: p.isAfk || false,
    }));
};

const revealAllCards = (retroId, credentials, socket) => {
  const user = getCurrentRetroUser(credentials, socket);
  const isRetroExpired = checkIsRetroExpired(retroId);
  if (!user || isRetroExpired) {
    return handleErrors("revealAllCards", retroId, socket, isRetroExpired);
  }

  // Only owner can reveal all cards
  if (retros[retroId].owner !== user.userID) {
    return {
      isSuccess: false,
      message: "Only the retro owner can reveal all cards"
    };
  }

  retros[retroId].cardsRevealed = true;
  return retros[retroId];
};

const revealUserCards = (retroId, credentials, socket) => {
  const user = getCurrentRetroUser(credentials, socket);
  const isRetroExpired = checkIsRetroExpired(retroId);
  if (!user || isRetroExpired) {
    return handleErrors("revealUserCards", retroId, socket, isRetroExpired);
  }

  // Mark all cards by this user as revealed
  Object.keys(retros[retroId].retroCards).forEach(columnKey => {
    retros[retroId].retroCards[columnKey].forEach(card => {
      if (card.authorId === user.userID) {
        card.isRevealed = true;
      }
    });
  });

  return retros[retroId];
};

module.exports = {
  generateNewRetro,
  handleJoinRetro,
  checkRetroExistance,
  getRetro,
  leaveUserFromRetro,
  addRetroCard,
  updateRetroCard,
  deleteRetroCard,
  updateRetroTimer,
  updateRetroMusic,
  updateBoardImages,
  updateColumnHeaderImages,
  voteCard,
  moveRetroCard,
  updateRetroNickname,
  groupRetroCards,
  renameCardGroup,
  ungroupCard,
  getRetroParticipants,
  cleanRetros,
  revealAllCards,
  revealUserCards
};
