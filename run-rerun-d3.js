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
  'google/gemini-3.7-flash',
  'nvidia/nemotron-3-super-120b-a12b:free',
  'openai/gpt-5.6-luna'
];

async function rerunD3() {
  console.log('================================================================');
  console.log('📊 Re-running D3.js Hierarchical DataViz Benchmark');
  console.log('Models: ' + MODELS.join(', '));
  console.log('================================================================');

  try {
    const res = await fetch('http://localhost:3000/api/consensus', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`
      },
      body: JSON.stringify({
        prompt: D3_PROMPT,
        models: MODELS,
        judgeModel: 'google/gemini-2.5-flash',
        saveToDb: true
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`❌ HTTP Error (${res.status}): ${errText}`);
    } else {
      const data = await res.json();
      console.log('✅ Consensus Run Complete!');
      console.log(`🏆 Winning Model: ${data.judgeReport?.winnerModelId || 'Split'}`);
      console.log(`⏱️ Latency: ${(data.totalLatencyMs / 1000).toFixed(1)}s`);
      console.log('\n--- Model Summaries ---');
      data.models?.forEach(m => {
        console.log(`* ${m.modelId} (${(m.latencyMs/1000).toFixed(1)}s, ${Math.round(m.tokensPerSec)} tok/s)`);
      });
      console.log('\n--- Supreme Judge Assessment ---');
      console.log(data.judgeReport?.synthesis?.slice(0, 400) + '...');
    }
  } catch (err) {
    console.error('❌ Request error:', err.message);
  }
}

rerunD3();
