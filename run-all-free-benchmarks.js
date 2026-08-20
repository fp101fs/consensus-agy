const fs = require('fs');

// Read .env.local for credentials
const envContent = fs.readFileSync('.env.local', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) envVars[match[1].trim()] = match[2].trim();
});

const OPENROUTER_API_KEY = envVars.OPENROUTER_API_KEY;

if (!OPENROUTER_API_KEY) {
  console.error('OPENROUTER_API_KEY missing in .env.local');
  process.exit(1);
}

// 10 Curated Logic Benchmarks
const PRESETS = [
  {
    id: "benchmark-zebra-puzzle",
    title: "Einstein's Riddle / Zebra Puzzle",
    prompt: `There are 5 houses in a row, each painted a different color. In each house lives a person of a different nationality. Each owner drinks a certain beverage, smokes a certain brand of cigar, and keeps a certain pet. No two owners have the same pet, smoke the same cigar, or drink the same beverage.
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
Question: Who owns the fish? Determine: (1) Answer, (2) Brief reasoning, (3) Confidence 0-100%, (4) Whether clues guarantee a unique answer.`
  },
  {
    id: "benchmark-scheduling-constraint",
    title: "Scheduling / Constraint Problem",
    prompt: `You must schedule 5 employees (Alice, Bob, Carol, Dave, Eve) for 5 consecutive shifts from Monday to Friday (exactly one employee per day).
Constraints:
1. Alice cannot work on Monday or Friday.
2. Bob must work on a day strictly after Carol's shift day.
3. Dave and Eve cannot work on adjacent consecutive days.
4. Eve must work on either Wednesday or Thursday.
5. Carol cannot work on Tuesday.
6. Alice and Dave must work exactly two days apart (i.e. |day(Alice) - day(Dave)| = 2).
Find the valid shift assignments. Determine: (1) Answer, (2) Brief reasoning, (3) Confidence 0-100%, (4) Whether clues guarantee a unique answer.`
  },
  {
    id: "benchmark-knights-knaves",
    title: "Knights & Knaves",
    prompt: `On an island, every inhabitant is either a Knight (who always tells the truth) or a Knave (who always lies).
You meet three inhabitants: A, B, and C.
- A states: "All of us are Knaves."
- B states: "Exactly one of us is a Knight."
- C says nothing.
Determine the identities of A, B, and C: (1) Answer, (2) Brief reasoning, (3) Confidence 0-100%, (4) Whether clues guarantee a unique answer.`
  },
  {
    id: "benchmark-river-crossing",
    title: "Wolf, Goat & Cabbage River Crossing",
    prompt: `Solve this logic puzzle: A farmer needs to cross a river with a wolf, a goat, and a cabbage. The boat can only carry the farmer and one item. If left alone, the wolf eats the goat, and the goat eats the cabbage. Determine: (1) Answer with exact step sequence, (2) Brief reasoning, (3) Confidence 0-100%, (4) Whether the clues guarantee a unique sequence.`
  },
  {
    id: "benchmark-truth-liar-random",
    title: "Truth / Liar / Random (Boolos Puzzle)",
    prompt: `Three gods A, B, and C are called (in some order) True, False, and Random. True always speaks truly, False always speaks falsely, but whether Random speaks truly or falsely is completely random.
You must determine the identities of A, B, and C by asking three yes-no questions; each question must be put to exactly one god.
The gods understand English, but will answer in their own language with 'da' and 'ja'. You do not know which word means which.
Provide the question strategy. Determine: (1) Answer, (2) Brief reasoning, (3) Confidence 0-100%, (4) Whether clues guarantee a unique answer.`
  },
  {
    id: "benchmark-self-referential",
    title: "Self-Referential Statements",
    prompt: `Consider the following 5 numbered statements:
1. "Exactly one statement in this list is false."
2. "Exactly two statements in this list are false."
3. "Exactly three statements in this list are false."
4. "At least three statements in this list are true."
5. "Statement 1 and Statement 2 have opposite truth values."
Determine the truth value of each statement: (1) Answer, (2) Brief reasoning, (3) Confidence 0-100%, (4) Whether clues guarantee a unique answer.`
  },
  {
    id: "benchmark-murder-mystery",
    title: "Murder Mystery Alibi Graph",
    prompt: `Lord Harrington was murdered in the library between 8:00 PM and 9:00 PM.
Suspects: Butler, Chef, Doctor, Maid.
Evidence & Statements:
1. The Doctor claims he was in the conservatory from 7:45 PM to 8:30 PM, then went to the billiard room.
2. The Maid was seen entering the kitchen at 8:15 PM and remained there with the Chef until 8:45 PM.
3. The Chef claims he never left the kitchen between 7:30 PM and 9:30 PM.
4. The Butler claims he was cleaning the dining room (which connects directly to the library) from 8:00 PM to 8:40 PM.
5. The broken watch on the victim stopped at 8:25 PM.
6. The Doctor’s footprint was found in the mud outside the library window (it rained only between 8:20 PM and 8:35 PM).
7. Someone saw the Butler in the conservatory at 8:25 PM looking for the Doctor.
Determine who committed the murder: (1) Answer, (2) Brief reasoning, (3) Confidence 0-100%, (4) Whether clues guarantee a unique answer.`
  },
  {
    id: "benchmark-counterfactual-puzzle",
    title: "Counterfactual Puzzle",
    prompt: `Consider a tournament of 4 teams (A, B, C, D) playing single elimination.
Actual history: Semifinal 1: A beats B; Semifinal 2: C beats D; Final: A beats C to win.
Hypothetical rules:
1. If B won Semifinal 1, their star player is not injured, giving them a 75% win probability against anyone in the final.
2. In any match between B and C, C wins 80% of the time.
3. In any match between B and D, B wins 90% of the time.
4. If D beat C in Semifinal 2, D faces whoever came out of Semifinal 1.
Under the counterfactual premise that "both semifinal results were reversed", who is the most probable champion and with what exact mathematical probability? (1) Answer, (2) Brief reasoning, (3) Confidence 0-100%, (4) Uniqueness guarantee.`
  },
  {
    id: "benchmark-impossible-puzzle",
    title: "Impossible Puzzle (False Premise Detection)",
    prompt: `A circle has a perimeter of 40 cm and an area of 200 cm².
A regular square is inscribed entirely inside this circle.
Calculate the exact diagonal length and area of the inscribed square.
Determine: (1) Answer, (2) Brief reasoning, (3) Confidence 0-100%, (4) Whether the given clues and premise are mathematically possible/unique.`
  },
  {
    id: "benchmark-multiple-solution-puzzle",
    title: "Multiple-Solution Ambiguity Puzzle",
    prompt: `Three positive integers x, y, z satisfy:
x + y + z = 15
x * y * z = 120
Find x, y, and z. List all possible valid integer triples and state whether the solution is unique or if multiple distinct sets of values exist. Determine: (1) Answer, (2) Brief reasoning, (3) Confidence 0-100%, (4) Uniqueness guarantee.`
  }
];

