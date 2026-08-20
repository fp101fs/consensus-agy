import { NextRequest } from 'next/server';
import { getDbPool, initDbSchema } from '@/lib/db';
import { HistoryQueryItem } from '@/types/consensus';

export const runtime = 'nodejs';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const db = getDbPool();
    await initDbSchema();

    const queriesRes = await db.query(`
      SELECT 
        id,
        benchmark_id,
        benchmark_title,
        prompt,
        winner_model_id,
        winner_reason,
        agreement_level,
        agreement_score::float,
        confidence_rating::float,
        total_cost_usd::float,
        total_tokens_in::int,
        total_tokens_out::int,
        total_latency_ms::int,
        created_at,
        judge_report
      FROM consensus_queries
      ORDER BY created_at DESC
      LIMIT 100
    `);

    const queryIds = queriesRes.rows.map((r) => r.id);
    let modelsByQuery: Record<string, any[]> = {};

    if (queryIds.length > 0) {
      const runsRes = await db.query(
        `
        SELECT 
          query_id,
          model_id,
          model_name,
          provider,
          prompt_tokens::int,
          completion_tokens::int,
          total_tokens::int,
          cost_usd::float,
          latency_ms::int,
          tokens_per_sec::float,
          response_text,
          is_winner,
          accuracy_score::float,
          overall_score::float
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
          provider: row.provider,
          promptTokens: row.prompt_tokens,
          completionTokens: row.completion_tokens,
          totalTokens: row.total_tokens,
          costUsd: row.cost_usd,
          latencyMs: row.latency_ms,
          tokensPerSec: row.tokens_per_sec,
          responseText: row.response_text,
          isWinner: row.is_winner,
          accuracyScore: row.accuracy_score,
          overallScore: row.overall_score,
        });
      });
    }

    const history: HistoryQueryItem[] = queriesRes.rows.map((r) => ({
      id: r.id,
      benchmarkId: r.benchmark_id || null,
      benchmarkTitle: r.benchmark_title || null,
      prompt: r.prompt,
      winnerModelId: r.winner_model_id,
      winnerReason: r.winner_reason,
      agreementLevel: r.agreement_level,
      agreementScore: r.agreement_score,
      confidenceRating: r.confidence_rating,
      totalCostUsd: Number(r.total_cost_usd || 0),
      totalTokensIn: Number(r.total_tokens_in || 0),
      totalTokensOut: Number(r.total_tokens_out || 0),
      totalLatencyMs: Number(r.total_latency_ms || 0),
      createdAt: r.created_at,
      judgeReport: r.judge_report,
      models: modelsByQuery[r.id] || [],
    }));

    return new Response(JSON.stringify({ history, total: history.length }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error: unknown) {
    console.error('History API error:', error);
    const message = error instanceof Error ? error.message : 'Database error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
