# Changelog

All notable changes to the **Consensus Arena** project are documented in this file.

## [1.2.0] - 2026-08-20

### Added
- **Batch Evaluation of All Benchmark Presets**: Executed test runs across all logic puzzles (Einstein's Riddle, Scheduling, Knights & Knaves, Boolos, River Crossing, etc.) against active `:free` OpenRouter models.
- **Fingerprinted Benchmark IDs (`benchmarkId`)**: Automated identification and grouping of preset benchmarks and unique custom query hashes for fine-grained statistical aggregation.
- **Head-to-Head Puzzle Breakdown on `/rankings`**: Added interactive "By Puzzle Benchmark" view tab to inspect win rates, average reasoning scores, and token throughput on individual logic puzzles.
- **Comprehensive Documentation**: Added `/how` methodology page, detailed `README.md`, and `CHANGELOG.md`.

---

## [1.1.0] - 2026-08-20

### Added
- **Programmatic REST API (`POST /api/consensus`)**: Headless endpoint allowing automated batch runs with custom model sets, prompts, and database persistence.
- **4-Part Metacognitive Protocol**: Enforces structured 4-dimensional answers across all models (Answer, Proof, Epistemic Confidence 0-100%, and Solution Uniqueness Guarantee).
- **Epistemic Calibration & Solvability Auditing**: Judge AI detects overconfident hallucinations on impossible or underdetermined problems.
- **Curated Logic Benchmark Presets Library & Modal**: 12 pre-configured benchmarks covering constraint satisfaction, counterfactuals, false premise detection, and multi-hop reasoning.
- **Database Persistence with Neon PostgreSQL**: Configured connection pooling and indexed tables for `consensus_queries` and `model_runs`.
- **Analytics & Cost Pages**:
  - `/usage`: Per-prompt token in/out breakdown and dollar costs with circular gauge navbar widget.
  - `/rankings`: Global Win % leaderboard with podium and multi-metric sorting.
  - `/history`: Searchable chronological transcript of past consensus queries.
- **Live Panel Controls**: Centered animated "Running..." spinner, "Done" checkmarks, individual and global cancellation buttons, and individual tokens/sec speed readouts.

---

## [1.0.0] - 2026-08-20

### Added
- **Initial MVP Release**:
  - Next.js 16 App Router application with Tailwind CSS and TypeScript.
  - Side-by-side 3-column parallel LLM comparison arena with Server-Sent Events (SSE) streaming.
  - Supreme Judge AI arbiter powered by Perplexity Sonar / GPT-4o with real-time web verification and cited references.
  - Dynamic OpenRouter catalog integration (`GET /api/models`) with searchable model picker.
  - Automated OpenRouter upstream provider routing and 429 rate-limit fallback.
