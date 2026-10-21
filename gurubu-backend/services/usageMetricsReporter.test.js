const {
  reportSidehubUsageIncrement,
  buildIncrementUrl,
  isReportingEnabled,
  DEFAULT_BASE_URL,
} = require("./usageMetricsReporter");

describe("usageMetricsReporter", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.SIDEHUB_PROJECT_ID;
    delete process.env.SIDEHUB_PROJECT_METRICS_TOKEN;
    delete process.env.SIDEHUB_USAGE_METRICS_BASE_URL;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  test("DEFAULT_BASE_URL is empty (must be set via env)", () => {
    expect(DEFAULT_BASE_URL).toBe("");
  });

  test("buildIncrementUrl constructs SideHub increment path", () => {
    expect(
      buildIncrementUrl(
        "https://product-qc-side-project-catalog-service.mars.trendyol.com",
        "42"
      )
    ).toBe(
      "https://product-qc-side-project-catalog-service.mars.trendyol.com/api/side-projects/42/usage-metrics/increment"
    );
  });

  test("isReportingEnabled requires base url, project id and token", () => {
    expect(isReportingEnabled()).toBe(false);
    process.env.SIDEHUB_PROJECT_ID = "42";
    process.env.SIDEHUB_PROJECT_METRICS_TOKEN = "secret";
    expect(isReportingEnabled()).toBe(false);
    process.env.SIDEHUB_USAGE_METRICS_BASE_URL =
      "https://product-qc-side-project-catalog-service.mars.trendyol.com";
    expect(isReportingEnabled()).toBe(true);
  });

  test("reportSidehubUsageIncrement skips when config is missing", () => {
    const axiosClient = { post: jest.fn() };
    reportSidehubUsageIncrement({ axiosClient });
    expect(axiosClient.post).not.toHaveBeenCalled();
  });

  test("reportSidehubUsageIncrement posts USER metric to increment endpoint", () => {
    process.env.SIDEHUB_PROJECT_ID = "42";
    process.env.SIDEHUB_PROJECT_METRICS_TOKEN = "secret-token";
    process.env.SIDEHUB_USAGE_METRICS_BASE_URL =
      "https://product-qc-side-project-catalog-service.mars.trendyol.com";

    const axiosClient = {
      post: jest.fn().mockResolvedValue({ status: 200 }),
    };

    reportSidehubUsageIncrement({ axiosClient });

    expect(axiosClient.post).toHaveBeenCalledTimes(1);
    expect(axiosClient.post).toHaveBeenCalledWith(
      "https://product-qc-side-project-catalog-service.mars.trendyol.com/api/side-projects/42/usage-metrics/increment",
      { metricType: "USER" },
      expect.objectContaining({
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          "X-Project-Metrics-Token": "secret-token",
        }),
        timeout: 5000,
      })
    );
  });

  test("reportSidehubUsageIncrement uses custom base url and times", () => {
    process.env.SIDEHUB_PROJECT_ID = "42";
    process.env.SIDEHUB_PROJECT_METRICS_TOKEN = "secret-token";
    process.env.SIDEHUB_USAGE_METRICS_BASE_URL = "https://example.test/";

    const axiosClient = {
      post: jest.fn().mockResolvedValue({ status: 200 }),
    };

    reportSidehubUsageIncrement({
      axiosClient,
      times: 3,
      metricType: "TRANSACTION",
    });

    expect(axiosClient.post).toHaveBeenCalledTimes(3);
    expect(axiosClient.post).toHaveBeenCalledWith(
      "https://example.test/api/side-projects/42/usage-metrics/increment",
      { metricType: "TRANSACTION" },
      expect.any(Object)
    );
  });

  test("reportSidehubUsageIncrement does not throw when POST fails", async () => {
    process.env.SIDEHUB_PROJECT_ID = "42";
    process.env.SIDEHUB_PROJECT_METRICS_TOKEN = "secret-token";
    process.env.SIDEHUB_USAGE_METRICS_BASE_URL = "https://example.test";

    const logger = { warn: jest.fn() };
    const axiosClient = {
      post: jest.fn().mockRejectedValue(new Error("network down")),
    };

    expect(() =>
      reportSidehubUsageIncrement({ axiosClient, logger })
    ).not.toThrow();

    await new Promise((resolve) => setImmediate(resolve));

    expect(logger.warn).toHaveBeenCalledWith(
      "SIDEHUB_USAGE_METRICS_INCREMENT_FAILED",
      expect.objectContaining({
        projectId: "42",
        error: "network down",
      })
    );
  });

  test("reportSidehubUsageIncrement skips when times is 0", () => {
    process.env.SIDEHUB_PROJECT_ID = "42";
    process.env.SIDEHUB_PROJECT_METRICS_TOKEN = "secret-token";
    process.env.SIDEHUB_USAGE_METRICS_BASE_URL = "https://example.test";

    const axiosClient = { post: jest.fn() };
    reportSidehubUsageIncrement({ axiosClient, times: 0 });
    expect(axiosClient.post).not.toHaveBeenCalled();
  });
});
