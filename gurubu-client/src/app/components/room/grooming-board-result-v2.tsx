import React from "react";
import { useGroomingRoom } from "@/contexts/GroomingRoomContext";
import { GroomingMode } from "@/shared/enums";

const GroomingBoardResultV2 = () => {
  const { groomingInfo } = useGroomingRoom();

  const isGroomingInfoLoaded = Boolean(Object.keys(groomingInfo).length);
  const isResultVisible =
    groomingInfo.isResultShown &&
    isGroomingInfoLoaded &&
    groomingInfo.mode === GroomingMode.PlanningPoker;

  if (!isResultVisible) {
    return null;
  }

  return (
    <div className="grooming-board__resultsv2">
      <p>{groomingInfo.score}</p>
    </div>
  );
};

export default GroomingBoardResultV2;
