/**
 * Bradley-Terry / Elo Pairing & Bayesian Metacognitive Ranking System
 *
 * Implements:
 * 1. Bradley-Terry maximum likelihood pairwise estimation for multi-model head-to-head match results.
 * 2. Elo conversion (scaled from log-abilities: Elo = 1500 + (ln_gamma * 400 / ln(10))).
 * 3. Bayesian credibility / provisional penalty for low sample sizes (n < 3 runs).
 * 4. Composite Leaderboard Score combining:
 *    - Competitive Strength (Bradley-Terry Elo) (45% weight)
 *    - Intrinsic Quality & Accuracy (35% weight)
 *    - Operational Practicality (Speed & Cost efficiency) (20% weight)
 */

export interface HeadToHeadMatch {
  queryId: string;
  winnerModelId: string | null;
  participantModelIds: string[];
}

export interface ModelPerformanceStats {
  modelId: string;
  modelName: string;
  provider: string;
  totalRuns: number;
  totalWins: number;
  winRate: number; // Raw win percentage
  avgAccuracy: number;
  avgCompleteness: number;
  avgReasoning: number;
  avgOverallScore: number;
  avgLatencyMs: number;
  avgTokensPerSec: number;
  totalCostUsd: number;
}

export interface BradleyTerryScore extends ModelPerformanceStats {
  eloRating: number; // e.g. 1500 base
  btAbility: number; // gamma value (relative power)
  btScore: number; // 0-100 normalized competitive score
  compositeScore: number; // 0-100 holistic rank index
  isProvisional: boolean; // true if totalRuns < 3
  confidenceInterval: [number, number]; // [lowerBound, upperBound] for Elo
  tier: 'S+' | 'S' | 'A' | 'B' | 'C' | 'Provisional';
}

/**
 * Solves Bradley-Terry model using iterative Minorization-Maximization (MM) algorithm.
 * For each multi-model query where model W won among participants {W, L1, L2...},
 * it expands to pairwise comparisons: W beats L1, W beats L2...
 * Ties/unclear verdicts result in half-wins (0.5).
 */
