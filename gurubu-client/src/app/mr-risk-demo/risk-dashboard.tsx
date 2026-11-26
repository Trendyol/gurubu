"use client";

import { createContext, useContext, useMemo, useRef, useState, type DragEvent, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconActivity, IconArrowLeft, IconCalendarEvent, IconChartBar, IconChevronDown, IconFileSpreadsheet,
  IconFileUpload, IconFilter, IconLayoutDashboard, IconListDetails, IconUpload,
} from "@tabler/icons-react";
import { Button, Card } from "./dashboard-ui";
import { DAY, parseRiskCSV, units, type Period, type RiskRow, type Unit } from "./risk-data";
import styles from "./dashboard.module.scss";

export const dashboardPath = "/mr-risk-demo";
export const formatNumber = new Intl.NumberFormat("en", { maximumFractionDigits: 2 });
export const formatDate = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeZone: "UTC" });
export const formatTimestamp = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium", timeStyle: "short", timeZone: "UTC",
});
export const unlinked = "unlinked";
export const all = "all";
const periods = { day: "Daily", week: "Weekly", month: "Monthly" } as const;
const ranges = [
  { value: "all", label: "All dates" },
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
  { value: "custom", label: "Custom range" },
];

export type Source = ReturnType<typeof parseRiskCSV> & { name: string };
type ProjectCount = { key: string; count: number };

export function duration(value: number | null, unit: Unit) {
  return value === null ? "—" : `${formatNumber.format(value * units[unit].factor)} ${unit}`;
}

export function projectLabel(key: string) {
  return key === unlinked ? "No Jira key" : key;
}

