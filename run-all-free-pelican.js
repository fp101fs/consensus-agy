const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) envVars[match[1].trim()] = match[2].trim();
});

const OPENROUTER_API_KEY = envVars.OPENROUTER_API_KEY;

const PELICAN_PROMPT = `Generate an SVG of a pelican riding a bicycle. Output only valid SVG markup. Do not wrap the SVG in Markdown fences. Do not use external images, links, scripts, CSS imports, or remote assets. Use a clean, vibrant illustration style with layered vector shapes, wheels, frame, pedals, handlebars, pelican beak/pouch, feathers, and feet.`;

// All Available :free Models Grouped into Triads
const ALL_FREE_TRIADS = [
  [
    'liquid/lfm-2.5-2.6b:free',
    'nvidia/nemotron-3.5-lightning:free',
    'poolside/laguna-s-2.1:free'
  ],
  [
    'poolside/laguna-xs-2.1:free',
    'openai/gpt-oss-20b:free',
    'google/gemma-4-26b-a4b-it:free'
  ],
  [
    'nvidia/nemotron-3-super-120b-a12b:free',
    'nvidia/nemotron-3-nano-30b-a3b:free',
    'z-ai/glm-5.2:free'
  ],
  [
    'google/gemma-4-31b-it:free',
    'nvidia/nemotron-3-ultra-550b-a55b:free',
    'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free'
  ],
  [
    'nvidia/nemotron-nano-12b-v2-vl:free',
    'nvidia/nemotron-nano-9b-v2:free',
    'cohere/north-mini-code:free'
  ]
];

async function runAllFreePelican() {
  console.log('================================================================');
  console.log('🚲 Starting "Pelican Riding a Bicycle" SVG Benchmark Across ALL Free Models');
  console.log('================================================================');

  for (let i = 0; i < ALL_FREE_TRIADS.length; i++) {
    const triad = ALL_FREE_TRIADS[i];
    console.log(`\n------------------------------------------------------------`);
    console.log(`[Triad ${i + 1}/${ALL_FREE_TRIADS.length}] Testing models:`);
    triad.forEach(m => console.log(` - ${m}`));
    console.log(`------------------------------------------------------------`);

    try {
      const res = await fetch('http://localhost:3000/api/consensus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`
        },
        body: JSON.stringify({
          prompt: PELICAN_PROMPT,
          models: triad,
          judgeModel: 'google/gemini-2.5-flash',
          saveToDb: true
        })
      });

      if (!res.ok) {
        const errText = await res.text();
        console.warn(`⚠️ Triad ${i + 1} warning (${res.status}): ${errText.slice(0, 150)}`);
      } else {
        const data = await res.json();
        console.log(`✅ Triad ${i + 1} Complete!`);
        console.log(`🏆 Winning Model: ${data.judgeReport?.winnerModelId || 'Split Decision'}`);
        console.log(`⏱️ Latency: ${(data.totalLatencyMs / 1000).toFixed(1)}s`);

        data.models?.forEach(m => {
          const hasSvg = m.response && m.response.includes('<svg');
          console.log(`   * ${m.modelId}: ${hasSvg ? '✅ Valid SVG markup' : '⚠️ No raw SVG detected'} (${(m.latencyMs / 1000).toFixed(1)}s, ${Math.round(m.tokensPerSec)} tok/s)`);
        });
      }
    } catch (err) {
      console.error(`❌ Triad ${i + 1} error:`, err.message);
    }

    await new Promise(r => setTimeout(r, 2000));
  }

  console.log('\n================================================================');
  console.log('🎉 ALL FREE MODELS FINISHED THE PELICAN BICYCLE SVG BENCHMARK!');
  console.log('================================================================');
}

runAllFreePelican();
