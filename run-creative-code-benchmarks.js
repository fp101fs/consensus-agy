const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) envVars[match[1].trim()] = match[2].trim();
});

const OPENROUTER_API_KEY = envVars.OPENROUTER_API_KEY;

// 3 New Creative Coding Benchmarks: p5.js, D3.js, HTML5 Canvas
const CODE_BENCHMARKS = [
  {
    id: 'benchmark-code-p5-generative-particles',
    title: 'p5.js Interactive Generative Art & Physics Simulation',
    prompt: `Write a standalone, complete, self-contained p5.js generative art sketch.
Requirements:
1. Create a 3D or 2D flow field with 500+ colorful glowing particles that follow a Perlin noise vector field.
2. Implement interactive mouse gravity or repulsion forces.
3. Use smooth color transitions based on particle speed or angle.
4. Provide the complete JavaScript code with setup() and draw() functions ready to run in an iframe or browser canvas.`
  },
  {
    id: 'benchmark-code-d3-interactive-dataviz',
    title: 'D3.js Custom Interactive Hierarchical Data Visualization',
    prompt: `Write a production-grade, complete standalone D3.js (v7) interactive data visualization.
Requirements:
1. Construct an interactive zoomable sunburst partition chart or force-directed network graph representing a sample dataset of 20+ nodes.
2. Implement smooth D3 transitions, hover tooltips showing node metrics, and zoom/pan SVG transforms.
3. Define linear/ordinal color scales and responsive SVG viewBox (800x600).
4. Provide the complete standalone JavaScript code using standard d3.select() and SVG join patterns.`
  },
  {
    id: 'benchmark-code-canvas-particle-physics',
    title: 'HTML5 Canvas API 2D Particle Engine & Collision Simulation',
    prompt: `Write a pure vanilla HTML5 Canvas 2D physics simulation with zero external libraries.
Requirements:
1. Implement a 60 FPS requestAnimationFrame loop with full canvas resize handling.
2. Simulate 100+ bouncing elastic particles with gravity, wind, boundary collision restitution, and mass-based momentum exchange.
3. Add a mouse-click particle fountain/firework explosion with alpha decay trails.
4. Provide the complete clean JavaScript code using native CanvasRenderingContext2D methods (ctx.arc, ctx.fillStyle, ctx.shadowBlur).`
  }
];

// 3 Triads of the Highest-Tested Models so far
const TOP_TIER_TRIADS = [
  // Triad 1: Frontier / Elite Reasoning
  [
    'google/gemini-3.7-flash',
    'openai/gpt-5.6-luna',
    'nvidia/nemotron-3-ultra-550b-a55b:free'
  ],
  // Triad 2: High Elo Champions
  [
    'nvidia/nemotron-3-super-120b-a12b:free',
    'liquid/lfm-2.5-2.6b:free',
    'nvidia/nemotron-3.5-lightning:free'
  ],
  // Triad 3: Specialized Geometry & Code
  [
    'poolside/laguna-xs-2.1:free',
    'nvidia/nemotron-3-nano-30b-a3b:free',
    'google/gemma-4-26b-a4b-it:free'
  ]
];

async function runCreativeCodeBenchmarks() {
  console.log('================================================================');
  console.log('⚡ Starting Creative Coding Benchmarks: p5.js, D3.js & HTML5 Canvas');
  console.log('================================================================');

  for (let bIdx = 0; bIdx < CODE_BENCHMARKS.length; bIdx++) {
    const bench = CODE_BENCHMARKS[bIdx];
    console.log(`\n======================================================`);
    console.log(`[Benchmark ${bIdx + 1}/3] ${bench.title} (${bench.id})`);
    console.log(`======================================================`);

    for (let tIdx = 0; tIdx < TOP_TIER_TRIADS.length; tIdx++) {
      const triad = TOP_TIER_TRIADS[tIdx];
      console.log(`  -> Running Triad ${tIdx + 1}/3: ${triad.join(', ')}`);

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
          console.warn(`    ⚠️ Triad warning (${res.status}): ${errText.slice(0, 150)}`);
        } else {
          const data = await res.json();
          console.log(`    ✅ Winner: ${data.judgeReport?.winnerModelId || 'Split Decision'}`);
          console.log(`    ⏱️ Time: ${(data.totalLatencyMs / 1000).toFixed(1)}s`);
        }
      } catch (err) {
        console.error(`    ❌ Request error: ${err.message}`);
      }

      await new Promise(r => setTimeout(r, 2000));
    }
  }

  console.log('\n================================================================');
  console.log('🎉 ALL p5.js, D3.js & HTML5 CANVAS BENCHMARKS COMPLETED!');
  console.log('================================================================');
}

runCreativeCodeBenchmarks();
