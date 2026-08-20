'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { HistoryQueryItem } from '@/types/consensus';
import { VisualArtifactRenderer } from '@/components/VisualArtifactRenderer';
import { SvgRenderer } from '@/components/SvgRenderer';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  ArrowLeft,
  Palette,
  Trophy,
  Filter,
  Eye,
  RefreshCw,
  Search,
  Sparkles,
  Layers,
} from 'lucide-react';

export default function SvgGalleryPage() {
  const [history, setHistory] = useState<HistoryQueryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchSvgHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/history');
      if (res.ok) {
        const data = await res.json();
        // Filter history to items that produce visual code (SVG, p5.js, Canvas 2D, D3.js)
        const visualRuns = (data.history || []).filter((h: HistoryQueryItem) => {
          const hasSvgInModel = h.models?.some((m) => m.responseText && m.responseText.includes('<svg'));
          const p = h.prompt.toLowerCase();
          const t = (h.benchmarkTitle || '').toLowerCase();
          const isVisualPrompt =
            p.includes('svg') ||
            p.includes('p5.js') ||
            p.includes('canvas') ||
            p.includes('d3') ||
            t.includes('svg') ||
            t.includes('p5') ||
            t.includes('canvas') ||
            t.includes('d3') ||
            p.includes('pelican') ||
            p.includes('dafoe') ||
            p.includes('pipe organ') ||
            p.includes('bulldozer') ||
            p.includes('steam engine') ||
            p.includes('excavator');
          return hasSvgInModel || isVisualPrompt;
        });
        setHistory(visualRuns);
      }
    } catch (e) {
      console.error('Error fetching visual gallery:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSvgHistory();
  }, []);

  // Preset Filters
  const filters = [
    { id: 'all', label: 'All Visual Art & Code' },
    { id: 'pelican', label: 'Pelican on Bicycle (SVG)' },
    { id: 'dafoe', label: 'Willem Dafoe (SVG)' },
    { id: 'tom-gally', label: 'Tom Gally Set (SVG)' },
    { id: 'p5', label: 'p5.js Generative Art' },
    { id: 'd3', label: 'D3.js Data Visualizations' },
    { id: 'canvas', label: 'HTML5 Canvas 2D Physics' },
  ];

  const filteredItems = history.filter((item) => {
    const p = item.prompt.toLowerCase();
    const t = (item.benchmarkTitle || '').toLowerCase();
    const matchesSearch =
      p.includes(searchQuery.toLowerCase()) ||
      t.includes(searchQuery.toLowerCase()) ||
      (item.winnerModelId && item.winnerModelId.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'pelican') {
      return p.includes('pelican');
    }
    if (selectedFilter === 'dafoe') {
      return p.includes('dafoe');
    }
    if (selectedFilter === 'p5') {
      return p.includes('p5.js') || t.includes('p5');
    }
    if (selectedFilter === 'd3') {
      return p.includes('d3') || t.includes('d3');
    }
    if (selectedFilter === 'canvas') {
      return p.includes('canvas') || t.includes('canvas');
    }
    if (selectedFilter === 'tom-gally') {
      return (
        p.includes('octopus') ||
        p.includes('starfish') ||
        p.includes('butterfly') ||
        p.includes('sloth') ||
        p.includes('excavator') ||
        p.includes('pipe organ') ||
        p.includes('bulldozer') ||
        p.includes('steam engine')
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-purple-500 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white px-3 py-1.5 rounded-xl border border-neutral-800 bg-neutral-900/60 hover:bg-neutral-800 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Arena</span>
            </Link>
            <h1 className="font-extrabold text-base text-white flex items-center gap-2">
              <Palette className="w-4 h-4 text-purple-400" />
              <span>SVG Vector Gallery • Live Visual Exhibition</span>
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/dafoe"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-purple-800/60 bg-purple-950/30 hover:bg-purple-900/40 text-xs text-purple-300 hover:text-white transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Dafoe Arena</span>
            </Link>
            <Link
              href="/rankings"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-800 bg-neutral-900/80 hover:bg-neutral-800 text-xs text-neutral-300 hover:text-white transition"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Rankings</span>
            </Link>
            <button
              onClick={fetchSvgHistory}
              disabled={loading}
              className="p-2 rounded-xl border border-neutral-800 bg-neutral-900/80 hover:bg-neutral-800 text-neutral-400 hover:text-white transition"
              title="Refresh Gallery"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Banner */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/40 via-neutral-900/80 to-neutral-900 border border-neutral-800 backdrop-blur-sm space-y-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[11px] font-semibold">
            <Layers className="w-3 h-3 text-purple-400" />
            <span>Pure Vector Spatial Benchmarks</span>
          </div>
          <h2 className="text-xl font-bold text-white">Visual SVG Artwork Exhibition</h2>
          <p className="text-xs text-neutral-400 max-w-3xl leading-relaxed">
            Side-by-side gallery of all pure vector graphics generated by models during benchmark face-offs. Each card renders the raw coordinate XML directly into interactive SVG illustrations with zoom and markup controls.
          </p>

          {/* Filter Pills and Search */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {filters.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFilter(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    selectedFilter === f.id
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search prompt or model..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-neutral-900/90 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500/50"
              />
            </div>
          </div>
        </div>

        {/* Gallery Stream */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3 text-neutral-500 text-xs">
            <RefreshCw className="w-8 h-8 text-purple-400 animate-spin" />
            <span>Loading SVG artwork archive...</span>
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="space-y-8">
            {filteredItems.map((item, idx) => (
              <div
                key={item.id || idx}
                className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800 space-y-5 shadow-xl backdrop-blur-sm"
              >
                {/* Query Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 font-mono font-bold uppercase">
                        {item.benchmarkTitle || 'SVG Benchmark'}
                      </span>
                      <span className="text-xs text-neutral-500 font-mono">
                        {new Date(item.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <h3 className="font-bold text-white text-base">
                      &quot;{item.prompt}&quot;
                    </h3>
                  </div>

                  {item.winnerModelId && (
                    <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-bold">
                      <Trophy className="w-3.5 h-3.5 text-amber-400" />
                      <span>Winner: {item.winnerModelId}</span>
                    </div>
                  )}
                </div>

                {/* Side-by-side 3-column Visual SVGs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {item.models?.map((m) => (
                    <div
                      key={m.modelId}
                      className={`flex flex-col rounded-2xl border ${
                        m.isWinner
                          ? 'border-amber-500/50 bg-amber-950/10'
                          : 'border-neutral-800 bg-neutral-950/50'
                      } overflow-hidden`}
                    >
                      {/* Model header */}
                      <div className="px-3 py-2 border-b border-neutral-800 bg-neutral-900/80 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-white truncate">
                          {m.isWinner && <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                          <span className="truncate">{m.modelName || m.modelId}</span>
                        </div>
                        {m.latencyMs && (
                          <span className="text-[10px] font-mono text-neutral-400">
                            {((m.latencyMs || 0) / 1000).toFixed(1)}s
                          </span>
                        )}
                      </div>

                      {/* Visual / Code Sandbox Body */}
                      <div className="p-3 flex-1 flex flex-col justify-center">
                        <VisualArtifactRenderer
                          content={m.responseText || ''}
                          title={`${m.modelName} ${item.benchmarkTitle || 'Art'}`}
                          className="w-full h-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Judge Reasoning Footer */}
                {item.winnerReason && (
                  <div className="p-3.5 rounded-2xl bg-neutral-950/60 border border-neutral-800/80 text-xs text-neutral-300 leading-relaxed">
                    <strong className="text-purple-300">Supreme Judge Assessment:</strong> {item.winnerReason}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-16 text-center rounded-3xl border border-neutral-800 bg-neutral-900/40 text-neutral-500 text-xs italic space-y-2">
            <Eye className="w-8 h-8 mx-auto text-neutral-600 mb-2" />
            <p>No SVG benchmarks found matching this filter.</p>
          </div>
        )}
      </main>
    </div>
  );
}
