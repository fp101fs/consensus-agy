import { NextRequest } from 'next/server';
import { getDbPool, initDbSchema } from '@/lib/db';
import { ConsensusJudgeReport, ModelOutput } from '@/types/consensus';
import { estimateTokens, calculateCost, calculateSanitizedSpeed } from '@/lib/pricing';
import { getPromptBenchmarkId } from '@/lib/presets';

export const runtime = 'nodejs';

const CANDIDATE_SYSTEM_PROMPT = `You are an elite reasoning model competing in a rigorous benchmark arbitration.
You must always structure your response clearly addressing these 4 exact dimensions:

1. **Answer**: State the direct, precise answer to the question/problem.
2. **Reasoning**: Provide a concise, step-by-step logical proof or justification.
3. **Confidence Rating (0–100%)**: State your numerical epistemic certainty in your answer (e.g. "Confidence: 95%"), accounting for any ambiguities.
4. **Uniqueness / Solvability**: State explicitly whether the given clues guarantee a **Unique Solution**, whether the problem is **Underdetermined** (multiple valid solutions exist), or whether the problem is **Impossible / Contradictory** (false premise or conflicting constraints).`;

const JUDGE_SYSTEM_PROMPT = `You are the Supreme AI Consensus Judge and Metacognitive Fact-Verification Arbiter.
Each candidate model was instructed to provide:
1. Answer
2. Brief reasoning
3. Confidence (0-100%)
4. Whether the clues guarantee a unique answer

Your Evaluation Criteria:
1. Analyze the mathematical/logical reality of the prompt. Determine the true problemSolvability:
   - "Guaranteed Unique Solution" (clues constrain to exactly 1 solution)
   - "Underdetermined (Multiple Solutions)" (degrees of freedom remain)
   - "Impossible (Contradictory/False Premise)" (contradiction or impossible premise)
   - "Open-Ended / Empirical"
2. Check whether each candidate model recognized underdetermined or impossible problems versus falsely asserting a single answer with unjustified certainty.
3. Assess epistemic calibration: did the model express high confidence on wrong answers (Overconfident) or appropriate uncertainty?
4. Provide cited references (with reputable domain / source hints) when factual claims can be verified online.
5. Synthesize the definitive, unified "Consensus Answer" that resolves all ambiguities and false premises.

You MUST respond ONLY with a single valid, raw JSON object conforming to this schema:
{
  "synthesis": "Comprehensive, authoritative synthesis answering the user's prompt correctly by combining verified insights and correcting errors",
  "verdictSummary": "Concise 2-3 sentence executive verdict summarizing the outcome",
  "agreementLevel": "High Consensus" | "Moderate Divergence" | "Sharp Disagreement" | "Mixed Nuance",
  "agreementScore": number (0-100),
  "problemSolvability": "Guaranteed Unique Solution" | "Underdetermined (Multiple Solutions)" | "Impossible (Contradictory/False Premise)" | "Open-Ended / Empirical",
  "keyConsensusPoints": ["point 1", "point 2"],
  "disagreementsOrOutliers": ["disagreement 1", "disagreement 2"],
  "evaluations": [
    {
      "modelId": "model-id-string",
      "modelName": "model name",
      "accuracyScore": number (0-100),
      "completenessScore": number (0-100),
      "reasoningScore": number (0-100),
      "overallScore": number (0-100),
      "strengths": ["...", "..."],
      "weaknesses": ["...", "..."],
      "hallucinationsOrErrors": ["..."],
      "distinctiveAngle": "what made this model's approach unique",
      "metaCognition": {
        "claimedConfidence": number (0-100),
        "confidenceAppropriateness": "Well-Calibrated" | "Overconfident" | "Underconfident" | "Unspecified",
        "uniquenessRecognition": "Correctly Identified Unique" | "Correctly Identified Non-Unique" | "Correctly Identified Impossible" | "Falsely Claimed Unique" | "Falsely Claimed Multiple",
        "epistemicVerdict": "Summary of whether model handled epistemic certainty and problem constraints properly"
      }
    }
  ],
  "winnerModelId": "id-of-winning-model",
  "winnerReason": "clear factual justification for why this model won",
  "citedReferences": [
    {
      "title": "Source name or document title",
      "url": "https://...",
      "snippet": "key fact or finding",
      "verifiedFact": "what specific claim this verifies"
    }
  ],
  "confidenceRating": number (0-100)
}`;

