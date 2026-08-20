const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) envVars[match[1].trim()] = match[2].trim();
});

const OPENROUTER_API_KEY = envVars.OPENROUTER_API_KEY;

const DAFOE_PROMPT = `Create a standalone SVG portrait of Willem Dafoe's face. Output only valid SVG markup. Do not wrap the SVG in Markdown fences. Do not use external images, links, scripts, CSS imports, or remote assets. Make the portrait recognizable as Willem Dafoe using vector shapes only. Include face shape, hair, eyes, eyebrows, nose, mouth, teeth, and expressive features. Use a 1024 by 1024 viewBox. Use detailed SVG-native vector techniques: layered paths, gradients, masks, clipping paths, shadows, highlights, blur filters, opacity, and fine strokes. The portrait should be as recognizable and detailed as possible.`;

// 3 Top Creative / Vision / High-Reasoning Models
const DAFOE_TRIAD = [
  'google/gemini-3.7-flash',
  'openai/gpt-5.6-luna',
  'qwen/qwen3-30b-a3b-instruct-2507'
];

async function runDafoeBenchmark() {
  console.log('================================================================');
  console.log('🎨 Starting Willem Dafoe SVG Vector Portrait Benchmark (BuseyBench Style)');
  console.log('================================================================');
  console.log(`Candidate Models: ${DAFOE_TRIAD.join(', ')}`);

  try {
    const res = await fetch('http://localhost:3000/api/consensus', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`
      },
      body: JSON.stringify({
        prompt: DAFOE_PROMPT,
        models: DAFOE_TRIAD,
        judgeModel: 'google/gemini-2.5-flash',
        saveToDb: true
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`❌ Dafoe benchmark failed (${res.status}): ${errText}`);
    } else {
      const data = await res.json();
      console.log(`\n✅ Dafoe Benchmark Complete!`);
      console.log(`🏆 Winning Model: ${data.judgeReport?.winnerModelId || 'Split Decision'}`);
      console.log(`💬 Judge Reason: ${data.judgeReport?.winnerReason || 'Evaluated artistic accuracy'}`);
      console.log(`⏱️ Latency: ${(data.totalLatencyMs / 1000).toFixed(1)}s`);
      
      data.models.forEach(m => {
        const hasSvg = m.response?.includes('<svg');
        console.log(`   * ${m.modelId}: ${hasSvg ? '✅ Valid SVG markup returned' : '⚠️ No raw SVG detected'} (${(m.latencyMs/1000).toFixed(1)}s, ${Math.round(m.tokensPerSec)} tok/s)`);
      });
    }
  } catch (err) {
    console.error('Execution error:', err.message);
  }
}

runDafoeBenchmark();
