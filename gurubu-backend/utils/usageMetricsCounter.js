const TIMEZONE = "Europe/Istanbul";

const countsByDay = new Map();

function formatDateKey(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function getTodayKey() {
  return formatDateKey(new Date());
}

function shiftDateKey(dateKey, deltaDays) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const utcDate = new Date(Date.UTC(year, month - 1, day));
  utcDate.setUTCDate(utcDate.getUTCDate() + deltaDays);
  return utcDate.toISOString().slice(0, 10);
}

function getYesterdayKey() {
  return shiftDateKey(getTodayKey(), -1);
}

function recordJoin() {
  const key = getTodayKey();
  const next = (countsByDay.get(key) || 0) + 1;
  countsByDay.set(key, next);
  return next;
}

function getCount(dateKey) {
  return countsByDay.get(dateKey) || 0;
}

function consumeDay(dateKey) {
  const count = getCount(dateKey);
  countsByDay.delete(dateKey);
  return count;
}

function _resetForTests() {
  countsByDay.clear();
}

module.exports = {
  TIMEZONE,
  formatDateKey,
  getTodayKey,
  getYesterdayKey,
  shiftDateKey,
  recordJoin,
  getCount,
  consumeDay,
  _resetForTests,
};
