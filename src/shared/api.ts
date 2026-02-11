export type InitResponse = {
  type: 'init';
  postId: string;
  username: string;
  dailySeed: string;
  completedQuests: string[];
  leaderboard: { username: string; score: number }[];
  streak: number;
  nextQuestIn: number; // Seconds until UTC midnight
};

export type SubmitScoreRequest = {
  questId: string;
  score: number;
};

export type SubmitScoreResponse = {
  status: 'success' | 'error';
  message?: string;
};

export type LeaderboardEntry = {
  username: string;
  score: number;
};
