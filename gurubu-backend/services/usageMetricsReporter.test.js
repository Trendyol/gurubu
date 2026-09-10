const {
  reportDay,
  buildMetricsUrl,
  isReportingEnabled,
  msUntilNextFlush,
  startDailyReporter,
  stopDailyReporter,
  DEFAULT_BASE_URL,
} = require("./usageMetricsReporter");
const {
  recordJoin,
  getCount,
  _resetForTests,
} = require("../utils/usageMetricsCounter");

describe("usageMetricsReporter", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    _resetForTests();
    stopDailyReporter();
    process.env = { ...originalEnv };
    delete process.env.SIDEHUB_PROJECT_ID;
    delete process.env.SIDEHUB_PROJECT_METRICS_TOKEN;
    delete process.env.SIDEHUB_USAGE_METRICS_BASE_URL;
  });

  afterEach(() => {
    stopDailyReporter();
    process.env = originalEnv;
  });

  test("buildMetricsUrl constructs SideHub path", () => {
    expect(buildMetricsUrl(DEFAULT_BASE_URL, "42")).toBe(
      `${DEFAULT_BASE_URL}/api/side-projects/42/usage-metrics`
    );
  });

  test("isReportingEnabled requires project id and token", () => {
    expect(isReportingEnabled()).toBe(false);
    process.env.SIDEHUB_PROJECT_ID = "42";
    expect(isReportingEnabled()).toBe(false);
    process.env.SIDEHUB_PROJECT_METRICS_TOKEN = "secret";
    expect(isReportingEnabled()).toBe(true);
  });

  test("reportDay skips when config is missing", async () => {
    const axiosClient = { post: jest.fn() };
    const result = await reportDay("2026-09-09", { axiosClient });
    expect(result).toEqual({ skipped: true, reason: "missing_config" });
    expect(axiosClient.post).not.toHaveBeenCalled();
  });

  test("reportDay posts USER payload and consumes the day on success", async () => {
    process.env.SIDEHUB_PROJECT_ID = "42";
    process.env.SIDEHUB_PROJECT_METRICS_TOKEN = "secret-token";
    process.env.SIDEHUB_USAGE_METRICS_BASE_URL = "https://example.test";

    recordJoin();
    recordJoin();
    const today = require("../utils/usageMetricsCounter").getTodayKey();
    expect(getCount(today)).toBe(2);

    const axiosClient = { post: jest.fn().mockResolvedValue({ status: 200 }) };
    const result = await reportDay(today, { axiosClient });

    expect(result.success).toBe(true);
    expect(result.count).toBe(2);
    expect(axiosClient.post).toHaveBeenCalledWith(
      "https://example.test/api/side-projects/42/usage-metrics",
      {
        metricType: "USER",
        count: 2,
        reportedAt: today,
      },
      expect.objectContaining({
        headers: expect.objectContaining({
          "X-Project-Metrics-Token": "secret-token",
        }),
      })
    );
    expect(getCount(today)).toBe(0);
  });

  test("reportDay keeps the bucket when POST fails", async () => {
    process.env.SIDEHUB_PROJECT_ID = "42";
    process.env.SIDEHUB_PROJECT_METRICS_TOKEN = "secret-token";

    recordJoin();
    const today = require("../utils/usageMetricsCounter").getTodayKey();

    const axiosClient = {
      post: jest.fn().mockRejectedValue({
        response: { status: 500 },
        message: "fail",
      }),
    };

    const result = await reportDay(today, { axiosClient });
    expect(result.success).toBe(false);
    expect(getCount(today)).toBe(1);
  });

  test("reportDay allows count 0", async () => {
    process.env.SIDEHUB_PROJECT_ID = "42";
    process.env.SIDEHUB_PROJECT_METRICS_TOKEN = "secret-token";

    const axiosClient = { post: jest.fn().mockResolvedValue({ status: 200 }) };
    const result = await reportDay("2026-01-01", { axiosClient });

    expect(result.success).toBe(true);
    expect(result.count).toBe(0);
    expect(axiosClient.post.mock.calls[0][1].count).toBe(0);
  });

  test("msUntilNextFlush returns a positive delay under 24h", () => {
    const delay = msUntilNextFlush(new Date("2026-09-10T10:00:00.000Z"));
    expect(delay).toBeGreaterThan(0);
    expect(delay).toBeLessThanOrEqual(24 * 60 * 60 * 1000);
  });

  test("startDailyReporter does not schedule when config missing", () => {
    const result = startDailyReporter();
    expect(result).toEqual({ started: false });
  });

  test("startDailyReporter starts when config present", () => {
    process.env.SIDEHUB_PROJECT_ID = "42";
    process.env.SIDEHUB_PROJECT_METRICS_TOKEN = "secret-token";
    const result = startDailyReporter({
      axiosClient: { post: jest.fn() },
    });
    expect(result).toEqual({ started: true });
    stopDailyReporter();
  });
});
