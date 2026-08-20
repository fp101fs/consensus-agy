import { NextRequest } from 'next/server';
import { getDbPool, initDbSchema } from '@/lib/db';
import { ModelRanking } from '@/types/consensus';

export const runtime = 'nodejs';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const db = getDbPool();
    await initDbSchema();

    const query = `
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
      ORDER BY win_rate DESC, total_wins DESC, avg_overall_score DESC
    `;

    const res = await db.query(query);

    const rankings: ModelRanking[] = res.rows.map((r) => ({
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

    return new Response(JSON.stringify({ rankings }), {
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
