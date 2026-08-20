const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) envVars[match[1].trim()] = match[2].trim();
});

const OPENROUTER_API_KEY = envVars.OPENROUTER_API_KEY;

// 4 Tom Gally SVG Prompts with full explicit SVG instructions
const TOM_GALLY_PROMPTS = [
  {
    id: 'benchmark-svg-octopus-pipe-organ',
    title: 'Tom Gally Set: Octopus Operating a Pipe Organ (SVG)',
    prompt: `Generate an SVG of an octopus operating a pipe organ. Output only valid SVG markup. Do not wrap the SVG in Markdown fences. Do not use external images, links, scripts, CSS imports, or remote assets. Use clean layered vector shapes, tentacles across the keyboards/pedals, organ pipes, gradients, and shading.`
  },
  {
    id: 'benchmark-svg-starfish-bulldozer',
    title: 'Tom Gally Set: Starfish Driving a Bulldozer (SVG)',
    prompt: `Generate an SVG of a starfish driving a bulldozer. Output only valid SVG markup. Do not wrap the SVG in Markdown fences. Do not use external images, links, scripts, CSS imports, or remote assets. Use clean vector shapes for the bulldozer tracks, blade, cabin, and a detailed starfish operating the controls.`
  },
  {
    id: 'benchmark-svg-butterfly-steam-engine',
    title: 'Tom Gally Set: Butterfly Inspecting a Steam Engine (SVG)',
    prompt: `Generate an SVG of a butterfly inspecting a steam engine. Output only valid SVG markup. Do not wrap the SVG in Markdown fences. Do not use external images, links, scripts, CSS imports, or remote assets. Feature intricate wing patterns contrasted against mechanical gears, pistons, boiler, and steam pipes.`
  },
  {
    id: 'benchmark-svg-sloth-excavator',
    title: 'Tom Gally Set: Sloth Steering an Excavator (SVG)',
    prompt: `Generate an SVG of a sloth steering an excavator. Output only valid SVG markup. Do not wrap the SVG in Markdown fences. Do not use external images, links, scripts, CSS imports, or remote assets. Include detailed construction excavator boom, tracks, cabin, and a relaxed sloth holding the control levers.`
  }
];

// Curated Triads of Free Models for testing
const FREE_TRIADS = [
  ['liquid/lfm-2.5-2.6b:free', 'nvidia/nemotron-3.5-lightning:free', 'poolside/laguna-s-2.1:free'],
  ['nvidia/nemotron-3-super-120b-a12b:free', 'nvidia/nemotron-3-nano-30b-a3b:free', 'z-ai/glm-5.2:free'],
  ['google/gemma-4-31b-it:free', 'nvidia/nemotron-3-ultra-550b-a55b:free', 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free'],
  ['nvidia/nemotron-nano-12b-v2-vl:free', 'nvidia/nemotron-nano-9b-v2:free', 'cohere/north-mini-code:free']
];

async function runTomGallySvg() {
  console.log('================================================================');
  console.log('🎨 Re-running Tom Gally Set with Explicit SVG Generation Prompts');
  console.log('================================================================');

  for (let i = 0; i < TOM_GALLY_PROMPTS.length; i++) {
    const item = TOM_GALLY_PROMPTS[i];
    const triad = FREE_TRIADS[i % FREE_TRIADS.length];

    console.log(`\n======================================================`);
    console.log(`[${i + 1}/${TOM_GALLY_PROMPTS.length}] Prompt: "${item.title}"`);
    console.log(`Triad: ${triad.join(', ')}`);
    console.log(`======================================================`);

    try {
      const res = await fetch('http://localhost:3000/api/consensus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`
        },
        body: JSON.stringify({
          prompt: item.prompt,
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
        console.log(`⏱️ Total Time: ${(data.totalLatencyMs / 1000).toFixed(1)}s`);

        data.models?.forEach(m => {
          const hasSvg = m.response && m.response.includes('<svg');
          console.log(`   * ${m.modelId}: ${hasSvg ? '✅ Valid SVG' : '⚠️ No SVG'} (${(m.latencyMs/1000).toFixed(1)}s, ${Math.round(m.tokensPerSec)} tok/s)`);
        });
      }
    } catch (err) {
      console.error(`❌ Request failed: ${err.message}`);
    }

    await new Promise(r => setTimeout(r, 2000));
  }

  console.log('\n================================================================');
  console.log('🎉 ALL TOM GALLY SVG BENCHMARKS COMPLETED AND STORED TO DATABASE!');
  console.log('================================================================');
}

runTomGallySvg();
