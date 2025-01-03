import classNames from "classnames";
import { IconCheck } from "@tabler/icons-react";
import { useGroomingRoom } from "@/contexts/GroomingRoomContext";
import Image from "next/image";
import { GroomingMode, PARTICIPANT_VOTES_COUNT } from "@/shared/enums";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const GroomingBoardParticipants = () => {
  const { groomingInfo } = useGroomingRoom();
  const groomingInfoParticipants = Object.keys(groomingInfo.participants || {});
  const [sortedParticipants, setSortedParticipants] = useState<string[]>([]);

  useEffect(() => {
    if (groomingInfo.isResultShown) {
      const sorted = [...groomingInfoParticipants].sort((a, b) => {
        const votesA = groomingInfo.participants[a].votes || {};
        const votesB = groomingInfo.participants[b].votes || {};
        const storyPointA = isNaN(Number(votesA["storyPoint"])) ? 0 : Number(votesA["storyPoint"]);
        const storyPointB = isNaN(Number(votesB["storyPoint"])) ? 0 : Number(votesB["storyPoint"]);
        return storyPointB - storyPointA
      });
      setSortedParticipants([...sorted]);
    } else {
      setSortedParticipants([...groomingInfoParticipants]);
    }
  }, [groomingInfo]);

  return (
    <ul className="grooming-board-participants">
      <AnimatePresence>
        {sortedParticipants.map(participantKey => {
          const participant = groomingInfo.participants[participantKey];
          if(!participant){
            return null;
          }
          const { isAdmin, sockets, votes = {}, nickname } = participant;
          const hasSockets = sockets.length > 0;
          const hasMaxVotes =
            Object.keys(votes || {}).length ===
            PARTICIPANT_VOTES_COUNT.MAX_VOTE;
          const isResultShown = groomingInfo.isResultShown;
          const isPlanningPokerMode =
            groomingInfo.mode === GroomingMode.PlanningPoker;

          const vote = !isNaN(Number(votes["storyPoint"])) ? Number(votes["storyPoint"]) : 0
          const isVoteBelowAverage = vote < Number(groomingInfo.score) && isResultShown;
          const isVoteAboveAverage = vote > Number(groomingInfo.score) && isResultShown;
          const onAverage = !isVoteAboveAverage && !isVoteBelowAverage && vote === Number(groomingInfo.score) && isResultShown;
          const noVote = isResultShown && vote === 0; 

          return (
            <motion.li
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              key={participantKey}
              className={classNames({
                "vote-above-average": isVoteAboveAverage,
                "vote-below-average": isVoteBelowAverage,
                "no-vote": noVote,
                "on-average": onAverage
              })}
            >
              <div className="grooming-board-participants__nickname-container">
                {isAdmin && (
                  <Image
                    src="/admin.svg"
                    width={16}
                    height={16}
                    alt="Admin Logo"
                    priority
                  />
                )}
                {!hasSockets && (
                  <Image
                    src="/wifi-off.svg"
                    width={14.26}
                    height={12}
                    alt="Wifi Off Logo"
                    priority
                  />
                )}
                {hasSockets && !isAdmin && !isPlanningPokerMode && (
                  <div
                    className={classNames(
                      "grooming-board-participants__point-card",
                      {
                        "grooming-board-participants__all-metrics-voted":
                          hasMaxVotes,
                      }
                    )}
                  >
                    {hasMaxVotes && (
                      <div className="grooming-board-participants__check-icon-container">
                        <IconCheck width={13} color="white" />
                      </div>
                    )}
                  </div>
                )}

                <label
                  className={classNames(
                    "grooming-board-participants__nickname",
                    {
                      "connection-lost": !hasSockets,
                      "additional-space":
                        hasSockets && isPlanningPokerMode && !isAdmin,
                    }
                  )}
                >
                  {nickname}
                </label>
              </div>

              <div className="grooming-board-participants__point-cards-container">
                {groomingInfo.metrics.map((metric) => {
                  const participantVote = votes && votes[metric.name];
                  const hasParticipantVoted = !!participantVote;

                  return (
                    <div key={metric.id}>
                      <div
                        className={classNames(
                          "grooming-board-participants__point-card",
                          {
                            "grooming-board-participants__metric-voted":
                              hasParticipantVoted,
                            show: isResultShown,
                          }
                        )}
                      >
                        {!isResultShown && (
                          <div className="grooming-board-participants__check-icon-container">
                            <IconCheck width={16} color="white" />
                          </div>
                        )}
                      </div>
                      {isResultShown && <p>{participantVote}</p>}
                    </div>
                  );
                })}
              </div>
            </motion.li>
          );
        })}
      </AnimatePresence>
    </ul>
  );
};

export default GroomingBoardParticipants;
