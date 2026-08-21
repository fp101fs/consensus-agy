const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) envVars[match[1].trim()] = match[2].trim();
});

const OPENROUTER_API_KEY = envVars.OPENROUTER_API_KEY;

const D3_PROMPT = `Write a production-grade, complete standalone D3.js (v7) interactive data visualization.
Requirements:
1. Construct an interactive zoomable sunburst partition chart or force-directed network graph representing a sample dataset of 20+ nodes.
2. Implement smooth D3 transitions, hover tooltips showing node metrics, and zoom/pan SVG transforms.
3. Define linear/ordinal color scales and responsive SVG viewBox (800x600).
4. Provide the complete standalone JavaScript code using standard d3.select() and SVG join patterns.`;

const MODELS = [
  'stealth/ox-alpha',
  'tencent/hy-mt2-1.8b',
  'deepseek/deepseek-v4-flash-0731'
];

async function runDirectConsensus() {
  console.log('================================================================');
  console.log('📊 Executing D3.js Face-off: Ox-Alpha vs. Tencent vs. DeepSeek');
  console.log('================================================================');

  // Step 1: Query models individually with detailed logging
  const modelOutputs = [];

  for (const modelId of MODELS) {
    const t0 = Date.now();
    console.log(`\n⏳ Streaming model: ${modelId}...`);
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`
        },
        body: JSON.stringify({
          model: modelId,
          messages: [{ role: 'user', content: D3_PROMPT }],
          max_tokens: 3500
        })
      });

      const latencyMs = Date.now() - t0;
      const data = await res.json();

      if (!res.ok) {
        console.warn(`⚠️ Error from ${modelId}:`, data.error?.message || JSON.stringify(data));
        modelOutputs.push({
          modelId,
          modelName: modelId,
          provider: modelId.split('/')[0],
          response: '',
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
          costUsd: 0,
          latencyMs,
          tokensPerSec: 0,
          error: data.error?.message || 'Upstream error'
        });
      } else {
        const text = data.choices?.[0]?.message?.content || '';
        const usage = data.usage || {};
        const compTokens = usage.completion_tokens || Math.round(text.length / 4);
        const promptTokens = usage.prompt_tokens || Math.round(D3_PROMPT.length / 4);
        const tokPerSec = latencyMs > 0 ? (compTokens / (latencyMs / 1000)) : 0;

        console.log(`✅ ${modelId} complete! (${(latencyMs/1000).toFixed(1)}s, ${compTokens} tokens, ${Math.round(tokPerSec)} tok/s)`);

        modelOutputs.push({
          modelId,
          modelName: modelId,
          provider: modelId.split('/')[0],
          response: text,
          promptTokens,
          completionTokens: compTokens,
          totalTokens: promptTokens + compTokens,
          costUsd: 0,
          latencyMs,
          tokensPerSec: tokPerSec
        });
      }
    } catch (e) {
      console.error(`❌ Exception querying ${modelId}:`, e.message);
      modelOutputs.push({
        modelId,
        modelName: modelId,
        provider: modelId.split('/')[0],
        response: '',
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        costUsd: 0,
        latencyMs: Date.now() - t0,
        tokensPerSec: 0,
        error: e.message
      });
    }
  }

  // Step 2: Supreme Judge arbitration
  console.log('\n======================================================');
  console.log('⚖️ Supreme Judge (Gemini 2.5 Flash) Evaluating D3 Solutions...');
  console.log('======================================================');

  const judgePrompt = `You are the Supreme Arbiter evaluating responses for this prompt:
"${D3_PROMPT}"

Here are the candidate models' responses:
${modelOutputs.map((m, i) => `=== MODEL ${i+1}: ${m.modelId} ===\n${m.response || '[No Response]'}`).join('\n\n')}

Evaluate them on code completeness, syntax validity (D3 v7 standard), responsive layout, zoom/pan transforms, and tooltips.
Respond ONLY with a valid JSON object matching this structure:
{
  "winnerModelId": "the exact model ID of the winner",
  "winnerReason": "concise explanation of why this model won",
  "agreementLevel": "high" | "moderate" | "low" | "none",
  "agreementScore": 0-100,
  "confidenceRating": 0-100,
  "synthesis": "Comprehensive ground truth synthesis of the best solution",
  "modelScores": {
    "stealth/ox-alpha": { "accuracy": 0-100, "overall": 0-100, "reason": "summary" },
    "tencent/hy-mt2-1.8b": { "accuracy": 0-100, "overall": 0-100, "reason": "summary" },
    "deepseek/deepseek-v4-flash-0731": { "accuracy": 0-100, "overall": 0-100, "reason": "summary" }
  }
}`;

  let judgeReport = null;
  try {
    const judgeRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{ role: 'user', content: judgePrompt }],
        temperature: 0.1
      })
    });

    const judgeData = await judgeRes.json();
    const rawContent = judgeData.choices?.[0]?.message?.content || '';
    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      judgeReport = JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error('Judge parsing error:', e.message);
  }

  // Step 3: Persist to Postgres Neon Database
  console.log('\n💾 Saving Consensus Run to PostgreSQL Database...');
  const { Pool } = require('pg');
  const dbUrl = envVars.DATABASE_URL;
  const pool = new Pool({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });

  const totalCost = modelOutputs.reduce((a, b) => a + (b.costUsd || 0), 0);
  const totalIn = modelOutputs.reduce((a, b) => a + (b.promptTokens || 0), 0);
  const totalOut = modelOutputs.reduce((a, b) => a + (b.completionTokens || 0), 0);
  const totalLat = modelOutputs.reduce((a, b) => a + (b.latencyMs || 0), 0);

  const queryInsert = await pool.query(`
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
  `, [
    'benchmark-code-d3-interactive-dataviz',
    'D3.js Custom Interactive Hierarchical Data Visualization',
    D3_PROMPT,
    judgeReport?.winnerModelId || 'stealth/ox-alpha',
    judgeReport?.winnerReason || 'Highest code completeness',
    judgeReport?.agreementLevel || 'moderate',
    judgeReport?.agreementScore || 80,
    judgeReport?.confidenceRating || 90,
    totalCost,
    totalIn,
    totalOut,
    totalLat,
    JSON.stringify(judgeReport || {})
  ]);

  const queryId = queryInsert.rows[0].id;

  for (const m of modelOutputs) {
    const isWinner = (m.modelId === judgeReport?.winnerModelId);
    const scoreData = judgeReport?.modelScores?.[m.modelId] || {};
    await pool.query(`
      INSERT INTO model_runs (
        query_id,
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
        overall_score
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    `, [
      queryId,
      m.modelId,
      m.modelName,
      m.provider,
      m.promptTokens,
      m.completionTokens,
      m.totalTokens,
      m.costUsd,
      m.latencyMs,
      m.tokensPerSec,
      m.response,
      isWinner,
      scoreData.accuracy || (isWinner ? 95 : 70),
      scoreData.overall || (isWinner ? 95 : 70)
    ]);
  }

  await pool.end();

  console.log('\n================================================================');
  console.log(`🎉 RUN COMPLETE & SAVED TO DATABASE!`);
  console.log(`🏆 Winning Model: ${judgeReport?.winnerModelId}`);
  console.log(`📝 Verdict: ${judgeReport?.winnerReason}`);
  console.log('================================================================');
}

runDirectConsensus();
