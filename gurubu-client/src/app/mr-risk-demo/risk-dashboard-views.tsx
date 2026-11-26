"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  IconArrowDown, IconArrowUp, IconArrowsSort, IconArrowUpRight, IconChartBar, IconChevronLeft, IconChevronRight,
  IconClock, IconGitMerge, IconSearch, IconShieldHalf,
} from "@tabler/icons-react";
import { Button, Card, CardHeader, CardTitle } from "./dashboard-ui";
import { all, countProjects, dashboardPath, duration, formatDate, formatNumber, formatTimestamp, projectLabel, useRiskDashboard } from "./risk-dashboard";
import { bucketStart, createTimeline, DAY, findBotStarts, safeLink, summarize, type RiskRow } from "./risk-data";
import BotImpact from "./bot-impact";
import RiskChart from "./risk-chart";
import styles from "./dashboard.module.scss";

const pageSize = 10;
const recordColumns = [
  { key: "title", label: "Merge request" },
  { key: "issue", label: "Jira key" },
  { key: "owner", label: "Risk owner" },
  { key: "risk", label: "Risk" },
  { key: "merge", label: "Merge" },
  { key: "approval", label: "2nd approval" },
  { key: "commits", label: "Commits" },
  { key: "lines", label: "Lines changed" },
  { key: "changes", label: "Changes" },
  { key: "comments", label: "Comments" },
  { key: "points", label: "Story points" },
  { key: "collectedAt", label: "Collected (UTC)" },
] as const;

type RecordColumn = typeof recordColumns[number]["key"];
type SortDirection = "ascending" | "descending";
const recordCollator = new Intl.Collator("en", { numeric: true, sensitivity: "base" });

function compareRecords(first: RiskRow, second: RiskRow, column: RecordColumn, direction: SortDirection) {
  const a = first[column];
  const b = second[column];
  if (a === null || a === "") return b === null || b === "" ? 0 : 1;
  if (b === null || b === "") return -1;
  const comparison = typeof a === "number" && typeof b === "number" ? a - b : recordCollator.compare(String(a), String(b));
  return direction === "ascending" ? comparison : -comparison;
}

export function OverviewPage() {
  const { source, visibleRows, unit } = useRiskDashboard();
  const metrics = useMemo(() => ({
    merge: summarize(visibleRows.map((row) => row.merge)),
    risk: summarize(visibleRows.map((row) => row.risk)),
  }), [visibleRows]);
  const cards = [
    { label: "Merge requests", value: source ? formatNumber.format(visibleRows.length) : "—", detail: "Records in the current view", icon: IconGitMerge },
    { label: "Median merge duration", value: duration(metrics.merge.median, unit), detail: `${formatNumber.format(metrics.merge.count)} measured MRs`, icon: IconClock },
    { label: "Average merge duration", value: duration(metrics.merge.average, unit), detail: `${formatNumber.format(metrics.merge.count)} measured MRs`, icon: IconChartBar },
    { label: "Average risk score", value: metrics.risk.average === null ? "—" : formatNumber.format(metrics.risk.average), detail: `${formatNumber.format(metrics.risk.count)} scored MRs`, icon: IconShieldHalf },
  ];


  return (
    <>
        <div className={styles.metrics} aria-label="Summary metrics">
          {cards.map(({ label, value, detail, icon: Icon }) => (
            <Card key={label} className={styles.metric}>
              <div className={styles.metricHeading}><span>{label}</span><Icon size={19} stroke={1.7} /></div>
              <strong>{value}</strong>
              <span className={styles.metricDetail}>{source ? detail : "Awaiting CSV data"}</span>
            </Card>
          ))}
        </div>
      <Link href={dashboardPath + "/bot-impact"} className={styles.overviewCallout}>
        <span><strong>Compare bot approvals</strong><span>See median and average merge duration for each approval group.</span></span>
        <IconArrowUpRight size={22} />
      </Link>
    </>
  );
}

