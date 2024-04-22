import classNames from "classnames";
import { IconCheck } from "@tabler/icons-react";
import { useGroomingRoom } from "@/contexts/GroomingRoomContext";
import Image from "next/image";
import { GroomingMode, PARTICIPANT_VOTES_COUNT } from "@/shared/enums";

const GroomingBoardParticipants = () => {
  const { groomingInfo } = useGroomingRoom();
  const groomingInfoParticipants = Object.keys(groomingInfo.participants || {});

  return (
    <ul className="grooming-board-participants">
      {groomingInfoParticipants.map((participantKey) => {
        const { isAdmin, sockets, votes, nickname } = groomingInfo.participants[participantKey];
        const hasSockets = sockets.length > 0;
        const hasMaxVotes = Object.keys(votes || {}).length === PARTICIPANT_VOTES_COUNT.MAX_VOTE;
        const isResultShown = groomingInfo.isResultShown;
        const isPlanningPokerMode = groomingInfo.mode === GroomingMode.PlanningPoker;

        return (
          <li key={participantKey}>
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
                className={classNames("grooming-board-participants__nickname", {
                  "connection-lost": !hasSockets,
                  "additional-space": hasSockets && isPlanningPokerMode && !isAdmin
                })}
              >
                {nickname}
              </label>
            </div>

            <div className="grooming-board-participants__point-cards-container">
              {groomingInfo.metrics.map((metric) => {
                const participantVote =
                  votes && votes[metric.name];
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
          </li>
        );
      })}
    </ul>
  );
};

export default GroomingBoardParticipants;
