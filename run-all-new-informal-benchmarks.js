const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) envVars[match[1].trim()] = match[2].trim();
});

const OPENROUTER_API_KEY = envVars.OPENROUTER_API_KEY;

// 6 New Benchmarks with EXACT prompts
const NEW_BENCHMARKS = [
  {
    id: 'benchmark-svg-octopus-pipe-organ',
    title: 'Octopus Operating a Pipe Organ (SVG)',
    category: 'Creative Vector & SVG Bench',
    prompt: `an octopus operating a pipe organ`
  },
  {
    id: 'benchmark-svg-starfish-bulldozer',
    title: 'Starfish Driving a Bulldozer (SVG)',
    category: 'Creative Vector & SVG Bench',
    prompt: `a starfish driving a bulldozer`
  },
  {
    id: 'benchmark-svg-butterfly-steam-engine',
    title: 'Butterfly Inspecting a Steam Engine (SVG)',
    category: 'Creative Vector & SVG Bench',
    prompt: `a butterfly inspecting a steam engine`
  },
  {
    id: 'benchmark-svg-sloth-excavator',
    title: 'Sloth Steering an Excavator (SVG)',
    category: 'Creative Vector & SVG Bench',
    prompt: `a sloth steering an excavator`
  },
  {
    id: 'benchmark-tokenizer-strawberry-count',
    title: "How many r's are in strawberry?",
    category: 'Tokenizer & Character Counting',
    prompt: `How many r’s are in the word ‘strawberry’?`
  },
  {
    id: 'benchmark-tokenizer-elephant-e-count',
    title: "How many e's in elephant?",
    category: 'Tokenizer & Character Counting',
    prompt: `How many times does the letter ‘e’ appear in the word ‘elephant’?`
  }
];

// Curated Triads of Free Models to distribute across prompts
const FREE_BENCHMARK_TRIADS = [
  ['liquid/lfm-2.5-2.6b:free', 'nvidia/nemotron-3.5-lightning:free', 'poolside/laguna-s-2.1:free'],
  ['poolside/laguna-xs-2.1:free', 'openai/gpt-oss-20b:free', 'google/gemma-4-26b-a4b-it:free'],
  ['nvidia/nemotron-3-super-120b-a12b:free', 'nvidia/nemotron-3-nano-30b-a3b:free', 'z-ai/glm-5.2:free'],
  ['google/gemma-4-31b-it:free', 'nvidia/nemotron-3-ultra-550b-a55b:free', 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free'],
  ['nvidia/nemotron-nano-12b-v2-vl:free', 'nvidia/nemotron-nano-9b-v2:free', 'cohere/north-mini-code:free'],
  ['liquid/lfm-2.5-2.6b:free', 'openai/gpt-oss-20b:free', 'nvidia/nemotron-3-super-120b-a12b:free']
];

async function runNewBenchmarks() {
  console.log('================================================================');
  console.log('🚀 Running 6 New Informal Benchmarks (Tom Gally Set + Strawberry / Elephant)');
  console.log('================================================================');

  for (let i = 0; i < NEW_BENCHMARKS.length; i++) {
    const bench = NEW_BENCHMARKS[i];
    const triad = FREE_BENCHMARK_TRIADS[i % FREE_BENCHMARK_TRIADS.length];

    console.log(`\n======================================================`);
    console.log(`[${i + 1}/${NEW_BENCHMARKS.length}] Prompt: "${bench.prompt}"`);
    console.log(`Category: ${bench.category} | Triad: ${triad.join(', ')}`);
    console.log(`======================================================`);

    try {
      const res = await fetch('http://localhost:3000/api/consensus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`
        },
        body: JSON.stringify({
          prompt: bench.prompt,
          models: triad,
          judgeModel: 'google/gemini-2.5-flash',
          saveToDb: true
        })
      });

      if (!res.ok) {
        const errText = await res.text();
        console.warn(`⚠️ Warning (${res.status}): ${errText.slice(0, 150)}`);
      } else {
        const data = await res.json();
        console.log(`✅ Complete!`);
        console.log(`🏆 Winner: ${data.judgeReport?.winnerModelId || 'Split Decision'}`);
        console.log(`⏱️ Latency: ${(data.totalLatencyMs / 1000).toFixed(1)}s`);
        data.models?.forEach(m => {
          console.log(`   * ${m.modelId}: ${m.status} | ${(m.latencyMs/1000).toFixed(1)}s | ${Math.round(m.tokensPerSec)} tok/s`);
        });
      }
    } catch (err) {
      console.error(`❌ Request failed: ${err.message}`);
    }

    await new Promise(r => setTimeout(r, 2000));
  }

  console.log('\n================================================================');
  console.log('🎉 ALL 6 NEW INFORMAL BENCHMARKS COMPLETED ACROSS FREE MODELS!');
  console.log('================================================================');
}

runNewBenchmarks();
