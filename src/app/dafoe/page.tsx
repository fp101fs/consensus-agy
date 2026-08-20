'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { LLMConfig, ModelOutput } from '@/types/consensus';
import { SvgRenderer } from '@/components/SvgRenderer';
import {
  ArrowLeft,
  Sparkles,
  Play,
  RotateCcw,
  Palette,
  Eye,
  Trophy,
  Scale,
  BrainCircuit,
  Coins,
  Search,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';

const DAFOE_PROMPT = `Create a standalone SVG portrait of Willem Dafoe's face. Output only valid SVG markup. Do not wrap the SVG in Markdown fences. Do not use external images, links, scripts, CSS imports, or remote assets. Make the portrait recognizable as Willem Dafoe using vector shapes only. Include face shape, hair, eyes, eyebrows, nose, mouth, teeth, and expressive features. Use a 1024 by 1024 viewBox. Use detailed SVG-native vector techniques: layered paths, gradients, masks, clipping paths, shadows, highlights, blur filters, opacity, and fine strokes. The portrait should be as recognizable and detailed as possible.`;

// Curated Creative Model Triads
const DEFAULT_MODELS: LLMConfig[] = [
  {
    id: 'google/gemini-3.7-flash',
    name: 'Gemini 3.7 Flash',
    provider: 'Google',
    tag: 'Google Creative',
    color: 'sky',
    badgeBg: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    borderColor: 'border-sky-500/40',
  },
  {
    id: 'openai/gpt-5.6-luna',
    name: 'GPT-5.6 Luna',
    provider: 'OpenAI',
    tag: 'OpenAI Next-Gen',
    color: 'emerald',
    badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    borderColor: 'border-emerald-500/40',
  },
  {
    id: 'qwen/qwen3-30b-a3b-instruct-2507',
    name: 'Qwen3 30B Instruct',
    provider: 'Alibaba Qwen',
    tag: 'High Vector Detail',
    color: 'violet',
    badgeBg: 'bg-violet-500/10 text-violet-400 border-violet-500/30',
    borderColor: 'border-violet-500/40',
  },
];

export default function DafoeBenchPage() {
  const [selectedModels, setSelectedModels] = useState<LLMConfig[]>(DEFAULT_MODELS);
  const [availableModels, setAvailableModels] = useState<LLMConfig[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [outputs, setOutputs] = useState<Record<string, ModelOutput>>({});
  const [judgeVerdict, setJudgeVerdict] = useState<any>(null);
  const [gallery, setGallery] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'live' | 'gallery'>('live');

  // Load available models
  useEffect(() => {
    fetch('/api/models')
      .then((r) => r.json())
      .then((d) => {
        if (d.models) setAvailableModels(d.models);
      })
      .catch(console.error);

    // Fetch past Dafoe benchmarks from history
    fetch('/api/history')
      .then((r) => r.json())
      .then((d) => {
        if (d.history) {
          const dafoeRuns = d.history.filter(
            (h: any) =>
              h.benchmarkId === 'benchmark-dafoe-svg-portrait' ||
              (h.prompt && h.prompt.toLowerCase().includes('willem dafoe'))
          );
          setGallery(dafoeRuns);
        }
      })
      .catch(console.error);
  }, []);

  const handleRunDafoe = async () => {
    setIsRunning(true);
    setOutputs({});
    setJudgeVerdict(null);

    try {
      const res = await fetch('/api/consensus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: DAFOE_PROMPT,
          models: selectedModels.map((m) => m.id),
          judgeModel: 'google/gemini-2.5-flash',
          saveToDb: true,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const map: Record<string, ModelOutput> = {};
        if (data.models) {
          data.models.forEach((m: ModelOutput) => {
            map[m.modelId] = m;
          });
        }
        setOutputs(map);
        if (data.judgeReport) setJudgeVerdict(data.judgeReport);
      }
    } catch (e) {
      console.error('Dafoe run error:', e);
    } finally {
      setIsRunning(false);
    }
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
              <span>Arena</span>
            </Link>
            <h1 className="font-extrabold text-base text-white flex items-center gap-2">
              <Palette className="w-4 h-4 text-purple-400" />
              <span>DafoeBench • Side-by-Side SVG Face-off</span>
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/rankings"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-800 bg-neutral-900/80 hover:bg-neutral-800 text-xs text-neutral-300 hover:text-white transition"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Rankings</span>
            </Link>
            <button
              onClick={handleRunDafoe}
              disabled={isRunning}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-xs font-bold text-white shadow-lg shadow-purple-600/20 transition"
            >
              <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
              <span>{isRunning ? 'Drawing SVGs...' : 'Generate 3-Way Dafoe'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Banner */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/30 via-neutral-900/70 to-neutral-900 border border-neutral-800 backdrop-blur-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[11px] font-semibold">
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span>Inspired by BuseyBench • Pure Vector Spatial Benchmark</span>
            </div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>Willem Dafoe Vector Portrait Arena</span>
            </h2>
            <p className="text-xs text-neutral-400 max-w-2xl leading-relaxed">
              We instruct 3 AI models simultaneously to generate a raw <strong>1024x1024 SVG portrait</strong> of Willem Dafoe without markdown backticks or raster images. Evaluates spatial geometry, Bézier curves, shading, and anatomical accuracy.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveTab('live')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'live'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              Live 3-Way Battle
            </button>
            <button
              onClick={() => setActiveTab('gallery')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'gallery'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Past Gallery ({gallery.length})</span>
            </button>
          </div>
        </div>

        {/* LIVE 3-WAY VIEW */}
        {activeTab === 'live' && (
          <div className="space-y-6">
            {/* 3 Columns Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {selectedModels.map((cfg, idx) => {
                const out = outputs[cfg.id];
                return (
                  <div
                    key={cfg.id}
                    className="flex flex-col rounded-3xl border border-neutral-800 bg-neutral-900/60 overflow-hidden shadow-xl"
                  >
                    {/* Model Header */}
                    <div className="p-4 border-b border-neutral-800/80 bg-neutral-950/70 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono text-neutral-500 font-bold">
                            MODEL {idx + 1}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-300 font-mono">
                            {cfg.provider}
                          </span>
                        </div>
                        <h3 className="font-bold text-sm text-white mt-0.5">{cfg.name}</h3>
                      </div>

                      {out?.latencyMs && (
                        <div className="text-right text-[10px] font-mono text-neutral-400">
                          <div>{((out.latencyMs || 0) / 1000).toFixed(1)}s</div>
                          <div className="text-emerald-400">{Math.round(out.tokensPerSec || 0)} tok/s</div>
                        </div>
                      )}
                    </div>

                    {/* SVG Content Area */}
                    <div className="p-4 flex-1 flex flex-col justify-center min-h-[420px]">
                      {isRunning && !out?.response && (
                        <div className="flex flex-col items-center justify-center py-16 space-y-3 text-neutral-400 text-xs animate-pulse">
                          <Palette className="w-8 h-8 text-purple-400 animate-spin" />
                          <span>Generating vector paths & Bézier curves...</span>
                        </div>
                      )}

                      {!isRunning && !out?.response && (
                        <div className="text-center py-20 text-neutral-600 text-xs italic space-y-2">
                          <Eye className="w-8 h-8 mx-auto text-neutral-700 mb-1" />
                          <p>Click &quot;Generate 3-Way Dafoe&quot; to begin</p>
                        </div>
                      )}

                      {out?.response && (
                        <SvgRenderer
                          content={out.response}
                          title={`${cfg.name} Willem Dafoe Portrait`}
                          className="w-full h-full"
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Supreme Judge Verdict if available */}
            {judgeVerdict && (
              <div className="p-6 rounded-3xl bg-neutral-900/80 border border-purple-800/40 space-y-3 shadow-2xl">
                <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>Judge Verdict • Winning Vector Portrait: {judgeVerdict.winnerModelId}</span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  <strong>Arbiter Critique:</strong> {judgeVerdict.winnerReason || judgeVerdict.verdictSummary}
                </p>
              </div>
            )}
          </div>
        )}

        {/* GALLERY VIEW */}
        {activeTab === 'gallery' && (
          <div className="space-y-6">
            {gallery.length > 0 ? (
              <div className="space-y-8">
                {gallery.map((item, gIdx) => (
                  <div
                    key={item.id || gIdx}
                    className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800 space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                      <div>
                        <h4 className="font-bold text-white text-sm">
                          Willem Dafoe Portrait Arbitration #{gallery.length - gIdx}
                        </h4>
                        <span className="text-[11px] text-neutral-500 font-mono">
                          {new Date(item.createdAt).toLocaleString()}
                        </span>
                      </div>
                      {item.winnerModelId && (
                        <span className="text-xs px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold flex items-center gap-1">
                          <Trophy className="w-3 h-3" />
                          <span>Winner: {item.winnerModelId}</span>
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {item.models?.map((m: any) => (
                        <div
                          key={m.modelId}
                          className={`p-3 rounded-2xl border ${
                            m.isWinner ? 'border-amber-500/50 bg-amber-950/10' : 'border-neutral-800 bg-neutral-950/40'
                          } space-y-2`}
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-white truncate">{m.modelName || m.modelId}</span>
                            {m.isWinner && <span className="text-[10px] text-amber-400 font-bold uppercase">Winner</span>}
                          </div>
                          <SvgRenderer content={m.responseText} title={m.modelName} />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-16 text-center rounded-3xl border border-neutral-800 bg-neutral-900/40 text-neutral-500 text-xs italic space-y-2">
                <Palette className="w-8 h-8 mx-auto text-neutral-600 mb-2" />
                <p>No past Dafoe portraits generated yet. Run the live generator!</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
