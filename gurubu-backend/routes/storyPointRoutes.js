const express = require("express");
const router = express.Router();
const storyPointController = require("../controllers/storyPointEstimationController");

router.post("/estimate", storyPointController.estimateStoryPoint);

module.exports = router;
