const uuid = require("uuid");
const { presentationUserJoin, getCurrentPresentationUser, getCurrentPresentationUserWithSocket, clearPresentationUser } = require("../utils/presentationUsers");
const { getTemplate } = require("../config/presentationTemplates");

let presentations = {};
let presentationRooms = [];

const handleErrors = (errorFunctionName, presentationId, socket, isPresentationExpired) => {
  if(!socket){
    console.log("Socket not found on handle join.", errorFunctionName, presentationId);
    return null;
  }
  if ((presentationRooms && !presentationRooms.some(presentation => presentation.presentationId === presentationId)) || isPresentationExpired) {
    console.log("Presentation is expired or deleted, info shown to the user.", errorFunctionName, presentationId);
    socket.emit("encounteredError", {
      id: 1,
      message: "Presentation is expired or deleted.",
    });
    return {
      isSuccess: false,
      message: "Presentation is expired or deleted."
    };
  }

  console.log("Something unexpected happen!");

  return {
    id: 3,
    isSuccess: false,
    message: "Your connection is lost. Connect again"
  }
};

const RETENTION_OPTIONS = {
  1: 1 * 24 * 60 * 60 * 1000,
  5: 5 * 24 * 60 * 60 * 1000,
  7: 7 * 24 * 60 * 60 * 1000,
  30: 30 * 24 * 60 * 60 * 1000,
};

const generateNewPresentation = (nickName, title, templateId = 'blank', retentionDays = 5, isPermanent = false) => {
  const currentTime = new Date().getTime();
  const retention = isPermanent ? null : (RETENTION_OPTIONS[retentionDays] || RETENTION_OPTIONS[5]);
  const expireTime = isPermanent ? null : (currentTime + retention);
  const presentationId = uuid.v4();

  console.log("generateNewPresentation:", { nickName, title, templateId, presentationId, currentTime, expireTime, isPermanent });

  const user = presentationUserJoin(nickName, presentationId);
  const template = getTemplate(templateId);

  const newPresentationRoom = {
    presentationId,
    title: title || "My Presentation",
    templateId: template.id,
    createdAt: currentTime,
    expiredAt: expireTime,
  };

  user.isAdmin = true;
  user.connected = false; // Will be set to true when user joins via socket

  const { credentials, ...userWithoutCredentials } = user;

  // Initialize pages from template - first page uses coverPage, others use contentPage
  const coverPageTemplate = template.coverPage || { elements: [], background: { color: '#ffffff' }, transition: { type: 'fade', duration: 500 } };
  const contentPageTemplate = template.contentPage || { elements: [], background: { color: '#ffffff' }, transition: { type: 'fade', duration: 500 } };
  
  const coverPage = {
    id: uuid.v4(),
    order: 0,
    elements: coverPageTemplate.elements.map(elem => ({
      ...elem,
      id: uuid.v4()
    })),
    background: coverPageTemplate.background,
    transition: coverPageTemplate.transition
  };
  
  const pages = [coverPage];

  presentations[presentationId] = {
    title: title || "My Presentation",
    templateId: template.id,
    template: template,
    appliedTheme: null, // Store applied theme for new pages
    owner: user.userID,
    participants: { [user.userID]: { ...userWithoutCredentials, isViewer: false } },
    pages: pages,
    currentPage: 0,
    settings: {
      retentionDays: retentionDays,
      isPublic: false,
      allowViewers: true
    },
    createdAt: currentTime,
    expiredAt: expireTime,
    status: "draft"
  };

  presentationRooms.push(newPresentationRoom);

  return {
    ...newPresentationRoom,
    userID: user.userID,
    credentials: user.credentials,
    isAdmin: user.isAdmin,
  };
};

