const jiraInitialStoryPointService = require("../services/jiraInitialStoryPointService");
const dotenv = require("dotenv");

dotenv.config();

exports.getBoardInitialStoryPoints = async (req, res) => {
  try {
    const boardId = parseInt(req.params.boardId);
    
    if (isNaN(boardId)) {
      return res.status(400).json({ error: "Invalid board ID" });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    let sentIssueKeys = new Set();
    let batchSize = 5;
    let issueBatch = [];

    const progressCallback = (progressData, newlyProcessedIssues = []) => {
      if (newlyProcessedIssues && newlyProcessedIssues.length > 0) {
        const uniqueNewIssues = newlyProcessedIssues.filter(issue => !sentIssueKeys.has(issue.key));
        
        uniqueNewIssues.forEach(issue => {
          sentIssueKeys.add(issue.key);
          issueBatch.push(issue);
        });
      }
      
      const responseData = {
        ...progressData,
        newIssues: []
      };
      
      if (issueBatch.length >= batchSize || 
          progressData.status === 'completed' || 
          progressData.status === 'error') {
        responseData.newIssues = issueBatch;
        issueBatch = [];
      }
      
      res.write(`data: ${JSON.stringify(responseData)}\n\n`);
      
      if (progressData.status === 'completed' || progressData.status === 'error') {
        res.end();
      }
    };

    jiraInitialStoryPointService.processAllBoardIssues(boardId, progressCallback)
      .catch(error => {
        console.error("Error processing board issues:", error);
        const errorData = {
          status: 'error',
          error: error.message || "Unknown error occurred",
          newIssues: []
        };
        res.write(`data: ${JSON.stringify(errorData)}\n\n`);
        res.end();
      });
  } catch (error) {
    console.error("Error starting board issues processing:", error);
    res.status(500).json({ error: error.message || "Failed to process board issues" });
  }
};