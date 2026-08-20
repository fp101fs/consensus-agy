import { NextRequest } from 'next/server';
import { getDbPool, initDbSchema } from '@/lib/db';
import { ConsensusJudgeReport, ModelOutput } from '@/types/consensus';
import { getPromptBenchmarkId } from '@/lib/presets';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { prompt, modelOutputs, judgeReport, totalLatencyMs } = await req.json();

    if (!prompt || !modelOutputs) {
      return new Response(JSON.stringify({ error: 'Missing prompt or model outputs' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const db = getDbPool();
    await initDbSchema();

    const { benchmarkId, benchmarkTitle } = getPromptBenchmarkId(prompt);
    const outputs: ModelOutput[] = Object.values(modelOutputs);

    let totalTokensIn = 0;
    let totalTokensOut = 0;
    let totalCostUsd = 0;

    outputs.forEach((o) => {
      totalTokensIn += o.promptTokens || 0;
      totalTokensOut += o.completionTokens || 0;
      totalCostUsd += o.costUsd || 0;
    });

    const report: ConsensusJudgeReport | null = judgeReport || null;

    // 1. Insert consensus query record with benchmark fingerprint
    const queryInsert = await db.query(
      `
      INSERT INTO consensus_queries (
        benchmark_id,
        benchmark_title,
        prompt,
        winner_model_id,
        winner_reason,
        agreement_level,
        agreement_score,
        confidence_rating,
        total_cost_usd,
        total_tokens_in,
        total_tokens_out,
        total_latency_ms,
        judge_report
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING id, created_at
      `,
      [
        benchmarkId,
        benchmarkTitle,
        prompt,
        report?.winnerModelId || null,
        report?.winnerReason || null,
        report?.agreementLevel || null,
        report?.agreementScore || null,
        report?.confidenceRating || null,
        totalCostUsd,
        totalTokensIn,
        totalTokensOut,
        totalLatencyMs || 0,
        report ? JSON.stringify(report) : null,
      ]
    );

    const queryId = queryInsert.rows[0].id;

    // 2. Insert individual model runs with benchmark_id
    for (const out of outputs) {
      const evaluation = report?.evaluations?.find((e) => e.modelId === out.modelId);
      const isWinner = report?.winnerModelId === out.modelId;

      await db.query(
        `
        INSERT INTO model_runs (
          query_id,
          benchmark_id,
          model_id,
          model_name,
          provider,
          prompt_tokens,
          completion_tokens,
          total_tokens,
          cost_usd,
          latency_ms,
          tokens_per_sec,
          response_text,
          is_winner,
          accuracy_score,
          completeness_score,
          reasoning_score,
          overall_score,
          status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        `,
        [
          queryId,
          benchmarkId,
          out.modelId,
          out.modelName || out.modelId,
          out.provider || 'AI',
          out.promptTokens || 0,
          out.completionTokens || 0,
          out.totalTokens || 0,
          out.costUsd || 0,
          out.latencyMs || 0,
          out.tokensPerSec || 0,
          out.response || '',
          isWinner,
          evaluation?.accuracyScore || null,
          evaluation?.completenessScore || null,
          evaluation?.reasoningScore || null,
          evaluation?.overallScore || null,
          out.status || 'completed',
        ]
      );
    }

    return new Response(JSON.stringify({ success: true, queryId, benchmarkId, benchmarkTitle }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error saving run to DB:', error);
    const message = error instanceof Error ? error.message : 'Database error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
