const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");

router.post("/create", roomController.createRoom);
router.post("/:roomId", roomController.joinRoom);
router.get("/:roomId", roomController.getRoom);

module.exports = router;
