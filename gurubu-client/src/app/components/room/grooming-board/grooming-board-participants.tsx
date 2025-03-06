import GroomingBoardParticipant from "./grooming-board-participant";
import { useGroomingRoom } from "@/contexts/GroomingRoomContext";
import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";

const GroomingBoardParticipants = () => {
  const { groomingInfo } = useGroomingRoom();
  const groomingInfoParticipants = Object.keys({
    "0": {
      "userID": 0,
      "nickname": "Armagan",
      "roomID": "e44fabf2-fe3f-4115-885e-117d7d6355bf",
      "sockets": [
        "ZvbLDqyZZdoZ47lqAAAH"
      ],
      "isAdmin": true,
      "connected": true,
      "avatar": {
        "seed": "xie3wsmnu9",
        "scale": 150
      },
      "votes": {
        "storyPoint": "2"
      }
    },
    "1": {
      "userID": 1,
      "nickname": "HelloFigma",
      "roomID": "e44fabf2-fe3f-4115-885e-117d7d6355bf",
      "sockets": [
        "NcA0GdSQRLhyWPbKAAAF"
      ],
      "isAdmin": false,
      "connected": true,
      "avatar": {
        "seed": "yzrl7syjjdc"
      },
      "votes": {
        "storyPoint": "3"
      }
    }
  },);
  const [sortedParticipants, setSortedParticipants] = useState<string[]>(["1","0"]);

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

  console.log(sortedParticipants)

  return (
    <>
      <ul className="grooming-board-participants">
        {/* <AnimatePresence> */}
          {sortedParticipants.map((participantKey) => (
            <GroomingBoardParticipant
              key={participantKey}
              participantKey={participantKey}
            />
          ))}
        {/* </AnimatePresence> */}
      </ul>
    </>
  );
};

export default GroomingBoardParticipants;
