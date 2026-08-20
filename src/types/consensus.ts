export interface LLMConfig {
  id: string;
  name: string;
  provider: string;
  tag: string;
  color: string;
  badgeBg: string;
  borderColor: string;
}

export interface ModelOutput {
  modelId: string;
  modelName: string;
  provider: string;
  response: string;
  status: 'idle' | 'loading' | 'completed' | 'error';
  latencyMs?: number;
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
  keyConsensusPoints: string[];
  disagreementsOrOutliers: string[];
  evaluations: ModelEvaluation[];
  winnerModelId: string;
  winnerReason: string;
  citedReferences?: CitedReference[];
  confidenceRating: number; // 0 - 100
}
