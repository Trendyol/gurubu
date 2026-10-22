const { toPublicGrooming, redactVotes } = require("./votePrivacy");

const buildGrooming = (overrides = {}) => ({
  mode: "0",
  isResultShown: false,
  score: 0,
  participants: {
    0: { userID: 0, nickname: "admin", votes: { storyPoint: "3" } },
    1: { userID: 1, nickname: "dev", votes: { storyPoint: "8", break: "?" } },
    2: { userID: 2, nickname: "qa" },
  },
  ...overrides,
});

describe("votePrivacy", () => {
  test("redactVotes keeps the voted metrics as flags and drops their values", () => {
    expect(redactVotes({ storyPoint: "8", break: "?" })).toEqual({
      storyPoint: true,
      break: true,
    });
  });

  test("redactVotes returns falsy values as false so voted flags survive", () => {
    expect(redactVotes({ storyPoint: "", developmentEase: "5" })).toEqual({
      storyPoint: false,
      developmentEase: true,
    });
  });

  test("redactVotes passes through a participant who has not voted", () => {
    expect(redactVotes(undefined)).toBeUndefined();
  });

  test("votes stay hidden from the room until results are shown", () => {
    const publicGrooming = toPublicGrooming(buildGrooming());

    expect(publicGrooming.participants["0"].votes).toEqual({
      storyPoint: true,
    });
    expect(publicGrooming.participants["1"].votes).toEqual({
      storyPoint: true,
      break: true,
    });
    expect(publicGrooming.participants["2"].votes).toBeUndefined();
  });

  test("a viewer keeps their own vote so it can be restored on reconnect", () => {
    const publicGrooming = toPublicGrooming(buildGrooming(), 1);

    expect(publicGrooming.participants["1"].votes).toEqual({
      storyPoint: "8",
      break: "?",
    });
    expect(publicGrooming.participants["0"].votes).toEqual({
      storyPoint: true,
    });
  });

  test("every vote is revealed once the result is shown", () => {
    const publicGrooming = toPublicGrooming(
      buildGrooming({ isResultShown: true })
    );

    expect(publicGrooming.participants["1"].votes).toEqual({
      storyPoint: "8",
      break: "?",
    });
  });

  test("the original grooming object is never mutated", () => {
    const grooming = buildGrooming();

    toPublicGrooming(grooming);

    expect(grooming.participants["0"].votes).toEqual({ storyPoint: "3" });
    expect(grooming).toEqual(buildGrooming());
  });

  test("non grooming payloads are returned untouched", () => {
    expect(toPublicGrooming(undefined)).toBeUndefined();
    expect(toPublicGrooming(null)).toBeNull();
  });

  test("a grooming without participants does not break the redaction", () => {
    expect(
      toPublicGrooming({ isResultShown: false, participants: undefined })
    ).toEqual({ isResultShown: false, participants: {} });
  });
});