export function TrendsPage() {
  const { source, visibleRows, dateRows, unit, period, project, changeProject } = useRiskDashboard();
  const projectCounts = useMemo(() => countProjects(dateRows), [dateRows]);
  const botStarts = useMemo(() => findBotStarts(source?.rows ?? []), [source]);
  const rangeStart = dateRows.at(-1)?.collectedAt;
  const rangeEnd = dateRows[0]?.collectedAt;
  const visibleBotStarts = useMemo(() =>
    botStarts.filter(({ time }) => rangeStart !== undefined && rangeEnd !== undefined &&
      time >= rangeStart && time <= rangeEnd),
  [botStarts, rangeStart, rangeEnd]);
  const chartWindow = useMemo(() => rangeStart !== undefined && rangeEnd !== undefined ? {
    min: bucketStart(rangeStart, period),
    max: (Math.floor(rangeEnd / DAY) + 1) * DAY,
  } : undefined, [rangeStart, rangeEnd, period]);
  const timeline = useMemo(() => createTimeline(visibleRows, period), [visibleRows, period]);

  return (
    <section id="trends" className={styles.trends} aria-label="Trends and breakdowns">
      {visibleBotStarts.length > 0 && (
        <div className={styles.milestones} aria-label="Bot flow starts">
          <span>First bot result (UTC)</span>
          <ul>
            {visibleBotStarts.map(({ key, label, color, time }) => (
              <li key={key}>
                <i style={{ color }} />
                <strong>{label}</strong>
                <time dateTime={new Date(time).toISOString()} title={formatTimestamp.format(time) + " UTC"}>
                  {formatDate.format(time)}
                </time>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className={styles.topCharts}>
        <RiskChart kind="duration" timeline={timeline} unit={unit} botStarts={visibleBotStarts} window={chartWindow} />
        <Card className={styles.projectCard}>
          <CardHeader><CardTitle>Jira projects</CardTitle><p>MRs in the selected date range</p></CardHeader>
          {projectCounts.length ? (
            <div className={styles.projects} aria-label="Filter by Jira project">
              {projectCounts.map(({ key, count }) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={project === key}
                  onClick={() => changeProject(project === key ? all : key)}
                  className={styles.projectRow}
                >
                  <span>{projectLabel(key)}</span><strong>{formatNumber.format(count)}</strong>
                  <span className={styles.track}><i style={{ width: `${(count / projectCounts[0].count) * 100}%` }} /></span>
                </button>
              ))}
            </div>
          ) : <div className={styles.chartPlaceholder}>No projects to display</div>}
        </Card>
      </div>
      <div className={styles.bottomCharts}>
        <RiskChart kind="risk" timeline={timeline} unit={unit} botStarts={visibleBotStarts} window={chartWindow} />
        <RiskChart kind="volume" timeline={timeline} unit={unit} botStarts={visibleBotStarts} window={chartWindow} />
      </div>
    </section>
  );
}

export function BotImpactPage() {
  const { source, visibleRows, unit, project } = useRiskDashboard();
  return <BotImpact rows={visibleRows} unit={unit} project={project} loaded={source !== null} />;
}

export function RecordsPage() {
  const { source, visibleRows, unit } = useRiskDashboard();
  // A new source or filter selection starts the table at the first page.
  const [table, setTable] = useState({ rows: visibleRows, source, page: 1, query: "" });
  const [sort, setSort] = useState<{ column: RecordColumn; direction: SortDirection }>({
    column: "collectedAt",
    direction: "descending",
  });
  if (table.rows !== visibleRows) {
    setTable({ rows: visibleRows, source, page: 1, query: table.source === source ? table.query : "" });
  }
  const { page, query } = table;
  const setPage = (page: number) => setTable({ ...table, page });
  const setQuery = (query: string) => setTable({ ...table, query, page: 1 });
  const matchingRows = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return visibleRows;
    return visibleRows.filter(({ title, issue, owner }) =>
      [title, issue, owner].some((value) => value.toLowerCase().includes(term)),
    );
  }, [query, visibleRows]);
  const sortedRows = useMemo(() => [...matchingRows].sort((first, second) =>
    compareRecords(first, second, sort.column, sort.direction),
  ), [matchingRows, sort]);
  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const displayRows = sortedRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <section id="records" aria-label="Merge request records">
      <Card className={styles.recordsCard}>
        <CardHeader className={styles.recordsHeader}>
          <div><CardTitle>Merge requests</CardTitle><p>{formatNumber.format(matchingRows.length)} matching records</p></div>
          <label className={styles.search}>
            <IconSearch size={17} />
            <input value={query} type="search" aria-label="Search merge requests" placeholder="Search title, Jira key or owner"
              disabled={!source} onChange={(event) => { setQuery(event.target.value); }} />
          </label>
        </CardHeader>
        <div className={styles.tableScroll} tabIndex={0} role="region" aria-label="Merge request table">
          <table>
            <thead><tr>
              {recordColumns.map(({ key, label }) => {
                const direction = sort.column === key ? sort.direction : undefined;
                const nextDirection = direction === "ascending" ? "descending" : "ascending";
                const Icon = direction === "ascending" ? IconArrowUp : direction === "descending" ? IconArrowDown : IconArrowsSort;
                return (
                  <th key={key} scope="col" aria-sort={direction}>
                    <button
                      type="button"
                      className={styles.sortHeader}
                      aria-label={`Sort ${label} ${nextDirection}`}
                      disabled={!source}
                      onClick={() => {
                        setSort({ column: key, direction: nextDirection });
                        setPage(1);
                      }}
                    >
                      {label}<Icon size={13} aria-hidden="true" />
                    </button>
                  </th>
                );
              })}
            </tr></thead>
            <tbody>
              {displayRows.map((row) => {
                const link = safeLink(row.link);
                return (
                  <tr key={row.id}>
                    <td className={styles.titleCell}>
                      {link ? <a href={link} target="_blank" rel="noreferrer">{row.title || "Open merge request"} <IconArrowUpRight size={14} /></a> : row.title || "—"}
                    </td>
                    <td><span className={styles.issue}>{row.issue || "—"}</span></td>
                    <td>{row.owner || "—"}</td>
                    <td>{row.risk ?? "—"}</td><td>{duration(row.merge, unit)}</td><td>{duration(row.approval, unit)}</td>
                    <td>{row.commits ?? "—"}</td><td>{row.lines === null ? "—" : formatNumber.format(row.lines)}</td>
                    <td>{row.changes === null ? "—" : formatNumber.format(row.changes)}</td>
                    <td>{row.comments ?? "—"}</td><td>{row.points ?? "—"}</td>
                    <td><time dateTime={new Date(row.collectedAt).toISOString()}>{formatTimestamp.format(row.collectedAt)}</time></td>
                  </tr>
                );
              })}
              {!displayRows.length && <tr><td colSpan={recordColumns.length} className={styles.emptyTable}>{source ? "No merge requests match the current filters." : "Import a CSV to see merge requests."}</td></tr>}
            </tbody>
          </table>
        </div>
        {matchingRows.length > pageSize && <div className={styles.pagination}>
          <span>Page {currentPage} of {totalPages}</span>
          <Button aria-label="Previous page" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}><IconChevronLeft size={17} /></Button>
          <Button aria-label="Next page" disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)}><IconChevronRight size={17} /></Button>
        </div>}
      </Card>
    </section>
  );
}
