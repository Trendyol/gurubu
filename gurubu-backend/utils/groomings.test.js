const {
  generateNewRoom,
  calculateScore,
  groomingMode,
  getGrooming,
} = require("./groomings");
const { GroomingType } = require("../enums/groomingType");

describe("groomings utils with GroomingType enum", () => {
  test("groomingMode contains both GroomingType enum keys and legacy keys", () => {
    expect(groomingMode[GroomingType.PlanningPoker]).toBeDefined();
    expect(groomingMode[GroomingType.ScoreGrooming]).toBeDefined();
    expect(groomingMode["0"]).toBe(groomingMode[GroomingType.PlanningPoker]);
    expect(groomingMode["1"]).toBe(groomingMode[GroomingType.ScoreGrooming]);
    expect(groomingMode[0]).toBe(groomingMode[GroomingType.PlanningPoker]);
    expect(groomingMode[1]).toBe(groomingMode[GroomingType.ScoreGrooming]);
  });

  test("generateNewRoom generates room with PlanningPoker GroomingType", () => {
    const room = generateNewRoom("Alice", GroomingType.PlanningPoker);
    const grooming = getGrooming(room.roomID);
    expect(room.roomID).toBeDefined();
    expect(grooming.mode).toBe(GroomingType.PlanningPoker);
    expect(grooming.metrics).toEqual(groomingMode[GroomingType.PlanningPoker]);
  });

  test("generateNewRoom normalizes legacy '0' to PlanningPoker", () => {
    const room = generateNewRoom("Bob", "0");
    const grooming = getGrooming(room.roomID);
    expect(grooming.mode).toBe(GroomingType.PlanningPoker);
    expect(grooming.metrics).toEqual(groomingMode[GroomingType.PlanningPoker]);
  });

  test("generateNewRoom generates room with ScoreGrooming GroomingType", () => {
    const room = generateNewRoom("Charlie", GroomingType.ScoreGrooming);
    const grooming = getGrooming(room.roomID);
    expect(grooming.mode).toBe(GroomingType.ScoreGrooming);
    expect(grooming.metrics).toEqual(groomingMode[GroomingType.ScoreGrooming]);
  });

  test("generateNewRoom normalizes legacy '1' to ScoreGrooming", () => {
    const room = generateNewRoom("Dave", "1");
    const grooming = getGrooming(room.roomID);
    expect(grooming.mode).toBe(GroomingType.ScoreGrooming);
    expect(grooming.metrics).toEqual(groomingMode[GroomingType.ScoreGrooming]);
  });

  test("calculateScore works with PlanningPoker mode and legacy '0'", () => {
    const participants = {
      1: { votes: { storyPoint: "5" } },
      2: { votes: { storyPoint: "8" } },
    };

    const scoreEnum = calculateScore(GroomingType.PlanningPoker, participants, "room-1");
    const scoreLegacy = calculateScore("0", participants, "room-1");

    expect(scoreEnum).toBe("8.00");
    expect(scoreLegacy).toBe("8.00");
  });
});
