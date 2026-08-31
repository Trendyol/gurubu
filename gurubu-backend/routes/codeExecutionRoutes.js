const express = require("express");
const router = express.Router();
const codeExecutionController = require("../controllers/codeExecutionController");

router.post("/execute", codeExecutionController.executeCode);

module.exports = router;
