"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import type { EChartsOption } from "echarts";
import { IconChartLine } from "@tabler/icons-react";
import { Card, CardHeader, CardTitle } from "./dashboard-ui";
import { createTimeline, units, type BotStart, type Unit } from "./risk-data";
import styles from "./dashboard.module.scss";

const DashboardChart = dynamic(() => import("echarts-for-react"), {
  ssr: false,
  loading: () => <div className={styles.chartPlaceholder}>Loading chart…</div>,
});

const chartDate = new Intl.DateTimeFormat("en-GB", {
  day: "numeric", month: "short", timeZone: "UTC",
});
const tooltipDate = new Intl.DateTimeFormat("en-GB", {
  day: "numeric", month: "short", year: "numeric", timeZone: "UTC",
});

const markerDate = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium", timeStyle: "medium", timeZone: "UTC",
});

const metricNumber = new Intl.NumberFormat("en", { maximumFractionDigits: 2 });
const seriesConfig = {
  merge: { name: "Merge duration", color: "#6546e7" },
  approval: { name: "Time to second approval", color: "#067e73" },
  risk: { name: "Average risk score", color: "#ad5c24" },
  count: { name: "Merge requests", color: "#7558e9" },
};
const charts = {
  duration: { title: "Review & merge times", description: "duration by collection date", series: ["merge", "approval"] },
  risk: { title: "Risk score over time", description: "Average score for MRs with a risk measurement", series: ["risk"] },
  volume: { title: "Merge request activity", description: "Number of MRs by collection date", series: ["count"] },
} as const;

const durationStatistics = { median: "Median", average: "Average" } as const;
type DurationStatistic = keyof typeof durationStatistics;
const durationStatisticKeys = Object.keys(durationStatistics) as DurationStatistic[];
type Timeline = ReturnType<typeof createTimeline>;

function timelineValue(point: Timeline[number], key: keyof typeof seriesConfig, statistic: DurationStatistic) {
  return key === "merge" || key === "approval" ? point[key][statistic] : point[key];
}

type ChartProps = {
  kind: keyof typeof charts;
  timeline: Timeline;
  unit: Unit;
  botStarts: BotStart[];
  window?: { min: number; max: number };
};

export default function RiskChart({ kind, timeline, unit, botStarts, window }: ChartProps) {
  const [statistic, setStatistic] = useState<DurationStatistic>("median");
  const { title, description: subtitle, series } = charts[kind];
  const description = kind === "duration" ? `${durationStatistics[statistic]} ${subtitle}` : subtitle;
  const hasData = timeline.some((point) => series.some((key) => timelineValue(point, key, statistic) !== null));
  const option = useMemo<EChartsOption>(() => {
    const factor = kind === "duration" ? units[unit].factor : 1;
    const suffix = kind === "duration" ? ` ${unit}` : "";
    return {
      animation: false,
      useUTC: true,
      textStyle: { fontFamily: "inherit" },
      grid: { left: 6, right: 12, top: 16, bottom: 6, containLabel: true },
      tooltip: {
        trigger: "axis",
        renderMode: "richText",
        confine: true,
        backgroundColor: "#211a36",
        borderWidth: 0,
        textStyle: { color: "#fff", fontSize: 12 },
        formatter: (params) => {
          const list = Array.isArray(params) ? params : [params];
          const point = list[0];
          const timestamp = Array.isArray(point?.value) ? point.value[0] : null;
          if (typeof timestamp !== "number") return "";
          const lines = list.map(({ seriesName, value }) => {
            const measure = Array.isArray(value) ? value[1] : null;
            return `${seriesName}  ${typeof measure === "number" ? metricNumber.format(measure) + suffix : "—"}`;
          });
          return [tooltipDate.format(timestamp), ...lines].join("\n");
        },
      },
      xAxis: {
        type: "time",
        min: window?.min,
        max: window?.max,
        splitNumber: 5,
        axisLabel: { color: "#645e74", hideOverlap: true, formatter: (value: number) => chartDate.format(value) },
        axisLine: { lineStyle: { color: "#e8e2f3" } },
        axisTick: { show: false },
      },
      yAxis: {
        type: "value",
        min: 0,
        minInterval: kind === "volume" ? 1 : undefined,
        splitNumber: 4,
        axisLabel: { color: "#645e74", formatter: (value: number) => metricNumber.format(value) + suffix },
        splitLine: { lineStyle: { type: "dashed", color: "#e8e2f3" } },
      },
      series: series.map((key, index) => {
        const { color, name } = seriesConfig[key];
        const data = timeline.map((point) => {
          const value = timelineValue(point, key, statistic);
          return [point.time, value === null ? null : value * factor];
        });
        const markLine = index === 0 && botStarts.length ? {
          symbol: "none",
          label: { show: false },
          tooltip: { trigger: "item" as const, formatter: "{b}" },
          data: botStarts.map(({ time, label, color }) => ({
            xAxis: time,
            name: `${label}\nFirst reported result · ${markerDate.format(time)} UTC`,
            lineStyle: { color, type: "dashed" as const, width: 1.5 },
          })),
        } : undefined;
        if (key === "count") {
          return { name, data, markLine, type: "bar", barMaxWidth: 26, itemStyle: { color, borderRadius: [4, 4, 0, 0] } };
        }
        return {
          name, data, markLine, type: "line",
          showSymbol: data.filter(([, value]) => value !== null).length < 24,
          symbolSize: 6,
          lineStyle: { width: 2.5 },
          itemStyle: { color },
          areaStyle: key === "approval" ? undefined : {
            color: {
              type: "linear", x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [{ offset: 0, color }, { offset: 1, color: "#ffffff" }],
            },
            opacity: 0.12,
          },
        };
      }),
    };
  }, [kind, series, timeline, unit, botStarts, window, statistic]);

  return (
    <Card className={styles.chartCard}>
      <CardHeader className={kind === "duration" ? styles.trendChartHeader : undefined}>
        <div>
          <CardTitle>{title}</CardTitle>
          <p>{description}</p>
        </div>
        {kind === "duration" && (
          <div className={styles.impactMetricSwitch} role="group" aria-label="Duration statistic">
            {durationStatisticKeys.map((key) => (
              <button key={key} type="button" aria-pressed={statistic === key} onClick={() => setStatistic(key)}>
                {durationStatistics[key]}
              </button>
            ))}
          </div>
        )}
      </CardHeader>
      {series.length > 1 && <div className={styles.chartLegend}>
        {series.map((key) => (
          <span key={key}><i style={{ background: seriesConfig[key].color }} />{seriesConfig[key].name}</span>
        ))}
      </div>}
      {hasData ? (
        <div className={styles.chart} role="img" aria-label={`${title}. ${description} in UTC.`}>
          <DashboardChart option={option} style={{ height: "100%" }} notMerge />
        </div>
      ) : (
        <div className={styles.chartPlaceholder}><IconChartLine size={22} /> No data to plot</div>
      )}
    </Card>
  );
}
