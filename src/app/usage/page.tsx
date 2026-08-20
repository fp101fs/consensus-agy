'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { UsageSummary } from '@/types/consensus';
import {
  ArrowLeft,
  Coins,
  Cpu,
  Layers,
  Sparkles,
  TrendingUp,
  Clock,
  Gauge,
  Trophy,
  History,
  RefreshCw,
} from 'lucide-react';

export default function UsagePage() {
  const [usage, setUsage] = useState<UsageSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUsage = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/usage');
      if (res.ok) {
        const data = await res.json();
        setUsage(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsage();
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
              <Coins className="w-4 h-4 text-amber-400" />
              <span>Token Usage & Spend Analytics</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/rankings"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-800 bg-neutral-900/80 hover:bg-neutral-800 text-xs text-neutral-300 hover:text-white transition"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Rankings</span>
            </Link>
            <button
              onClick={fetchUsage}
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
        {/* Metric Cards Top Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Spend */}
          <div className="p-5 rounded-3xl bg-neutral-900/60 border border-neutral-800 relative overflow-hidden backdrop-blur-sm">
            <div className="flex items-center justify-between text-neutral-400 text-xs mb-2">
              <span className="font-medium uppercase tracking-wider text-[11px]">Total Cost</span>
              <Coins className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-black font-mono text-white">
              ${(usage?.totalCostUsd || 0).toFixed(4)}
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">
              Estimated OpenRouter blended spend
            </p>
          </div>

          {/* Total Tokens (In + Out) */}
          <div className="p-5 rounded-3xl bg-neutral-900/60 border border-neutral-800 relative overflow-hidden backdrop-blur-sm">
            <div className="flex items-center justify-between text-neutral-400 text-xs mb-2">
              <span className="font-medium uppercase tracking-wider text-[11px]">Total Tokens</span>
              <Cpu className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-3xl font-black font-mono text-white">
              {(usage?.totalTokens || 0).toLocaleString()}
            </div>
            <p className="text-[11px] text-neutral-500 mt-1 flex items-center gap-1.5 font-mono">
              <span>In: {(usage?.totalTokensIn || 0).toLocaleString()}</span>
              <span>•</span>
              <span>Out: {(usage?.totalTokensOut || 0).toLocaleString()}</span>
            </p>
          </div>

          {/* Total Queries */}
          <div className="p-5 rounded-3xl bg-neutral-900/60 border border-neutral-800 relative overflow-hidden backdrop-blur-sm">
            <div className="flex items-center justify-between text-neutral-400 text-xs mb-2">
              <span className="font-medium uppercase tracking-wider text-[11px]">Consensus Queries</span>
              <Layers className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-3xl font-black font-mono text-white">
              {usage?.totalQueries || 0}
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">
              Multi-model arbitration runs
            </p>
          </div>

          {/* Avg Cost per Prompt */}
          <div className="p-5 rounded-3xl bg-neutral-900/60 border border-neutral-800 relative overflow-hidden backdrop-blur-sm">
            <div className="flex items-center justify-between text-neutral-400 text-xs mb-2">
              <span className="font-medium uppercase tracking-wider text-[11px]">Avg Cost / Query</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-black font-mono text-white">
              ${(usage?.avgCostPerQuery || 0).toFixed(4)}
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">
              Across all 3 models + judge
            </p>
          </div>
        </div>

        {/* Per-Prompt Cost & Token Breakdown Table */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-neutral-200 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Prompt-by-Prompt Usage & Dollar Breakdown</span>
            </h2>
            <span className="text-xs text-neutral-500">
              Showing latest {usage?.recentQueries?.length || 0} recorded queries
            </span>
          </div>

          <div className="bg-neutral-900/60 border border-neutral-800 rounded-3xl overflow-hidden backdrop-blur-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-neutral-300">
                <thead className="bg-neutral-950/80 border-b border-neutral-800 text-[11px] text-neutral-400 uppercase">
                  <tr>
                    <th className="p-4">Prompt</th>
                    <th className="p-4">Total Tokens</th>
                    <th className="p-4">Tokens (In / Out)</th>
                    <th className="p-4">Total Spend</th>
                    <th className="p-4">Model Breakdown</th>
                    <th className="p-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 font-sans">
                  {usage?.recentQueries && usage.recentQueries.length > 0 ? (
                    usage.recentQueries.map((q) => (
                      <tr key={q.id} className="hover:bg-neutral-800/30 transition">
                        <td className="p-4 max-w-sm">
                          <p className="font-medium text-white line-clamp-2">{q.prompt}</p>
                        </td>
                        <td className="p-4 font-mono font-bold text-neutral-200">
                          {q.totalTokens.toLocaleString()}
                        </td>
                        <td className="p-4 font-mono text-neutral-400 text-[11px]">
                          {q.tokensIn.toLocaleString()} in / {q.tokensOut.toLocaleString()} out
                        </td>
                        <td className="p-4 font-mono font-bold text-amber-300">
                          ${q.totalCostUsd.toFixed(5)}
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1.5 max-w-md">
                            {q.models?.map((m, idx) => (
                              <div
                                key={idx}
                                className="px-2 py-0.5 rounded-lg bg-neutral-950 border border-neutral-800 text-[10px] font-mono text-neutral-300"
                              >
                                <span className="font-semibold text-white">{m.modelName}:</span>{' '}
                                <span className="text-amber-400">${m.costUsd.toFixed(4)}</span>{' '}
                                <span className="text-neutral-500">({m.tokens}t • {(m.tokensPerSec || 0).toFixed(0)}t/s)</span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="p-4 font-mono text-[11px] text-neutral-500 whitespace-nowrap">
                          {new Date(q.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-neutral-500 italic">
                        No queries recorded yet. Run a consensus debate from the arena!
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
