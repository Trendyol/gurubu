const openaiService = require("../services/openaiService");

exports.estimateStoryPoint = async (req, res) => {
  try {
    const { boardName, issueSummary, issueDescription, threadId } = req.body;

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
    
    const message = createStoryPointPrompt(issueSummary, issueDescription);

    const response = await openaiService.askAssistant(assistantId, message, threadId);

    res.json(response);
  } catch (error) {
    console.error("Error estimating story point:", error);
    res.status(500).json({ error: error.message || "Failed to estimate story point" });
  }
};

function createStoryPointPrompt(issueSummary, issueDescription, maxSp = 13) {
  return `Lütfen aşağıdaki issue için sadece bir storypoint değeri döndür.
Cevabında kesinlikle başka hiçbir açıklama, metin veya karakter olmasın, sadece rakam olsun.
Sadece sayısal değeri döndür. Örneğin: 5

Bir işe verilebilecek minimum SP değeri 1, maksimum SP değeri ${maxSp}.
Fibonacci serisine göre SP değerleri: 1, 2, 3, 5, 8, 13 ... ... ... olabilir.

Issue Summary: ${issueSummary}
Issue Description: ${issueDescription}`;
}
