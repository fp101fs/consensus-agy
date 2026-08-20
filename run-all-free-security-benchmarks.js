const fs = require('fs');
const { BENCHMARK_PRESET_PROMPTS } = require('./src/lib/presets');

const envContent = fs.readFileSync('.env.local', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) envVars[match[1].trim()] = match[2].trim();
});

const OPENROUTER_API_KEY = envVars.OPENROUTER_API_KEY;

// 5 Security Benchmarks
const SECURITY_PRESETS = [
  'benchmark-sec-sql-injection-audit',
  'benchmark-sec-race-condition-transfer',
  'benchmark-sec-jwt-validation-bypass',
  'benchmark-sec-ssrf-url-validator',
  'benchmark-sec-idor-authorization-matrix'
];

// Curated Triads of Free Models for Testing
const FREE_TRIADS = [
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
  ]
];

async function runSecurityBenchmarks() {
  console.log('================================================================');
  console.log('🛡️ Starting Automated Benchmark Run: 5 Security Prompts on Free Models');
  console.log('================================================================');

  const selectedPresets = BENCHMARK_PRESET_PROMPTS.filter(p => SECURITY_PRESETS.includes(p.id));
  console.log(`Loaded ${selectedPresets.length} Security benchmark prompts.\n`);

  for (let pIdx = 0; pIdx < selectedPresets.length; pIdx++) {
    const preset = selectedPresets[pIdx];
    console.log(`======================================================`);
    console.log(`[${pIdx + 1}/${selectedPresets.length}] Running Security Benchmark: "${preset.title}" (${preset.id})`);
    console.log(`Category: ${preset.category} | Tags: ${preset.tags.join(', ')}`);
    console.log(`======================================================`);

    for (const triad of FREE_TRIADS) {
      console.log(`  -> Testing triad: ${triad.join(', ')}`);

      try {
        const res = await fetch('http://localhost:3000/api/consensus', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`
          },
          body: JSON.stringify({
            prompt: preset.prompt,
            models: triad,
            judgeModel: 'google/gemini-2.5-flash',
            saveToDb: true
          })
        });

        if (!res.ok) {
          const errText = await res.text();
          console.warn(`    ⚠️ Triad warning (${res.status}): ${errText.slice(0, 150)}`);
        } else {
          const data = await res.json();
          console.log(`    ✅ Winner: ${data.judgeReport?.winnerModelId || 'Split decision'}`);
          console.log(`    📊 Solvability: ${data.judgeReport?.problemSolvability || 'N/A'}`);
          console.log(`    ⏱️ Total Time: ${(data.totalLatencyMs / 1000).toFixed(1)}s`);
        }
      } catch (err) {
        console.error(`    ❌ Request failed: ${err.message}`);
      }

      await new Promise(r => setTimeout(r, 2000));
    }
    console.log('');
  }

  console.log('🎉 ALL 5 SECURITY BENCHMARKS COMPLETED ACROSS FREE MODELS!');
}

runSecurityBenchmarks();