const handleJoinPresentation = (nickName, presentationId, isViewer = false) => {
  const user = presentationUserJoin(nickName, presentationId);
  if (!user) {
    return handleErrors("handleJoinPresentation", presentationId);
  }

  user.connected = true;

  const { credentials, ...userWithoutCredentials } = user;

  if(!presentations[presentationId]){
    return handleErrors("handleJoinPresentation", presentationId);
  }
  if(!presentations[presentationId]?.participants){
    return handleErrors("handleJoinPresentation", presentationId);
  }

  // Check if user is the owner
  user.isAdmin = presentations[presentationId].owner === user.userID;
  user.isViewer = isViewer || !user.isAdmin;

  presentations[presentationId].participants[user.userID] = { ...userWithoutCredentials, isViewer: user.isViewer };

  const presentationRoom = presentationRooms.find((presentation) => presentation.presentationId === presentationId);

  return {
    ...presentationRoom,
    userID: user.userID,
    credentials: user.credentials,
    isAdmin: user.isAdmin,
    isViewer: user.isViewer,
  };
};

const checkPresentationExistance = (presentationId) => {
  const isPresentationExpired = checkIsPresentationExpired(presentationId);
  if (isPresentationExpired) {
    return false;
  }
  return presentationRooms.some((presentation) => presentation.presentationId === presentationId);
};

const checkIsPresentationExpired = (presentationId) => {
  const currentTime = new Date().getTime();
  const presentationRoom = presentationRooms.find(p => p.presentationId === presentationId);
  if (!presentationRoom) return true;
  if (presentationRoom.expiredAt === null) return false; // Permanent
  return presentationRoom.expiredAt < currentTime;
};

const getPresentation = (presentationId) => {
  console.log("getPresentation called with presentationId:", presentationId);
  console.log("Available presentations:", Object.keys(presentations));
  console.log("Presentation data:", presentations[presentationId]);
  return presentations[presentationId];
};

const leaveUserFromPresentation = (user) => {
  if (!user) {
    console.log("leaveUserFromPresentation: No user provided");
    return;
  }

  if (!presentations[user.presentationId]) {
    console.log(`leaveUserFromPresentation: Presentation ${user.presentationId} not found`);
    return;
  }

  const userPresentationData = presentations[user.presentationId].participants[user.userID];
  if (!userPresentationData) {
    console.log(`leaveUserFromPresentation: User ${user.userID} not found in presentation participants`);
    return;
  }

  // Mark user as disconnected
  presentations[user.presentationId].participants[user.userID] = {
    ...userPresentationData,
    connected: false,
  };
  console.log(`User ${user.nickname} (${user.userID}) marked as disconnected in presentation ${user.presentationId}`);

  return user.presentationId;
};

// Page management functions
const updatePresentationPage = (presentationId, pageId, updates, credentials, socket) => {
  const user = getCurrentPresentationUser(credentials, socket);
  const isPresentationExpired = checkIsPresentationExpired(presentationId);
  if (!user || isPresentationExpired) {
    return handleErrors("updatePresentationPage", presentationId, socket, isPresentationExpired);
  }

  // Only owner can edit
  if (presentations[presentationId].owner !== user.userID) {
    return {
      isSuccess: false,
      message: "Only the presentation owner can edit pages"
    };
  }

  const presentation = presentations[presentationId];
  const pageIndex = presentation.pages.findIndex(p => p.id === pageId);
  if (pageIndex === -1) {
    return {
      isSuccess: false,
      message: "Page not found"
    };
  }

  presentation.pages[pageIndex] = {
    ...presentation.pages[pageIndex],
    ...updates
  };

  // If background is being updated and it's a theme application, store the theme
  if (updates.background && updates.themeId) {
    presentation.appliedTheme = {
      id: updates.themeId,
      coverPage: updates.themeCoverPage || presentation.appliedTheme?.coverPage,
      contentPage: updates.themeContentPage || presentation.appliedTheme?.contentPage
    };
  }

  return presentation;
};

