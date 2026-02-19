const {
  generateNewPresentation,
  checkPresentationExistance,
  handleJoinPresentation,
  getPresentation,
  getPresentationParticipants,
} = require("../utils/presentations");
const { getAllTemplates } = require("../config/presentationTemplates");

exports.createPresentation = async (req, res) => {
  const nickName = req.body.nickName;
  const title = req.body.title;
  const templateId = req.body.templateId || 'blank';
  const retentionDays = req.body.retentionDays || 5;
  const isPermanent = req.body.isPermanent || false;

  if (!nickName) {
    return res.status(400).json({ error: "nickName is required" });
  }

  const result = generateNewPresentation(nickName, title, templateId, retentionDays, isPermanent);
  console.log("Presentation created:", result);

  res.status(201).json(result);
};

exports.getTemplates = async (req, res) => {
  const templates = getAllTemplates();
  res.status(200).json(templates);
};

// Join an existing presentation
exports.joinPresentation = async (req, res) => {
  const presentationId = req.params.presentationId;
  const nickName = req.body.nickName;
  const isViewer = req.body.isViewer || false;

  const result = handleJoinPresentation(nickName, presentationId, isViewer);

  if(!result){
    return res.status(404).json({ message: "Presentation not found" });
  }

  res.status(200).json(result);
};

exports.checkPresentationBatch = async (req, res) => {
  const presentationIds = req.body.presentationIds;
  if (!presentationIds || !Array.isArray(presentationIds)) {
    return res.status(400).json({ error: "presentationIds array is required" });
  }

  const existingIds = presentationIds.filter(id => checkPresentationExistance(id));
  
  // Also return participant info for existing presentations
  const participantsMap = {};
  existingIds.forEach(id => {
    participantsMap[id] = getPresentationParticipants(id);
  });

  res.status(200).json({ existingIds, participants: participantsMap });
};

exports.getPresentation = async (req, res) => {
  const presentationId = req.params.presentationId;

  const presentationExist = checkPresentationExistance(presentationId);

  if (!presentationExist) {
    return res.status(404).json({ message: "Presentation not found or expired" });
  }

  const presentationData = getPresentation(presentationId);

  if (presentationData) {
    return res.status(200).json(presentationData);
  }

  res.status(404).json({ message: "Presentation not found" });
};
