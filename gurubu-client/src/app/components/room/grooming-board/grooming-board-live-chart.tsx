import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";
import ReactECharts from "echarts-for-react";

import { calculateVotesOptimized } from "@/shared/helpers/calculateVotesCount";
import { useGroomingRoom } from "@/contexts/GroomingRoomContext";
import { GroomingMode } from "@/shared/enums";
import { useTheme } from "@/contexts/ThemeContext";

const GroomingBoardLiveChart = () => {
  const chartRef = useRef<ReactECharts>(null);

  const { groomingInfo } = useGroomingRoom();
  const { currentTheme } = useTheme();
  const calculatedVotes = calculateVotesOptimized(
    groomingInfo.metrics?.[0]?.points,
    groomingInfo.participants
  );

  const initialData: number[] = Array(
    groomingInfo.metrics?.[0]?.points.length ?? 9
  ).fill(0);

  const getOption = (data: number[]): echarts.EChartsOption => ({
    xAxis: {
      max: "dataMax",
      axisLabel: {
        fontFamily: "Inter, sans-serif",
        fontSize: "16px",
        ...(currentTheme === "snow" ? {color: "#ffffff"} : {color: "#344054"})
      },
    },
    yAxis: {
      type: "category",
      data: groomingInfo.metrics?.[0]?.points,
      inverse: true,
      animationDuration: 300,
      animationDurationUpdate: 300,
      max: 5,
      axisLabel: {
        fontFamily: "Inter, sans-serif",
        fontSize: "16px",
        ...(currentTheme === "snow" ? {color: "#ffffff"} : {color: "#344054"})
      },
    },
    legend: {
      show: true,
      type: "plain",
      data: ["Vote Numbers"],
      textStyle: {
        fontFamily: "Inter, sans-serif",
        fontSize: "16px",
        ...(currentTheme === "snow" ? {color: "#ffffff"} : {color: "#344054"})
      },
    },
    series: [
      {
        realtimeSort: true,
        type: "bar",
        data,
        name: "Vote Numbers",
        label: {
          show: true,
          position: "right",
          valueAnimation: true,
          fontSize: 16,
          fontFamily: "Inter, sans-serif",
          color: "#6941c6",
          fontWeight: "bold",
        },
        itemStyle: {
          borderRadius: [10, 10, 10, 10],
          color: "#6941c6",
        },
      },
    ],
    animationDuration: 0,
    animationDurationUpdate: 750,
    animationEasing: "linear",
    animationEasingUpdate: "linear",
  });

  const updateData = () => {
    if (!calculatedVotes || !groomingInfo.isResultShown) {
      return;
    }
    chartRef.current?.getEchartsInstance().setOption<echarts.EChartsOption>({
      series: [
        {
          type: "bar",
          data: calculatedVotes,
        },
      ],
    });
  };

  useEffect(() => {
    updateData();
  }, [groomingInfo.participants, currentTheme]);

  if (!groomingInfo.isResultShown || groomingInfo.mode === GroomingMode.ScoreGrooming) {
    return null;
  }

  return (
    <ReactECharts
      className="grooming-board-live-chart"
      ref={chartRef}
      option={getOption(initialData)}
      style={{ width: "100%", height: "400px" }}
    />
  );
};

export default GroomingBoardLiveChart;