const addPresentationPage = (presentationId, afterPageId, credentials, socket) => {
  const user = getCurrentPresentationUser(credentials, socket);
  const isPresentationExpired = checkIsPresentationExpired(presentationId);
  if (!user || isPresentationExpired) {
    return handleErrors("addPresentationPage", presentationId, socket, isPresentationExpired);
  }

  if (presentations[presentationId].owner !== user.userID) {
    return {
      isSuccess: false,
      message: "Only the presentation owner can add pages"
    };
  }

  const presentation = presentations[presentationId];
  const afterIndex = afterPageId 
    ? presentation.pages.findIndex(p => p.id === afterPageId)
    : presentation.pages.length - 1;
  
  // Use content page template from the presentation's template
  const template = presentation.template || getTemplate('blank');
  const contentPageTemplate = template.contentPage || { elements: [], background: { color: '#ffffff' }, transition: { type: 'fade', duration: 500 } };
  
  // If a theme is applied, use theme's contentPage background, otherwise use template
  let pageBackground = contentPageTemplate.background;
  if (presentation.appliedTheme && presentation.appliedTheme.contentPage) {
    pageBackground = presentation.appliedTheme.contentPage.background;
  }
  
  const newPage = {
    id: uuid.v4(),
    order: afterIndex + 1,
    elements: contentPageTemplate.elements.map(elem => ({
      ...elem,
      id: uuid.v4()
    })),
    background: pageBackground,
    transition: contentPageTemplate.transition
  };

  // Update order of subsequent pages
  presentation.pages.forEach((page, index) => {
    if (index > afterIndex) {
      page.order = index + 2;
    }
  });

  presentation.pages.splice(afterIndex + 1, 0, newPage);
  
  // Switch to the new page
  presentation.currentPage = afterIndex + 1;

  return presentation;
};

const deletePresentationPage = (presentationId, pageId, credentials, socket) => {
  const user = getCurrentPresentationUser(credentials, socket);
  const isPresentationExpired = checkIsPresentationExpired(presentationId);
  if (!user || isPresentationExpired) {
    return handleErrors("deletePresentationPage", presentationId, socket, isPresentationExpired);
  }

  if (presentations[presentationId].owner !== user.userID) {
    return {
      isSuccess: false,
      message: "Only the presentation owner can delete pages"
    };
  }

  const presentation = presentations[presentationId];
  if (presentation.pages.length <= 1) {
    return {
      isSuccess: false,
      message: "Cannot delete the last page"
    };
  }

  const pageIndex = presentation.pages.findIndex(p => p.id === pageId);
  if (pageIndex === -1) {
    return {
      isSuccess: false,
      message: "Page not found"
    };
  }

  presentation.pages.splice(pageIndex, 1);
  
  // Update order of remaining pages
  presentation.pages.forEach((page, index) => {
    page.order = index;
  });

  // Adjust currentPage if needed
  if (presentation.currentPage >= presentation.pages.length) {
    presentation.currentPage = presentation.pages.length - 1;
  }

  return presentation;
};

const reorderPresentationPages = (presentationId, newOrder, credentials, socket) => {
  const user = getCurrentPresentationUser(credentials, socket);
  const isPresentationExpired = checkIsPresentationExpired(presentationId);
  if (!user || isPresentationExpired) {
    return handleErrors("reorderPresentationPages", presentationId, socket, isPresentationExpired);
  }

  if (presentations[presentationId].owner !== user.userID) {
    return {
      isSuccess: false,
      message: "Only the presentation owner can reorder pages"
    };
  }

  const presentation = presentations[presentationId];
  const reorderedPages = newOrder.map((pageId, index) => {
    const page = presentation.pages.find(p => p.id === pageId);
    return { ...page, order: index };
  });

  presentation.pages = reorderedPages;
  return presentation;
};

// Element management functions
const addPresentationElement = (presentationId, pageId, element, credentials, socket) => {
  const user = getCurrentPresentationUser(credentials, socket);
  const isPresentationExpired = checkIsPresentationExpired(presentationId);
  if (!user || isPresentationExpired) {
    return handleErrors("addPresentationElement", presentationId, socket, isPresentationExpired);
  }

  if (presentations[presentationId].owner !== user.userID) {
    return {
      isSuccess: false,
      message: "Only the presentation owner can add elements"
    };
  }

  const presentation = presentations[presentationId];
  const page = presentation.pages.find(p => p.id === pageId);
  if (!page) {
    return {
      isSuccess: false,
      message: "Page not found"
    };
  }

  const newElement = {
    ...element,
    id: element.id || uuid.v4()
  };

  page.elements.push(newElement);
  return presentation;
};

