const express = require("express");
const router = express.Router();
const jiraPdfCreatorController = require("../controllers/jiraPdfCreatorController");

router.get("/:boardId/download-pdf", jiraPdfCreatorController.downloadBoardIssuesAsPdf);

module.exports = router;
