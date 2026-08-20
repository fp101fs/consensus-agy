import { NextRequest } from 'next/server';
import { getDbPool, initDbSchema } from '@/lib/db';
import { UsageSummary } from '@/types/consensus';

export const runtime = 'nodejs';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const db = getDbPool();
    await initDbSchema();

    // Query aggregate usage stats
    const aggRes = await db.query(`
      SELECT 
        COALESCE(SUM(total_tokens_in), 0)::int AS total_tokens_in,
        COALESCE(SUM(total_tokens_out), 0)::int AS total_tokens_out,
        COALESCE(SUM(total_tokens_in + total_tokens_out), 0)::int AS total_tokens,
        COALESCE(SUM(total_cost_usd), 0)::float AS total_cost_usd,
        COUNT(*)::int AS total_queries
      FROM consensus_queries
    `);

    const agg = aggRes.rows[0] || {
      total_tokens_in: 0,
      total_tokens_out: 0,
      total_tokens: 0,
      total_cost_usd: 0,
      total_queries: 0,
    };

    const avgCostPerQuery =
      agg.total_queries > 0 ? agg.total_cost_usd / agg.total_queries : 0;

    // Get recent queries with breakdown
    const queriesRes = await db.query(`
      SELECT 
        q.id,
        q.prompt,
        q.created_at,
        q.total_cost_usd::float,
        (q.total_tokens_in + q.total_tokens_out)::int AS total_tokens,
        q.total_tokens_in::int AS tokens_in,
        q.total_tokens_out::int AS tokens_out,
        q.winner_model_id
      FROM consensus_queries q
      ORDER BY q.created_at DESC
      LIMIT 25
    `);

    // Get model details for these recent queries
    const queryIds = queriesRes.rows.map((r) => r.id);
    let modelsByQuery: Record<string, any[]> = {};

    if (queryIds.length > 0) {
      const runsRes = await db.query(
        `
        SELECT 
          query_id,
          model_id,
          model_name,
          total_tokens::int,
          cost_usd::float,
          latency_ms::int,
          tokens_per_sec::float
        FROM model_runs
        WHERE query_id = ANY($1)
        ORDER BY created_at ASC
        `,
        [queryIds]
      );

      runsRes.rows.forEach((row) => {
        if (!modelsByQuery[row.query_id]) {
          modelsByQuery[row.query_id] = [];
        }
        modelsByQuery[row.query_id].push({
          modelId: row.model_id,
          modelName: row.model_name,
          tokens: row.total_tokens,
          costUsd: row.cost_usd,
          latencyMs: row.latency_ms,
          tokensPerSec: row.tokens_per_sec,
        });
      });
    }

    const recentQueries = queriesRes.rows.map((r) => ({
      id: r.id,
      prompt: r.prompt,
      createdAt: r.created_at,
      totalCostUsd: Number(r.total_cost_usd || 0),
      totalTokens: Number(r.total_tokens || 0),
      tokensIn: Number(r.tokens_in || 0),
      tokensOut: Number(r.tokens_out || 0),
      winnerModelId: r.winner_model_id,
      models: modelsByQuery[r.id] || [],
    }));

    const summary: UsageSummary = {
      totalTokensIn: Number(agg.total_tokens_in),
      totalTokensOut: Number(agg.total_tokens_out),
      totalTokens: Number(agg.total_tokens),
      totalCostUsd: Number(Number(agg.total_cost_usd).toFixed(5)),
      totalQueries: Number(agg.total_queries),
      avgCostPerQuery: Number(avgCostPerQuery.toFixed(5)),
      recentQueries,
    };

    return new Response(JSON.stringify(summary), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error: unknown) {
    console.error('Usage API error:', error);
    const message = error instanceof Error ? error.message : 'Database error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
