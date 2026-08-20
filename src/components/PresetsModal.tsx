'use client';

import React, { useState } from 'react';
import { PresetPrompt, BENCHMARK_PRESET_PROMPTS } from '@/lib/presets';
import {
  Sparkles,
  X,
  Search,
  Check,
  Brain,
  HelpCircle,
  ShieldAlert,
  ArrowRight,
  Flame,
} from 'lucide-react';

interface PresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrompt: (promptText: string) => void;
}

export const PresetsModal: React.FC<PresetsModalProps> = ({
  isOpen,
  onClose,
  onSelectPrompt,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  if (!isOpen) return null;

  const categories = ['All', ...Array.from(new Set(BENCHMARK_PRESET_PROMPTS.map((p) => p.category)))];

  const filteredPresets = BENCHMARK_PRESET_PROMPTS.filter((p) => {
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <span>LLM Benchmark & Logic Puzzle Presets</span>
                <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded-full font-mono">
                  {BENCHMARK_PRESET_PROMPTS.length} Presets
                </span>
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Curated problem sets designed to highlight model divergence, constraint reasoning, and judge arbitration.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="p-4 border-b border-neutral-800/80 bg-neutral-950/40 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search benchmarks by reasoning skill, name, or keywords (e.g. 'Constraint', 'False premises', 'Knights')..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Categories pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white font-bold shadow-sm'
                    : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Presets Grid Body */}
        <div className="p-6 overflow-y-auto flex-1 divide-y divide-neutral-800/60 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPresets.map((preset) => (
              <div
                key={preset.id}
                onClick={() => {
                  onSelectPrompt(preset.prompt);
                  onClose();
                }}
                className="group p-4 rounded-2xl border border-neutral-800/90 bg-neutral-950/50 hover:bg-neutral-900/90 hover:border-indigo-500/50 cursor-pointer transition flex flex-col justify-between shadow-sm relative overflow-hidden"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h3 className="font-bold text-sm text-neutral-100 group-hover:text-white group-hover:underline decoration-indigo-400">
                      {preset.title}
                    </h3>
                    <span className="text-xs shrink-0 font-mono text-amber-400" title="Difficulty">
                      {preset.difficulty}
                    </span>
                  </div>

                  {/* Benchmark Capability Badge */}
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-semibold uppercase tracking-wider">
                      {preset.category}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-400 leading-relaxed line-clamp-2">
                    {preset.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-800/60 flex items-center justify-between text-[11px] text-neutral-500">
                  <div className="flex flex-wrap gap-1">
                    {preset.tags.map((t, idx) => (
                      <span key={idx} className="bg-neutral-900 px-1.5 py-0.5 rounded text-[10px] text-neutral-400">
                        #{t}
                      </span>
                    ))}
                  </div>
                  <span className="text-indigo-400 font-medium group-hover:translate-x-0.5 transition flex items-center gap-0.5 shrink-0 ml-2">
                    Use Prompt <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>

          {filteredPresets.length === 0 && (
            <div className="p-12 text-center text-neutral-500 text-xs italic">
              No benchmark prompts found matching your search.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950/70 flex items-center justify-between text-xs text-neutral-400">
          <span>Click any card to immediately insert and test all 3 models</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-neutral-800 hover:bg-neutral-800 text-neutral-300 hover:text-white transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
