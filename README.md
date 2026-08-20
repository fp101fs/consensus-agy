# Consensus Arena (Next.js MVP)

A side-by-side LLM consensus and arbitration platform built with Next.js, Tailwind CSS, and OpenRouter.

## Key Features

1. **Simultaneous 3-Column LLM Execution**:
   - The user inputs 1 prompt, which is concurrently streamed to 3 leading LLMs (defaults: **GPT-4o**, **Claude 3.5 Sonnet**, and **Gemini 2.0 Flash**).
   - Dynamic model selectors per column allow switching to DeepSeek R1, Llama 3.3 70B, Mistral Large, etc.

2. **Supreme Judge AI Arbitrator & Fact-Checker**:
   - Once all 3 models finish, a 4th Judge AI (powered by **Perplexity Sonar Reasoning Pro** / GPT-4o) reviews the responses.
   - Evaluates factual accuracy, completeness, and reasoning scores (0-100).
   - Synthesizes a unified ground-truth answer.
   - Highlights points of consensus, flags errors/hallucinations, and cites verified references.

3. **Color-Coded Verdict & Scorecard**:
   - Visual consensus ratings (*High Consensus*, *Moderate Divergence*, *Sharp Disagreement*).
   - Model scorecard table with accuracy, completeness, and reasoning breakdowns.
   - Highlighted winning model card with objective justifications.

4. **Configurable via OpenRouter**:
   - Works directly with Vercel environment variables (`OPENROUTER_API_KEY`) or client settings modal.

## Getting Started

### 1. Environment Setup

Create `.env.local` or set in Vercel:

```bash
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

### 2. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
