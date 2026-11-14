import { useEffect, useMemo, useRef, useState } from "react";
import {
  IconSparkles,
  IconSettings,
  IconLoader2,
} from "@tabler/icons-react";
import { useGroomingRoom } from "@/contexts/GroomingRoomContext";
import { isAgentEstimationActive } from "@/shared/featureFlags";
import {
  agentEstimationService,
  AgentEstimateStatus,
} from "@/services/agentEstimationService";
import { GroomingMode } from "@/shared/enums";

type Props = {
  roomId: string;
};

type EstimateState = {
  status: AgentEstimateStatus;
  estimation?: number;
  reasoning?: string[];
};

const AgentEstimateCard = (_props: Props) => {
  const { groomingInfo, agentGuideStatus, userInfo } = useGroomingRoom();
  const [estimateState, setEstimateState] = useState<EstimateState | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const selectedIssue = useMemo(() => {
    return groomingInfo.issues?.find((issue) => issue.selected) || null;
  }, [groomingInfo.issues]);

  const projectKey = (
    groomingInfo.gurubuAI?.projectName ||
    groomingInfo.gurubuAI?.selectedBoardName ||
    ""
  )
    .trim()
    .toUpperCase();

  const isPlanningPoker = groomingInfo.mode === GroomingMode.PlanningPoker;
  const agentEstimationActive = isAgentEstimationActive(userInfo?.nickname);
  const resultsShown = Boolean(groomingInfo.isResultShown);
  const canEstimate =
    agentEstimationActive && isPlanningPoker && !!selectedIssue && !!projectKey;

  useEffect(() => {
    if (!canEstimate || !selectedIssue) {
      setEstimateState(null);
      return;
    }

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setEstimateState({ status: "loading" });

    const run = async () => {
      const result = await agentEstimationService.estimate(
        {
          projectKey,
          issueKey: selectedIssue.key,
          summary: selectedIssue.summary,
          description: selectedIssue.description,
        },
        controller.signal
      );

      if (controller.signal.aborted) {
        return;
      }

      if (result.status === "loading") {
        return;
      }

      setEstimateState(result);
    };

    void run();

    return () => {
      controller.abort();
    };
  }, [
    canEstimate,
    projectKey,
    selectedIssue?.key,
    selectedIssue?.summary,
    selectedIssue?.description,
  ]);

  if (!agentEstimationActive || !isPlanningPoker || !resultsShown || !canEstimate) {
    return null;
  }

  const showReady =
    estimateState?.status === "ready" &&
    typeof estimateState.estimation === "number";
  const showGuidePending =
    !showReady &&
    (agentGuideStatus === "preparing" ||
      estimateState?.status === "preparing");
  const showFailed = !showReady && !showGuidePending && estimateState?.status === "failed";

  return (
    <div className="agent-estimate-card">
      <div className="agent-estimate-card__header">
        <IconSparkles size={18} className="agent-estimate-card__sparkle" />
        <h4 className="agent-estimate-card__title">AI Estimate</h4>
      </div>

      <div className="agent-estimate-card__body">
        {showReady ? (
          <>
            <span className="agent-estimate-card__label">
              Suggested Story Point
            </span>
            <div className="agent-estimate-card__value">
              {estimateState.estimation} SP
            </div>

            {estimateState.reasoning && estimateState.reasoning.length > 0 && (
              <>
                <div className="agent-estimate-card__divider" />
                <ul className="agent-estimate-card__reasoning">
                  {estimateState.reasoning.map((text) => (
                    <li
                      key={text}
                      className="agent-estimate-card__reasoning-item"
                    >
                      <span className="agent-estimate-card__reasoning-icon">
                        <IconSettings size={16} stroke={1.75} />
                      </span>
                      <span className="agent-estimate-card__reasoning-text">
                        {text}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </>
        ) : showGuidePending ? (
          <p className="agent-estimate-card__message">
            Puanlama rehberi oluştuğunda kullanılabilecek.
          </p>
        ) : showFailed ? (
          <p className="agent-estimate-card__message agent-estimate-card__message--error">
            Tahmin alınamadı
          </p>
        ) : (
          <div className="agent-estimate-card__preparing">
            <IconLoader2
              size={18}
              className="agent-estimate-card__preparing-spinner"
            />
            <span className="agent-estimate-card__preparing-text">
              AI Suggestion Preparing
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentEstimateCard;