export async function POST(req: NextRequest) {
  const overallStartTime = Date.now();

  try {
    const body = await req.json();
    const {
      prompt,
      models = [
        'openai/gpt-4o',
        'anthropic/claude-sonnet-4.5',
        'google/gemini-2.5-flash',
      ],
      judgeModel = 'perplexity/sonar-reasoning-pro',
      saveToDb = true,
      apiKey: customApiKey,
    } = body;

    const apiKey =
      customApiKey ||
      req.headers.get('Authorization')?.replace(/^Bearer\s+/i, '') ||
      process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: 'No OpenRouter API key provided. Supply OPENROUTER_API_KEY in env or Authorization header.',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return new Response(
        JSON.stringify({ error: 'Missing or empty "prompt" field in request body.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!Array.isArray(models) || models.length === 0) {
      return new Response(
        JSON.stringify({ error: '"models" must be an array of at least 1 model ID.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { benchmarkId, benchmarkTitle } = getPromptBenchmarkId(prompt);
    const promptTokens = estimateTokens(prompt);

    // 1. Run all candidate models simultaneously in parallel
    const runSingleModel = async (modelId: string): Promise<ModelOutput> => {
      const startTime = Date.now();
      try {
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
            'X-Title': process.env.NEXT_PUBLIC_SITE_NAME || 'Consensus Arena API',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: modelId,
            messages: [
              { role: 'system', content: CANDIDATE_SYSTEM_PROMPT },
              { role: 'user', content: prompt },
            ],
            provider: { allow_fallbacks: true },
          }),
        });

        const latencyMs = Date.now() - startTime;

        if (!res.ok) {
          const errText = await res.text();
          return {
            modelId,
            modelName: modelId,
            provider: modelId.split('/')[0] || 'AI',
            response: '',
            status: 'error',
            latencyMs,
            error: `HTTP ${res.status}: ${errText}`,
          };
        }

        const data = await res.json();
        const choice = data.choices?.[0];
        const responseText =
          choice?.message?.content ||
          choice?.text ||
          choice?.message?.reasoning ||
          '';

        const explicitPrompt = data.usage?.prompt_tokens ?? promptTokens;
        const { tokens: completionTokens, tokensPerSec } = calculateSanitizedSpeed(
          responseText,
          data.usage?.completion_tokens,
          latencyMs
        );
        const totalTok = explicitPrompt + completionTokens;
        const costUsd = calculateCost(modelId, explicitPrompt, completionTokens);

        return {
          modelId,
          modelName: modelId,
          provider: modelId.split('/')[0] || 'AI',
          response: responseText,
          status: 'completed',
          latencyMs,
          promptTokens: explicitPrompt,
          completionTokens,
          totalTokens: totalTok,
          costUsd,
          tokensPerSec,
        };
      } catch (err: unknown) {
        const latencyMs = Date.now() - startTime;
        const msg = err instanceof Error ? err.message : 'Execution error';
        return {
          modelId,
          modelName: modelId,
          provider: modelId.split('/')[0] || 'AI',
          response: '',
          status: 'error',
          latencyMs,
          error: msg,
        };
      }
    };

    const modelOutputsArray = await Promise.all(models.map((m) => runSingleModel(m)));
    const modelOutputs: Record<string, ModelOutput> = {};
    modelOutputsArray.forEach((o) => {
      modelOutputs[o.modelId] = o;
    });

    // 2. Run Supreme Judge Arbitrator
    const userContent = `User Prompt:\n"""\n${prompt}\n"""\n\nCandidate Model Responses to judge:\n${modelOutputsArray
      .map(
        (m, idx) => `
--- Candidate Model ${idx + 1}: ${m.modelName} (ID: ${m.modelId}) ---
${m.response || `[Failed: ${m.error || 'No output'}]`}
`
      )
      .join('\n')}\n\nEvaluate problem uniqueness, accuracy, confidence calibration, and output the complete JSON verdict.`;

    const requestJudge = async (targetJudge: string) => {
      return await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
          'X-Title': process.env.NEXT_PUBLIC_SITE_NAME || 'Consensus Arena API',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: targetJudge,
          messages: [
            { role: 'system', content: JUDGE_SYSTEM_PROMPT },
            { role: 'user', content: userContent },
          ],
          temperature: 0.2,
          response_format: { type: 'json_object' },
        }),
      });
    };

    let judgeRes = await requestJudge(judgeModel);
    if (!judgeRes.ok && judgeModel !== 'openai/gpt-4o') {
      console.warn(`Judge model ${judgeModel} failed. Falling back to openai/gpt-4o.`);
      judgeRes = await requestJudge('openai/gpt-4o');
    }

    if (!judgeRes.ok) {
      const errText = await judgeRes.text();
      return new Response(
        JSON.stringify({
          error: `Judge evaluation failed (${judgeRes.status}): ${errText}`,
          modelOutputs,
        }),
        { status: judgeRes.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const judgeData = await judgeRes.json();
    const rawContent = judgeData.choices?.[0]?.message?.content || '';

    let cleaned = rawContent.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    let judgeReport: ConsensusJudgeReport;
    try {
      judgeReport = JSON.parse(cleaned);
    } catch {
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        judgeReport = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Judge did not return valid JSON: ' + cleaned.slice(0, 200));
      }
    }

    const totalLatencyMs = Date.now() - overallStartTime;

    // 3. Optionally persist to PostgreSQL DB for rankings & history
    let queryId: string | undefined;
    if (saveToDb) {
      try {
        const db = getDbPool();
        await initDbSchema();

        let totalTokensIn = 0;
        let totalTokensOut = 0;
        let totalCostUsd = 0;

        modelOutputsArray.forEach((o) => {
          totalTokensIn += o.promptTokens || 0;
          totalTokensOut += o.completionTokens || 0;
          totalCostUsd += o.costUsd || 0;
        });

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
          RETURNING id
          `,
          [
            benchmarkId,
            benchmarkTitle,
            prompt,
            judgeReport.winnerModelId || null,
            judgeReport.winnerReason || null,
            judgeReport.agreementLevel || null,
            judgeReport.agreementScore || null,
            judgeReport.confidenceRating || null,
            totalCostUsd,
            totalTokensIn,
            totalTokensOut,
            totalLatencyMs,
            JSON.stringify(judgeReport),
          ]
        );

        queryId = queryInsert.rows[0]?.id;

        for (const out of modelOutputsArray) {
          const evaluation = judgeReport.evaluations?.find((e) => e.modelId === out.modelId);
          const isWinner = judgeReport.winnerModelId === out.modelId;

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
              out.modelName,
              out.provider,
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
      } catch (dbErr) {
        console.warn('Could not record programmatic run in DB:', dbErr);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        queryId,
        benchmarkId,
        benchmarkTitle,
        prompt,
        totalLatencyMs,
        models: modelOutputsArray,
        judgeReport,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('API /api/consensus error:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
