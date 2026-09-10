const {
  recordJoin,
  getCount,
  consumeDay,
  getTodayKey,
  getYesterdayKey,
  shiftDateKey,
  formatDateKey,
  _resetForTests,
} = require("./usageMetricsCounter");

describe("usageMetricsCounter", () => {
  beforeEach(() => {
    _resetForTests();
  });

  test("formatDateKey returns yyyy-MM-dd in Europe/Istanbul", () => {
    // 2026-09-09 22:00 UTC is 2026-09-10 01:00 in Istanbul (UTC+3)
    const key = formatDateKey(new Date("2026-09-09T22:00:00.000Z"));
    expect(key).toBe("2026-09-10");
  });

  test("recordJoin increments today's count", () => {
    const today = getTodayKey();
    expect(getCount(today)).toBe(0);
    expect(recordJoin()).toBe(1);
    expect(recordJoin()).toBe(2);
    expect(getCount(today)).toBe(2);
  });

  test("consumeDay returns count and clears the bucket", () => {
    const today = getTodayKey();
    recordJoin();
    recordJoin();
    expect(consumeDay(today)).toBe(2);
    expect(getCount(today)).toBe(0);
    expect(consumeDay(today)).toBe(0);
  });

  test("getCount returns 0 for unknown days", () => {
    expect(getCount("1999-01-01")).toBe(0);
  });

  test("shiftDateKey and getYesterdayKey are calendar-day based", () => {
    expect(shiftDateKey("2026-09-10", -1)).toBe("2026-09-09");
    expect(shiftDateKey("2026-03-01", -1)).toBe("2026-02-28");
    expect(getYesterdayKey()).toBe(shiftDateKey(getTodayKey(), -1));
  });
});
