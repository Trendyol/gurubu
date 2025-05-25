import { useEffect, useState } from "react";
import GroomingBoardParticipant from "./grooming-board-participant";
import GurubuAIParticipant from "./gurubu-ai/gurubu-ai-participant";
import { useGroomingRoom } from "@/contexts/GroomingRoomContext";
import { AnimatePresence } from "framer-motion";
import { GroomingMode } from "@/shared/enums";
import classNames from "classnames";
interface Props {
  roomId: string;
}

const GroomingBoardParticipants = ({roomId}: Props) => {
  const { groomingInfo } = useGroomingRoom();
  const groomingInfoParticipants = Object.keys(groomingInfo.participants || {});
  const [sortedParticipants, setSortedParticipants] = useState<string[]>([]);

  const isStoryPointMode = groomingInfo?.mode === GroomingMode.PlanningPoker;

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
    <>
      <ul className={classNames("grooming-board-participants", { "story-point-mode": isStoryPointMode })}>
        <AnimatePresence>
          <GurubuAIParticipant roomId={roomId} />
          {sortedParticipants.map((participantKey) => (
            <GroomingBoardParticipant
              key={participantKey}
              participantKey={participantKey}
            />
          ))}
        </AnimatePresence>
      </ul>
    </>
  );
};

export default GroomingBoardParticipants;
