'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Scale,
  Brain,
  Search,
  CheckCircle2,
  AlertTriangle,
  Trophy,
  Zap,
  Sparkles,
  Layers,
  BarChart3,
  ShieldCheck,
  Cpu,
  Coins,
  History,
  BookOpen,
} from 'lucide-react';

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white px-3 py-1.5 rounded-xl border border-neutral-800 bg-neutral-900/60 hover:bg-neutral-800 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Arena</span>
            </Link>
            <h1 className="font-extrabold text-base text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span>How Consensus Works</span>
            </h1>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <Link
              href="/rankings"
              className="px-3 py-1.5 rounded-xl border border-neutral-800 bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-white transition"
            >
              Leaderboard
            </Link>
            <Link
              href="/usage"
              className="px-3 py-1.5 rounded-xl border border-neutral-800 bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-white transition"
            >
              Usage & Tokens
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-10 space-y-12">
        {/* Hero Section */}
        <section className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Multi-Model Arbitration Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            Why One LLM Hallucinates, But Three Deliver the Truth.
          </h2>
          <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">
            Single LLMs often produce subtly inaccurate data, fall for cognitive traps, or invent nonexistent facts with high confidence. Consensus runs <strong className="text-white">three independent models simultaneously</strong> and uses an adversarial <strong className="text-indigo-300">4th Judge AI</strong> with live web grounding to cross-verify claims, measure calibration, and synthesize definitive answers.
          </p>
        </section>

        {/* 4-Step Process Pipeline Diagram */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>The 4-Stage Execution Pipeline</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Step 1 */}
            <div className="p-5 rounded-3xl bg-neutral-900/60 border border-neutral-800 space-y-3 relative overflow-hidden backdrop-blur-sm">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h4 className="font-bold text-sm text-white">Parallel Fan-Out</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Your single prompt is dispatched simultaneously across 3 isolated, uninfluenced candidate models via streaming Server-Sent Events.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-5 rounded-3xl bg-neutral-900/60 border border-neutral-800 space-y-3 relative overflow-hidden backdrop-blur-sm">
              <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-500/40 text-sky-400 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h4 className="font-bold text-sm text-white">Metacognitive Protocol</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Each model is forced to output 4 dimensions: Answer, Step-by-Step Proof, Confidence Rating (0–100%), and Problem Solvability status.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-5 rounded-3xl bg-neutral-900/60 border border-neutral-800 space-y-3 relative overflow-hidden backdrop-blur-sm">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-400 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h4 className="font-bold text-sm text-white">Supreme Arbitration</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                When all 3 finish, a 4th Judge AI (Perplexity Sonar) fact-checks discrepancies against live online citations and analyzes logic gaps.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-5 rounded-3xl bg-neutral-900/60 border border-neutral-800 space-y-3 relative overflow-hidden backdrop-blur-sm">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold text-sm">
                4
              </div>
              <h4 className="font-bold text-sm text-white">Consensus & Scorecard</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Outputs an authoritative unified synthesis, quantified accuracy/reasoning scores, calibration flags, and logs the run to the database.
              </p>
            </div>
          </div>
        </section>

        {/* Detailed Methodology Cards */}
        <section className="space-y-6">
          <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
            <Brain className="w-4 h-4 text-indigo-400" />
            <span>Deep Methodology Breakdown</span>
          </h3>

          <div className="space-y-4">
            {/* 1. The 4-Part Metacognitive Protocol */}
            <div className="p-6 rounded-3xl bg-neutral-900/40 border border-neutral-800 space-y-3">
              <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                <span>1. The 4-Part Metacognitive Benchmark Protocol</span>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Rather than simply asking for answers, every candidate LLM is evaluated on:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3 bg-neutral-950 rounded-2xl border border-neutral-800">
                  <div className="font-semibold text-white mb-1">1. Direct Answer & Proof</div>
                  <p className="text-neutral-400 text-[11px]">
                    Provides clear answers and tests whether the step-by-step reasoning is sound and uncorrupted by deductive leaps.
                  </p>
                </div>
                <div className="p-3 bg-neutral-950 rounded-2xl border border-neutral-800">
                  <div className="font-semibold text-white mb-1">2. Epistemic Confidence (0–100%)</div>
                  <p className="text-neutral-400 text-[11px]">
                    Measures whether the model knows what it doesn't know, penalizing models that exhibit high confidence on flawed answers.
                  </p>
                </div>
                <div className="p-3 bg-neutral-950 rounded-2xl border border-neutral-800">
                  <div className="font-semibold text-white mb-1">3. Solution Uniqueness Recognition</div>
                  <p className="text-neutral-400 text-[11px]">
                    Tests whether the model identifies problems with multiple valid solutions or recognizes false/contradictory premises.
                  </p>
                </div>
                <div className="p-3 bg-neutral-950 rounded-2xl border border-neutral-800">
                  <div className="font-semibold text-white mb-1">4. Live Citations & Fact Grounding</div>
                  <p className="text-neutral-400 text-[11px]">
                    Resolves factual discrepancies using Perplexity Sonar search grounding to produce cited web references.
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Quantified Scoring & Calibration */}
            <div className="p-6 rounded-3xl bg-neutral-900/40 border border-neutral-800 space-y-3">
              <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
                <BarChart3 className="w-4 h-4 text-purple-400" />
                <span>2. Multi-Dimensional Scorecards & Calibration Auditing</span>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                The Judge model outputs structured JSON with quantified 0–100 scores across:
              </p>
              <ul className="space-y-1.5 text-xs text-neutral-400 list-disc list-inside">
                <li><strong className="text-neutral-200">Accuracy (0–100%)</strong>: Objective factual and mathematical correctness.</li>
                <li><strong className="text-neutral-200">Completeness (0–100%)</strong>: Coverage of edge cases, secondary clauses, and nuance.</li>
                <li><strong className="text-neutral-200">Reasoning (0–100%)</strong>: Structural rigor and validity of deduction chains.</li>
                <li><strong className="text-neutral-200">Calibration Flag</strong>: Tagged as <em>Well-Calibrated</em>, <em>Overconfident</em>, or <em>Underconfident</em>.</li>
              </ul>
            </div>

            {/* 3. The Power of OpenRouter Dynamic Catalog */}
            <div className="p-6 rounded-3xl bg-neutral-900/40 border border-neutral-800 space-y-3">
              <div className="flex items-center gap-2 text-sky-300 font-bold text-sm">
                <Cpu className="w-4 h-4 text-sky-400" />
                <span>3. Live OpenRouter Routing & Upstream Fallback</span>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Consensus fetches the live catalog directly from OpenRouter, letting you pit OpenAI GPT-4o, Anthropic Claude 3.5/4.5 Sonnet, Google Gemini, DeepSeek R1, Llama 3.3, and custom models against each other. If an upstream provider rate-limits (HTTP 429), the system automatically routes to secondary provider endpoints.
              </p>
            </div>
          </div>
        </section>

        {/* Call to action */}
        <section className="p-8 rounded-3xl bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-neutral-900 border border-indigo-500/30 text-center space-y-4">
          <h3 className="text-xl font-bold text-white">Ready to test model consensus?</h3>
          <p className="text-xs text-neutral-300 max-w-md mx-auto">
            Choose from logic puzzles, constraint scheduling, or ask your own hard technical questions.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/"
              className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition"
            >
              Go to Consensus Arena
            </Link>
            <Link
              href="/rankings"
              className="px-5 py-2.5 rounded-2xl border border-neutral-700 bg-neutral-900/80 hover:bg-neutral-800 text-white text-xs font-semibold transition"
            >
              View Leaderboard
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-900 bg-neutral-950 py-6 text-center text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>Consensus AI • Methodology & Architecture</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-neutral-400">
            <Link href="/" className="hover:text-white transition">Arena</Link>
            <Link href="/rankings" className="hover:text-white transition">Rankings</Link>
            <Link href="/usage" className="hover:text-white transition">Usage</Link>
            <Link href="/history" className="hover:text-white transition">History</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
