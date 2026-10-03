const {
  GroomingType,
  normalizeGroomingType,
  isValidGroomingType,
} = require("./groomingType");

describe("groomingType enum", () => {
  test("defines GroomingType values correctly", () => {
    expect(GroomingType.PlanningPoker).toBe("PlanningPoker");
    expect(GroomingType.ScoreGrooming).toBe("ScoreGrooming");
  });

  test("normalizes string enum values", () => {
    expect(normalizeGroomingType("PlanningPoker")).toBe(GroomingType.PlanningPoker);
    expect(normalizeGroomingType("ScoreGrooming")).toBe(GroomingType.ScoreGrooming);
  });

  test("normalizes legacy numeric and string-numeric values", () => {
    expect(normalizeGroomingType("0")).toBe(GroomingType.PlanningPoker);
    expect(normalizeGroomingType(0)).toBe(GroomingType.PlanningPoker);
    expect(normalizeGroomingType("1")).toBe(GroomingType.ScoreGrooming);
    expect(normalizeGroomingType(1)).toBe(GroomingType.ScoreGrooming);
  });

  test("validates supported grooming types", () => {
    expect(isValidGroomingType(GroomingType.PlanningPoker)).toBe(true);
    expect(isValidGroomingType(GroomingType.ScoreGrooming)).toBe(true);
    expect(isValidGroomingType("PlanningPoker")).toBe(true);
    expect(isValidGroomingType("ScoreGrooming")).toBe(true);
    expect(isValidGroomingType("0")).toBe(true);
    expect(isValidGroomingType(0)).toBe(true);
    expect(isValidGroomingType("1")).toBe(true);
    expect(isValidGroomingType(1)).toBe(true);
  });

  test("rejects invalid grooming types", () => {
    expect(isValidGroomingType("invalidType")).toBe(false);
    expect(isValidGroomingType("")).toBe(false);
    expect(isValidGroomingType(null)).toBe(false);
    expect(isValidGroomingType(undefined)).toBe(false);
    expect(isValidGroomingType("2")).toBe(false);
  });
});
