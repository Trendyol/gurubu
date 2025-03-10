const openaiService = require("../services/openaiService");

exports.askAssistant = async (req, res) => {
  try {
    const { boardName, issueSummary, issueDescription } = req.body;

    if(!boardName) {
      return res.status(400).json({ error: "Board name is required" });     
    }

    if (!issueSummary) {
      return res.status(400).json({ error: "Issue Summary is required" });
    }

    if (!issueDescription) {
      return res.status(400).json({ error: "Issue Description is required" });
    }
    
    const assistantId = process.env.OPENAI_ASSISTANT_ID;
    const message = `Board: ${boardName}\nIssue Summary: ${issueSummary}\nIssue Description: ${issueDescription}`;

    const response = await openaiService.askAssistant(assistantId, message);

    res.json(response);
  } catch (error) {
    console.error("Error asking assistant:", error);
    res.status(500).json({ error: error.message || "Failed to get response from assistant" });
  }
};

