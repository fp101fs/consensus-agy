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

    const systemPrompt = `You are the Supreme AI Consensus Judge and Metacognitive Fact-Verification Arbiter.
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

Evaluate problem uniqueness, accuracy, confidence calibration, and output the complete JSON verdict.`;

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
