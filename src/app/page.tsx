'use client';

import React, { useState, useEffect, useRef } from 'react';
import { LLMConfig, ModelOutput, ConsensusJudgeReport } from '@/types/consensus';
import { DEFAULT_MODELS, AVAILABLE_MODELS_LIST, JUDGE_MODEL_CONFIG } from '@/lib/models';
import { ModelColumn } from '@/components/ModelColumn';
import { JudgeVerdict } from '@/components/JudgeVerdict';
import { SettingsModal } from '@/components/SettingsModal';
import {
  Sparkles,
  Send,
  Sliders,
  Scale,
  Zap,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

const PRESET_PROMPTS = [
  "Compare Next.js App Router vs Remix for enterprise real-time dashboards with SSR.",
  "What was the exact revenue of NVIDIA in Q3 FY2025 and what drove the growth?",
  "Should a modern startup choose PostgreSQL with pgvector or dedicated Pinecone/Qdrant for semantic search?",
  "Solve this logic puzzle: A farmer needs to cross a river with a wolf, a goat, and a cabbage in a boat with limited capacity.",
];

export default function ConsensusArenaPage() {
  const [prompt, setPrompt] = useState('');
  const [availableModels, setAvailableModels] = useState<LLMConfig[]>(AVAILABLE_MODELS_LIST);
  const [activeModels, setActiveModels] = useState<[LLMConfig, LLMConfig, LLMConfig]>(DEFAULT_MODELS);
  const [modelOutputs, setModelOutputs] = useState<Record<string, ModelOutput>>({});
  const [judgeReport, setJudgeReport] = useState<ConsensusJudgeReport | null>(null);
  const [isModelsStreaming, setIsModelsStreaming] = useState(false);
  const [isJudging, setIsJudging] = useState(false);
  const [judgeError, setJudgeError] = useState<string | undefined>();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [userApiKey, setUserApiKey] = useState('');
  const [judgeModelId, setJudgeModelId] = useState(JUDGE_MODEL_CONFIG.id);
  const [isFetchingCatalog, setIsFetchingCatalog] = useState(false);

  const verdictRef = useRef<HTMLDivElement>(null);

  const fetchCatalog = async (apiKeyOverride?: string) => {
    setIsFetchingCatalog(true);
    try {
      const headers: Record<string, string> = {};
      const key = apiKeyOverride !== undefined ? apiKeyOverride : userApiKey;
      if (key) {
        headers['Authorization'] = `Bearer ${key}`;
      }

      const res = await fetch('/api/models', { headers });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.models) && data.models.length > 0) {
          setAvailableModels(data.models);

          // Update active models to ensure valid live endpoints
          setActiveModels((prev) => {
            return prev.map((curr) => {
              const exact = data.models.find((m: LLMConfig) => m.id === curr.id);
              if (exact) return exact;

              // Fallback to closest provider match from live catalog if previous ID was decommissioned
              const providerMatch = data.models.find((m: LLMConfig) => m.provider === curr.provider);
              return providerMatch || curr;
            }) as [LLMConfig, LLMConfig, LLMConfig];
          });
        }
      }
    } catch (err) {
      console.warn('Failed to dynamically fetch OpenRouter catalog:', err);
    } finally {
      setIsFetchingCatalog(false);
    }
  };

  useEffect(() => {
    const storedKey = localStorage.getItem('consensus_openrouter_api_key') || '';
    const storedJudge = localStorage.getItem('consensus_judge_model_id') || JUDGE_MODEL_CONFIG.id;
    if (storedKey) setUserApiKey(storedKey);
    if (storedJudge) setJudgeModelId(storedJudge);

    // Clean any obsolete cached local model selections
    fetchCatalog(storedKey);
  }, []);

  const handleSaveApiKey = (key: string) => {
    setUserApiKey(key);
    localStorage.setItem('consensus_openrouter_api_key', key);
    fetchCatalog(key);
  };

  const handleSaveJudgeModel = (modelId: string) => {
    setJudgeModelId(modelId);
    localStorage.setItem('consensus_judge_model_id', modelId);
  };

  const handleModelChange = (index: number, newModelId: string) => {
    const selected = availableModels.find((m) => m.id === newModelId);
    if (!selected) return;
    const newModels = [...activeModels] as [LLMConfig, LLMConfig, LLMConfig];
    newModels[index] = selected;
    setActiveModels(newModels);
  };

  const streamSingleModel = async (model: LLMConfig, promptText: string) => {
    const startTime = Date.now();
    setModelOutputs((prev) => ({
      ...prev,
      [model.id]: {
        modelId: model.id,
        modelName: model.name,
        provider: model.provider,
        response: '',
        status: 'loading',
      },
    }));

    try {
      const response = await fetch('/api/stream-model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelId: model.id,
          prompt: promptText,
          userApiKey: userApiKey || undefined,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP ${response.status}`);
      }

      if (!response.body) throw new Error('Readable stream not supported');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            const dataStr = trimmed.slice(6);
            if (dataStr === '[DONE]') continue;
            try {
              const data = JSON.parse(dataStr);
              if (data.error) throw new Error(data.error);
              if (data.content) {
                accumulatedText += data.content;
                setModelOutputs((prev) => ({
                  ...prev,
                  [model.id]: {
                    modelId: model.id,
                    modelName: model.name,
                    provider: model.provider,
                    response: accumulatedText,
                    status: 'loading',
                  },
                }));
              }
            } catch {
              // Pass
            }
          }
        }
      }

      const totalLatency = Date.now() - startTime;
      setModelOutputs((prev) => ({
        ...prev,
        [model.id]: {
          modelId: model.id,
          modelName: model.name,
          provider: model.provider,
          response: accumulatedText,
          status: 'completed',
          latencyMs: totalLatency,
        },
      }));

      return {
        modelId: model.id,
        modelName: model.name,
        response: accumulatedText,
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown execution error';
      setModelOutputs((prev) => ({
        ...prev,
        [model.id]: {
          modelId: model.id,
          modelName: model.name,
          provider: model.provider,
          response: '',
          status: 'error',
          error: errorMsg,
        },
      }));
      return {
        modelId: model.id,
        modelName: model.name,
        response: `[Error: ${errorMsg}]`,
      };
    }
  };

  const handleRunConsensus = async (customPrompt?: string) => {
    const promptToSubmit = customPrompt || prompt;
    if (!promptToSubmit.trim() || isModelsStreaming || isJudging) return;

    setIsModelsStreaming(true);
    setIsJudging(false);
    setJudgeReport(null);
    setJudgeError(undefined);

    // Run 3 candidate models simultaneously in parallel
    const promises = activeModels.map((model) =>
      streamSingleModel(model, promptToSubmit)
    );

    const completedResponses = await Promise.all(promises);
    setIsModelsStreaming(false);

    // Now trigger the 4th Judge AI LLM with fact-checking & quantitative synthesis
    setIsJudging(true);

    try {
      const judgeRes = await fetch('/api/judge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToSubmit,
          modelResponses: completedResponses,
          judgeModelId: judgeModelId,
          userApiKey: userApiKey || undefined,
        }),
      });

      if (!judgeRes.ok) {
        const errJson = await judgeRes.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP ${judgeRes.status}`);
      }

      const report: ConsensusJudgeReport = await judgeRes.json();
      setJudgeReport(report);

      setTimeout(() => {
        verdictRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to obtain judge verdict';
      setJudgeError(errorMsg);
    } finally {
      setIsJudging(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleRunConsensus();
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-md shadow-indigo-500/20 text-white font-black text-lg">
              C
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white">
                  Consensus Arena
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Live Catalog ({availableModels.length} models)
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Cross-reference 3 independent LLMs simultaneously to eliminate hallucinations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => fetchCatalog()}
              disabled={isFetchingCatalog}
              title="Refresh OpenRouter live model catalog"
              className="p-2 rounded-xl border border-neutral-800 bg-neutral-900/80 hover:bg-neutral-800 text-xs text-neutral-300 hover:text-white transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetchingCatalog ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={() => setSettingsOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-800 bg-neutral-900/80 hover:bg-neutral-800 text-xs text-neutral-300 hover:text-white transition"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Settings / API Key</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col space-y-6">
        {/* Hero Prompt Input Section */}
        <section className="bg-neutral-900/60 border border-neutral-800/80 rounded-3xl p-5 md:p-6 shadow-xl backdrop-blur-sm">
          <div className="space-y-4">
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={3}
                placeholder="Ask any complex question, technical debate, fact-check query, or code problem to see where 3 LLMs agree or diverge..."
                className="w-full bg-neutral-950 border border-neutral-800/90 rounded-2xl p-4 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 resize-none font-sans leading-relaxed shadow-inner"
              />
              <div className="absolute right-3 bottom-3 flex items-center gap-2">
                <span className="text-[11px] text-neutral-500 hidden sm:inline-block">
                  Press <kbd className="bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-400 font-mono text-[10px]">⌘ + Enter</kbd>
                </span>
                <button
                  onClick={() => handleRunConsensus()}
                  disabled={!prompt.trim() || isModelsStreaming || isJudging}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition transform active:scale-95"
                >
                  {isModelsStreaming ? (
                    <>
                      <Zap className="w-3.5 h-3.5 animate-spin" />
                      <span>Generating (3x)...</span>
                    </>
                  ) : isJudging ? (
                    <>
                      <Scale className="w-3.5 h-3.5 animate-bounce" />
                      <span>Judge Fact-Checking...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Run Consensus Debate</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Example Presets */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
              <span className="text-neutral-500 text-[11px] font-medium shrink-0 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-400" /> Presets:
              </span>
              {PRESET_PROMPTS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setPrompt(preset);
                    handleRunConsensus(preset);
                  }}
                  disabled={isModelsStreaming || isJudging}
                  className="px-3 py-1 bg-neutral-950/80 hover:bg-neutral-800 border border-neutral-800/80 rounded-full text-neutral-300 hover:text-white text-[11px] whitespace-nowrap transition"
                >
                  {preset.length > 42 ? preset.substring(0, 42) + '...' : preset}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* 3-Column Simultaneous Side-by-Side Model Arena */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold tracking-wider uppercase text-neutral-400">
                Parallel LLM Comparison (3 Columns)
              </h2>
              <span className="text-[10px] bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded-full font-mono">
                Simultaneous
              </span>
            </div>
            <p className="text-xs text-neutral-500 hidden md:block">
              Click any model title to search & select from {availableModels.length}+ live models
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-[460px]">
            {activeModels.map((config, index) => {
              const output = modelOutputs[config.id];
              const evaluation = judgeReport?.evaluations?.find((e) => e.modelId === config.id);
              const isWinner = judgeReport?.winnerModelId === config.id;

              return (
                <ModelColumn
                  key={`${config.id}-${index}`}
                  config={config}
                  output={output}
                  evaluation={evaluation}
                  isWinner={isWinner}
                  onModelSelect={(newId) => handleModelChange(index, newId)}
                  availableModels={availableModels}
                  disabled={isModelsStreaming || isJudging}
                />
              );
            })}
          </div>
        </section>

        {/* 4th Judge AI Report & Verdict Section */}
        <section ref={verdictRef} className="pt-2">
          <JudgeVerdict
            report={judgeReport}
            isLoading={isJudging}
            error={judgeError}
            models={activeModels}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-900 bg-neutral-950 py-6 text-center text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>Consensus AI • Powered by OpenRouter & Perplexity Sonar Judge</span>
          </div>
          <div className="text-[11px] text-neutral-600">
            Side-by-side verification and truth synthesis
          </div>
        </div>
      </footer>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        userApiKey={userApiKey}
        onSaveApiKey={handleSaveApiKey}
        judgeModelId={judgeModelId}
        onSaveJudgeModel={handleSaveJudgeModel}
        availableModels={availableModels}
        onRefreshModels={() => fetchCatalog()}
        isRefreshingModels={isFetchingCatalog}
      />
    </div>
  );
}
