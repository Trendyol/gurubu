const express = require("express");
const router = express.Router();
const openaiController = require("../controllers/openaiController");

router.post("/ask", openaiController.askAssistant);

module.exports = router;
