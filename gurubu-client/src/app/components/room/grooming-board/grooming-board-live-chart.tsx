import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";
import ReactECharts from "echarts-for-react";

import { calculateVotesOptimized } from "@/shared/helpers/calculateVotesCount";
import { useGroomingRoom } from "@/contexts/GroomingRoomContext";
import { GroomingMode } from "@/shared/enums";
import { useTheme } from "@/contexts/ThemeContext";
import classNames from "classnames";

const GroomingBoardLiveChart = () => {
  const chartRef = useRef<ReactECharts>(null);
  const { groomingInfo, jiraSidebarExpanded } = useGroomingRoom();
  const { currentTheme } = useTheme();
  
  const calculatedVotes = calculateVotesOptimized(
    groomingInfo.metrics?.[0]?.points,
    groomingInfo.participants
  );

  const getOption = (): echarts.EChartsOption => ({
    tooltip: {
      trigger: 'item',
      formatter: '{b} SP: {c} votes ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      textStyle: {
        fontFamily: "Inter, sans-serif",
        fontSize: "16px",
        ...(currentTheme === "snow" ? {color: "#ffffff"} : {color: "#344054"})
      },
      formatter: '{name} SP'
    },
    series: [
      {
        type: 'pie',
        radius: '70%',
        data: groomingInfo.metrics?.[0]?.points.map((point, index) => ({
          value: 0,
          name: point.toString()
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        label: {
          show: true,
          formatter: '{b} SP \n{c} votes',
          fontSize: 16,
          fontFamily: "Inter, sans-serif",
          lineHeight: 20,
        },
        itemStyle: {
          color: function(params: any) {
            const colors = ['#6941c6', '#9f75ff', '#d4b7ff', '#f4ebff', '#7f56d9', '#5925dc', '#4a1fb8'];
            return colors[params.dataIndex % colors.length];
          }
        },
        animationType: 'expansion',
        animationDuration: 1000,
        animationEasing: 'cubicInOut',
        animationDelay: function (idx: number) {
          return idx * 100;
        }
      }
    ]
  });

  useEffect(() => {
    const chart = chartRef.current?.getEchartsInstance();
    if (!chart || !calculatedVotes || !groomingInfo.isResultShown) return;

    const newData = groomingInfo.metrics?.[0]?.points
      .map((point, index) => ({
        value: calculatedVotes[index],
        name: point.toString()
      }))
      .filter(item => item.value > 0);

    // Update data with animation
    chart.setOption({
      series: [{
        data: newData
      }]
    });
  }, [groomingInfo.participants, groomingInfo.isResultShown, calculatedVotes]);

  if (!groomingInfo.isResultShown || groomingInfo.mode === GroomingMode.ScoreGrooming) {
    return null;
  }

  return (
    <div className={classNames("grooming-board-live-chart", {"jira-sidebar-expanded": jiraSidebarExpanded})}>
      <ReactECharts
        ref={chartRef}
        option={getOption()}
        style={{ height: '400px' }}
        opts={{ renderer: 'canvas' }}
      />
    </div>
  );
};

export default GroomingBoardLiveChart;
