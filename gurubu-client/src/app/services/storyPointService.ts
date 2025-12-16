import axios from 'axios';

interface AIWorkflowRequest {
  issueKey: string;
  projectKey: string;
}

interface AIWorkflowEstimationResponse {
  executionId: string;
  issueKey: string;
  projectKey: string;
  confidence: string;
  estimation: number;
  historical_comparison: string;
  reasoning: {
    complexity: { explanation: string; level: string };
    effort: { explanation: string; level: string };
    risk: { explanation: string; level: string };
  };
  split_recommendation: string | null;
  status: string;
}

export class StoryPointService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  }

  async estimateStoryPoint(
    request: AIWorkflowRequest,
    signal?: AbortSignal
  ): Promise<AIWorkflowEstimationResponse> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/ai-workflow/estimate`, 
        request, 
        { signal }
      );
      return response.data;
    } catch (error) {
      if (axios.isCancel(error)) {
        throw new Error('Request was cancelled');
      }
      console.error('Error estimating story point:', error);
      throw error;
    }
  }
}

export const storyPointService = new StoryPointService(); 