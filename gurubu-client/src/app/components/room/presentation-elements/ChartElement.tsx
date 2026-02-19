"use client";

import { useState, useRef, useEffect } from "react";
import { PresentationElement } from "@/shared/interfaces";
import { usePresentationRoom } from "@/contexts/PresentationRoomContext";
import { usePresentationSocket } from "@/contexts/PresentationSocketContext";
import ResizeHandles from "../presentation-board/resize-handles";
import { snapToGrid } from "@/utils/gridUtils";
import { IconChartBar, IconChartLine, IconChartPie, IconChartArea } from "@tabler/icons-react";
import ReactECharts from 'echarts-for-react';

interface ChartElementProps {
  element: PresentationElement;
  isEditing?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
  onUpdate?: (updates: any) => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  onEditData?: () => void;
  zIndex?: number;
  pageId: string;
  presentationId?: string;
}

const ChartElement = ({ element, isEditing = false, isSelected = false, onSelect, onUpdate, onContextMenu, onEditData, zIndex, pageId, presentationId }: ChartElementProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const elementRef = useRef<HTMLDivElement>(null);
  const { presentationInfo, userInfo } = usePresentationRoom();
  const socket = usePresentationSocket();
  const chartType = element.style?.chartType || 'bar';
  const chartData = element.style?.chartData || { labels: ['A', 'B', 'C'], values: [10, 20, 30] };

  const getChartOption = () => {
    const { labels, values } = chartData;
    const colors = ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#fee140', '#30cfd0'];

    const baseOption = {
      grid: {
        left: '10%',
        right: '10%',
        top: '15%',
        bottom: '15%',
        containLabel: true,
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: '#667eea',
        borderWidth: 1,
        textStyle: { color: '#fff' },
      },
      color: colors,
    };

    if (chartType === 'bar') {
      return {
        ...baseOption,
        xAxis: {
          type: 'category',
          data: labels,
          axisLine: { lineStyle: { color: '#e0e0e0' } },
          axisLabel: { color: '#666' },
        },
        yAxis: {
          type: 'value',
          axisLine: { lineStyle: { color: '#e0e0e0' } },
          axisLabel: { color: '#666' },
          splitLine: { lineStyle: { color: '#f0f0f0' } },
        },
        series: [{
          type: 'bar',
          data: values,
          itemStyle: {
            borderRadius: [4, 4, 0, 0],
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(102, 126, 234, 0.5)',
            },
          },
        }],
      };
    } else if (chartType === 'line') {
      return {
        ...baseOption,
        xAxis: {
          type: 'category',
          data: labels,
          axisLine: { lineStyle: { color: '#e0e0e0' } },
          axisLabel: { color: '#666' },
        },
        yAxis: {
          type: 'value',
          axisLine: { lineStyle: { color: '#e0e0e0' } },
          axisLabel: { color: '#666' },
          splitLine: { lineStyle: { color: '#f0f0f0' } },
        },
        series: [{
          type: 'line',
          data: values,
          smooth: true,
          lineStyle: { width: 3 },
          symbol: 'circle',
          symbolSize: 8,
          itemStyle: { borderWidth: 2, borderColor: '#fff' },
          areaStyle: {
            opacity: 0.3,
          },
        }],
      };
    } else if (chartType === 'pie') {
      return {
        ...baseOption,
        tooltip: {
          trigger: 'item',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          borderColor: '#667eea',
          borderWidth: 1,
          textStyle: { color: '#fff' },
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          textStyle: { color: '#666' },
        },
        series: [{
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 8,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: true,
            formatter: '{b}: {c} ({d}%)',
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 'bold',
            },
          },
          data: labels.map((label: string, i: number) => ({
            value: values[i],
            name: label,
          })),
        }],
      };
    } else if (chartType === 'area') {
      return {
        ...baseOption,
        xAxis: {
          type: 'category',
          data: labels,
          axisLine: { lineStyle: { color: '#e0e0e0' } },
          axisLabel: { color: '#666' },
        },
        yAxis: {
          type: 'value',
          axisLine: { lineStyle: { color: '#e0e0e0' } },
          axisLabel: { color: '#666' },
          splitLine: { lineStyle: { color: '#f0f0f0' } },
        },
        series: [{
          type: 'line',
          data: values,
          smooth: true,
          lineStyle: { width: 3 },
          symbol: 'circle',
          symbolSize: 8,
          itemStyle: { borderWidth: 2, borderColor: '#fff' },
          areaStyle: {
            opacity: 0.4,
          },
        }],
      };
    }
    return baseOption;
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!isEditing) return;
    onSelect?.();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isEditing) return;
    e.stopPropagation();
    setIsMouseDown(true);
    setDragStartPos({ x: e.clientX, y: e.clientY });
    const rect = elementRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  useEffect(() => {
    if (!isMouseDown) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isEditing || !elementRef.current) return;
      const deltaX = Math.abs(e.clientX - dragStartPos.x);
      const deltaY = Math.abs(e.clientY - dragStartPos.y);
      
      if (deltaX > 5 || deltaY > 5) {
        setIsDragging(true);
      }

      if (isDragging && onUpdate) {
        const pageElement = elementRef.current?.closest('.presentation-page');
        if (!pageElement) return;
        const pageRect = pageElement.getBoundingClientRect();
        const rawX = e.clientX - pageRect.left - dragOffset.x;
        const rawY = e.clientY - pageRect.top - dragOffset.y;
        const snappedX = snapToGrid(rawX);
        const snappedY = snapToGrid(rawY);
        // Constrain to page bounds with padding to prevent overlap
        const padding = 10;
        const constrainedX = Math.max(padding, Math.min(snappedX, pageRect.width - element.size.width - padding));
        const constrainedY = Math.max(padding, Math.min(snappedY, pageRect.height - element.size.height - padding));
        onUpdate({ position: { x: constrainedX, y: constrainedY } });
      }
    };

    const handleMouseUp = () => {
      setIsMouseDown(false);
      setTimeout(() => setIsDragging(false), 0);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isMouseDown, isDragging, dragOffset, dragStartPos, isEditing, onUpdate]);

  const handleResize = (newSize: { width: number; height: number }, newPosition?: { x: number; y: number }) => {
    const updates: any = { 
      size: {
        width: snapToGrid(newSize.width),
        height: snapToGrid(newSize.height),
      }
    };
    if (newPosition) {
      updates.position = {
        x: snapToGrid(newPosition.x),
        y: snapToGrid(newPosition.y),
      };
    }
    onUpdate?.(updates);
  };

  const handleChartTypeChange = (newType: string) => {
    if (userInfo.lobby && presentationId) {
      socket.emit("updateElement",
        presentationId,
        pageId,
        element.id,
        { style: { ...element.style, chartType: newType } },
        userInfo.lobby.credentials
      );
    }
  };

  if (isEditing) {
    return (
      <div
        ref={elementRef}
        className={`chart-element ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''}`}
        style={{
          position: 'absolute',
          left: `${element.position.x}px`,
          top: `${element.position.y}px`,
          width: `${element.size.width}px`,
          height: `${element.size.height}px`,
          cursor: isDragging ? 'grabbing' : 'default',
          zIndex: zIndex !== undefined ? zIndex : 'auto',
        }}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onContextMenu={onContextMenu}
      >
        <div className="chart-element__header">
          <div className="chart-element__type-selector">
            <button
              className={chartType === 'bar' ? 'active' : ''}
              onClick={(e) => {
                e.stopPropagation();
                handleChartTypeChange('bar');
              }}
              title="Bar Chart"
            >
              <IconChartBar size={16} />
            </button>
            <button
              className={chartType === 'line' ? 'active' : ''}
              onClick={(e) => {
                e.stopPropagation();
                handleChartTypeChange('line');
              }}
              title="Line Chart"
            >
              <IconChartLine size={16} />
            </button>
            <button
              className={chartType === 'pie' ? 'active' : ''}
              onClick={(e) => {
                e.stopPropagation();
                handleChartTypeChange('pie');
              }}
              title="Pie Chart"
            >
              <IconChartPie size={16} />
            </button>
            <button
              className={chartType === 'area' ? 'active' : ''}
              onClick={(e) => {
                e.stopPropagation();
                handleChartTypeChange('area');
              }}
              title="Area Chart"
            >
              <IconChartArea size={16} />
            </button>
          </div>
          {isSelected && onEditData && (
            <button
              className="chart-element__edit-data-btn"
              onClick={(e) => {
                e.stopPropagation();
                onEditData();
              }}
              title="Edit Data"
            >
              Edit Data
            </button>
          )}
        </div>
        <div className="chart-element__chart-wrapper">
          <ReactECharts
            option={getChartOption()}
            style={{ width: '100%', height: '100%' }}
            opts={{ renderer: 'svg' }}
          />
        </div>
        {isSelected && (
          <ResizeHandles
            elementRef={elementRef}
            currentSize={element.size}
            currentPosition={element.position}
            onResize={handleResize}
          />
        )}
      </div>
    );
  }

  return (
    <div
      ref={elementRef}
      className="chart-element"
      style={{
        position: 'absolute',
        left: `${element.position.x}px`,
        top: `${element.position.y}px`,
        width: `${element.size.width}px`,
        height: `${element.size.height}px`,
        zIndex: zIndex !== undefined ? zIndex : 'auto',
      }}
    >
      <div className="chart-element__chart-wrapper">
        <ReactECharts
          option={getChartOption()}
          style={{ width: '100%', height: '100%' }}
          opts={{ renderer: 'svg' }}
        />
      </div>
    </div>
  );
};

export default ChartElement;
