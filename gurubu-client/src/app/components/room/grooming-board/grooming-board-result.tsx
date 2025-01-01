import React from "react";
import Image from "next/image";
import { useGroomingRoom } from "@/contexts/GroomingRoomContext";

const GroomingBoardResult = () => {
  const { groomingInfo } = useGroomingRoom();

  const isGroomingInfoLoaded = Boolean(Object.keys(groomingInfo).length);
  const isResultVisible = groomingInfo.isResultShown && isGroomingInfoLoaded;

  if (!isResultVisible) {
    return null;
  }

  return (
    <div className="grooming-board__results">
      <Image priority src="/trophy.svg" alt="trophy" width={200} height={200} />
      <p>{groomingInfo.score}</p>
    </div>
  );
};

export default GroomingBoardResult;
