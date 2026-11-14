const estimationGuideStore = require("./agentEstimation/estimationGuideStore");
const workspaceKickoffClient = require("./agentEstimation/workspaceKickoffClient");
const estimateResultCache = require("./agentEstimation/estimateResultCache");
const llmEstimationClient = require("./agentEstimation/llmEstimationClient");

const PROJECT_KEY_RE = /^[A-Z][A-Z0-9]{1,9}$/;
const MAX_TEXT_LENGTH = 50000;

class AgentEstimationService {
  isActive() {
    return String(process.env.AGENT_ESTIMATION_ACTIVE || "").toLowerCase() === "true";
  }

  normalizeProjectKey(value) {
    return String(value || "")
      .trim()
      .toUpperCase();
  }

  validateProjectKey(projectKey) {
    return PROJECT_KEY_RE.test(projectKey);
  }

  truncate(text) {
    const value = String(text || "");
    if (value.length <= MAX_TEXT_LENGTH) {
      return value;
    }
    return value.slice(0, MAX_TEXT_LENGTH);
  }

  async prepareSkill(projectKeyInput) {
    const projectKey = this.normalizeProjectKey(projectKeyInput);
    if (!this.validateProjectKey(projectKey)) {
      const error = new Error("Invalid projectKey");
      error.status = 400;
      throw error;
    }

    const guideResult = await estimationGuideStore.get(projectKey);
    if (guideResult.status === "ready") {
      return { status: "ready" };
    }

    if (
      guideResult.status === "missing" &&
      String(process.env.ESTIMATION_WORKSPACE_KICKOFF_ACTIVE || "").toLowerCase() ===
        "true"
    ) {
      await workspaceKickoffClient.once(projectKey);
    }

    return { status: "preparing" };
  }

  async estimate({ projectKey: projectKeyInput, issueKey, summary, description }) {
    const projectKey = this.normalizeProjectKey(projectKeyInput);
    if (!this.validateProjectKey(projectKey)) {
      const error = new Error("Invalid projectKey");
      error.status = 400;
      throw error;
    }

    const normalizedIssueKey = String(issueKey || "").trim();
    if (!normalizedIssueKey) {
      const error = new Error("issueKey is required");
      error.status = 400;
      throw error;
    }

    const safeSummary = this.truncate(summary);
    const safeDescription = this.truncate(description);

    const cached = estimateResultCache.get(
      projectKey,
      normalizedIssueKey,
      safeSummary,
      safeDescription
    );
    if (cached) {
      return {
        status: "ready",
        estimation: cached.estimation,
        reasoning: cached.reasoning,
      };
    }

    const guideResult = await estimationGuideStore.get(projectKey);
    if (guideResult.status !== "ready" || !guideResult.guide) {
      return { status: "preparing" };
    }

    try {
      const result = await llmEstimationClient.estimate({
        projectKey,
        issueKey: normalizedIssueKey,
        summary: safeSummary,
        description: safeDescription,
        guide: guideResult.guide,
      });

      if (
        !result ||
        typeof result.estimation !== "number" ||
        !Array.isArray(result.reasoning)
      ) {
        return { status: "failed" };
      }

      estimateResultCache.set(
        projectKey,
        normalizedIssueKey,
        safeSummary,
        safeDescription,
        {
          estimation: result.estimation,
          reasoning: result.reasoning,
        }
      );

      return {
        status: "ready",
        estimation: result.estimation,
        reasoning: result.reasoning,
      };
    } catch (error) {
      console.error(
        "[agent-estimation] LLM estimate failed",
        normalizedIssueKey,
        error.message
      );
      return { status: "failed" };
    }
  }
}

module.exports = new AgentEstimationService();
