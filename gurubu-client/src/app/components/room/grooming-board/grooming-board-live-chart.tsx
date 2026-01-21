import React, { useMemo } from "react";
import * as echarts from "echarts";
import ReactECharts from "echarts-for-react";

import { calculateVotesOptimized } from "@/shared/helpers/calculateVotesCount";
import { useGroomingRoom } from "@/contexts/GroomingRoomContext";
import { GroomingMode } from "@/shared/enums";
import { useTheme } from "@/contexts/ThemeContext";
import classNames from "classnames";

const CHART_COLORS = ['#6941c6', '#9f75ff', '#d4b7ff', '#f4ebff', '#7f56d9', '#5925dc', '#4a1fb8'];

const GroomingBoardLiveChart = () => {
  const { groomingInfo, jiraSidebarExpanded } = useGroomingRoom();
  const { currentTheme } = useTheme();
  
  const calculatedVotes = useMemo(() => 
    calculateVotesOptimized(
      groomingInfo?.metrics?.[0]?.points,
      groomingInfo?.participants
    ),
    [groomingInfo?.metrics, groomingInfo?.participants]
  );

  const chartData = useMemo(() => {
    if (!calculatedVotes || !groomingInfo?.metrics?.[0]?.points) return [];
    
    return groomingInfo?.metrics?.[0]?.points
      .map((point, index) => ({
        value: calculatedVotes?.[index] || 0,
        name: point?.toString(),
        itemStyle: {
          color: CHART_COLORS[index % CHART_COLORS.length]
        }
      }))
      .filter(item => item?.value > 0);
  }, [calculatedVotes, groomingInfo?.metrics]);

  const chartOption = useMemo((): echarts.EChartsOption => ({
    tooltip: {
      trigger: 'item',
      formatter: '{b} SP: {c} votes ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: chartData?.map(item => item?.name),
      textStyle: {
        fontFamily: "Inter, sans-serif",
        fontSize: "16px",
        color: currentTheme === "snow" ? "#ffffff" : "#344054"
      },
      formatter: '{name} SP'
    },
    series: [
      {
        type: 'pie',
        radius: '70%',
        data: chartData,
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
        animationType: 'expansion',
        animationDuration: 800,
        animationEasing: 'cubicOut'
      }
    ]
  }), [chartData, currentTheme]);

  if (!groomingInfo.isResultShown || groomingInfo.mode === GroomingMode.ScoreGrooming) {
    return null;
  }

  if (chartData?.length === 0) {
    return null;
  }

  return (
    <div className={classNames("grooming-board-live-chart", {"jira-sidebar-expanded": jiraSidebarExpanded})}>
      <ReactECharts
        option={chartOption}
        style={{ height: '400px' }}
        opts={{ renderer: 'canvas' }}
        notMerge={false}
        lazyUpdate={true}
      />
    </div>
  );
};

export default GroomingBoardLiveChart;
