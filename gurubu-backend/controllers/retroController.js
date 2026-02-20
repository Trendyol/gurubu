const {
  generateNewRetro,
  checkRetroExistance,
  handleJoinRetro,
  getRetro,
  getRetroParticipants,
  getRetroActionItems,
} = require("../utils/retros");
const { getAllTemplates } = require("../config/retroTemplates");

exports.createRetro = async (req, res) => {
  const nickName = req.body.nickName;
  const title = req.body.title;
  const templateId = req.body.templateId || 'what-went-well';
  const retentionDays = req.body.retentionDays || 5;
  const customColumns = req.body.customColumns || null;

  if (!nickName) {
    return res.status(400).json({ error: "nickName is required" });
  }

  const result = generateNewRetro(nickName, title, templateId, retentionDays, customColumns);
  console.log("Retro created:", result);

  res.status(201).json(result);
};

exports.getTemplates = async (req, res) => {
  const templates = getAllTemplates();
  res.status(200).json(templates);
};

// Join an existing retro
exports.joinRetro = async (req, res) => {
  const retroId = req.params.retroId;
  const nickName = req.body.nickName;

  const result = handleJoinRetro(nickName, retroId);

  if(!result){
    return res.status(404).json({ message: "Retro not found" });
  }

  res.status(200).json(result);
};

exports.checkRetroBatch = async (req, res) => {
  const retroIds = req.body.retroIds;
  if (!retroIds || !Array.isArray(retroIds)) {
    return res.status(400).json({ error: "retroIds array is required" });
  }

  const existingIds = retroIds.filter(id => checkRetroExistance(id));
  
  // Also return participant info and status for existing retros
  const participantsMap = {};
  const statusMap = {};
  existingIds.forEach(id => {
    participantsMap[id] = getRetroParticipants(id);
    const retro = getRetro(id);
    statusMap[id] = retro?.status || 'ongoing';
  });

  res.status(200).json({ existingIds, participants: participantsMap, statuses: statusMap });
};

exports.getRetroActionItems = async (req, res) => {
  const retroId = req.params.retroId;

  const retroExist = checkRetroExistance(retroId);
  if (!retroExist) {
    return res.status(404).json({ message: "Retro not found or expired" });
  }

  const actionItems = getRetroActionItems(retroId);
  if (actionItems) {
    return res.status(200).json(actionItems);
  }

  res.status(404).json({ message: "No action items found" });
};

exports.getRetro = async (req, res) => {
  const retroId = req.params.retroId;

  const retroExist = checkRetroExistance(retroId);

  if (!retroExist) {
    return res.status(404).json({ message: "Retro not found or expired" });
  }

  const retroData = getRetro(retroId);

  if (retroData) {
    return res.status(200).json(retroData);
  }

  res.status(404).json({ message: "Retro not found" });
};
