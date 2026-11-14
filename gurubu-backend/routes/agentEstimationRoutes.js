const express = require("express");
const router = express.Router();
const agentEstimationController = require("../controllers/agentEstimationController");

router.post("/prepare-skill", agentEstimationController.prepareSkill);
router.post("/estimate", agentEstimationController.estimate);

module.exports = router;
