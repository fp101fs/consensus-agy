'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { HistoryQueryItem } from '@/types/consensus';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  ArrowLeft,
  History,
  Trophy,
  Coins,
  ChevronDown,
  ChevronUp,
  Clock,
  Search,
  Sparkles,
  RefreshCw,
  Scale,
  Bot,
} from 'lucide-react';

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryQueryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/history');
      if (res.ok) {
        const data = await res.json();
        setHistory(data.history || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filteredHistory = history.filter((item) =>
    item.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.winnerModelId && item.winnerModelId.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
              <History className="w-4 h-4 text-sky-400" />
              <span>Consensus Query History (Most Recent First)</span>
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
            <Link
              href="/usage"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-800 bg-neutral-900/80 hover:bg-neutral-800 text-xs text-neutral-300 hover:text-white transition"
            >
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>Usage Stats</span>
            </Link>
            <button
              onClick={fetchHistory}
              disabled={loading}
              className="p-2 rounded-xl border border-neutral-800 bg-neutral-900/80 hover:bg-neutral-800 text-xs text-neutral-300 hover:text-white transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Search Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search past prompts or winning models..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-900/80 border border-neutral-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="text-xs text-neutral-500 font-mono">
            {filteredHistory.length} queries found
          </div>
        </div>

        {/* History List */}
        <div className="space-y-4">
          {filteredHistory.length > 0 ? (
            filteredHistory.map((item) => {
              const isExpanded = expandedId === item.id;
              return (
                <div
                  key={item.id}
                  className="rounded-3xl border border-neutral-800 bg-neutral-900/60 overflow-hidden backdrop-blur-sm transition-all"
                >
                  {/* Query Header Item */}
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    className="p-5 cursor-pointer hover:bg-neutral-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4 transition"
                  >
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        {item.winnerModelId && (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold flex items-center gap-1">
                            <Trophy className="w-3 h-3" /> Winner: {item.winnerModelId}
                          </span>
                        )}
                        {item.agreementLevel && (
                          <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-[10px] font-semibold">
                            {item.agreementLevel} ({item.agreementScore}%)
                          </span>
                        )}
                        <span className="text-[11px] text-neutral-500 font-mono">
                          {new Date(item.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="font-semibold text-sm text-neutral-100 line-clamp-2">
                        {item.prompt}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 font-mono text-xs text-neutral-400">
                      <div className="text-right">
                        <div className="text-amber-300 font-bold">${item.totalCostUsd.toFixed(4)}</div>
                        <div className="text-[10px] text-neutral-500">
                          {(item.totalTokensIn + item.totalTokensOut).toLocaleString()} tokens
                        </div>
                      </div>
                      <div className="p-2 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-400">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details: Judge Synthesis & 3 LLM responses */}
                  {isExpanded && (
                    <div className="p-6 border-t border-neutral-800/80 bg-neutral-950/60 space-y-6">
                      {/* Judge Verdict Synthesis if present */}
                      {item.judgeReport?.synthesis && (
                        <div className="p-5 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 space-y-2">
                          <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs uppercase tracking-wider">
                            <Scale className="w-4 h-4" />
                            <span>Judge Ground Truth Synthesis</span>
                          </div>
                          <div className="text-xs text-neutral-200 prose prose-invert max-w-none leading-relaxed">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {item.judgeReport.synthesis}
                            </ReactMarkdown>
                          </div>
                          {item.winnerReason && (
                            <div className="text-xs text-amber-300/90 pt-2 border-t border-indigo-500/20">
                              <strong>Winner Reason:</strong> {item.winnerReason}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Side-by-side responses for this run */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                          Models Run in This Query
                        </h4>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                          {item.models?.map((m, idx) => (
                            <div
                              key={idx}
                              className={`p-4 rounded-2xl border ${
                                m.isWinner
                                  ? 'border-amber-400/80 bg-amber-950/10'
                                  : 'border-neutral-800 bg-neutral-900/60'
                              } space-y-3 flex flex-col`}
                            >
                              <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                                <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                                  {m.isWinner && <Trophy className="w-3.5 h-3.5 text-amber-400" />}
                                  <span>{m.modelName}</span>
                                </div>
                                <span className="font-mono text-[10px] text-amber-300">
                                  ${m.costUsd.toFixed(4)}
                                </span>
                              </div>

                              <div className="text-xs text-neutral-300 flex-1 overflow-y-auto max-h-48 font-sans leading-relaxed prose prose-invert prose-xs">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                  {m.responseText || '[No response]'}
                                </ReactMarkdown>
                              </div>

                              <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[10px] font-mono text-neutral-400">
                                <span>{(m.latencyMs / 1000).toFixed(1)}s</span>
                                <span>{m.tokensPerSec?.toFixed(0)} tok/s</span>
                                <span>{m.totalTokens} tokens</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center rounded-3xl border border-neutral-800 bg-neutral-900/40 text-neutral-500 italic space-y-2">
              <History className="w-8 h-8 mx-auto text-neutral-600 mb-2" />
              <p>No queries match your search or no runs recorded yet.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
