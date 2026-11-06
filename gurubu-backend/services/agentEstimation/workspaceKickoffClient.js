const TtlCache = require("./ttlCache");

const DEFAULT_TTL_MS = 45 * 60 * 1000;

class WorkspaceKickoffClient {
  constructor() {
    this.started = new TtlCache();
  }

  ttlMs() {
    const parsed = Number(process.env.ESTIMATION_WORKSPACE_KICKOFF_TTL_MS);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_TTL_MS;
  }

  async once(projectKey) {
    if (this.started.has(projectKey)) {
      return { started: false, reason: "already_started" };
    }

    this.started.set(projectKey, true, this.ttlMs());

    return { started: true, reason: "stub" };
  }
}

module.exports = new WorkspaceKickoffClient();
