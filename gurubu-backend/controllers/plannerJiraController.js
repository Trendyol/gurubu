const jiraService = require("../services/jiraService");
const dotenv = require("dotenv");

dotenv.config();

exports.getFutureSprints = async (req, res) => {
  try {
    const boardId = parseInt(req.params.boardId);
    const sprints = await jiraService.getFutureSprints(boardId);
    res.json(sprints);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unexpected error occurred" });
    }
  }
};

exports.getSprintIssues = async (req, res) => {
  try {
    const sprintId = parseInt(req.params.sprintId);

    if (isNaN(sprintId)) {
      return res.status(400).json({ error: "Invalid sprint ID" });
    }

    const issues = await jiraService.getSprintIssues(sprintId);
    res.json(issues);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unexpected error occurred" });
    }
  }
};

exports.getSprintStatistics = async (req, res) => {
  try {
    const sprintId = parseInt(req.params.sprintId);
    const { assignees } = req.body;

    if (isNaN(sprintId)) {
      return res.status(400).json({ error: "Invalid sprint ID" });
    }

    if (!assignees) {
      return res.status(400).json({ error: "Assignees data is required" });
    }

    const issues = await jiraService.getSprintIssues(sprintId);
    const statistics = jiraService.calculateSprintStatistics(sprintId, issues.issues, assignees);
    res.json(statistics);
  } catch (error) {
    console.error("Error getting sprint statistics:", {
      error: error.message,
      stack: error.stack,
      sprintId: req.params.sprintId,
      assignees: req.body.assignees
    });
    res.status(500).json({ error: error.message || "Failed to get sprint statistics" });
  }
};

exports.getBoardByName = async (req, res) => {
  try {
    const { name } = req.query;

    if (!name || typeof name !== "string") {
      return res.status(400).json({ error: "Board name is required" });
    }

    const board = await jiraService.getBoardByName(name);
    res.json(board);
  } catch (error) {
    console.error("Error getting board:", error);
    if (error instanceof Error && error.message.includes("not found")) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Failed to get board" });
    }
  }
};
