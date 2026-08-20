'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ModelRanking } from '@/types/consensus';
import {
  ArrowLeft,
  Trophy,
  Medal,
  TrendingUp,
  Coins,
  Gauge,
  Clock,
  RefreshCw,
  Zap,
  Sparkles,
} from 'lucide-react';

export default function RankingsPage() {
  const [rankings, setRankings] = useState<ModelRanking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRankings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/rankings');
      if (res.ok) {
        const data = await res.json();
        setRankings(data.rankings || []);
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
              <span>Consensus Leaderboard & Win % Rankings</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
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
        {/* Intro description */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-950/20 via-neutral-900/60 to-neutral-900 border border-neutral-800 backdrop-blur-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>Judge Win Rates & Multi-Model Benchmarks</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </h2>
            <p className="text-xs text-neutral-400 mt-1 max-w-2xl">
              Track how often each LLM wins the Judge arbitration verdict when placed side-by-side on the same prompt, along with accuracy, generation speed, and overall scoring.
            </p>
          </div>
        </div>

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
                    <Medal className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-black text-white">{r.modelName}</h3>
                  <div className="text-xs text-neutral-400 font-mono mb-4">{r.provider}</div>

                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="bg-neutral-950/70 p-2 rounded-xl border border-white/5">
                      <div className="text-[10px] text-neutral-400">Win Rate</div>
                      <div className="text-base font-black font-mono text-amber-400">
                        {r.winRate}%
                      </div>
                    </div>
                    <div className="bg-neutral-950/70 p-2 rounded-xl border border-white/5">
                      <div className="text-[10px] text-neutral-400">Wins / Runs</div>
                      <div className="text-base font-black font-mono text-white">
                        {r.totalWins} / {r.totalRuns}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Full Leaderboard Table */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-neutral-200 uppercase tracking-wider">
              Comprehensive Model Standings (Sorted by Win % Descending)
            </h3>
            <span className="text-xs text-neutral-500 font-mono">
              {rankings.length} models tracked
            </span>
          </div>

          <div className="bg-neutral-900/60 border border-neutral-800 rounded-3xl overflow-hidden backdrop-blur-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-neutral-300">
                <thead className="bg-neutral-950/80 border-b border-neutral-800 text-[11px] text-neutral-400 uppercase">
                  <tr>
                    <th className="p-4">Rank</th>
                    <th className="p-4">Model & Provider</th>
                    <th className="p-4">Win Rate %</th>
                    <th className="p-4">Wins / Runs</th>
                    <th className="p-4">Avg Accuracy</th>
                    <th className="p-4">Avg Completeness</th>
                    <th className="p-4">Avg Score</th>
                    <th className="p-4">Speed</th>
                    <th className="p-4">Total Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 font-sans">
                  {rankings.length > 0 ? (
                    rankings.map((r, idx) => (
                      <tr
                        key={r.modelId}
                        className={`hover:bg-neutral-800/30 transition ${
                          idx === 0 ? 'bg-amber-500/5 font-semibold' : ''
                        }`}
                      >
                        <td className="p-4 font-mono font-bold text-neutral-400">
                          #{idx + 1}
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-white">{r.modelName}</div>
                          <div className="text-[11px] text-neutral-500 font-mono">{r.provider}</div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-amber-400 text-sm">
                              {r.winRate}%
                            </span>
                            <div className="w-16 h-1.5 rounded-full bg-neutral-800 overflow-hidden">
                              <div
                                className="h-full bg-amber-400 rounded-full"
                                style={{ width: `${r.winRate}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-mono text-neutral-300">
                          {r.totalWins} <span className="text-neutral-500">/ {r.totalRuns}</span>
                        </td>
                        <td className="p-4 font-mono">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] ${
                              r.avgAccuracy >= 85
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : 'bg-yellow-500/10 text-yellow-400'
                            }`}
                          >
                            {r.avgAccuracy > 0 ? `${r.avgAccuracy}%` : 'N/A'}
                          </span>
                        </td>
                        <td className="p-4 font-mono text-sky-400">
                          {r.avgCompleteness > 0 ? `${r.avgCompleteness}%` : 'N/A'}
                        </td>
                        <td className="p-4 font-mono font-bold text-white text-sm">
                          {r.avgOverallScore > 0 ? `${r.avgOverallScore}/100` : 'N/A'}
                        </td>
                        <td className="p-4 font-mono text-emerald-400 text-[11px]">
                          {r.avgTokensPerSec > 0 ? `${r.avgTokensPerSec} tok/s` : 'N/A'}
                        </td>
                        <td className="p-4 font-mono text-amber-300">
                          ${r.totalCostUsd.toFixed(4)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-neutral-500 italic">
                        No rankings data yet. Run comparisons in the arena to generate win statistics!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
