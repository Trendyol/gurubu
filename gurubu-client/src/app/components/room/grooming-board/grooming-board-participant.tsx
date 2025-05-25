import React, { useMemo } from "react";
import Avatar from "@/components/common/avatar";
import classNames from "classnames";
import { useAvatar } from "@/contexts/AvatarContext";
import { useGroomingRoom } from "@/contexts/GroomingRoomContext";
import { GroomingMode, PARTICIPANT_VOTES_COUNT } from "@/shared/enums";
import { IconCheck, IconCoffee } from "@tabler/icons-react";
import { motion } from "framer-motion";
import Image from "next/image";

interface Props {
  participantKey: string;
}

const GroomingBoardParticipant = ({ participantKey }: Props) => {
  const { groomingInfo } = useGroomingRoom();
  const { createAvatarSvg } = useAvatar();

  const participant = groomingInfo.participants[participantKey];
  const serializedAvatar = JSON.stringify(participant?.avatar);
  const avatarSvg = useMemo(
    () => createAvatarSvg(participant?.avatar),
    [createAvatarSvg, serializedAvatar]
  );

  if (!participant) {
    return null;
  }
  const { isAdmin, sockets, votes = {}, nickname } = participant;
  const hasSockets = sockets.length > 0;
  const hasMaxVotes =
    Object.keys(votes || {}).length === PARTICIPANT_VOTES_COUNT.MAX_VOTE;
  const isResultShown = groomingInfo.isResultShown;
  const isPlanningPokerMode = groomingInfo.mode === GroomingMode.PlanningPoker;

  const vote = !isNaN(Number(votes["storyPoint"]))
    ? Number(votes["storyPoint"])
    : 0;
  const isVoteBelowAverage = vote < Number(groomingInfo.score) && isResultShown;
  const isVoteAboveAverage = vote > Number(groomingInfo.score) && isResultShown;
  const onAverage =
    !isVoteAboveAverage &&
    !isVoteBelowAverage &&
    vote === Number(groomingInfo.score) &&
    isResultShown;
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
        "on-average": onAverage,
      })}
    >
      <div
        className={classNames(
          "grooming-board-participants__nickname-container",
          { "planning-poker-mode": isPlanningPokerMode }
        )}
      >
        {hasSockets && !isAdmin && !isPlanningPokerMode && (
          <div
            className={classNames("grooming-board-participants__point-card", {
              "grooming-board-participants__all-metrics-voted": hasMaxVotes,
            })}
          >
            {hasMaxVotes && (
              <div className="grooming-board-participants__check-icon-container">
                <IconCheck width={13} color="white" />
              </div>
            )}
          </div>
        )}
        <div
          className={classNames({
            "admin-avatar": isAdmin,
            "disconnected-avatar": !hasSockets,
            "profile-picture": participant?.profile?.picture,
          })}
        >
          {participant?.profile?.picture && participant?.profile?.isSelected ? (
            <Image
              src={participant?.profile?.picture}
              alt="Avatar"
              width={32}
              height={32}
            />
          ) : (
            <Avatar svg={avatarSvg} />
          )}
        </div>
        <label
          className={classNames("grooming-board-participants__nickname", {
            "connection-lost": !hasSockets
          })}
        >
          {participant?.profile?.displayName && participant?.profile?.isSelected ? participant?.profile?.displayName : nickname}
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
              {isResultShown && <p>{participantVote === "break" ? <IconCoffee /> : participantVote}</p>}
            </div>
          );
        })}
      </div>
    </motion.li>
  );
};

export default GroomingBoardParticipant;
