const express = require("express");
const router = express.Router();
const jiraController = require("../controllers/jiraController");
const plannerJiraController = require("../controllers/plannerJiraController");

router.get("/fetch", jiraController.fetchGet);
router.put("/fetch", jiraController.fetchPut);
router.get("/:boardId/future", plannerJiraController.getFutureSprints);
router.get("/board", plannerJiraController.getBoardByName);
router.get("/:sprintId/issues", plannerJiraController.getSprintIssues);
router.post("/:sprintId/statistics", plannerJiraController.getSprintStatistics);
router.get("/:projectKey/boards", plannerJiraController.getBoardsByProjectKey);

module.exports = router;
