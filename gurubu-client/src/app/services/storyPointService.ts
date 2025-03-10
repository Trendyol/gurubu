import axios from 'axios';

interface StoryPointEstimationRequest {
  boardName: string;
  issueSummary: string;
  issueDescription: string;
  threadId?: string;
}

interface StoryPointEstimationResponse {
  response: string;
  threadId: string;
}

export class StoryPointService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  }

  async estimateStoryPoint(
    request: StoryPointEstimationRequest,
    signal?: AbortSignal
  ): Promise<StoryPointEstimationResponse> {
    try {
      const response = await axios.post(`${this.baseUrl}/storypoint/estimate`, request, {
        signal
      });
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