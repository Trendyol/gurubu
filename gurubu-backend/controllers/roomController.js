const {
  generateNewRoom,
  getRooms,
  checkRoomExistance,
  handleJoinRoom,
} = require("../utils/groomings");

exports.createRoom = async (req, res) => {
  const nickName = req.body.nickName;
  const groomingType = req.body.groomingType;
  if (!nickName) {
    return res.status(400).json({ error: "nickName is required" });
  }

  if(!groomingType){
    return res.status(400).json({ error: "groomingType is required" });
  }

  const result = generateNewRoom(nickName, groomingType);

  res.status(201).json(result);
};

// Join an existing room
exports.joinRoom = async (req, res) => {
  const roomID = req.params.roomId;
  const nickName = req.body.nickName;

  const result = handleJoinRoom(nickName, roomID);

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
