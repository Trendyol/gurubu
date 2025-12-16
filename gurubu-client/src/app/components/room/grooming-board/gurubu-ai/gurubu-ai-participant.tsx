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
  const isGroomingInfoLoaded = Boolean(Object.keys(groomingInfo).length);
  const selectedIssueIndex = groomingInfo.issues?.findIndex(
    (issue) => issue.selected
  );
  const isIssueIndexChanged =
    selectedIssueIndex !== groomingInfo?.gurubuAI?.selectedIssueIndex;
  const selectedBoardName = groomingInfo?.gurubuAI?.selectedBoardName;
  const isAnalyzing = groomingInfo?.gurubuAI?.isAnalyzing;
  const isResultShown = groomingInfo?.isResultShown;
  const aiMessage = groomingInfo?.gurubuAI?.aiMessage;
  const isAdmin = userInfo?.lobby?.isAdmin;
  const credentials = userInfo?.lobby?.credentials;
  const currentIssue = groomingInfo?.issues?.[selectedIssueIndex];

  const generateAIAnalysis = async () => {
    try {
      if(!groomingInfo.issues.length) {
        return;
      }
      abortControllerRef.current = new AbortController();
      
      const issueKey = currentIssue?.key;
      const projectKey = issueKey?.split('-')[0];
      
      if (!issueKey || !projectKey) {
        throw new Error('Issue key or project key not found');
      }

      const response = await storyPointService.estimateStoryPoint(
        { issueKey, projectKey },
        abortControllerRef.current.signal
      );

      return response;
    } catch (error: any) {
      if (error.message === 'Request was cancelled') {
        return null;
      }
      console.error('Error getting AI analysis:', error);
      return null;
    }
  };

  useEffect(() => {
    const fetchAIAnalysis = async () => {
      if (isAnalyzing) {
        abortControllerRef.current?.abort();
      }

      if (isGroomingInfoLoaded && isResultShown) {
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
              aiMessage: analysis.estimation.toString(),
              confidence: analysis.confidence,
              reasoning: analysis.reasoning,
              historicalComparison: analysis.historical_comparison,
              status: analysis.status,
              splitRecommendation: analysis.split_recommendation,
              selectedIssueIndex,
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

  const handleCloseTooltip = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setShowTooltip(false);
  };

  const handleParticipantClick = () => {
    if (isResultShown && aiMessage && !isAnalyzing) {
      setShowTooltip(true);
    }
  };

  if (!selectedBoardName) {
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
      onClick={handleParticipantClick}
    >
      <GurubuAITooltip
        estimation={aiMessage}
        confidence={groomingInfo?.gurubuAI?.confidence}
        reasoning={groomingInfo?.gurubuAI?.reasoning}
        historicalComparison={groomingInfo?.gurubuAI?.historicalComparison}
        status={groomingInfo?.gurubuAI?.status}
        splitRecommendation={groomingInfo?.gurubuAI?.splitRecommendation}
        isVisible={showTooltip}
        anchorRef={participantRef as React.RefObject<HTMLElement>}
        onClose={handleCloseTooltip}
      />
      <div className="profile-container">
        <div className="avatar">
          <Image
            src="https://cdn.dsmcdn.com/web/production/armagan-ai.jpg"
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
