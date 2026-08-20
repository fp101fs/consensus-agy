# Consensus Arena (Next.js & OpenRouter MVP)

A multi-model LLM consensus, benchmarking, and arbitration platform built with Next.js App Router, Tailwind CSS, Neon PostgreSQL, and OpenRouter.

## Key Capabilities

1. **Parallel 3-Column LLM Execution**:
   - Dispatches a single prompt simultaneously to 3 independent models.
   - Dynamic searchable model picker supporting hundreds of live OpenRouter endpoints.

2. **Metacognitive 4-Part Benchmark Protocol**:
   - Evaluates models on: (1) Answer, (2) Step-by-Step Proof, (3) Epistemic Confidence (0-100%), and (4) Solution Uniqueness Recognition (detecting underdetermined and false-premise impossible problems).

3. **Supreme Judge AI Arbitrator**:
   - Powered by Perplexity Sonar / GPT-4o to synthesize the unified ground-truth answer, verify factual claims with online citations, and grade model accuracy & calibration.

4. **Leaderboard & Analytics Dashboard**:
   - `/rankings`: Real-time Win % leaderboard tracking model win rates, average accuracy, generation speeds (tok/s), and overall scores.
   - `/usage`: Token in/out and exact dollar spend per prompt with a circular gauge widget in the navbar.
   - `/history`: Searchable chronological log of all past consensus runs.
   - `/how`: Interactive methodology and architecture guide.

5. **Programmatic REST API (`POST /api/consensus`)**:
   - Trigger runs headlessly from scripts, CLI, or backend workflows.

---

## Programmatic API Usage

### Endpoint: `POST /api/consensus`

Trigger a full multi-model consensus debate and judge evaluation via a single HTTP request.

#### Request Headers:
```http
Content-Type: application/json
Authorization: Bearer <OPENROUTER_API_KEY>  (optional if set in env)
```

#### Request Body:
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

#### Example cURL:
```bash
curl -X POST http://localhost:3000/api/consensus \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENROUTER_API_KEY" \
  -d '{
    "prompt": "Determine if there is a unique integer solution for x+y+z=15 and x*y*z=120.",
    "models": ["openai/gpt-4o", "anthropic/claude-sonnet-4.5", "google/gemini-2.5-flash"],
    "judgeModel": "perplexity/sonar-reasoning-pro"
  }'
```

#### Response Structure:
```json
{
  "success": true,
  "queryId": "6f42621c-a17e-4625-bd45-b3ff9f5f24af",
  "prompt": "...",
  "totalLatencyMs": 4200,
  "models": [
    {
      "modelId": "openai/gpt-4o",
      "modelName": "openai/gpt-4o",
      "response": "1. Answer: ...\n2. Reasoning: ...\n3. Confidence: 95%\n4. Uniqueness: ...",
      "status": "completed",
      "latencyMs": 1820,
      "promptTokens": 120,
      "completionTokens": 310,
      "totalTokens": 430,
      "costUsd": 0.0034,
      "tokensPerSec": 170.3
    }
  ],
  "judgeReport": {
    "synthesis": "Unified ground truth...",
    "verdictSummary": "Executive verdict...",
    "agreementLevel": "High Consensus",
    "agreementScore": 95,
    "problemSolvability": "Underdetermined (Multiple Solutions)",
    "winnerModelId": "anthropic/claude-sonnet-4.5",
    "winnerReason": "Correctly identified multiple valid integer triples rather than asserting a false unique answer.",
    "evaluations": [
      {
        "modelId": "anthropic/claude-sonnet-4.5",
        "accuracyScore": 98,
        "completenessScore": 95,
        "reasoningScore": 96,
        "overallScore": 96,
        "metaCognition": {
          "claimedConfidence": 95,
          "confidenceAppropriateness": "Well-Calibrated",
          "uniquenessRecognition": "Correctly Identified Non-Unique",
          "epistemicVerdict": "Recognized underdetermined degrees of freedom."
        }
      }
    ]
  }
}
```

---

## Local Development

1. Set up `.env.local`:
```bash
OPENROUTER_API_KEY=your_key_here
DATABASE_URL=postgresql://...
```

2. Run development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).
