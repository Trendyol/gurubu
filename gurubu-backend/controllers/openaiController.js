const openaiService = require("../services/openaiService");

exports.askAssistant = async (req, res) => {
  try {
    const { assistantId, message } = req.body;

    if (!assistantId) {
      return res.status(400).json({ error: "Assistant ID is required" });
    }

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const response = await openaiService.askAssistant(assistantId, message);
    res.json(response);
  } catch (error) {
    console.error("Error asking assistant:", error);
    res.status(500).json({ error: error.message || "Failed to get response from assistant" });
  }
};
