const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();

class AIWorkflowService {
  constructor() {
    this.baseUrl = process.env.TYAI_BASE_URL || "";
    this.bearerToken = process.env.TYAI_BEARER_TOKEN || "";
    this.defaultExecutionId = process.env.TYAI_EXECUTION_ID || "";
  }

  async estimateStoryPointWithWorkflow(issueKey, projectKey, executionId = null, version = "v1") {
    try {
      const id = executionId || this.defaultExecutionId;
      
      const response = await axios.post(
        `${this.baseUrl}/execution/result`,
        {
          id: id,
          version: version,
          data: {
            issue: issueKey,
            project: projectKey,
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-TYAI-Agent": "Gurubu Planning Poker",
            Authorization: `Bearer ${this.bearerToken}`,
          },
        }
      );

      const outputData = response.data.output?.["Output Name"] || {};

      return {
        executionId: id,
        issueKey,
        projectKey,
        confidence: outputData.confidence,
        estimation: outputData.estimation,
        historical_comparison: outputData.historical_comparison,
        reasoning: outputData.reasoning,
        split_recommendation: outputData.split_recommendation,
        status: outputData.status,
      };
    } catch (error) {
      console.error("Error calling AI Workflow API:", error.response?.data || error.message);
      throw new Error(
        `Failed to get execution result: ${error.response?.data?.message || error.message}`
      );
    }
  }
}

module.exports = new AIWorkflowService();