export function computeBradleyTerryRatings(
  models: ModelPerformanceStats[],
  matches: HeadToHeadMatch[]
): BradleyTerryScore[] {
  if (models.length === 0) return [];

  const modelMap = new Map<string, ModelPerformanceStats>();
  models.forEach((m) => modelMap.set(m.modelId, m));

  const modelIds = models.map((m) => m.modelId);
  const n = modelIds.length;
  const idToIndex = new Map<string, number>();
  modelIds.forEach((id, idx) => idToIndex.set(id, idx));

  // Initialize Pairwise Win Matrix W[i][j] and Total Matches N[i][j]
  const W: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  const N: number[][] = Array.from({ length: n }, () => Array(n).fill(0));

  // Prior regularization (pseudo-counts) to avoid 0/infinity division
  const PRIOR = 0.5;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i !== j) {
        W[i][j] += PRIOR;
        W[j][i] += PRIOR;
        N[i][j] += PRIOR * 2;
        N[j][i] += PRIOR * 2;
      }
    }
  }

  // Populate from actual head-to-head match events
  matches.forEach((match) => {
    const participants = match.participantModelIds.filter((id) => idToIndex.has(id));
    if (participants.length < 2) return;

    const winner = match.winnerModelId;

    for (let i = 0; i < participants.length; i++) {
      for (let j = i + 1; j < participants.length; j++) {
        const idxA = idToIndex.get(participants[i])!;
        const idxB = idToIndex.get(participants[j])!;

        N[idxA][idxB] += 1;
        N[idxB][idxA] += 1;

        if (winner === participants[i]) {
          W[idxA][idxB] += 1;
        } else if (winner === participants[j]) {
          W[idxB][idxA] += 1;
        } else {
          // Tie / split decision
          W[idxA][idxB] += 0.5;
          W[idxB][idxA] += 0.5;
        }
      }
    }
  });

  // Total wins vector w_i
  const wins: number[] = W.map((row) => row.reduce((a, b) => a + b, 0));

  // Iterative Minorization-Maximization to find Bradley-Terry abilities (gamma)
  let gamma = Array(n).fill(1.0);
  const MAX_ITER = 60;
  const EPSILON = 1e-6;

  for (let iter = 0; iter < MAX_ITER; iter++) {
    const nextGamma = Array(n).fill(1.0);

    for (let i = 0; i < n; i++) {
      let denom = 0;
      for (let j = 0; j < n; j++) {
        if (i !== j) {
          const totalMatches = N[i][j];
          if (totalMatches > 0) {
            denom += totalMatches / (gamma[i] + gamma[j]);
          }
        }
      }
      nextGamma[i] = denom > 0 ? wins[i] / denom : gamma[i];
    }

    // Geometric mean normalization
    const logSum = nextGamma.reduce((sum, g) => sum + Math.log(Math.max(1e-12, g)), 0);
    const scale = Math.exp(logSum / n);
    for (let i = 0; i < n; i++) {
      nextGamma[i] /= scale;
    }

    // Check convergence
    let maxDiff = 0;
    for (let i = 0; i < n; i++) {
      maxDiff = Math.max(maxDiff, Math.abs(nextGamma[i] - gamma[i]));
    }
    gamma = nextGamma;
    if (maxDiff < EPSILON) break;
  }

  // Convert gamma to Bradley-Terry Elo ratings: Elo = 1500 + ln(gamma) * (400 / ln(10))
  const ELO_BASE = 1500;
  const ELO_SCALE = 400 / Math.LN10;

  const results: BradleyTerryScore[] = models.map((m, i) => {
    const rawElo = ELO_BASE + Math.log(Math.max(1e-6, gamma[i])) * ELO_SCALE;
    const isProvisional = m.totalRuns < 3;

    // Standard error for Bayesian credible interval: SE ~ EloScale / sqrt(totalRuns + 1)
    const se = ELO_SCALE / Math.sqrt(m.totalRuns + 1);
    const lowerElo = Math.round(rawElo - 1.96 * se);
    const upperElo = Math.round(rawElo + 1.96 * se);

    // Normalized BT Competitive Score (0 to 100)
    // 1200 Elo = 0, 1800 Elo = 100
    const btScore = Math.max(0, Math.min(100, ((rawElo - 1200) / 600) * 100));

    // Quality Score component (0 to 100)
    const qualityScore = m.avgOverallScore > 0 ? m.avgOverallScore : m.avgAccuracy;

    // Practicality Score component (Speed & Cost)
    // Speed: 0-300 tok/s mapped to 0-100
    const speedScore = Math.min(100, (m.avgTokensPerSec / 250) * 100);
    const costScore = m.totalCostUsd === 0 ? 100 : Math.max(0, 100 - m.totalCostUsd * 2000);
    const practicalScore = speedScore * 0.6 + costScore * 0.4;

    // Composite Holistic Rating (0 to 100):
    // 45% Bradley-Terry Head-to-Head Strength
    // 35% Quality & Accuracy
    // 20% Speed & Practicality
    let composite = btScore * 0.45 + qualityScore * 0.35 + practicalScore * 0.20;

    // Apply modest regression toward mean for low sample size (shrinkage)
    if (m.totalRuns === 1) {
      composite = composite * 0.6 + 50 * 0.4; // heavy shrinkage for 1 run
    } else if (m.totalRuns === 2) {
      composite = composite * 0.8 + 50 * 0.2; // moderate shrinkage for 2 runs
    }

    let tier: BradleyTerryScore['tier'] = 'B';
    if (isProvisional) tier = 'Provisional';
    else if (composite >= 85) tier = 'S+';
    else if (composite >= 75) tier = 'S';
    else if (composite >= 65) tier = 'A';
    else if (composite >= 50) tier = 'B';
    else tier = 'C';

    return {
      ...m,
      eloRating: Math.round(rawElo),
      btAbility: Number(gamma[i].toFixed(3)),
      btScore: Number(btScore.toFixed(1)),
      compositeScore: Number(composite.toFixed(1)),
      isProvisional,
      confidenceInterval: [lowerElo, upperElo],
      tier,
    };
  });

  // Sort by Composite Holistic Score descending, placing mature proven models higher than 1-sample anomalies
  results.sort((a, b) => {
    // Mature models with high composite rank highest
    if (!a.isProvisional && b.isProvisional && a.compositeScore >= b.compositeScore - 10) {
      return -1;
    }
    if (a.isProvisional && !b.isProvisional && b.compositeScore >= a.compositeScore - 10) {
      return 1;
    }
    return b.compositeScore - a.compositeScore || b.eloRating - a.eloRating;
  });

  return results;
}
