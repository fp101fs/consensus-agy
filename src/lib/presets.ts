export interface PresetPrompt {
  id: string;
  title: string;
  category: string;
  difficulty: string; // e.g. "⭐⭐"
  tags: string[];
  description: string;
  prompt: string;
}

export const BENCHMARK_PRESET_PROMPTS: PresetPrompt[] = [
  {
    id: 'zebra-puzzle',
    title: "Einstein's Riddle / Zebra Puzzle",
    category: 'Constraint Satisfaction',
    difficulty: '⭐⭐⭐',
    tags: ['Constraint satisfaction', 'Grid deduction', 'Classic logic'],
    description: '5 houses, 5 colors, 5 nationalities, 5 pets, 5 drinks, 5 cigarettes. Tests complex multi-variable constraint elimination.',
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

Question: Who owns the fish? Provide the complete table for all 5 houses with proof step-by-step.`,
  },
  {
    id: 'scheduling-constraint',
    title: 'Scheduling / Constraint Problem',
    category: 'Constraint Reasoning',
    difficulty: '⭐⭐⭐',
    tags: ['Scheduling', 'Combinatorics', 'Conflict resolution'],
    description: "Determines the single valid 5-day shift schedule under competing operational rules and worker availability constraints.",
    prompt: `You must schedule 5 employees (Alice, Bob, Carol, Dave, Eve) for 5 consecutive shifts from Monday to Friday (exactly one employee per day).

Constraints:
1. Alice cannot work on Monday or Friday.
2. Bob must work on a day strictly after Carol's shift day.
3. Dave and Eve cannot work on adjacent consecutive days.
4. Eve must work on either Wednesday or Thursday.
5. Carol cannot work on Tuesday.
6. Alice and Dave must work exactly two days apart (i.e. |day(Alice) - day(Dave)| = 2).

Find all valid shift assignments from Monday to Friday, show why other candidates fail, and state the definitive valid schedule.`,
  },
  {
    id: 'knights-knaves',
    title: 'Knights & Knaves',
    category: 'Basic Deduction',
    difficulty: '⭐⭐',
    tags: ['Truth tellers', 'Propositional logic', 'Discrete math'],
    description: 'Evaluates straightforward logical deduction on an island where inhabitants either always tell the truth or always lie.',
    prompt: `On an island, every inhabitant is either a Knight (who always tells the truth) or a Knave (who always lies).
You meet three inhabitants: A, B, and C.
- A states: "All of us are Knaves."
- B states: "Exactly one of us is a Knight."
- C says nothing.

Determine the exact identities of A, B, and C with formal logical deduction.`,
  },
  {
    id: 'truth-liar-random',
    title: 'Truth / Liar / Random (Hardest Logic Puzzle)',
    category: 'Complex Deduction',
    difficulty: '⭐⭐⭐⭐',
    tags: ['Boolos puzzle', 'Complex deduction', 'Game theory'],
    description: 'Three gods A, B, and C are True, False, and Random in some order. Tests complex nested question strategies and truth-table mapping.',
    prompt: `Three gods A, B, and C are called (in some order) True, False, and Random. True always speaks truly, False always speaks falsely, but whether Random speaks truly or falsely is completely random.
You must determine the identities of A, B, and C by asking three yes-no questions; each question must be put to exactly one god.
The gods understand English, but will answer in their own language, in which the words for YES and NO are 'da' and 'ja', in some order. You do not know which word means which.

Provide a complete, sound question strategy that guarantees discovering the identity of each god.`,
  },
  {
    id: 'self-referential',
    title: 'Self-Referential Statements',
    category: 'Logical Consistency',
    difficulty: '⭐⭐⭐⭐⭐',
    tags: ['Gödel-like statements', 'Logical consistency', 'Meta-reasoning'],
    description: 'Tests resistance to paradoxical looping and ability to establish formal consistency across recursive propositions.',
    prompt: `Consider the following 5 numbered statements:
1. "Exactly one statement in this list is false."
2. "Exactly two statements in this list are false."
3. "Exactly three statements in this list are false."
4. "At least three statements in this list are true."
5. "Statement 1 and Statement 2 have opposite truth values."

Determine the truth value (True or False) of each of the 5 statements such that the entire system is logically consistent, or prove that no consistent assignment exists.`,
  },
  {
    id: 'murder-mystery',
    title: 'Murder Mystery Alibi Graph',
    category: 'Multi-hop Reasoning',
    difficulty: '⭐⭐⭐⭐',
    tags: ['Multi-hop reasoning', 'Timeline analysis', 'Elimination'],
    description: 'Tests temporal reasoning across alibis, witness testimonies, and physical room access windows.',
    prompt: `Lord Harrington was murdered in the library between 8:00 PM and 9:00 PM.
Suspects: Butler, Chef, Doctor, Maid.
Evidence & Statements:
1. The Doctor claims he was in the conservatory from 7:45 PM to 8:30 PM, then went to the billiard room.
2. The Maid was seen entering the kitchen at 8:15 PM and remained there with the Chef until 8:45 PM.
3. The Chef claims he never left the kitchen between 7:30 PM and 9:30 PM.
4. The Butler claims he was cleaning the dining room (which connects directly to the library) from 8:00 PM to 8:40 PM.
5. The broken watch on the victim stopped at 8:25 PM.
6. The Doctor’s footprint was found in the mud outside the library window; it was made while it was raining (it rained only between 8:20 PM and 8:35 PM).
7. Someone saw the Butler in the conservatory at 8:25 PM looking for the Doctor.

Who committed the murder, who lied on their alibi, and what is the exact timeline?`,
  },
  {
    id: 'counterfactual-puzzle',
    title: 'Counterfactual Puzzle',
    category: 'Hypothetical Reasoning',
    difficulty: '⭐⭐⭐⭐⭐',
    tags: ['Hypothetical reasoning', 'Counterfactuals', 'Branching logic'],
    description: 'Tests deep branch reasoning where conditions alter the rules of the environment and prior historical facts.',
    prompt: `Consider a tournament of 4 teams (A, B, C, D) playing single elimination.
Actual history:
- Semifinal 1: A beats B
- Semifinal 2: C beats D
- Final: A beats C to win the championship.

Hypothetical rule changes:
1. If team B had won Semifinal 1 instead, their star player would not have been injured, giving them a 75% win probability against anyone in the final.
2. In any match between B and C, C's coach always exploits B's defensive weakness, flipping the outcome so C wins 80% of the time.
3. In any match between B and D, B wins 90% of the time.
4. If D had beaten C in Semifinal 2, D would face whoever came out of Semifinal 1.

Under the counterfactual premise that "both semifinal results were reversed", who is the most probable champion and with what exact mathematical probability?`,
  },
  {
    id: 'impossible-puzzle',
    title: 'Impossible Puzzle (False Premise Detection)',
    category: 'Detecting False Premises',
    difficulty: '⭐⭐⭐⭐⭐',
    tags: ['False premise detection', 'Critical thinking', 'Hallucination test'],
    description: 'Tests if the LLM blindly generates an answer or correctly identifies that the problem contains a mathematical impossibility.',
    prompt: `A circle has a perimeter of 40 cm and an area of 200 cm².
A regular square is inscribed entirely inside this circle.
Calculate the exact diagonal length and area of the inscribed square.
Show all formulas and calculate the final numerical values.`,
  },
  {
    id: 'multiple-solution-puzzle',
    title: 'Multiple-Solution Ambiguity Puzzle',
    category: 'Avoiding Unjustified Certainty',
    difficulty: '⭐⭐⭐⭐⭐',
    tags: ['Avoiding unjustified certainty', 'Under-specified systems', 'Degrees of freedom'],
    description: 'Tests whether models arbitrarily hallucinate assumptions to force a single answer or correctly identify all degrees of freedom and multiple valid solutions.',
    prompt: `Three positive integers x, y, z satisfy:
x + y + z = 15
x * y * z = 120

Find x, y, and z. List all possible valid integer triples (up to permutation) and prove whether the solution is unique or if multiple distinct sets of values exist.`,
  },
  {
    id: 'nextjs-vs-remix',
    title: 'Next.js App Router vs Remix (SSR & Real-time)',
    category: 'Technical Architecture',
    difficulty: '⭐⭐⭐',
    tags: ['Technical architecture', 'Trade-offs', 'Frontend'],
    description: 'Compare architectural trade-offs, streaming, nested layouts, and server actions for enterprise real-time dashboards.',
    prompt: 'Compare Next.js App Router vs Remix for enterprise real-time dashboards with SSR. Highlight server actions, streaming rendering, caching models, and ecosystem lock-in.',
  },
  {
    id: 'nvidia-revenue',
    title: 'NVIDIA Q3 FY2025 Revenue & Growth Breakdown',
    category: 'Fact Verification',
    difficulty: '⭐⭐⭐',
    tags: ['Financial verification', 'Data extraction', 'Fact checking'],
    description: 'Verifies real financial disclosures, Data Center segment share, and compute growth metrics.',
    prompt: 'What was the exact revenue of NVIDIA in Q3 FY2025 and what drove the growth? Break down Data Center vs Gaming and gross margin figures.',
  },
  {
    id: 'pgvector-vs-pinecone',
    title: 'PostgreSQL pgvector vs Dedicated Vector DBs',
    category: 'Engineering Decisions',
    difficulty: '⭐⭐⭐',
    tags: ['Database architecture', 'Vector search', 'System design'],
    description: 'Evaluates architectural cost, latency at scale, indexing (HNSW vs IVFFlat), and ACID trade-offs.',
    prompt: 'Should an AI startup choose PostgreSQL with pgvector or a dedicated vector database (Pinecone/Qdrant) for 50M embeddings with metadata filtering? Compare costs, index build latency, and ACID operational overhead.',
  },
];
