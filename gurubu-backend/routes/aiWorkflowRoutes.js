const express = require("express");
const router = express.Router();
const aiWorkflowController = require("../controllers/aiWorkflowController");

router.post("/estimate", aiWorkflowController.estimateStoryPoint);

module.exports = router;