// All available text-capable :free models
const FREE_MODELS = [
  'liquid/lfm-2.5-2.6b:free',
  'nvidia/nemotron-3.5-lightning:free',
  'poolside/laguna-s-2.1:free',
  'poolside/laguna-xs-2.1:free',
  'openai/gpt-oss-20b:free',
  'google/gemma-4-26b-a4b-it:free',
  'nvidia/nemotron-3-super-120b-a12b:free',
  'nvidia/nemotron-3-nano-30b-a3b:free',
  'z-ai/glm-5.2:free',
  'dots-studio/dots-3-note-preview:free'
];

async function runBenchmarkBatch() {
  console.log(`Starting execution: ${PRESETS.length} presets across ${FREE_MODELS.length} free models...`);

  // To stay within OpenRouter rate limits cleanly, we chunk the models into triads per preset
  for (let i = 0; i < PRESETS.length; i++) {
    const preset = PRESETS[i];
    console.log(`\n======================================================`);
    console.log(`[${i + 1}/${PRESETS.length}] Running Benchmark: "${preset.title}"`);
    console.log(`======================================================`);

    // Chunk free models into groups of 3
    for (let j = 0; j < FREE_MODELS.length; j += 3) {
      const modelChunk = FREE_MODELS.slice(j, j + 3);
      if (modelChunk.length < 2) continue;

      console.log(`  -> Testing triad: ${modelChunk.join(', ')}`);

      try {
        const response = await fetch('http://localhost:3000/api/consensus', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`
          },
          body: JSON.stringify({
            prompt: preset.prompt,
            models: modelChunk,
            judgeModel: 'google/gemini-2.5-flash',
            saveToDb: true
          })
        });

        if (!response.ok) {
          const err = await response.text();
          console.warn(`    ⚠️ Batch error (${response.status}):`, err.slice(0, 150));
        } else {
          const result = await response.json();
          console.log(`    ✅ Winner: ${result.judgeReport?.winnerModelId || 'N/A'}`);
          console.log(`    📊 Solvability: ${result.judgeReport?.problemSolvability}`);
          console.log(`    ⏱️ Total Time: ${(result.totalLatencyMs / 1000).toFixed(1)}s`);
        }
      } catch (err) {
        console.error('    ❌ Request failed:', err.message);
      }

      // Small cooldown to prevent rate limiting
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  console.log('\n🎉 ALL PRE-MADE PROMPTS COMPLETED SUCCESSFULLY ACROSS FREE MODELS!');
}

runBenchmarkBatch();
