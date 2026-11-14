const crypto = require("crypto");
const TtlCache = require("./ttlCache");

const DEFAULT_TTL_MS = 2 * 60 * 60 * 1000;

class EstimateResultCache {
  constructor() {
    this.cache = new TtlCache();
  }

  ttlMs() {
    const parsed = Number(process.env.ESTIMATE_RESULT_CACHE_TTL_MS);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_TTL_MS;
  }

  buildKey(projectKey, issueKey, summary, description) {
    const hash = crypto
      .createHash("sha256")
      .update(`${summary || ""}\n${description || ""}`)
      .digest("hex");
    return `${projectKey}:${issueKey}:${hash}`;
  }

  get(projectKey, issueKey, summary, description) {
    return this.cache.get(
      this.buildKey(projectKey, issueKey, summary, description)
    );
  }

  set(projectKey, issueKey, summary, description, result) {
    this.cache.set(
      this.buildKey(projectKey, issueKey, summary, description),
      result,
      this.ttlMs()
    );
  }
}

module.exports = new EstimateResultCache();
