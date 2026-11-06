const axios = require("axios");
const TtlCache = require("./ttlCache");

const DEFAULT_TTL_MS = 60 * 60 * 1000;
const FILE_SUFFIX = "-estimation-guide.md";

class EstimationGuideStore {
  constructor() {
    this.cache = new TtlCache();
  }

  ttlMs() {
    const parsed = Number(process.env.ESTIMATION_GUIDE_CACHE_TTL_MS);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_TTL_MS;
  }

  fileName(projectKey) {
    const suffix =
      process.env.GITLAB_ESTIMATION_GUIDE_FILE_SUFFIX || FILE_SUFFIX;
    return `${projectKey}${suffix}`;
  }

  isConfigured() {
    return Boolean(
      process.env.GITLAB_URL &&
        process.env.GITLAB_TOKEN &&
        (process.env.GITLAB_ESTIMATION_GUIDES_PROJECT_ID ||
          process.env.GITLAB_ESTIMATION_GUIDES_PROJECT_PATH)
    );
  }

  buildRawUrl(projectKey) {
    const base = String(process.env.GITLAB_URL || "").replace(/\/+$/, "");
    const projectId =
      process.env.GITLAB_ESTIMATION_GUIDES_PROJECT_ID ||
      encodeURIComponent(
        process.env.GITLAB_ESTIMATION_GUIDES_PROJECT_PATH || ""
      );
    const filePath = encodeURIComponent(this.fileName(projectKey));
    const ref = encodeURIComponent(
      process.env.GITLAB_ESTIMATION_GUIDES_REF || "master"
    );
    return `${base}/api/v4/projects/${projectId}/repository/files/${filePath}/raw?ref=${ref}`;
  }

  async get(projectKey) {
    const cached = this.cache.get(projectKey);
    if (cached !== undefined) {
      return { status: "ready", guide: cached };
    }

    if (!this.isConfigured()) {
      if (String(process.env.ESTIMATION_GUIDE_STUB || "").toLowerCase() === "true") {
        const guide = `# Stub estimation guide for ${projectKey}\n`;
        this.cache.set(projectKey, guide, this.ttlMs());
        return { status: "ready", guide };
      }
      return { status: "unavailable", guide: null };
    }

    try {
      const response = await axios.get(this.buildRawUrl(projectKey), {
        headers: {
          "PRIVATE-TOKEN": process.env.GITLAB_TOKEN,
        },
        timeout: 15000,
        validateStatus: () => true,
      });

      if (response.status === 404) {
        return { status: "missing", guide: null };
      }

      if (response.status < 200 || response.status >= 300) {
        console.error(
          `[agent-estimation] GitLab guide fetch failed status=${response.status} projectKey=${projectKey}`
        );
        return { status: "unavailable", guide: null };
      }

      const guide = typeof response.data === "string" ? response.data : String(response.data);
      this.cache.set(projectKey, guide, this.ttlMs());
      return { status: "ready", guide };
    } catch (error) {
      console.error(
        `[agent-estimation] GitLab guide fetch error projectKey=${projectKey}:`,
        error.message
      );
      return { status: "unavailable", guide: null };
    }
  }
}

module.exports = new EstimationGuideStore();
