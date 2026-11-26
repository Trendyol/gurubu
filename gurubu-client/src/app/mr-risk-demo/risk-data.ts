export const DAY = 86_400_000;

export const units = {
  h: { label: "Hours", factor: 1 },
  min: { label: "Minutes", factor: 60 },
  s: { label: "Seconds", factor: 3600 },
} as const;

export type Unit = keyof typeof units;
export type Period = "day" | "week" | "month";

type Measurement = number | null;
export type RiskRow = {
  id: number;
  title: string;
  link: string;
  owner: string;
  issue: string;
  projects: string[];
  collectedAt: number;
  merge: Measurement;
  approval: Measurement;
  risk: Measurement;
  commits: Measurement;
  lines: Measurement;
  changes: Measurement;
  comments: Measurement;
  points: Measurement;
  reviewBot: boolean | null;
  qaBot: boolean | null;
};

export const botFlows = [
  { key: "reviewBot", label: "Code Review Bot", color: "#1d64b5" },
  { key: "qaBot", label: "Storefront QA Bot", color: "#aa5318" },
] as const;

export type BotStart = typeof botFlows[number] & { time: number };

export function findBotStarts(rows: RiskRow[]): BotStart[] {
  return botFlows.flatMap((bot) => {
    const time = rows.reduce((first, row) =>
      row[bot.key] === null ? first : Math.min(first, row.collectedAt), Infinity);
    return Number.isFinite(time) ? [{ ...bot, time }] : [];
  });
}

export const riskScoreBands = [
  { label: "0–30", upper: 30 },
  { label: "31–40", upper: 40, threshold: "Current threshold", tone: "current" },
  { label: "41–45", upper: 45, threshold: "Candidate threshold", tone: "candidate" },
  { label: "46–50", upper: 50 },
  { label: "51–60", upper: 60 },
  { label: "61+", upper: Infinity },
] as const;

export function riskBandIndex(score: Measurement) {
  return score === null ? null : riskScoreBands.findIndex(({ upper }) => score <= upper);
}

const requiredHeaders = [
  "mr_title", "collected_at", "jira_issue_key", "risk_score",
  "merge_duration_hours", "second_approve_time_hours",
];

function readCSV(source: string) {
  const records: string[][] = [];
  let record: string[] = [];
  let field = "";
  let state: "field" | "quoted" | "closed" = "field";

  function finishField() {
    record.push(field.trim());
    field = "";
    state = "field";
  }

  function finishRecord() {
    finishField();
    if (record.some(Boolean)) records.push(record);
    record = [];
  }

  for (let index = 0; index < source.length; index++) {
    const character = source[index];
    if (state === "quoted") {
      if (character !== '"') {
        field += character;
      } else if (source[index + 1] === '"') {
        field += '"';
        index++;
      } else {
        state = "closed";
      }
      continue;
    }
    if (character === ",") finishField();
    else if (character === "\n" || character === "\r") {
      finishRecord();
      if (character === "\r" && source[index + 1] === "\n") index++;
    } else if (character === '"' && state === "field" && field.trim() === "") {
      field = "";
      state = "quoted";
    } else if (state === "field" && character !== '"') {
      field += character;
    } else if (state !== "closed" || character.trim()) {
      throw new Error("The CSV contains an invalid quoted field.");
    }
  }
  if (state === "quoted") throw new Error("The CSV contains an unclosed quoted field.");
  finishRecord();
  return records;
}

function numberCell(text: string) {
  const value = Number(text);
  return text && Number.isFinite(value) && value >= 0 ? value : null;
}

function approvalCell(text: string) {
  if (text.toLowerCase() === "true") return true;
  if (text.toLowerCase() === "false") return false;
  return null;
}

function parseDateCell(text: string) {
  return Date.parse(
    /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?$/.test(text)
      ? `${text.replace(" ", "T")}Z`
      : text,
  );
}

