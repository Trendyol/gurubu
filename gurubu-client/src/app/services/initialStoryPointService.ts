export interface InitialStoryPointIssue {
  key: string;
  summary: string;
  description: string;
  initialStoryPoint: number | null;
  storyPoint: number | null;
}

export interface InitialStoryPointResponse {
  total: number;
  issues: InitialStoryPointIssue[];
}

export interface ProgressUpdate {
  total: number;
  processed: number;
  currentRange: { start: number; end: number };
  status: 'in_progress' | 'completed' | 'error';
  error?: string;
  newIssues: InitialStoryPointIssue[];
}

export class InitialStoryPointService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }
  streamInitialStoryPoints(
    boardId: string,
    onProgress: (data: ProgressUpdate) => void,
    onComplete: (data: ProgressUpdate) => void,
    onError: (error: string) => void
  ): () => void {
    const url = `${this.baseUrl}/initial-storypoint/board/${boardId}/initial-story-points/stream`;
    const eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
      const data: ProgressUpdate = JSON.parse(event.data);
      
      if (data.status === 'in_progress') {
        onProgress(data);
      } else if (data.status === 'completed') {
        onComplete(data);
        eventSource.close();
      } else if (data.status === 'error') {
        onError(data.error || 'Unknown error');
        eventSource.close();
      }
    };

    eventSource.onerror = () => {
      onError('Connection error');
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }
} 