import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import GurubuAITooltip from "./gurubu-ai-tooltip";
import { motion } from "framer-motion";
import { useGroomingRoom } from "@/contexts/GroomingRoomContext";
import { storyPointService } from "@/services/storyPointService";
import { useSocket } from "@/contexts/SocketContext";

interface Props {
  roomId: string;
}

const GurubuAIParticipant = ({ roomId }: Props) => {
  const socket = useSocket();
  const { groomingInfo, userInfo } = useGroomingRoom();
  const [showTooltip, setShowTooltip] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const participantRef = useRef<HTMLLIElement>(null);
  const isSFWCBoard =
    groomingInfo?.gurubuAI?.selectedBoardName?.includes("SFWC");
  const isGroomingInfoLoaded = Boolean(Object.keys(groomingInfo).length);
  const selectedIssueIndex = groomingInfo.issues?.findIndex(
    (issue) => issue.selected
  );
  const isIssueIndexChanged =
    selectedIssueIndex !== groomingInfo?.gurubuAI?.selectedIssueIndex;
  const selectedBoardName = groomingInfo?.gurubuAI?.selectedBoardName;
  const threadId = groomingInfo?.gurubuAI?.threadId;
  const isAnalyzing = groomingInfo?.gurubuAI?.isAnalyzing;
  const isResultShown = groomingInfo?.isResultShown;
  const aiMessage = groomingInfo?.gurubuAI?.aiMessage;
  const isAdmin = userInfo?.lobby?.isAdmin;
  const credentials = userInfo?.lobby?.credentials;
  const currentIssue = groomingInfo?.issues?.[selectedIssueIndex];

  const generateAIAnalysis = async () => {
    try {
      abortControllerRef.current = new AbortController();

      const response = await storyPointService.estimateStoryPoint(
        {
          boardName: selectedBoardName || "",
          issueSummary: currentIssue?.summary || "",
          issueDescription: currentIssue?.description || "",
          threadId: threadId || undefined,
        },
        abortControllerRef.current.signal
      );

      return { threadId: response.threadId, message: response.response };
    } catch (error: any) {
      if (error.message === "Request was cancelled") {
        return "";
      }
      console.error("Error getting AI analysis:", error);
      return "I encountered an error while analyzing the task. Please try again.";
    }
  };

  useEffect(() => {
    const fetchAIAnalysis = async () => {
      if (isAnalyzing) {
        abortControllerRef.current?.abort();
      }

      if (isGroomingInfoLoaded && isResultShown && isSFWCBoard) {
        socket.emit(
          "setGurubuAI",
          roomId,
          { ...groomingInfo.gurubuAI, isAnalyzing: true },
          credentials
        );
        const analysis = await generateAIAnalysis();
        if (analysis) {
          socket.emit(
            "setGurubuAI",
            roomId,
            {
              ...groomingInfo.gurubuAI,
              aiMessage:
                typeof analysis === "string" ? analysis : analysis.message,
              selectedIssueIndex,
              threadId:
                typeof analysis === "string" ? undefined : analysis.threadId,
              isAnalyzing: false,
            },
            credentials
          );
        } else {
          socket.emit(
            "setGurubuAI",
            roomId,
            { ...groomingInfo.gurubuAI, isAnalyzing: false },
            credentials
          );
        }
      } else {
        setShowTooltip(false);
      }
    };

    if (isAdmin && isIssueIndexChanged) {
      fetchAIAnalysis();
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [isResultShown, isGroomingInfoLoaded, selectedIssueIndex]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (isResultShown && !isAnalyzing) {
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
  }, [aiMessage, isResultShown, isAnalyzing]);

  const handleCloseTooltip = () => {
    setShowTooltip(false);
  };

  if (!selectedBoardName || !isSFWCBoard) {
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
          <Image
            src="https://cdn.dsmcdn.com/web/develop/gurubu-ai.svg"
            alt="GuruBu AI"
            width={32}
            height={32}
          />
        </div>
        <div className="name">GuruBu AI</div>
      </div>
      <div className="score">
        {isResultShown && aiMessage && !isAnalyzing
          ? Number(aiMessage)?.toFixed(0)
          : "Thinking..."}
      </div>
    </motion.li>
  );
};

export default GurubuAIParticipant;
