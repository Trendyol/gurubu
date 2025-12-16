const aiWorkflowService = require("../services/aiWorkflowService");

exports.estimateStoryPoint = async (req, res) => {
  try {
    const { issueKey, projectKey, executionId, version } = req.body;

    if (!issueKey) {
      return res.status(400).json({ error: "Issue key is required" });
    }

    if (!projectKey) {
      return res.status(400).json({ error: "Project key is required" });
    }

    const result = await aiWorkflowService.estimateStoryPointWithWorkflow(
      issueKey,
      projectKey,
      executionId,
      version
    );

    res.json(result);
  } catch (error) {
    console.error("Error estimating story point with workflow:", error);
    res.status(500).json({ 
      error: error.message || "Failed to estimate story point" 
    });
  }
};

