const agentEstimationService = require("../services/agentEstimationService");

const resolveProjectKey = (body) => {
  const raw = body?.projectKey || body?.projectName;
  return raw ? String(raw).trim() : "";
};

exports.prepareSkill = async (req, res) => {
  try {
    if (!agentEstimationService.isActive()) {
      return res.status(403).json({ error: "Agent estimation is disabled" });
    }

    const projectKey = resolveProjectKey(req.body || {});
    if (!projectKey) {
      return res.status(400).json({ error: "projectKey is required" });
    }

    const result = await agentEstimationService.prepareSkill(projectKey);
    return res.status(200).json(result);
  } catch (error) {
    const status = error.status || 500;
    if (status >= 500) {
      console.error("Error preparing agent estimation skill:", error);
    }
    return res.status(status).json({
      error: error.message || "Failed to prepare skill",
    });
  }
};

exports.estimate = async (req, res) => {
  try {
    if (!agentEstimationService.isActive()) {
      return res.status(403).json({ error: "Agent estimation is disabled" });
    }

    const body = req.body || {};
    const projectKey = resolveProjectKey(body);
    if (!projectKey) {
      return res.status(400).json({ error: "projectKey is required" });
    }
    if (!body.issueKey || !String(body.issueKey).trim()) {
      return res.status(400).json({ error: "issueKey is required" });
    }

    const result = await agentEstimationService.estimate({
      projectKey,
      issueKey: String(body.issueKey).trim(),
      summary: body.summary || "",
      description: body.description || "",
    });

    return res.status(200).json(result);
  } catch (error) {
    const status = error.status || 500;
    if (status >= 500) {
      console.error("Error estimating with agent:", error);
    }
    return res.status(status).json({
      error: error.message || "Failed to estimate",
    });
  }
};
