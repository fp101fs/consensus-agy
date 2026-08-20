export interface LLMConfig {
  id: string;
  name: string;
  provider: string;
  tag: string;
  color: string;
  badgeBg: string;
  borderColor: string;
  promptPrice?: number;
  completionPrice?: number;
}

export interface ModelOutput {
  modelId: string;
  modelName: string;
  provider: string;
  response: string;
  status: 'idle' | 'loading' | 'completed' | 'error' | 'cancelled';
  latencyMs?: number;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  costUsd?: number;
  tokensPerSec?: number;
  error?: string;
}

export interface ModelEvaluation {
  modelId: string;
  modelName: string;
  accuracyScore: number; // 0-100
  completenessScore: number; // 0-100
  reasoningScore: number; // 0-100
  overallScore: number; // 0-100
  strengths: string[];
  weaknesses: string[];
  hallucinationsOrErrors?: string[];
  distinctiveAngle?: string;
  metaCognition?: {
    claimedConfidence?: number; // 0-100 reported by model
    confidenceAppropriateness?: 'Well-Calibrated' | 'Overconfident' | 'Underconfident' | 'Unspecified';
    uniquenessRecognition?: 'Correctly Identified Unique' | 'Correctly Identified Non-Unique' | 'Correctly Identified Impossible' | 'Falsely Claimed Unique' | 'Falsely Claimed Multiple';
    epistemicVerdict?: string;
  };
}

export interface CitedReference {
  title: string;
  url?: string;
  snippet: string;
  verifiedFact: string;
}

export interface ConsensusJudgeReport {
  synthesis: string;
  verdictSummary: string;
  agreementLevel: 'High Consensus' | 'Moderate Divergence' | 'Sharp Disagreement' | 'Mixed Nuance';
  agreementScore: number;
  problemSolvability: 'Guaranteed Unique Solution' | 'Underdetermined (Multiple Solutions)' | 'Impossible (Contradictory/False Premise)' | 'Open-Ended / Empirical';
  keyConsensusPoints: string[];
  disagreementsOrOutliers: string[];
  evaluations: ModelEvaluation[];
  winnerModelId: string;
  winnerReason: string;
  citedReferences?: CitedReference[];
  confidenceRating: number;
}

export interface ModelRanking {
  modelId: string;
  modelName: string;
  provider: string;
  totalRuns: number;
  totalWins: number;
  winRate: number; // percentage 0-100
  avgAccuracy: number;
  avgCompleteness: number;
  avgReasoning: number;
  avgOverallScore: number;
  avgLatencyMs: number;
  avgTokensPerSec: number;
  totalCostUsd: number;
}

export interface BenchmarkStats {
  benchmarkId: string;
  benchmarkTitle: string;
  totalRuns: number;
  winningModels: { modelId: string; modelName: string; wins: number; winRate: number }[];
  modelScores: {
    modelId: string;
    modelName: string;
    runs: number;
    wins: number;
    avgAccuracy: number;
    avgReasoning: number;
    avgOverall: number;
    avgLatencyMs: number;
    avgTokensPerSec: number;
  }[];
}

export interface UsageSummary {
  totalTokensIn: number;
  totalTokensOut: number;
  totalTokens: number;
  totalCostUsd: number;
  totalQueries: number;
  avgCostPerQuery: number;
  recentQueries: {
    id: string;
    benchmarkId?: string;
    benchmarkTitle?: string;
    prompt: string;
    createdAt: string;
    totalCostUsd: number;
    totalTokens: number;
    tokensIn: number;
    tokensOut: number;
    winnerModelId?: string;
    models: {
      modelId: string;
      modelName: string;
      tokens: number;
      costUsd: number;
      latencyMs: number;
      tokensPerSec: number;
    }[];
  }[];
}

export interface HistoryQueryItem {
  id: string;
  benchmarkId: string | null;
  benchmarkTitle: string | null;
  prompt: string;
  winnerModelId: string | null;
  winnerReason: string | null;
  agreementLevel: string | null;
  agreementScore: number | null;
  confidenceRating: number | null;
  totalCostUsd: number;
  totalTokensIn: number;
  totalTokensOut: number;
  totalLatencyMs: number;
  createdAt: string;
  judgeReport: ConsensusJudgeReport | null;
  models: {
    modelId: string;
    modelName: string;
    provider: string;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    costUsd: number;
    latencyMs: number;
    tokensPerSec: number;
    responseText: string;
    isWinner: boolean;
    accuracyScore: number;
    overallScore: number;
  }[];
}
