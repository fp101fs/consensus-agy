const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) envVars[match[1].trim()] = match[2].trim();
});

const OPENROUTER_API_KEY = envVars.OPENROUTER_API_KEY;

// 9 Untested Free Models (Group Gamma)
const UNTESTED_FREE_9 = [
  'google/gemma-4-31b-it:free',
  'nvidia/nemotron-3-ultra-550b-a55b:free',
  'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
  'nvidia/nemotron-nano-12b-v2-vl:free',
  'nvidia/nemotron-nano-9b-v2:free',
  'cohere/north-mini-code:free',
  'dots-studio/dots-3-note-preview:free',
  'nvidia/nemotron-3.5-content-safety:free',
  'openrouter/free'
];

// Target Benchmark Puzzle: Einstein's Riddle / Zebra Puzzle
const PUZZLE_PROMPT = `There are 5 houses in a row, each painted a different color. In each house lives a person of a different nationality. Each owner drinks a certain beverage, smokes a certain brand of cigar, and keeps a certain pet. No two owners have the same pet, smoke the same cigar, or drink the same beverage.

Clues:
1. The Brit lives in the red house.
2. The Swede keeps dogs as pets.
3. The Dane drinks tea.
4. The green house is immediately to the left of the white house.
5. The green house's owner drinks coffee.
6. The person who smokes Pall Mall rears birds.
7. The owner of the yellow house smokes Dunhill.
8. The man living in the center house drinks milk.
9. The Norwegian lives in the first house.
10. The man who smokes Blends lives next to the one who keeps cats.
11. The man who keeps horses lives next to the man who smokes Dunhill.
12. The owner who smokes BlueMaster drinks beer.
13. The German smokes Prince.
14. The Norwegian lives next to the blue house.
15. The man who smokes Blends has a neighbor who drinks water.

Question: Who owns the fish? Determine: (1) Answer, (2) Brief reasoning, (3) Confidence 0-100%, (4) Whether clues guarantee a unique answer.`;

async function runUntestedFreeGroup() {
  console.log('================================================================');
  console.log('🚀 Executing 9 Untested Free Models on Einstein\'s Zebra Puzzle');
  console.log('================================================================');
  console.log('Models (' + UNTESTED_FREE_9.length + '):');
  UNTESTED_FREE_9.forEach(m => console.log(' - ' + m));

  // Run in triads of 3
  for (let i = 0; i < UNTESTED_FREE_9.length; i += 3) {
    const triad = UNTESTED_FREE_9.slice(i, i + 3);
    console.log(`\n-> Running Triad: [${triad.join(', ')}]`);

    try {
      const res = await fetch('http://localhost:3000/api/consensus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`
        },
        body: JSON.stringify({
          prompt: PUZZLE_PROMPT,
          models: triad,
          judgeModel: 'google/gemini-2.5-flash',
          saveToDb: true
        })
      });

      if (!res.ok) {
        const err = await res.text();
        console.warn(`   ⚠️ Triad error (${res.status}):`, err.slice(0, 200));
      } else {
        const data = await res.json();
        console.log(`   ✅ Winner: ${data.judgeReport?.winnerModelId || 'N/A'}`);
        console.log(`   📊 Solvability: ${data.judgeReport?.problemSolvability}`);
        console.log(`   ⏱️ Latency: ${(data.totalLatencyMs / 1000).toFixed(1)}s`);
        if (data.models) {
          data.models.forEach(m => {
            console.log(`      * ${m.modelId}: ${m.status} | ${m.tokensPerSec || 0} tok/s | ${m.totalTokens || 0} tok`);
          });
        }
      }
    } catch (err) {
      console.error('   ❌ Triad execution failed:', err.message);
    }

    await new Promise(r => setTimeout(r, 2000));
  }

  console.log('\n✨ All 9 untested free models evaluated successfully!');
}

runUntestedFreeGroup();
