'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ModelRanking, BenchmarkStats } from '@/types/consensus';
import {
  ArrowLeft,
  Trophy,
  Medal,
  Coins,
  RefreshCw,
  Sparkles,
  BrainCircuit,
  Copy,
  Check,
  HelpCircle,
  X,
  ExternalLink,
  Scale,
} from 'lucide-react';

interface ColumnHelpInfo {
  title: string;
  summary: string;
  anchor: string;
}

const COLUMN_HELP: Record<string, ColumnHelpInfo> = {
  rank: {
    title: 'Rank Position',
    summary: 'Sorted by Composite Quality & Bradley-Terry Elo score.',
    anchor: 'composite-score',
  },
  model: {
    title: 'Model & Provider',
    summary: 'The model architecture name and upstream provider endpoint.',
    anchor: 'elo-bt',
  },
  elo: {
    title: 'Bradley–Terry Elo',
    summary: 'Pairwise competitive power rating based on head-to-head triumphs.',
    anchor: 'elo-bt',
  },
  composite: {
    title: 'Composite Score',
    summary: 'Holistic 0-100 rating combining Elo (45%), Quality (35%), and Practicality (20%).',
    anchor: 'composite-score',
  },
  winrate: {
    title: 'Win Rate %',
    summary: 'Percentage of rounds where this model was chosen as 1st place champion.',
    anchor: 'win-rate',
  },
  runs: {
    title: 'Wins / Runs',
    summary: 'Total first-place finishes out of total arbitrations participated in.',
    anchor: 'win-rate',
  },
  accuracy: {
    title: 'Average Accuracy',
    summary: 'Judge-audited factual correctness score (0-100%).',
    anchor: 'accuracy',
  },
  reasoning: {
    title: 'Average Reasoning',
    summary: 'Judge-evaluated logical deduction and step-by-step proof rigor.',
    anchor: 'accuracy',
  },
  speed: {
    title: 'Generation Speed',
    summary: 'Completion tokens produced per second (sanitized against reporting bugs).',
    anchor: 'speed',
  },
  status: {
    title: 'Tier & Status',
    summary: 'Provisional if n < 3 runs; otherwise assigned tier (S+, S, A, B, C).',
    anchor: 'status-tiers',
  },
};

