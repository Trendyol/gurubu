const express = require("express");
const router = express.Router();
const initialStoryPointController = require("../controllers/initialStoryPointController");

router.get("/board/:boardId/initial-story-points/stream", initialStoryPointController.getBoardInitialStoryPoints);

module.exports = router; 