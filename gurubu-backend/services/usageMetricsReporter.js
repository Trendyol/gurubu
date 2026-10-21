const axios = require("axios");

const DEFAULT_BASE_URL = "";

function getConfig() {
  const baseUrl = (
    process.env.SIDEHUB_USAGE_METRICS_BASE_URL || DEFAULT_BASE_URL
  ).replace(/\/$/, "");
  const projectId = process.env.SIDEHUB_PROJECT_ID;
  const token = process.env.SIDEHUB_PROJECT_METRICS_TOKEN;

  return { baseUrl, projectId, token };
}

function isReportingEnabled() {
  const { baseUrl, projectId, token } = getConfig();
  return Boolean(baseUrl && projectId && token);
}

function buildIncrementUrl(baseUrl, projectId) {
  return `${baseUrl}/api/side-projects/${projectId}/usage-metrics/increment`;
}

/**
 * Fire-and-forget SideHub usage increment. Never throws; skips when config
 * missing. Do not wrap with automatic retries (overcount risk).
 */
function reportSidehubUsageIncrement({
  axiosClient = axios,
  metricType = "USER",
  times = 1,
  logger = console,
} = {}) {
  if (!isReportingEnabled()) {
    return;
  }

  const { baseUrl, projectId, token } = getConfig();
  const count = Math.max(0, times);
  if (count === 0) {
    return;
  }

  const url = buildIncrementUrl(baseUrl, projectId);

  for (let i = 0; i < count; i += 1) {
    void axiosClient
      .post(
        url,
        { metricType },
        {
          headers: {
            "Content-Type": "application/json",
            "X-Project-Metrics-Token": token,
          },
          timeout: 5000,
        }
      )
      .catch((error) => {
        const message =
          error instanceof Error ? error.message : String(error);
        if (typeof logger?.warn === "function") {
          logger.warn("SIDEHUB_USAGE_METRICS_INCREMENT_FAILED", {
            projectId,
            error: message,
          });
        }
      });
  }
}

module.exports = {
  DEFAULT_BASE_URL,
  getConfig,
  isReportingEnabled,
  buildIncrementUrl,
  reportSidehubUsageIncrement,
};
