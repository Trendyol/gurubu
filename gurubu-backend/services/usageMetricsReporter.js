const axios = require("axios");
const {
  getCount,
  consumeDay,
  getYesterdayKey,
} = require("../utils/usageMetricsCounter");

const DEFAULT_BASE_URL = "";

const FLUSH_HOUR = 0;
const FLUSH_MINUTE = 5;

let flushTimer = null;
let intervalTimer = null;

function getConfig() {
  const baseUrl = (
    process.env.SIDEHUB_USAGE_METRICS_BASE_URL || DEFAULT_BASE_URL
  ).replace(/\/$/, "");
  const projectId = process.env.SIDEHUB_PROJECT_ID;
  const token = process.env.SIDEHUB_PROJECT_METRICS_TOKEN;

  return { baseUrl, projectId, token };
}

function isReportingEnabled() {
  const { projectId, token } = getConfig();
  return Boolean(projectId && token);
}

function buildMetricsUrl(baseUrl, projectId) {
  return `${baseUrl}/api/side-projects/${projectId}/usage-metrics`;
}

/**
 * Milliseconds until next 00:05 in Europe/Istanbul.
 */
function msUntilNextFlush(now = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = Object.fromEntries(
    formatter.formatToParts(now).map(({ type, value }) => [type, value])
  );

  const year = Number(parts.year);
  const month = Number(parts.month);
  const day = Number(parts.day);
  const hour = Number(parts.hour === "24" ? "0" : parts.hour);
  const minute = Number(parts.minute);
  const second = Number(parts.second);

  // Istanbul is UTC+3 year-round (no DST since 2016)
  const istanbulOffsetMs = 3 * 60 * 60 * 1000;
  const currentIstanbulAsUtc = Date.UTC(
    year,
    month - 1,
    day,
    hour,
    minute,
    second
  );
  let targetIstanbulAsUtc = Date.UTC(
    year,
    month - 1,
    day,
    FLUSH_HOUR,
    FLUSH_MINUTE,
    0
  );

  if (targetIstanbulAsUtc <= currentIstanbulAsUtc) {
    targetIstanbulAsUtc += 24 * 60 * 60 * 1000;
  }

  const targetUtc = targetIstanbulAsUtc - istanbulOffsetMs;
  const currentUtc = currentIstanbulAsUtc - istanbulOffsetMs;
  return targetUtc - currentUtc;
}

async function reportDay(dateKey, { axiosClient = axios } = {}) {
  if (!isReportingEnabled()) {
    return { skipped: true, reason: "missing_config" };
  }

  const { baseUrl, projectId, token } = getConfig();
  const count = getCount(dateKey);
  const url = buildMetricsUrl(baseUrl, projectId);

  try {
    await axiosClient.post(
      url,
      {
        metricType: "USER",
        count,
        reportedAt: dateKey,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-Project-Metrics-Token": token,
        },
        timeout: 15000,
      }
    );
    consumeDay(dateKey);
    return { skipped: false, success: true, count, reportedAt: dateKey };
  } catch (error) {
    const message = error.response
      ? `status=${error.response.status}`
      : error.message;
    console.error(
      `[usage-metrics] Failed to report ${dateKey} (count=${count}): ${message}`
    );
    return { skipped: false, success: false, count, reportedAt: dateKey, error };
  }
}

async function flushYesterday(options) {
  const dateKey = getYesterdayKey();
  return reportDay(dateKey, options);
}

function scheduleNextFlush(runFlush) {
  const delay = msUntilNextFlush();
  flushTimer = setTimeout(async () => {
    await runFlush();
    intervalTimer = setInterval(runFlush, 24 * 60 * 60 * 1000);
    if (typeof intervalTimer.unref === "function") {
      intervalTimer.unref();
    }
  }, delay);
  if (typeof flushTimer.unref === "function") {
    flushTimer.unref();
  }
}

function startDailyReporter({ axiosClient = axios } = {}) {
  if (!isReportingEnabled()) {
    console.log(
      "[usage-metrics] Reporting disabled: set SIDEHUB_PROJECT_ID and SIDEHUB_PROJECT_METRICS_TOKEN"
    );
    return { started: false };
  }

  const runFlush = async () => {
    await flushYesterday({ axiosClient });
  };

  scheduleNextFlush(runFlush);
  console.log(
    `[usage-metrics] Daily reporter scheduled (next flush in ~${Math.round(
      msUntilNextFlush() / 60000
    )} min)`
  );
  return { started: true };
}

function stopDailyReporter() {
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
  if (intervalTimer) {
    clearInterval(intervalTimer);
    intervalTimer = null;
  }
}

module.exports = {
  DEFAULT_BASE_URL,
  getConfig,
  isReportingEnabled,
  buildMetricsUrl,
  msUntilNextFlush,
  reportDay,
  flushYesterday,
  startDailyReporter,
  stopDailyReporter,
};
