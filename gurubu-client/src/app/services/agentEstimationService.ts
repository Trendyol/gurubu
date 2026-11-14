import axios from "axios";

export type AgentGuideStatus = "unknown" | "ready" | "preparing";

export type AgentEstimateStatus =
  | "loading"
  | "ready"
  | "failed"
  | "preparing";

export interface AgentEstimationResult {
  status: AgentEstimateStatus;
  estimation?: number;
  reasoning?: string[];
}

export interface AgentEstimateRequest {
  projectKey: string;
  issueKey: string;
  summary?: string;
  description?: string;
}

export class AgentEstimationService {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_API_URL || "";
  }

  async prepareSkill(projectKey: string): Promise<AgentGuideStatus> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/agent-estimation/prepare-skill`,
        { projectKey }
      );
      const status = response.data?.status;
      if (status === "ready" || status === "preparing") {
        return status;
      }
      return "preparing";
    } catch {
      return "preparing";
    }
  }

  async estimate(
    payload: AgentEstimateRequest,
    signal?: AbortSignal
  ): Promise<AgentEstimationResult> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/agent-estimation/estimate`,
        payload,
        { signal, timeout: 120000 }
      );

      const data = response.data || {};
      if (data.status === "ready") {
        return {
          status: "ready",
          estimation: data.estimation,
          reasoning: Array.isArray(data.reasoning) ? data.reasoning : [],
        };
      }
      if (data.status === "failed") {
        return { status: "failed" };
      }
      return { status: "preparing" };
    } catch (error) {
      if (axios.isCancel(error)) {
        return { status: "loading" };
      }
      return { status: "failed" };
    }
  }
}

export const agentEstimationService = new AgentEstimationService();
