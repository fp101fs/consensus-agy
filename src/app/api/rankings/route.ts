import { NextRequest } from 'next/server';
import { getDbPool, initDbSchema } from '@/lib/db';
import { BenchmarkStats } from '@/types/consensus';
import {
  computeBradleyTerryRatings,
  HeadToHeadMatch,
  ModelPerformanceStats,
  BradleyTerryScore,
} from '@/lib/bradley-terry';

export const runtime = 'nodejs';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const db = getDbPool();
    await initDbSchema();

    // 1. Raw performance statistics per model
    const statsQuery = `
      SELECT 
        m.model_id,
        MAX(m.model_name) as model_name,
        MAX(m.provider) as provider,
        COUNT(*)::int as total_runs,
        SUM(CASE WHEN m.is_winner = true THEN 1 ELSE 0 END)::int as total_wins,
        ROUND((SUM(CASE WHEN m.is_winner = true THEN 1 ELSE 0 END)::numeric / NULLIF(COUNT(*), 0)::numeric) * 100, 1)::float as win_rate,
        ROUND(AVG(m.accuracy_score)::numeric, 1)::float as avg_accuracy,
        ROUND(AVG(m.completeness_score)::numeric, 1)::float as avg_completeness,
        ROUND(AVG(m.reasoning_score)::numeric, 1)::float as avg_reasoning,
        ROUND(AVG(m.overall_score)::numeric, 1)::float as avg_overall_score,
        ROUND(AVG(m.latency_ms)::numeric, 0)::int as avg_latency_ms,
        ROUND(AVG(m.tokens_per_sec)::numeric, 1)::float as avg_tokens_per_sec,
        ROUND(SUM(m.cost_usd)::numeric, 5)::float as total_cost_usd
      FROM model_runs m
      GROUP BY m.model_id
    `;

    const statsRes = await db.query(statsQuery);

    const rawModels: ModelPerformanceStats[] = statsRes.rows.map((r) => ({
      modelId: r.model_id,
      modelName: r.model_name || r.model_id,
      provider: r.provider || 'AI',
      totalRuns: Number(r.total_runs || 0),
      totalWins: Number(r.total_wins || 0),
      winRate: Number(r.win_rate || 0),
      avgAccuracy: Number(r.avg_accuracy || 0),
      avgCompleteness: Number(r.avg_completeness || 0),
      avgReasoning: Number(r.avg_reasoning || 0),
      avgOverallScore: Number(r.avg_overall_score || 0),
      avgLatencyMs: Number(r.avg_latency_ms || 0),
      avgTokensPerSec: Number(r.avg_tokens_per_sec || 0),
      totalCostUsd: Number(r.total_cost_usd || 0),
    }));

    // 2. Fetch all individual head-to-head match events for pairwise Bradley-Terry modeling
    const matchesRes = await db.query(`
      SELECT 
        q.id as query_id,
        q.winner_model_id,
        ARRAY_AGG(m.model_id) as participant_model_ids
      FROM consensus_queries q
      JOIN model_runs m ON m.query_id = q.id
      GROUP BY q.id, q.winner_model_id
    `);

    const matches: HeadToHeadMatch[] = matchesRes.rows.map((r) => ({
      queryId: r.query_id,
      winnerModelId: r.winner_model_id,
      participantModelIds: r.participant_model_ids || [],
    }));

    // 3. Compute Bradley-Terry Elo, Bayesian Uncertainty & Composite Rankings
    const rankings: BradleyTerryScore[] = computeBradleyTerryRatings(rawModels, matches);

    // 4. Per-Benchmark breakdown: How each model performed on specific logic puzzles & security audits
    const benchRes = await db.query(`
      SELECT 
        COALESCE(q.benchmark_id, 'custom-prompt') as benchmark_id,
        COALESCE(q.benchmark_title, 'Custom Query') as benchmark_title,
        COALESCE(MAX(q.category), 'General') as category,
        m.model_id,
        MAX(m.model_name) as model_name,
        COUNT(*)::int as runs,
        SUM(CASE WHEN m.is_winner = true THEN 1 ELSE 0 END)::int as wins,
        ROUND(AVG(m.accuracy_score)::numeric, 1)::float as avg_accuracy,
        ROUND(AVG(m.reasoning_score)::numeric, 1)::float as avg_reasoning,
        ROUND(AVG(m.overall_score)::numeric, 1)::float as avg_overall,
        ROUND(AVG(m.latency_ms)::numeric, 0)::int as avg_latency_ms,
        ROUND(AVG(m.tokens_per_sec)::numeric, 1)::float as avg_tokens_per_sec
      FROM model_runs m
      JOIN consensus_queries q ON m.query_id = q.id
      GROUP BY q.benchmark_id, q.benchmark_title, m.model_id
      ORDER BY q.benchmark_id, wins DESC, avg_overall DESC
    `);

    const benchmarkMap: Record<string, BenchmarkStats> = {};

    benchRes.rows.forEach((row) => {
      const bId = row.benchmark_id;
      if (!benchmarkMap[bId]) {
        benchmarkMap[bId] = {
          benchmarkId: bId,
          benchmarkTitle: row.benchmark_title,
          category: row.category,
          totalRuns: 0,
          winningModels: [],
          modelScores: [],
        };
      }

      benchmarkMap[bId].totalRuns += row.runs;
      benchmarkMap[bId].modelScores.push({
        modelId: row.model_id,
        modelName: row.model_name,
        runs: row.runs,
        wins: row.wins,
        avgAccuracy: Number(row.avg_accuracy || 0),
        avgReasoning: Number(row.avg_reasoning || 0),
        avgOverall: Number(row.avg_overall || 0),
        avgLatencyMs: Number(row.avg_latency_ms || 0),
        avgTokensPerSec: Number(row.avg_tokens_per_sec || 0),
      });
    });

    const benchmarks: BenchmarkStats[] = Object.values(benchmarkMap);

    return new Response(JSON.stringify({ rankings, benchmarks }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error: unknown) {
    console.error('Rankings API error:', error);
    const message = error instanceof Error ? error.message : 'Database error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
