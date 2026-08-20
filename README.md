# Consensus Arena

An advanced multi-model LLM benchmarking, arbitration, and consensus platform built with **Next.js 16 (App Router)**, **Tailwind CSS**, **Neon PostgreSQL**, and **OpenRouter**.

Pits multiple independent LLMs simultaneously against the same prompt, applies a rigorous 4-part metacognitive reasoning protocol, and uses a Supreme Judge AI with live web search grounding to synthesize the definitive truth, score model accuracy, and flag hallucinations or unjustified certainty.

---

## Key Features

1. **Simultaneous Multi-Model Comparison (3 Columns)**:
   - Dispatches a single prompt in parallel via Server-Sent Events (SSE) streaming.
   - Interactive searchable model picker querying hundreds of live OpenRouter endpoints.

2. **4-Part Metacognitive Benchmark Protocol**:
   - Enforces structured 4-dimensional answers across all models:
     1. **Answer**: Precise solution.
     2. **Reasoning**: Step-by-step logical proof.
     3. **Confidence Rating (0–100%)**: Epistemic certainty.
     4. **Uniqueness / Solvability**: Detects whether the problem has a *Guaranteed Unique Solution*, is *Underdetermined (Multiple Solutions)*, or is *Impossible (False Premise / Contradiction)*.

3. **Supreme Judge AI Arbitrator**:
   - Analyzes where models agree, catches deductive leaps, fact-checks claims using online search grounding (Perplexity Sonar / GPT-4o), and generates a unified consensus verdict.

4. **Curated Logic Benchmark Presets Library & Modal**:
   - Built-in benchmarks for Einstein's Riddle, Scheduling Constraints, Knights & Knaves, Boolos Hardest Logic Puzzle, Murder Mystery Alibis, False Premise Detection, Counterfactuals, and Multiple-Solution Ambiguity.

5. **Analytics & Performance Tracking (Neon PostgreSQL)**:
   - **`/rankings`**: Global Win % leaderboard + **"By Puzzle Benchmark"** head-to-head comparison breakdown.
   - **`/usage`**: Prompt-by-prompt token in/out breakdown and dollar costs with circular gauge widget in navbar.
   - **`/history`**: Searchable chronological logs of all past consensus runs.
   - **`/how`**: Methodology and architectural breakdown.

6. **Programmatic REST API (`POST /api/consensus`)**:
   - Run batch evaluations and benchmark experiments headlessly from scripts, CLI, or backend workflows.

---

## Programmatic API Reference

### `POST /api/consensus`

Run any custom prompt against any list of OpenRouter models with automated arbitration and database logging.

#### Request Headers:
```http
Content-Type: application/json
Authorization: Bearer <OPENROUTER_API_KEY>  (optional if set in environment)
```

#### Request Payload:
```json
{
  "prompt": "Solve this logic puzzle: Alice cannot work Monday, Bob must work after Carol...",
  "models": [
    "openai/gpt-4o",
    "anthropic/claude-sonnet-4.5",
    "google/gemini-2.5-flash"
  ],
  "judgeModel": "perplexity/sonar-reasoning-pro",
  "saveToDb": true
}
```

#### cURL Example:
```bash
curl -X POST https://your-domain.vercel.app/api/consensus \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENROUTER_API_KEY" \
  -d '{
    "prompt": "A farmer needs to cross a river with a wolf, a goat, and a cabbage...",
    "models": ["google/gemini-2.5-flash", "openai/gpt-4o-mini", "meta-llama/llama-3.3-70b-instruct"],
    "judgeModel": "google/gemini-2.5-flash",
    "saveToDb": true
  }'
```

---

## Getting Started

### 1. Prerequisites & Environment Setup

Create `.env.local` with your credentials:

```bash
# OpenRouter API Key
OPENROUTER_API_KEY=sk-or-v1-...

# Neon PostgreSQL Connection
DATABASE_URL=postgresql://user:password@ep-xyz.aws.neon.tech/neondb?sslmode=require
```

### 2. Install & Run

```bash
# Install dependencies
npm install

# Run local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
