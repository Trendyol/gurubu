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
    tooltip: {
      trigger: 'item',
      formatter: 'Story Point {b}: {c} votes ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      textStyle: {
        fontFamily: "Inter, sans-serif",
        fontSize: "16px",
        ...(currentTheme === "snow" ? {color: "#ffffff"} : {color: "#344054"})
      },
      formatter: 'Story Point {name}'
    },
    series: [
      {
        type: 'pie',
        radius: '70%',
        data: groomingInfo.metrics?.[0]?.points
          .map((point, index) => ({
            value: data[index],
            name: point.toString()
          }))
          .filter(item => item.value > 0),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        label: {
          show: true,
          formatter: 'SP {b}\n{c} votes',
          fontSize: 16,
          fontFamily: "Inter, sans-serif",
          lineHeight: 20,
        },
        itemStyle: {
          color: function(params: any) {
            const colors = ['#6941c6', '#9f75ff', '#d4b7ff', '#f4ebff', '#7f56d9', '#5925dc', '#4a1fb8'];
            return colors[params.dataIndex % colors.length];
          }
        }
      }
    ],
    animationDuration: 750,
    animationEasing: "linear",
  });

  const updateData = () => {
    if (!calculatedVotes || !groomingInfo.isResultShown) {
      return;
    }
    chartRef.current?.getEchartsInstance().setOption<echarts.EChartsOption>({
      series: [
        {
          type: 'pie',
          data: groomingInfo.metrics?.[0]?.points
            .map((point, index) => ({
              value: calculatedVotes[index],
              name: point.toString()
            }))
            .filter(item => item.value > 0)
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
