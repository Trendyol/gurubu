const {
  generateNewRetro,
  checkRetroExistance,
  handleJoinRetro,
  getRetro,
} = require("../utils/retros");
const { getAllTemplates } = require("../config/retroTemplates");

exports.createRetro = async (req, res) => {
  const nickName = req.body.nickName;
  const title = req.body.title;
  const templateId = req.body.templateId || 'what-went-well';

  if (!nickName) {
    return res.status(400).json({ error: "nickName is required" });
  }

  const result = generateNewRetro(nickName, title, templateId);
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
