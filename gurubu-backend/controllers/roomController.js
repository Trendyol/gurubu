const {
  generateNewRoom,
  checkRoomExistance,
  handleJoinRoom,
} = require("../utils/groomings");
const { isValidGroomingType } = require("../enums/groomingType");
const { recordJoin } = require("../utils/usageMetricsCounter");

exports.createRoom = async (req, res) => {
  const nickName = req.body.nickName;
  const groomingType = req.body.groomingType;
  if (!nickName) {
    return res.status(400).json({ error: "nickName is required" });
  }

  if (groomingType === undefined || groomingType === null || groomingType === "") {
    return res.status(400).json({ error: "groomingType is required" });
  }

  if (!isValidGroomingType(groomingType)) {
    return res.status(400).json({ error: "invalid groomingType" });
  }

  const result = generateNewRoom(nickName, groomingType);
  recordJoin();

  res.status(201).json(result);
};

// Join an existing room
exports.joinRoom = async (req, res) => {
  const roomID = req.params.roomId;
  const nickName = req.body.nickName;

  const result = handleJoinRoom(nickName, roomID);

  if(!result){
    return res.status(404).json({ message: "Room not found" });
  }

  recordJoin();
  res.status(200).json(result);
};

exports.getRoom = async (req, res) => {
  const roomId = req.params.roomId;

  const roomExist = checkRoomExistance(roomId);

  if (roomExist) {
    return res.status(200).json({ roomID: roomId });
  }

  res.status(404).json({ message: "Room not found" });
};
