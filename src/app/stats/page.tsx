'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Scale,
  Brain,
  Trophy,
  Zap,
  Sparkles,
  ShieldCheck,
  HelpCircle,
  BarChart3,
  TrendingUp,
  Coins,
  Gauge,
  CheckCircle2,
} from 'lucide-react';

export default function StatisticsGuidePage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/rankings"
              className="flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white px-3 py-1.5 rounded-xl border border-neutral-800 bg-neutral-900/60 hover:bg-neutral-800 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Rankings</span>
            </Link>
            <h1 className="font-extrabold text-base text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-amber-400" />
              <span>How Rankings Are Calculated</span>
            </h1>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <Link
              href="/"
              className="px-3 py-1.5 rounded-xl border border-neutral-800 bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-white transition"
            >
              Arena
            </Link>
            <Link
              href="/how"
              className="px-3 py-1.5 rounded-xl border border-neutral-800 bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-white transition"
            >
              How It Works
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-10 space-y-12">
        {/* Intro */}
        <section className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Plain English Math Guide</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            How We Rank AI Models Fairly
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-xl mx-auto">
            Winning one game does not make a champion.
            We use chess math and quality checks.
          </p>
        </section>

        {/* The 1/1 vs 3/5 Problem */}
        <section className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800 space-y-3">
          <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
            <Brain className="w-4 h-4 text-amber-400" />
            <span>The Big Problem with Simple Win Rates</span>
          </h3>
          <p className="text-xs text-neutral-300">
            Imagine Model A plays 1 game and wins.
            Its win rate is 100%.
          </p>
          <p className="text-xs text-neutral-300">
            Model B plays 10 games and wins 8.
            Its win rate is 80%.
          </p>
          <p className="text-xs text-amber-300 font-semibold">
            Is Model A better than Model B? No.
            One lucky win does not prove mastery.
          </p>
        </section>

        {/* Section 1: Elo Rating (Bradley-Terry) */}
        <section id="elo-bt" className="p-6 rounded-3xl bg-neutral-900/40 border border-neutral-800 space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Trophy className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white">1. Elo Rating (Bradley–Terry)</h3>
          </div>

          <div className="space-y-2 text-xs text-neutral-300">
            <p><strong>What it is:</strong> A chess rating system for AI models.</p>
            <p><strong>The simple idea:</strong> Beating strong models awards more points. Beating weak models gives fewer points.</p>
            <p><strong>Base Score:</strong> Every model starts at 1500 Elo.</p>
            <p><strong>Math used:</strong> Pairwise Bradley–Terry Maximum Likelihood estimation.</p>
          </div>

          <div className="p-3 bg-neutral-950 rounded-2xl border border-neutral-800 text-xs space-y-1">
            <div className="font-semibold text-amber-400">Confidence Interval: CI [Lower - Upper]</div>
            <p className="text-neutral-400 text-[11px]">
              This is the statistical error range.
              More tests make this range narrower.
            </p>
          </div>
        </section>

        {/* Section 2: Composite Score */}
        <section id="composite-score" className="p-6 rounded-3xl bg-neutral-900/40 border border-neutral-800 space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white">2. Composite Score (0 to 100)</h3>
          </div>

          <p className="text-xs text-neutral-300">
            A single holistic score combining three pillars:
          </p>

          <ul className="space-y-2 text-xs text-neutral-300 list-disc list-inside">
            <li><strong>45% Head-to-Head Strength:</strong> Bradley-Terry Elo score against rivals.</li>
            <li><strong>35% Answer Quality:</strong> Accuracy, reasoning, and completeness.</li>
            <li><strong>20% Practicality:</strong> Generation speed and cost efficiency.</li>
          </ul>

          <div className="p-3 bg-neutral-950 rounded-2xl border border-neutral-800 text-xs">
            <p className="text-neutral-400 text-[11px]">
              Models with higher composite scores offer the best overall balance.
            </p>
          </div>
        </section>

        {/* Section 3: Win Rate & Wins / Runs */}
        <section id="win-rate" className="p-6 rounded-3xl bg-neutral-900/40 border border-neutral-800 space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white">3. Win Rate % & Wins / Runs</h3>
          </div>

          <div className="space-y-2 text-xs text-neutral-300">
            <p><strong>Wins / Runs:</strong> Total first-place finishes out of total rounds played.</p>
            <p><strong>Win Rate %:</strong> Calculated as: <code>(Total Wins / Total Runs) × 100</code>.</p>
            <p>We display this as a clean integer with no confusing decimals.</p>
          </div>
        </section>

        {/* Section 4: Accuracy & Reasoning Quality */}
        <section id="accuracy" className="p-6 rounded-3xl bg-neutral-900/40 border border-neutral-800 space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white">4. Accuracy & Reasoning Scores</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-neutral-950 rounded-2xl border border-neutral-800">
              <div className="font-semibold text-emerald-400 mb-1">Accuracy (0–100%)</div>
              <p className="text-neutral-400 text-[11px]">
                Audited by Judge AI.
                Measures whether the final mathematical or factual answer is true.
              </p>
            </div>
            <div className="p-3 bg-neutral-950 rounded-2xl border border-neutral-800">
              <div className="font-semibold text-purple-400 mb-1">Reasoning (0–100%)</div>
              <p className="text-neutral-400 text-[11px]">
                Checks step-by-step logic.
                Penalizes unearned guesses and logical flaws.
              </p>
            </div>
          </div>
        </section>

        {/* Section 5: Speed & Tokens per Second */}
        <section id="speed" className="p-6 rounded-3xl bg-neutral-900/40 border border-neutral-800 space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Gauge className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white">5. Speed (Tokens per Second)</h3>
          </div>

          <div className="space-y-2 text-xs text-neutral-300">
            <p><strong>Calculation:</strong> <code>Completion Tokens / Time in Seconds</code>.</p>
            <p>Measures how fast the model generates its response text.</p>
            <p>We sanitize against broken upstream reports to keep numbers accurate.</p>
          </div>
        </section>

        {/* Section 6: Status Tiers & Provisional Flags */}
        <section id="status-tiers" className="p-6 rounded-3xl bg-neutral-900/40 border border-neutral-800 space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white">6. Status Tiers & Provisional Flags</h3>
          </div>

          <div className="space-y-3 text-xs text-neutral-300">
            <div className="p-3 bg-neutral-950 rounded-2xl border border-neutral-800">
              <div className="font-semibold text-amber-300">Provisional (n &lt; 3 runs)</div>
              <p className="text-neutral-400 text-[11px] mt-0.5">
                Models tested fewer than 3 times are labeled Provisional.
                We shrink their score toward average until they play more games.
              </p>
            </div>

            <div className="p-3 bg-neutral-950 rounded-2xl border border-neutral-800">
              <div className="font-semibold text-emerald-300">Established Tiers (S+, S, A, B, C)</div>
              <p className="text-neutral-400 text-[11px] mt-0.5">
                Assigned once a model has proven its consistency across multiple benchmarks.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center pt-4">
          <Link
            href="/rankings"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-lg transition"
          >
            <span>View Live Leaderboard</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
