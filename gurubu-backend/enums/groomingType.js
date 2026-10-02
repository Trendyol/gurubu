const GroomingType = Object.freeze({
  PlanningPoker: "PlanningPoker",
  ScoreGrooming: "ScoreGrooming",
});

const normalizeGroomingType = (type) => {
  if (type === GroomingType.PlanningPoker || type === "0" || type === 0) {
    return GroomingType.PlanningPoker;
  }
  if (type === GroomingType.ScoreGrooming || type === "1" || type === 1) {
    return GroomingType.ScoreGrooming;
  }
  return type;
};

const isValidGroomingType = (type) => {
  const normalized = normalizeGroomingType(type);
  return Object.values(GroomingType).includes(normalized);
};

module.exports = {
  GroomingType,
  normalizeGroomingType,
  isValidGroomingType,
};