export function parseRiskCSV(source: string) {
  const [header = [], ...records] = readCSV(source.replace(/^\uFEFF/, ""));
  const columns = new Map(header.map((key, index) => [key.toLowerCase(), index]));
  const missing = requiredHeaders.filter((key) => !columns.has(key));
  if (missing.length) throw new Error(`Missing CSV columns: ${missing.join(", ")}.`);
  if (columns.size !== header.length) throw new Error("The CSV contains duplicate column names.");

  const rows: RiskRow[] = [];
  let skipped = 0;
  for (const [id, record] of records.entries()) {
    if (record.length !== header.length) {
      skipped++;
      continue;
    }
    const cell = (key: string) => record[columns.get(key) ?? -1] ?? "";
    const date = cell("collected_at");
    const collectedAt = parseDateCell(date);
    if (!Number.isFinite(collectedAt)) {
      skipped++;
      continue;
    }
    const issue = cell("jira_issue_key");
    const projects = Array.from(new Set(
      Array.from(issue.toUpperCase().matchAll(/\b([A-Z][A-Z0-9_]+)-\d+\b/g), (match) => match[1]),
    ));
    rows.push({
      id, collectedAt, issue, projects,
      title: cell("mr_title"),
      link: cell("mr_link"),
      owner: cell("risk_owner"),
      merge: numberCell(cell("merge_duration_hours")),
      approval: numberCell(cell("second_approve_time_hours")),
      risk: numberCell(cell("risk_score")),
      commits: numberCell(cell("commit_count")),
      lines: numberCell(cell("total_line_changes")),
      changes: numberCell(cell("changes_count")),
      comments: numberCell(cell("human_comment_count")),
      points: numberCell(cell("story_point")),
      reviewBot: approvalCell(cell("code_review_bot_approved_text")),
      qaBot: approvalCell(cell("storefront_monorepo_qa_bot_approved_text")),
    });
  }

  if (!rows.length) throw new Error("The CSV has no records with a valid collected_at timestamp.");
  rows.sort((first, second) => second.collectedAt - first.collectedAt);
  return { rows, skipped };
}

export function summarize(values: (number | null)[]) {
  const sorted = values.filter((value): value is number => value !== null).sort((a, b) => a - b);
  const count = sorted.length;
  if (!count) return { average: null, median: null, count };
  const middle = Math.floor(count / 2);
  return {
    average: sorted.reduce((sum, value) => sum + value, 0) / count,
    median: count % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2,
    count,
  };
}

export function bucketStart(timestamp: number, period: Period) {
  const date = new Date(timestamp);
  const day = Math.floor(timestamp / DAY) * DAY;
  if (period === "month") return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1);
  if (period === "week") return day - ((date.getUTCDay() + 6) % 7) * DAY;
  return day;
}

function nextBucket(timestamp: number, period: Period) {
  if (period === "month") {
    const date = new Date(timestamp);
    return Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1);
  }
  return timestamp + (period === "week" ? 7 : 1) * DAY;
}

export function createTimeline(rows: RiskRow[], period: Period) {
  const buckets = new Map<number, RiskRow[]>();
  for (const row of rows) {
    const start = bucketStart(row.collectedAt, period);
    const bucket = buckets.get(start);
    if (bucket) bucket.push(row);
    else buckets.set(start, [row]);
  }

  const timeline = [];
  const emptyDuration = { median: null, average: null, count: 0 };
  let previous: number | undefined;
  for (const [time, samples] of Array.from(buckets).sort(([a], [b]) => a - b)) {
    if (previous !== undefined && nextBucket(previous, period) < time) {
      timeline.push({ time: nextBucket(previous, period), count: 0, merge: emptyDuration, approval: emptyDuration, risk: null });
    }
    timeline.push({
      time,
      count: samples.length,
      merge: summarize(samples.map((row) => row.merge)),
      approval: summarize(samples.map((row) => row.approval)),
      risk: summarize(samples.map((row) => row.risk)).average,
    });
    previous = time;
  }
  return timeline;
}

export function safeLink(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol === "https:" || url.protocol === "http:") return url.href;
  } catch {
    return undefined;
  }
}
