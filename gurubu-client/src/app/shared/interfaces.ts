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
}

export interface Metric {
  text: string;
  id: number;
  name: string;
  displayName: string;
  points: string[];
}

export interface Participants {
  [key: string]: User;
}

export interface MetricAverages {
  [key: string]: {
    average: number;
    missingVotes: number;
    total: number;
  };
}

export interface GurubuAI {
  selectedBoardName: string;
  aiMessage: string;
  selectedIssueIndex: number;
  threadId: string | null;
  isAnalyzing: boolean;
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
  startTime: number;
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
