import GroomingBoardParticipant from "./grooming-board-participant";
import { useGroomingRoom } from "@/contexts/GroomingRoomContext";
import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";

const GroomingBoardParticipants = () => {
  const { groomingInfo } = useGroomingRoom();
  const groomingInfoParticipants = Object.keys(groomingInfo.participants || {});
  const [sortedParticipants, setSortedParticipants] = useState<string[]>([]);

  useEffect(() => {
    if (groomingInfo.isResultShown) {
      const sorted = [...groomingInfoParticipants].sort((a, b) => {
        const votesA = groomingInfo.participants[a].votes || {};
        const votesB = groomingInfo.participants[b].votes || {};
        const storyPointA = isNaN(Number(votesA["storyPoint"]))
          ? 0
          : Number(votesA["storyPoint"]);
        const storyPointB = isNaN(Number(votesB["storyPoint"]))
          ? 0
          : Number(votesB["storyPoint"]);
        return storyPointB - storyPointA;
      });
      setSortedParticipants([...sorted]);
    } else {
      setSortedParticipants([...groomingInfoParticipants]);
    }
  }, [groomingInfo]);

  return (
    <ul className="grooming-board-participants">
      <AnimatePresence>
        {sortedParticipants.map((participantKey) => (
          <GroomingBoardParticipant
            key={participantKey}
            participantKey={participantKey}
          />
        ))}
      </AnimatePresence>
    </ul>
  );
};

export default GroomingBoardParticipants;