const updatePresentationElement = (presentationId, pageId, elementId, updates, credentials, socket) => {
  const user = getCurrentPresentationUser(credentials, socket);
  const isPresentationExpired = checkIsPresentationExpired(presentationId);
  if (!user || isPresentationExpired) {
    return handleErrors("updatePresentationElement", presentationId, socket, isPresentationExpired);
  }

  if (presentations[presentationId].owner !== user.userID) {
    return {
      isSuccess: false,
      message: "Only the presentation owner can update elements"
    };
  }

  const presentation = presentations[presentationId];
  const page = presentation.pages.find(p => p.id === pageId);
  if (!page) {
    return {
      isSuccess: false,
      message: "Page not found"
    };
  }

  const elementIndex = page.elements.findIndex(e => e.id === elementId);
  if (elementIndex === -1) {
    return {
      isSuccess: false,
      message: "Element not found"
    };
  }

  page.elements[elementIndex] = {
    ...page.elements[elementIndex],
    ...updates
  };

  return presentation;
};

const deletePresentationElement = (presentationId, pageId, elementId, credentials, socket) => {
  const user = getCurrentPresentationUser(credentials, socket);
  const isPresentationExpired = checkIsPresentationExpired(presentationId);
  if (!user || isPresentationExpired) {
    return handleErrors("deletePresentationElement", presentationId, socket, isPresentationExpired);
  }

  if (presentations[presentationId].owner !== user.userID) {
    return {
      isSuccess: false,
      message: "Only the presentation owner can delete elements"
    };
  }

  const presentation = presentations[presentationId];
  const page = presentation.pages.find(p => p.id === pageId);
  if (!page) {
    return {
      isSuccess: false,
      message: "Page not found"
    };
  }

  page.elements = page.elements.filter(e => e.id !== elementId);
  return presentation;
};

const setCurrentPage = (presentationId, pageIndex, credentials, socket) => {
  const user = getCurrentPresentationUser(credentials, socket);
  const isPresentationExpired = checkIsPresentationExpired(presentationId);
  if (!user || isPresentationExpired) {
    return handleErrors("setCurrentPage", presentationId, socket, isPresentationExpired);
  }

  const presentation = presentations[presentationId];
  if (pageIndex < 0 || pageIndex >= presentation.pages.length) {
    return {
      isSuccess: false,
      message: "Invalid page index"
    };
  }

  presentation.currentPage = pageIndex;
  return presentation;
};

const getPresentationParticipants = (presentationId) => {
  const presentation = presentations[presentationId];
  if (!presentation || !presentation.participants) return [];

  return Object.values(presentation.participants)
    .filter(p => p.connected !== false)
    .map(p => ({
      nickname: p.nickname,
      avatarSeed: p.avatarSeed || '',
      isViewer: p.isViewer || false,
    }));
};

const cleanPresentations = () => {
  setInterval(() => {
    const currentTime = Date.now();

    // Get expired presentation IDs before modifying arrays
    const expiredPresentationIds = presentationRooms
      .filter(p => p.expiredAt !== null && p.expiredAt < currentTime)
      .map(p => p.presentationId);

    // Remove expired presentations safely
    presentationRooms = presentationRooms.filter(p => 
      p.expiredAt === null || p.expiredAt >= currentTime
    );

    // Remove expired presentations from presentations object
    expiredPresentationIds.forEach(presentationId => delete presentations[presentationId]);

    // Remove users in expired presentations
    expiredPresentationIds.forEach(clearPresentationUser);
  }, 1000 * 60 * 60 * 24 * 4); // work every 4 days
};

module.exports = {
  generateNewPresentation,
  handleJoinPresentation,
  checkPresentationExistance,
  getPresentation,
  leaveUserFromPresentation,
  updatePresentationPage,
  addPresentationPage,
  deletePresentationPage,
  reorderPresentationPages,
  addPresentationElement,
  updatePresentationElement,
  deletePresentationElement,
  setCurrentPage,
  getPresentationParticipants,
  cleanPresentations
};
