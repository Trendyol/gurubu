import { BackgroundType } from "@dicebear/core";

export interface Votes {
  [key: string]: string;
}
export interface User {
  userID: number;
  credentials: string;
  nickname: string;
  roomID: string;
  sockets: string[];
  votes: Votes;
  isAdmin: boolean;
  avatar: Avatar;
  profile: pProfile;
  connected?: boolean;
}

export interface Metric {
  text: string;
  id: number;
  name: string;
  displayName: string;
  points: string[];
}

export interface RetroParticipant {
  userID: number;
  nickname: string;
  avatarSeed?: string;
  connected?: boolean;
}

export interface Participants {
  [key: string]: User | RetroParticipant;
}

export interface MetricAverages {
  [key: string]: {
    average: number;
    missingVotes: number;
    total: number;
  };
}

export interface AIWorkflowReasoning {
  complexity: {
    explanation: string;
    level: string;
  };
  effort: {
    explanation: string;
    level: string;
  };
  risk: {
    explanation: string;
    level: string;
  };
}

export interface AIWorkflowResponse {
  executionId: string;
  issueKey: string;
  projectKey: string;
  confidence: string;
  estimation: number;
  historical_comparison: string;
  reasoning: AIWorkflowReasoning;
  split_recommendation: string | null;
  status: string;
}

export interface GurubuAI {
  selectedBoardName: string;
  aiMessage: string;
  selectedIssueIndex: number;
  threadId: string | null;
  isAnalyzing: boolean;
  confidence?: string;
  reasoning?: AIWorkflowReasoning;
  historicalComparison?: string;
  status?: string;
  splitRecommendation?: string | null;
}

export interface RetroCard {
  id: string;
  text: string;
  image: string | null;
  color?: string | null;
  author: string;
  authorId: number;
  createdAt: number;
  stamps?: Array<{emoji: string, x: number, y: number}>;
  mentions?: string[];
  votes?: number[];
  voteCount?: number;
  isAnonymous?: boolean;
  isRevealed?: boolean;
}

export interface RetroCards {
  [key: string]: RetroCard[];
}

export interface RetroMusic {
  isPlaying: boolean;
  url: string | null;
}

export interface RetroInfo {
  title: string;
  owner: number;
  participants: Participants;
  retroCards: RetroCards;
  timer: Timer;
  music: RetroMusic;
  boardImages?: Array<{id: string, src: string, x: number, y: number, width: number, height: number}>;
  columnHeaderImages?: Record<string, string | null>;
  cardGroups?: Record<string, { name: string }>;
  template?: {
    id: string;
    name: string;
    icon: string;
    description: string;
    popular: boolean;
    columns: Array<{
      key: string;
      title: string;
      color: string;
      description: string;
      isMain?: boolean;
    }>;
  };
  status: string;
  cardsRevealed?: boolean;
}

export interface GroomingInfo {
  mode: string;
  participants: Participants;
  gurubuAI: GurubuAI;
  metrics: Metric[];
  score: number;
  metricAverages: MetricAverages;
  status: string;
  isAdmin: boolean;
  isResultShown: boolean;
  issues: Issue[];
  timer: Timer;
}

export interface Avatar {
  seed: string;
  backgroundColor: string[];
  scale: number;
  backgroundType: BackgroundType[] | undefined;
  accessories: any;
  accessoriesProbability: number;
}

export interface Timer {
  timeLeft: number;
  isRunning: boolean;
  startTime: number | null;
}

export interface UserInfo {
  nickname: string;
  lobby: {
    roomID: string;
    credentials: string;
    userID: string;
    createdAt: string;
    expiredAt: string;
    isAdmin: boolean;
  };
}

export interface EncounteredError {
  id: number;
  message: string;
}

export interface UserVote {
  [key: string]: string;
}

export interface Board {
  id: string;
  name: string;
}

export interface Issue {
  id: string;
  key: string;
  url: string;
  fields: any;
  summary: string;
  description: string;
  point: string;
  testPoint: string;
  selected: boolean;
  reporter: {
    displayName: string;
  };
  assigneeForAnalysis: {
    displayName: string;
  };
  epic: {
    color: {
      key: string;
    },
    summary: string;  
    key: string;
    id: string;
    done: boolean;
    name: string;
    self: string;
  }
}

export interface ServiceResponse<T> {
  isSuccess: boolean;
  data?: T;
  error?: string;
}

export interface pProfile {
  department: string;
  description: string;
  displayName: string;
  email: string;
  phone: string;
  picture: string;
  title: string;
  isSelected?: boolean;
}
