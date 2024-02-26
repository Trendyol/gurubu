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
}

export interface Metric {
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

export interface GroomingInfo {
  totalParticipants: number;
  mode: string;
  participants: Participants;
  metrics: Metric[];
  score: number;
  metricAverages: MetricAverages;
  status: string;
  isAdmin: boolean;
  isResultShown: boolean;
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