export function countProjects(rows: RiskRow[]): ProjectCount[] {
  const counts = new Map<string, number>();
  for (const { projects } of rows) {
    for (const project of projects.length ? projects : [unlinked]) {
      counts.set(project, (counts.get(project) ?? 0) + 1);
    }
  }
  return Array.from(counts, ([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
}

const pages = [
  { path: "", label: "Overview", title: "Merge request risk", description: "Track merge duration, review speed and risk from your CSV.", icon: IconLayoutDashboard },
  { path: "/bot-impact", label: "Bot impact", title: "Bot approvals & review duration", description: "Compare median and average merge and second approval times by bot status.", icon: IconChartBar },
  { path: "/trends", label: "Trends", title: "Trends", description: "Follow collection dates and see when each bot first reported a result.", icon: IconActivity },
  { path: "/records", label: "Merge requests", title: "Merge requests", description: "Search and inspect individual merge requests from the selected CSV.", icon: IconListDetails },
];

type DashboardData = {
  source: Source | null;
  dateRows: RiskRow[];
  visibleRows: RiskRow[];
  project: string;
  changeProject: (project: string) => void;
  unit: Unit;
  period: Period;
};

const DashboardContext = createContext<DashboardData | null>(null);

export function useRiskDashboard() {
  const data = useContext(DashboardContext);
  if (!data) throw new Error("MR Risk Dashboard layout is missing.");
  return data;
}

export default function RiskDashboard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const current = pages.find((item) => dashboardPath + item.path === pathname) ?? pages[0];
  const [source, setSource] = useState<Source | null>(null);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [project, setProject] = useState(all);
  const [range, setRange] = useState(all);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [draftFrom, setDraftFrom] = useState("");
  const [draftTo, setDraftTo] = useState("");
  const [period, setPeriod] = useState<Period>("week");
  const [unit, setUnit] = useState<Unit>("h");
  const input = useRef<HTMLInputElement>(null);
  const dateDialog = useRef<HTMLDialogElement>(null);
  const importId = useRef(0);

  function resetDates() {
    setRange(all);
    setFrom("");
    setTo("");
  }

  function resetFilters() {
    setProject(all);
    resetDates();
  }

  async function importFile(file?: File) {
    if (!file) return;
    const id = ++importId.current;
    setImporting(true);
    setError("");
    try {
      const result = parseRiskCSV(await file.text());
      if (id !== importId.current) return;
      setSource({ ...result, name: file.name });
      resetFilters();
    } catch (failure) {
      if (id === importId.current) {
        setError(failure instanceof Error ? failure.message : "Could not read the CSV.");
      }
    } finally {
      if (id === importId.current) setImporting(false);
    }
  }

  function dropFile(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    void importFile(event.dataTransfer.files[0]);
  }

  const firstDate = source?.rows.at(-1)?.collectedAt;
  const lastDate = source?.rows[0].collectedAt;
  const presetStart = lastDate !== undefined && range !== all && range !== "custom"
    ? Math.floor(lastDate / DAY) * DAY - (Number(range) - 1) * DAY
    : undefined;
  const shownStart = range === "custom" ? (from ? Date.parse(from) : undefined) : presetStart ?? firstDate;
  const shownEnd = range === "custom" ? (to ? Date.parse(to) : undefined) : lastDate;
  const dateLabel = shownStart !== undefined && shownEnd !== undefined
    ? `${formatDate.format(shownStart)} – ${formatDate.format(shownEnd)}`
    : shownStart !== undefined ? `From ${formatDate.format(shownStart)}`
    : shownEnd !== undefined ? `Until ${formatDate.format(shownEnd)}` : "All dates";

  function openDateDialog() {
    setDraftFrom(shownStart === undefined ? "" : new Date(shownStart).toISOString().slice(0, 10));
    setDraftTo(shownEnd === undefined ? "" : new Date(shownEnd).toISOString().slice(0, 10));
    dateDialog.current?.showModal();
  }

  function applyDates() {
    if (draftFrom && draftTo && draftFrom > draftTo) return;
    setFrom(draftFrom);
    setTo(draftTo);
    setRange(draftFrom || draftTo ? "custom" : all);
    dateDialog.current?.close();
  }
  const availableProjects = useMemo(() => countProjects(source?.rows ?? []), [source]);
  const dateRows = useMemo(() => {
    if (!source) return [];
    const start = range === "custom" && from ? Date.parse(from) : presetStart ?? -Infinity;
    const end = range === "custom" && to ? Date.parse(to) + DAY : Infinity;
    return source.rows.filter((row) => row.collectedAt >= start && row.collectedAt < end);
  }, [source, presetStart, range, from, to]);
  const visibleRows = useMemo(() => {
    if (project === all) return dateRows;
    return dateRows.filter(({ projects }) => project === unlinked ? !projects.length : projects.includes(project));
  }, [dateRows, project]);

  return (
    <DashboardContext.Provider value={{ source, dateRows, visibleRows, project, changeProject: setProject, unit, period }}>
      <div className={styles.shell} data-clarity-mask="true">
        <aside className={styles.sidebar}>
          <Link href="/" className={styles.brand}>
            <Image src="/logo.svg" alt="" width={31} height={31} />
            <span>Gurubu</span>
          </Link>
          <nav aria-label="Dashboard sections" className={styles.navigation}>
            {pages.map(({ path, label, icon: Icon }) => (
              <Link key={path} href={dashboardPath + path} aria-current={current.path === path ? "page" : undefined}>
                <Icon size={19} stroke={1.7} />{label}
              </Link>
            ))}
          </nav>
          <Link href="/" className={styles.backLink}><IconArrowLeft size={17} /> Back to Gurubu</Link>
        </aside>

        <main className={styles.main}>
          <header className={styles.pageHeader}>
            <div><h1>{current.title}</h1><p>{current.description}</p></div>
            {source && firstDate !== undefined && lastDate !== undefined && (
              <button type="button" className={styles.dateBadge} aria-haspopup="dialog"
                aria-label={`Select date range. ${dateLabel} UTC`} onClick={openDateDialog}>
                <IconCalendarEvent size={16} aria-hidden="true" />{dateLabel}
                <span className={styles.utc}>UTC</span>
                <IconChevronDown size={14} aria-hidden="true" />
              </button>
            )}
          </header>

          {source && (
            <dialog ref={dateDialog} className={styles.dateDialog} aria-labelledby="collection-range-title">
              <form onSubmit={(event) => { event.preventDefault(); applyDates(); }}>
                <h2 id="collection-range-title">Select date range</h2>
                <p>Both dates are inclusive and use UTC.</p>
                <div className={`${styles.filters} ${styles.dateFields}`}>
                  <label>Start date
                    <input type="date" value={draftFrom} max={draftTo || undefined}
                      onChange={(event) => setDraftFrom(event.target.value)} />
                  </label>
                  <label>End date
                    <input type="date" value={draftTo} min={draftFrom || undefined}
                      onChange={(event) => setDraftTo(event.target.value)} />
                  </label>
                </div>
                <div className={styles.dateActions}>
                  <Button className={styles.allDatesButton} onClick={() => { resetDates(); dateDialog.current?.close(); }}>All dates</Button>
                  <Button onClick={() => dateDialog.current?.close()}>Cancel</Button>
                  <Button type="submit" variant="primary">Apply range</Button>
                </div>
              </form>
            </dialog>
          )}

          <input
            id="risk-csv"
            type="file"
            aria-label="Choose MR risk CSV file"
            accept=".csv,text/csv"
            ref={input}
            className={styles.visuallyHidden}
            tabIndex={-1}
            onChange={(event) => {
              void importFile(event.currentTarget.files?.[0]);
              event.currentTarget.value = "";
            }}
          />
          <div
            role="region"
            aria-label="CSV import"
            className={styles.importPanel}
            data-loaded={Boolean(source)}
            data-dragging={dragging}
            onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
            onDragLeave={(event) => {
              if (!(event.relatedTarget instanceof Node) || !event.currentTarget.contains(event.relatedTarget)) setDragging(false);
            }}
            onDrop={dropFile}
          >
            <div className={styles.importIcon}>
              {source ? <IconFileSpreadsheet size={23} /> : <IconFileUpload size={26} />}
            </div>
            <div className={styles.importCopy} aria-live="polite">
              <h2>{source?.name ?? "Import an MR risk CSV"}</h2>
              <p>{source
                ? `${formatNumber.format(source.rows.length)} records loaded${source.skipped ? ` · ${source.skipped} invalid rows skipped` : ""}`
                : "Drop your CSV here or choose a file to populate the dashboard."}</p>
            </div>
            <Button variant="primary" onClick={() => input.current?.click()} disabled={importing}>
              <IconUpload size={17} /> {importing ? "Reading CSV…" : source ? "Replace CSV" : "Choose CSV"}
            </Button>
          </div>
          {error && <p className={styles.error} role="alert">{error}</p>}

          <Card className={styles.filterCard}>
            <div className={styles.filterHeading}>
              <IconFilter size={18} stroke={1.75} />
              <h2>Filters</h2>
              <Button disabled={project === all && range === all} onClick={resetFilters}>Reset filters</Button>
            </div>
            <div className={styles.filters} data-compact={current.path !== "/trends"}>
              <label>Jira project
                <select value={project} onChange={(event) => setProject(event.target.value)} disabled={!source}>
                  <option value={all}>All projects</option>
                  {availableProjects.map(({ key }) => <option key={key} value={key}>{projectLabel(key)}</option>)}
                </select>
              </label>
              <label>Collection date
                <select value={range} disabled={!source} onChange={(event) => {
                  if (event.target.value === "custom") openDateDialog();
                  else setRange(event.target.value);
                }}>
                  {ranges.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
              {current.path === "/trends" && <label>Group by
                <select value={period} onChange={(event) => setPeriod(event.target.value as Period)}>
                  {Object.entries(periods).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                </select>
              </label>}
              <label>Duration unit
                <select value={unit} onChange={(event) => setUnit(event.target.value as Unit)}>
                  {Object.entries(units).map(([key, { label }]) => <option key={key} value={key}>{label}</option>)}
                </select>
              </label>
            </div>
            {range !== all && range !== "custom" && <p className={styles.filterHint}>Relative to the latest collection date in the CSV (UTC).</p>}
          </Card>
          {children}
        </main>
      </div>
    </DashboardContext.Provider>
  );
}
