const {
  generateNewRetro,
  checkRetroExistance,
  handleJoinRetro,
  getRetro,
  getRetroParticipants,
} = require("../utils/retros");
const { getAllTemplates } = require("../config/retroTemplates");

exports.createRetro = async (req, res) => {
  const nickName = req.body.nickName;
  const title = req.body.title;
  const templateId = req.body.templateId || 'what-went-well';
  const retentionDays = req.body.retentionDays || 5;

  if (!nickName) {
    return res.status(400).json({ error: "nickName is required" });
  }

  const result = generateNewRetro(nickName, title, templateId, retentionDays);
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
  
  // Also return participant info for existing retros
  const participantsMap = {};
  existingIds.forEach(id => {
    participantsMap[id] = getRetroParticipants(id);
  });

  res.status(200).json({ existingIds, participants: participantsMap });
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
