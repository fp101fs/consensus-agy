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
  // 4-Dimensional Metacognitive Calibration Assessment
  metaCognition?: {
    claimedConfidence?: number; // 0-100 reported by model
    confidenceAppropriateness?: 'Well-Calibrated' | 'Overconfident' | 'Underconfident' | 'Unspecified';
    uniquenessRecognition?: 'Correctly Identified Unique' | 'Correctly Identified Non-Unique' | 'Correctly Identified Impossible' | 'Falsely Claimed Unique' | 'Falsely Claimed Multiple';
    epistemicVerdict?: string; // e.g. "Model correctly caught that problem is underdetermined"
  };
}

export interface CitedReference {
  title: string;
  url?: string;
  snippet: string;
  verifiedFact: string;
}

export interface ConsensusJudgeReport {
  synthesis: string; // Unified truth & best verified solution
  verdictSummary: string; // High level TL;DR
  agreementLevel: 'High Consensus' | 'Moderate Divergence' | 'Sharp Disagreement' | 'Mixed Nuance';
  agreementScore: number; // 0 - 100
  problemSolvability: 'Guaranteed Unique Solution' | 'Underdetermined (Multiple Solutions)' | 'Impossible (Contradictory/False Premise)' | 'Open-Ended / Empirical';
  keyConsensusPoints: string[];
  disagreementsOrOutliers: string[];
  evaluations: ModelEvaluation[];
  winnerModelId: string;
  winnerReason: string;
  citedReferences?: CitedReference[];
  confidenceRating: number; // 0 - 100
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

export interface UsageSummary {
  totalTokensIn: number;
  totalTokensOut: number;
  totalTokens: number;
  totalCostUsd: number;
  totalQueries: number;
  avgCostPerQuery: number;
  recentQueries: {
    id: string;
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
