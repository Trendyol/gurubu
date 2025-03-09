import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import GurubuAITooltip from "./gurubu-ai-tooltip";
import { motion } from "framer-motion";
import { useGroomingRoom } from "@/contexts/GroomingRoomContext";

interface GurubuAIParticipantProps {
  sortedParticipants: string[];
}

const GurubuAIParticipant = ({
  sortedParticipants,
}: GurubuAIParticipantProps) => {
  const { groomingInfo } = useGroomingRoom();
  const [aiMessage, setAiMessage] = useState<string>("");
  const [showTooltip, setShowTooltip] = useState(false);
  const participantRef = useRef<HTMLLIElement>(null);

  const isSFWCBoard = groomingInfo?.selectedBoard?.includes("SFWC");
  const isGroomingInfoLoaded = Boolean(Object.keys(groomingInfo).length);

  const getAllParticipantsVotes = () => {
    const allParticipantsVotes: { storyPoint: string; nickname: string }[] = [];
    sortedParticipants?.forEach((participantKey) => {
      const participant = groomingInfo?.participants[participantKey];
      allParticipantsVotes.push({
        storyPoint: participant?.votes?.["storyPoint"],
        nickname: participant?.nickname,
      });
    });
    return allParticipantsVotes;
  };

  const generateAIAnalysis = (
    votes: { storyPoint: string; nickname: string }[]
  ) => {
    const validVotes = votes.filter(
      (vote) =>
        vote.storyPoint &&
        vote.storyPoint !== "?" &&
        vote.storyPoint !== "break"
    );
    if (validVotes.length === 0) return "";

    return `Based on the analysis of the tasks we previously scored, I believe the score for this task should be ${Number(
      groomingInfo?.score
    )?.toFixed(
      0
    )}. The acceptance criteria are as follows. Our team is experienced in this area, and my suggestion is as follows.`;
  };

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (isGroomingInfoLoaded && groomingInfo?.isResultShown && isSFWCBoard) {
      // example result of allParticipantsVotes: { storyPoint: "1", nickname: "John Doe" }
      const allParticipantsVotes = getAllParticipantsVotes();
      const analysis = generateAIAnalysis(allParticipantsVotes);
      setAiMessage(analysis);

      // Delay showing the tooltip to ensure proper positioning
      timeoutId = setTimeout(() => {
        setShowTooltip(true);
      }, 300);
    } else {
      setShowTooltip(false);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };

    // add sortedParticipants dependency if you want to trigger the tooltip when the votes change
  }, [groomingInfo.isResultShown, isGroomingInfoLoaded]);

  const handleCloseTooltip = () => {
    setShowTooltip(false);
  };

  if (!groomingInfo.selectedBoard || !isSFWCBoard) {
    return null;
  }

  return (
    <motion.li
      ref={participantRef}
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      key="gurubu-ai-participant"
      className="gurubu-ai-participant"
    >
      <GurubuAITooltip
        message={aiMessage}
        isVisible={showTooltip}
        anchorRef={participantRef}
        onClose={handleCloseTooltip}
      />
      <div className="profile-container">
        <div className="avatar">
          <Image src="https://cdn.dsmcdn.com/web/develop/gurubu-ai.svg" alt="GuruBu AI" width={32} height={32} />
        </div>
        <div className="name">GuruBu AI</div>
      </div>
      <div className="score">
        {groomingInfo.isResultShown
          ? Number(groomingInfo?.score)?.toFixed(0)
          : "Thinking..."}
      </div>
    </motion.li>
  );
};

export default GurubuAIParticipant;