export default function RankingsPage() {
  const [rankings, setRankings] = useState<ModelRanking[]>([]);
  const [benchmarks, setBenchmarks] = useState<BenchmarkStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overall' | 'by-puzzle'>('overall');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeHelpCol, setActiveHelpCol] = useState<string | null>(null);

  const fetchRankings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/rankings');
      if (res.ok) {
        const data = await res.json();
        setRankings(data.rankings || []);
        setBenchmarks(data.benchmarks || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRankings();
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => {
      setCopiedId(null);
    }, 1500);
  };

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
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Consensus Leaderboard & Bradley–Terry Elo</span>
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/stats"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-800 bg-neutral-900/80 hover:bg-neutral-800 hover:border-amber-500/40 text-xs text-neutral-300 hover:text-white transition"
            >
              <Scale className="w-3.5 h-3.5 text-amber-400" />
              <span>Math & Stats Guide</span>
            </Link>
            <Link
              href="/usage"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-800 bg-neutral-900/80 hover:bg-neutral-800 text-xs text-neutral-300 hover:text-white transition"
            >
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>Usage Stats</span>
            </Link>
            <button
              onClick={fetchRankings}
              disabled={loading}
              className="p-2 rounded-xl border border-neutral-800 bg-neutral-900/80 hover:bg-neutral-800 text-xs text-neutral-300 hover:text-white transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Intro Banner */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-950/20 via-neutral-900/60 to-neutral-900 border border-neutral-800 backdrop-blur-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-semibold mb-1">
              <Scale className="w-3 h-3" />
              <span>Pairwise Bradley–Terry Model + Bayesian Quality Index</span>
            </div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>Model Arbitration Standings & Empirical Elo</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </h2>
            <p className="text-xs text-neutral-400 max-w-2xl leading-relaxed">
              Rankings combine <strong>Head-to-Head Bradley–Terry Elo</strong> (45%), <strong>Quality & Accuracy</strong> (35%), and <strong>Speed & Practicality</strong> (20%). Low sample sizes (n &lt; 3) are labeled <em>Provisional</em> with Bayesian shrinkage.{' '}
              <Link href="/stats" className="text-sky-400 hover:underline">
                Read our simple math guide →
              </Link>
            </p>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-neutral-950 border border-neutral-800 shrink-0">
            <button
              onClick={() => setActiveTab('overall')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'overall'
                  ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Holistic Standings
            </button>
            <button
              onClick={() => setActiveTab('by-puzzle')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'by-puzzle'
                  ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <BrainCircuit className="w-3.5 h-3.5" />
              <span>By Puzzle Benchmark</span>
            </button>
          </div>
        </div>

        {/* OVERALL TAB */}
        {activeTab === 'overall' && (
          <div className="space-y-8">
            {/* Top 3 Podium if data exists */}
            {rankings.length >= 3 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {rankings.slice(0, 3).map((r, idx) => {
                  const podiumColors = [
                    'border-amber-400/80 bg-amber-950/20 text-amber-300',
                    'border-neutral-400/60 bg-neutral-900/70 text-neutral-300',
                    'border-amber-700/60 bg-amber-950/10 text-amber-500',
                  ];
                  const titles = ['1st Place Champion', '2nd Place', '3rd Place'];
                  return (
                    <div
                      key={r.modelId}
                      className={`p-5 rounded-3xl border ${podiumColors[idx]} relative overflow-hidden backdrop-blur-sm`}
                    >
                      <div className="flex items-center justify-between text-xs mb-3">
                        <span className="font-bold uppercase tracking-wider">{titles[idx]}</span>
                        <div className="flex items-center gap-1.5">
                          {r.isProvisional ? (
                            <span className="text-[10px] bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded-full font-mono border border-neutral-700">
                              Provisional
                            </span>
                          ) : (
                            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-mono font-bold border border-amber-500/40">
                              Tier {r.tier}
                            </span>
                          )}
                          <Medal className="w-5 h-5" />
                        </div>
                      </div>
                      <h3 className="text-lg font-black text-white">{r.modelName}</h3>
                      <div className="text-xs text-neutral-400 font-mono mb-4">{r.provider}</div>

                      <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                        <div className="bg-neutral-950/70 p-2 rounded-xl border border-white/5">
                          <div className="text-[10px] text-neutral-400">Elo Rating</div>
                          <div className="text-sm font-black font-mono text-amber-400">
                            {r.eloRating || 1500}
                          </div>
                        </div>
                        <div className="bg-neutral-950/70 p-2 rounded-xl border border-white/5">
                          <div className="text-[10px] text-neutral-400">Composite</div>
                          <div className="text-sm font-black font-mono text-indigo-300">
                            {Math.round(r.compositeScore || 0)}/100
                          </div>
                        </div>
                        <div className="bg-neutral-950/70 p-2 rounded-xl border border-white/5">
                          <div className="text-[10px] text-neutral-400">Wins / Runs</div>
                          <div className="text-sm font-black font-mono text-white">
                            {r.totalWins}/{r.totalRuns}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Full Leaderboard Table with Interactive ? Minimodals */}
            <section className="space-y-4 relative">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-neutral-200 uppercase tracking-wider flex items-center gap-2">
                  <span>Holistic Leaderboard (Ranked by Bradley–Terry Elo & Composite Quality)</span>
                </h3>
                <span className="text-xs text-neutral-500 font-mono">
                  {rankings.length} models evaluated
                </span>
              </div>

              <div className="bg-neutral-900/60 border border-neutral-800 rounded-3xl overflow-visible backdrop-blur-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-neutral-300">
                    <thead className="bg-neutral-950/80 border-b border-neutral-800 text-[11px] text-neutral-400 uppercase">
                      <tr>
                        {/* Rank Header */}
                        <th className="p-4">
                          <div className="flex items-center gap-1">
                            <span>Rank</span>
                            <button
                              type="button"
                              onClick={() => setActiveHelpCol(activeHelpCol === 'rank' ? null : 'rank')}
                              className="text-neutral-500 hover:text-amber-400 transition"
                              title="Click for explanation"
                            >
                              <HelpCircle className="w-3 h-3" />
                            </button>
                          </div>
                        </th>

                        {/* Model Header */}
                        <th className="p-4">
                          <div className="flex items-center gap-1">
                            <span>Model & Provider</span>
                            <button
                              type="button"
                              onClick={() => setActiveHelpCol(activeHelpCol === 'model' ? null : 'model')}
                              className="text-neutral-500 hover:text-amber-400 transition"
                              title="Click for explanation"
                            >
                              <HelpCircle className="w-3 h-3" />
                            </button>
                          </div>
                        </th>

                        {/* Elo Header */}
                        <th className="p-4 relative">
                          <div className="flex items-center gap-1">
                            <span>Elo (BT)</span>
                            <button
                              type="button"
                              onClick={() => setActiveHelpCol(activeHelpCol === 'elo' ? null : 'elo')}
                              className="text-neutral-500 hover:text-amber-400 transition"
                              title="Click for explanation"
                            >
                              <HelpCircle className="w-3 h-3" />
                            </button>
                          </div>
                        </th>

                        {/* Composite Header */}
                        <th className="p-4 relative">
                          <div className="flex items-center gap-1">
                            <span>Composite Score</span>
                            <button
                              type="button"
                              onClick={() => setActiveHelpCol(activeHelpCol === 'composite' ? null : 'composite')}
                              className="text-neutral-500 hover:text-amber-400 transition"
                              title="Click for explanation"
                            >
                              <HelpCircle className="w-3 h-3" />
                            </button>
                          </div>
                        </th>

                        {/* Win Rate Header */}
                        <th className="p-4 relative">
                          <div className="flex items-center gap-1">
                            <span>Win Rate %</span>
                            <button
                              type="button"
                              onClick={() => setActiveHelpCol(activeHelpCol === 'winrate' ? null : 'winrate')}
                              className="text-neutral-500 hover:text-amber-400 transition"
                              title="Click for explanation"
                            >
                              <HelpCircle className="w-3 h-3" />
                            </button>
                          </div>
                        </th>

                        {/* Wins / Runs Header */}
                        <th className="p-4 relative">
                          <div className="flex items-center gap-1">
                            <span>Wins / Runs</span>
                            <button
                              type="button"
                              onClick={() => setActiveHelpCol(activeHelpCol === 'runs' ? null : 'runs')}
                              className="text-neutral-500 hover:text-amber-400 transition"
                              title="Click for explanation"
                            >
                              <HelpCircle className="w-3 h-3" />
                            </button>
                          </div>
                        </th>

                        {/* Accuracy Header */}
                        <th className="p-4 relative">
                          <div className="flex items-center gap-1">
                            <span>Accuracy</span>
                            <button
                              type="button"
                              onClick={() => setActiveHelpCol(activeHelpCol === 'accuracy' ? null : 'accuracy')}
                              className="text-neutral-500 hover:text-amber-400 transition"
                              title="Click for explanation"
                            >
                              <HelpCircle className="w-3 h-3" />
                            </button>
                          </div>
                        </th>

                        {/* Reasoning Header */}
                        <th className="p-4 relative">
                          <div className="flex items-center gap-1">
                            <span>Reasoning</span>
                            <button
                              type="button"
                              onClick={() => setActiveHelpCol(activeHelpCol === 'reasoning' ? null : 'reasoning')}
                              className="text-neutral-500 hover:text-amber-400 transition"
                              title="Click for explanation"
                            >
                              <HelpCircle className="w-3 h-3" />
                            </button>
                          </div>
                        </th>

                        {/* Speed Header */}
                        <th className="p-4 relative">
                          <div className="flex items-center gap-1">
                            <span>Speed</span>
                            <button
                              type="button"
                              onClick={() => setActiveHelpCol(activeHelpCol === 'speed' ? null : 'speed')}
                              className="text-neutral-500 hover:text-amber-400 transition"
                              title="Click for explanation"
                            >
                              <HelpCircle className="w-3 h-3" />
                            </button>
                          </div>
                        </th>

                        {/* Status Header */}
                        <th className="p-4 relative">
                          <div className="flex items-center gap-1">
                            <span>Status</span>
                            <button
                              type="button"
                              onClick={() => setActiveHelpCol(activeHelpCol === 'status' ? null : 'status')}
                              className="text-neutral-500 hover:text-amber-400 transition"
                              title="Click for explanation"
                            >
                              <HelpCircle className="w-3 h-3" />
                            </button>
                          </div>
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-neutral-800/60 font-sans">
                      {rankings.length > 0 ? (
                        rankings.map((r, idx) => (
                          <tr
                            key={r.modelId}
                            className={`hover:bg-neutral-800/30 transition group ${
                              idx === 0 ? 'bg-amber-500/5 font-semibold' : ''
                            }`}
                          >
                            <td className="p-4 font-mono font-bold text-neutral-400">
                              #{idx + 1}
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white">{r.modelName}</span>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(r.modelId)}
                                  title={`Copy ID: ${r.modelId}`}
                                  className="opacity-0 group-hover:opacity-100 p-1 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition shrink-0"
                                >
                                  {copiedId === r.modelId ? (
                                    <Check className="w-3 h-3 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                              <div className="text-[11px] text-neutral-500 font-mono flex items-center gap-1.5 mt-0.5">
                                <span>{r.provider}</span>
                                <span className="text-neutral-700">•</span>
                                <span className="text-neutral-400">{r.modelId}</span>
                              </div>
                            </td>
                            {/* Bradley-Terry Elo */}
                            <td className="p-4 font-mono">
                              <span className="font-bold text-amber-400 text-sm">
                                {r.eloRating || 1500}
                              </span>
                              {r.confidenceInterval && (
                                <div className="text-[10px] text-neutral-500">
                                  CI: [{r.confidenceInterval[0]}-{r.confidenceInterval[1]}]
                                </div>
                              )}
                            </td>
                            {/* Composite Rank Index */}
                            <td className="p-4 font-mono">
                              <div className="flex items-center gap-2">
                                <span className="font-black text-indigo-300 text-sm">
                                  {Math.round(r.compositeScore || 0)}
                                </span>
                                <div className="w-12 h-1.5 rounded-full bg-neutral-800 overflow-hidden">
                                  <div
                                    className="h-full bg-indigo-500 rounded-full"
                                    style={{ width: `${Math.round(r.compositeScore || 0)}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                            {/* Win Rate */}
                            <td className="p-4 font-mono text-neutral-200">
                              {Math.round(r.winRate)}%
                            </td>
                            {/* Wins / Runs */}
                            <td className="p-4 font-mono text-neutral-300">
                              {r.totalWins} <span className="text-neutral-500">/ {r.totalRuns}</span>
                            </td>
                            {/* Accuracy */}
                            <td className="p-4 font-mono">
                              <span
                                className={`px-2 py-0.5 rounded text-[11px] ${
                                  r.avgAccuracy >= 85
                                    ? 'bg-emerald-500/10 text-emerald-400'
                                    : 'bg-yellow-500/10 text-yellow-400'
                                }`}
                              >
                                {r.avgAccuracy > 0 ? `${Math.round(r.avgAccuracy)}%` : 'N/A'}
                              </span>
                            </td>
                            {/* Reasoning */}
                            <td className="p-4 font-mono text-purple-300">
                              {r.avgReasoning > 0 ? `${Math.round(r.avgReasoning)}%` : 'N/A'}
                            </td>
                            {/* Speed */}
                            <td className="p-4 font-mono text-emerald-400 text-[11px]">
                              {r.avgTokensPerSec > 0 ? `${Math.round(r.avgTokensPerSec)} tok/s` : 'N/A'}
                            </td>
                            {/* Provisional Flag */}
                            <td className="p-4">
                              {r.isProvisional ? (
                                <span className="text-[10px] bg-neutral-800/80 text-neutral-400 border border-neutral-700 px-2 py-0.5 rounded-md font-mono">
                                  Provisional ({r.totalRuns} run)
                                </span>
                              ) : (
                                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-md font-mono font-bold">
                                  Tier {r.tier}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={10} className="p-8 text-center text-neutral-500 italic">
                            No rankings data yet. Run comparisons in the arena to generate win statistics!
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Floating Mini-Modal Explanation Popup */}
              {activeHelpCol && COLUMN_HELP[activeHelpCol] && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/40 backdrop-blur-xs">
                  <div className="relative max-w-sm w-full bg-neutral-900 border border-neutral-700 rounded-2xl p-5 shadow-2xl space-y-3 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                        <HelpCircle className="w-4 h-4 text-amber-400" />
                        <span>{COLUMN_HELP[activeHelpCol].title}</span>
                      </h4>
                      <button
                        onClick={() => setActiveHelpCol(null)}
                        className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs text-neutral-300 leading-relaxed">
                      {COLUMN_HELP[activeHelpCol].summary}
                    </p>

                    <div className="pt-2 border-t border-neutral-800 flex items-center justify-between">
                      <Link
                        href={`/stats#${COLUMN_HELP[activeHelpCol].anchor}`}
                        className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center gap-1 font-medium hover:underline"
                      >
                        <span>Learn how this is calculated</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                      <button
                        onClick={() => setActiveHelpCol(null)}
                        className="px-3 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold"
                      >
                        Got it
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>
        )}

        {/* BY PUZZLE BENCHMARK TAB */}
        {activeTab === 'by-puzzle' && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-neutral-200 uppercase tracking-wider">
                  Head-to-Head Breakdown by Benchmark & Category
                </h3>
                <span className="text-xs text-neutral-500 font-mono">
                  {benchmarks.length} benchmarks recorded across Logic & Security
                </span>
              </div>
            </div>

            {benchmarks.length > 0 ? (
              <div className="space-y-6">
                {benchmarks.map((b) => (
                  <div
                    key={b.benchmarkId}
                    className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800 space-y-4 backdrop-blur-sm"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-bold text-white text-base">{b.benchmarkTitle}</h4>
                          {b.category && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-semibold">
                              {b.category}
                            </span>
                          )}
                          <code className="text-[10px] bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800 font-mono text-neutral-400">
                            {b.benchmarkId}
                          </code>
                        </div>
                      </div>
                      <div className="text-xs font-mono text-neutral-400">
                        Total model evaluations: <strong className="text-white">{b.totalRuns}</strong>
                      </div>
                    </div>

                    {/* Table for this specific puzzle */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-neutral-300">
                        <thead className="bg-neutral-950/60 text-[10px] text-neutral-400 uppercase">
                          <tr>
                            <th className="p-3">Model</th>
                            <th className="p-3">Wins</th>
                            <th className="p-3">Avg Accuracy</th>
                            <th className="p-3">Avg Reasoning</th>
                            <th className="p-3">Avg Overall Score</th>
                            <th className="p-3">Avg Speed</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800/40 font-sans">
                          {b.modelScores.map((m) => (
                            <tr key={`${b.benchmarkId}-${m.modelId}`} className={`group ${m.wins > 0 ? 'bg-amber-500/5' : ''}`}>
                              <td className="p-3">
                                <div className="flex items-center gap-2 font-bold text-white">
                                  {m.wins > 0 && <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                                  <span>{m.modelName}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleCopy(m.modelId)}
                                    title={`Copy ID: ${m.modelId}`}
                                    className="opacity-0 group-hover:opacity-100 p-1 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition shrink-0"
                                  >
                                    {copiedId === m.modelId ? (
                                      <Check className="w-3 h-3 text-emerald-400" />
                                    ) : (
                                      <Copy className="w-3 h-3" />
                                    )}
                                  </button>
                                </div>
                                <div className="text-[10px] text-neutral-500 font-mono mt-0.5">
                                  {m.modelId}
                                </div>
                              </td>
                              <td className="p-3 font-mono">
                                <span className={m.wins > 0 ? 'text-amber-300 font-bold' : 'text-neutral-500'}>
                                  {m.wins} / {m.runs} wins
                                </span>
                              </td>
                              <td className="p-3 font-mono">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] ${
                                    m.avgAccuracy >= 85
                                      ? 'bg-emerald-500/10 text-emerald-400'
                                      : 'bg-yellow-500/10 text-yellow-400'
                                  }`}
                                >
                                  {Math.round(m.avgAccuracy)}%
                                </span>
                              </td>
                              <td className="p-3 font-mono text-purple-300">{Math.round(m.avgReasoning)}%</td>
                              <td className="p-3 font-mono font-bold text-white text-sm">
                                {Math.round(m.avgOverall)}/100
                              </td>
                              <td className="p-3 font-mono text-emerald-400 text-[11px]">
                                {m.avgTokensPerSec > 0 ? `${Math.round(m.avgTokensPerSec)} tok/s` : 'N/A'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center rounded-3xl border border-neutral-800 bg-neutral-900/40 text-neutral-500 italic space-y-2">
                <BrainCircuit className="w-8 h-8 mx-auto text-neutral-600 mb-2" />
                <p>No puzzle benchmark runs recorded yet. Test pre-made prompts in the Arena!</p>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
