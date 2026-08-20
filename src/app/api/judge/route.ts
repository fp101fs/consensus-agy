import { NextRequest } from 'next/server';
import { ConsensusJudgeReport } from '@/types/consensus';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { prompt, modelResponses, judgeModelId, userApiKey } = await req.json();

    const apiKey = userApiKey || process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: 'No OpenRouter API key provided. Please set OPENROUTER_API_KEY in environment or input it.',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!prompt || !modelResponses || !Array.isArray(modelResponses) || modelResponses.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Missing prompt or model responses' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const selectedJudgeModel = judgeModelId || 'perplexity/sonar-reasoning-pro';

    const systemPrompt = `You are the Supreme AI Consensus Judge and Fact-Verification Arbiter.
Your mission:
1. Examine the user's original prompt.
2. Read the responses provided independently by 3 candidate LLMs (identified by modelId and name).
3. Thoroughly analyze where the models agree, where they diverge, what errors/hallucinations any model made, and which model produced the best/most complete response.
4. Perform live fact-checking / verification of any factual claims or data points. Provide cited references (with reputable domain / source hints) when applicable.
5. Synthesize the definitive, unified, correct "Consensus Answer" that resolves all gaps and discards false/misleading points.
6. Evaluate each model quantitatively (accuracyScore, completenessScore, reasoningScore, overallScore on a 0-100 scale), listing clear bullet strengths, weaknesses, and any inaccuracies.
7. Determine an overall "agreementLevel" ("High Consensus" | "Moderate Divergence" | "Sharp Disagreement" | "Mixed Nuance") and an "agreementScore" (0-100).
8. Pick a single winning modelId with an objective reason.

You MUST respond ONLY with a single valid, raw JSON object (NO markdown backticks, NO surrounding explanations, just JSON) conforming to this TypeScript schema:
{
  "synthesis": "Comprehensive, authoritative synthesis answering the user's prompt correctly by combining verified insights and correcting errors",
  "verdictSummary": "Concise 2-3 sentence executive verdict summarizing the outcome",
  "agreementLevel": "High Consensus" | "Moderate Divergence" | "Sharp Disagreement" | "Mixed Nuance",
  "agreementScore": number (0-100),
  "keyConsensusPoints": ["point 1", "point 2", ...],
  "disagreementsOrOutliers": ["disagreement 1", "disagreement 2", ...],
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
      "hallucinationsOrErrors": ["..."] or [],
      "distinctiveAngle": "what made this model's approach unique"
    }
  ],
  "winnerModelId": "id-of-winning-model",
  "winnerReason": "clear factual justification for why this model won",
  "citedReferences": [
    {
      "title": "Source name or document title",
      "url": "https://... or empty string",
      "snippet": "key fact or finding",
      "verifiedFact": "what specific claim this verifies"
    }
  ],
  "confidenceRating": number (0-100)
}`;

    const userContent = `User Prompt:
"""
${prompt}
"""

Candidate Model Responses to judge:
${modelResponses
  .map(
    (m: { modelId: string; modelName: string; response: string }, idx: number) => `
--- Candidate Model ${idx + 1}: ${m.modelName} (ID: ${m.modelId}) ---
${m.response || '[No output provided / failed]'}
`
  )
  .join('\n')}

Perform your deep analysis and output ONLY the JSON verdict according to specifications.`;

    const requestJudge = async (modelToUse: string) => {
      return await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
          'X-Title': process.env.NEXT_PUBLIC_SITE_NAME || 'Consensus Arena',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: modelToUse,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userContent },
          ],
          temperature: 0.2,
          response_format: { type: 'json_object' },
        }),
      });
    };

    let response = await requestJudge(selectedJudgeModel);

    // If primary judge model fails (e.g. rate limit or temporary provider issue), fallback to GPT-4o
    if (!response.ok && selectedJudgeModel !== 'openai/gpt-4o') {
      console.warn(`Judge model ${selectedJudgeModel} failed with ${response.status}. Retrying with openai/gpt-4o fallback.`);
      response = await requestJudge('openai/gpt-4o');
    }

    if (!response.ok) {
      const errText = await response.text();
      return new Response(
        JSON.stringify({ error: `Judge evaluation failed (${response.status}): ${errText}` }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || '';

    // Clean JSON content if wrapped in markdown blocks
    let cleaned = rawContent.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    let parsedReport: ConsensusJudgeReport;
    try {
      parsedReport = JSON.parse(cleaned);
    } catch {
      // Emergency fallback JSON parser if slight syntax anomaly
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedReport = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Judge did not return valid JSON: ' + cleaned.slice(0, 200));
      }
    }

    return new Response(JSON.stringify(parsedReport), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
