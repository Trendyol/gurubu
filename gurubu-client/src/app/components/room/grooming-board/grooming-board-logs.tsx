import React, { useState } from "react";
import GroomingBoardParticipants from "./grooming-board-participants";
import GroomingBoardResultV2 from "./grooming-board-result-v2";
import GroomingBoardActions from "./grooming-board-actions";
import ConsensusBanner from "./consensus-banner";
import classNames from "classnames";
import { useGroomingRoom } from "@/contexts/GroomingRoomContext";
import { MetricToggleTooltip } from "./metricToggleTooltip";
import { GroomingMode } from "@/shared/enums";

interface Props {
  roomId: string;
}

const GroomingBoardLogs = ({ roomId }: Props) => {
  const [hoveredMetric, setHoveredMetric] = useState<number | null>(null);
  const { groomingInfo } = useGroomingRoom();
  const isGroomingInfoLoaded = Boolean(Object.keys(groomingInfo).length);

  const isScoreGrooming = groomingInfo?.mode === GroomingMode.ScoreGrooming;
  const isStoryPointMode = groomingInfo?.mode === GroomingMode.PlanningPoker;

  const toggleTooltipHover = (metricId?: number | null) => {
    setHoveredMetric(metricId ?? null);
  };

  return (
    <section className={classNames("grooming-board__logs-section", {"score-grooming": isScoreGrooming, "story-point-mode": isStoryPointMode})}>
      {isGroomingInfoLoaded && (
        <>
          <ul className="grooming-board__metrics">
            <div className="grooming-board__participants-text">
              <span>Participants ({Object.keys(groomingInfo?.participants || {}).length || "0"})</span>
            </div>
            {groomingInfo.metrics?.map((metric) => (
              <li
                key={metric.id}
                onMouseEnter={() => toggleTooltipHover(metric.id)}
                onMouseLeave={() => toggleTooltipHover(null)}
              >
                {metric.displayName}
                {hoveredMetric === metric.id && (
                  <MetricToggleTooltip text={metric.text} />
                )}
              </li>
            ))}
          </ul>
          <GroomingBoardParticipants roomId={roomId} />
          {groomingInfo.mode === GroomingMode.PlanningPoker && (
            <GroomingBoardResultV2 />
          )}
          <ConsensusBanner />
          {
            groomingInfo.mode === GroomingMode.PlanningPoker && (
              <GroomingBoardActions
                roomId={roomId}
              />
            )}
        </>
      )}
    </section>
  );
};

export default GroomingBoardLogs;
