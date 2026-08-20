'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { LLMConfig, ModelOutput, ConsensusJudgeReport } from '@/types/consensus';
import { DEFAULT_MODELS, AVAILABLE_MODELS_LIST, JUDGE_MODEL_CONFIG } from '@/lib/models';
import { BENCHMARK_PRESET_PROMPTS, PresetPrompt } from '@/lib/presets';
import { ModelColumn } from '@/components/ModelColumn';
import { JudgeVerdict } from '@/components/JudgeVerdict';
import { SettingsModal } from '@/components/SettingsModal';
import { PresetsModal } from '@/components/PresetsModal';
import { UsageWidget } from '@/components/UsageWidget';
import { estimateTokens, calculateCost } from '@/lib/pricing';
import {
  Sparkles,
  Send,
  Sliders,
  Scale,
  Zap,
  ShieldCheck,
  RefreshCw,
  Trophy,
  History,
  StopCircle,
  Brain,
} from 'lucide-react';

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
  const [presetsModalOpen, setPresetsModalOpen] = useState(false);
  const [userApiKey, setUserApiKey] = useState('');
  const [judgeModelId, setJudgeModelId] = useState(JUDGE_MODEL_CONFIG.id);
  const [isFetchingCatalog, setIsFetchingCatalog] = useState(false);

  // Abort controllers for canceling LLM queries
  const abortControllersRef = useRef<Record<string, AbortController>>({});
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

          setActiveModels((prev) => {
            return prev.map((curr) => {
              const exact = data.models.find((m: LLMConfig) => m.id === curr.id);
              if (exact) return exact;

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

  const cancelSingleModel = (modelId: string) => {
    if (abortControllersRef.current[modelId]) {
      abortControllersRef.current[modelId].abort();
      delete abortControllersRef.current[modelId];
    }
    setModelOutputs((prev) => ({
      ...prev,
      [modelId]: {
        ...(prev[modelId] || { modelId, modelName: modelId, provider: 'AI', response: '' }),
        status: 'cancelled',
        error: 'Execution cancelled by user',
      },
    }));
  };

  const cancelAllRuns = () => {
    Object.keys(abortControllersRef.current).forEach((id) => {
      abortControllersRef.current[id].abort();
    });
    abortControllersRef.current = {};
    setIsModelsStreaming(false);
    setIsJudging(false);
  };

  const streamSingleModel = async (model: LLMConfig, promptText: string) => {
    const startTime = Date.now();
    let firstTokenTime: number | null = null;
    let explicitPromptTokens: number | null = null;
    let explicitCompletionTokens: number | null = null;

    const controller = new AbortController();
    abortControllersRef.current[model.id] = controller;

    setModelOutputs((prev) => ({
      ...prev,
      [model.id]: {
        modelId: model.id,
        modelName: model.name,
        provider: model.provider,
        response: '',
        status: 'loading',
        promptTokens: estimateTokens(promptText),
      },
    }));

    try {
      const response = await fetch('/api/stream-model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
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

              if (data.usage) {
                if (data.usage.prompt_tokens) explicitPromptTokens = data.usage.prompt_tokens;
                if (data.usage.completion_tokens) explicitCompletionTokens = data.usage.completion_tokens;
              }

              if (data.content) {
                if (!firstTokenTime) {
                  firstTokenTime = Date.now();
                }
                accumulatedText += data.content;
                const now = Date.now();
                const totalElapsedSec = Math.max(0.05, (now - startTime) / 1000);
                const currTokens = explicitCompletionTokens ?? estimateTokens(accumulatedText);
                const currentTokensPerSec = currTokens / totalElapsedSec;

                setModelOutputs((prev) => ({
                  ...prev,
                  [model.id]: {
                    modelId: model.id,
                    modelName: model.name,
                    provider: model.provider,
                    response: accumulatedText,
                    status: 'loading',
                    promptTokens: explicitPromptTokens ?? estimateTokens(promptText),
                    completionTokens: currTokens,
                    totalTokens: (explicitPromptTokens ?? estimateTokens(promptText)) + currTokens,
                    tokensPerSec: currentTokensPerSec,
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
      const promptTokens = explicitPromptTokens ?? estimateTokens(promptText);
      const completionTokens = explicitCompletionTokens ?? estimateTokens(accumulatedText);
      const totalTokens = promptTokens + completionTokens;
      
      // Calculate realistic tokens per second over actual duration
      const durationSec = Math.max(0.1, totalLatency / 1000);
      const tokensPerSec = completionTokens / durationSec;

      const costUsd = calculateCost(
        model.id,
        promptTokens,
        completionTokens,
        model.promptPrice,
        model.completionPrice
      );

      const finalOutput: ModelOutput = {
        modelId: model.id,
        modelName: model.name,
        provider: model.provider,
        response: accumulatedText,
        status: 'completed',
        latencyMs: totalLatency,
        promptTokens,
        completionTokens,
        totalTokens,
        costUsd,
        tokensPerSec: Number(tokensPerSec.toFixed(1)),
      };

      setModelOutputs((prev) => ({
        ...prev,
        [model.id]: finalOutput,
      }));

      delete abortControllersRef.current[model.id];

      return {
        modelId: model.id,
        modelName: model.name,
        response: accumulatedText,
        output: finalOutput,
      };
    } catch (err: unknown) {
      delete abortControllersRef.current[model.id];
      const errorMsg = err instanceof Error ? err.message : 'Unknown execution error';
      
      const errorOutput: ModelOutput = {
        modelId: model.id,
        modelName: model.name,
        provider: model.provider,
        response: '',
        status: err instanceof Error && err.name === 'AbortError' ? 'cancelled' : 'error',
        error: errorMsg,
      };

      setModelOutputs((prev) => ({
        ...prev,
        [model.id]: errorOutput,
      }));

      return {
        modelId: model.id,
        modelName: model.name,
        response: `[${errorMsg}]`,
        output: errorOutput,
      };
    }
  };

  const handleRunConsensus = async (customPrompt?: string) => {
    const promptToSubmit = customPrompt || prompt;
    if (!promptToSubmit.trim() || isModelsStreaming || isJudging) return;

    const overallStartTime = Date.now();
    setIsModelsStreaming(true);
    setIsJudging(false);
    setJudgeReport(null);
    setJudgeError(undefined);

    // Run 3 candidate models simultaneously in parallel
    const promises = activeModels.map((model) =>
      streamSingleModel(model, promptToSubmit)
    );

    const completedResults = await Promise.all(promises);
    setIsModelsStreaming(false);

    // Map completed outputs directly from return values to guarantee latest state
    const latestOutputs: Record<string, ModelOutput> = {};
    completedResults.forEach((r) => {
      if (r.output) {
        latestOutputs[r.modelId] = r.output;
      }
    });

    // Now trigger the 4th Judge AI LLM with fact-checking & quantitative synthesis
    setIsJudging(true);

    try {
      const judgeRes = await fetch('/api/judge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToSubmit,
          modelResponses: completedResults.map((r) => ({
            modelId: r.modelId,
            modelName: r.modelName,
            response: r.response,
          })),
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

      // Record full consensus query & metrics to PostgreSQL DB
      const totalElapsedMs = Date.now() - overallStartTime;
      await fetch('/api/record-run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToSubmit,
          modelOutputs: latestOutputs,
          judgeReport: report,
          totalLatencyMs: totalElapsedMs,
        }),
      }).catch((e) => console.warn('Could not record run in DB:', e));

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

  const handleSelectPreset = (selectedText: string, autoRun = false) => {
    setPrompt(selectedText);
    if (autoRun) {
      handleRunConsensus(selectedText);
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
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-md shadow-indigo-500/20 text-white font-black text-lg group-hover:scale-105 transition">
                C
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base tracking-tight text-white group-hover:text-indigo-200 transition">
                    Consensus Arena
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    Live ({availableModels.length})
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400">
                  Side-by-side arbitration & factual consensus
                </p>
              </div>
            </Link>
          </div>

          {/* Navigation Links & Widgets */}
          <div className="flex items-center gap-2.5">
            {/* Circular Usage Widget */}
            <UsageWidget />

            {/* Rankings Link */}
            <Link
              href="/rankings"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-800 bg-neutral-900/80 hover:bg-neutral-800 hover:border-amber-500/40 text-xs text-neutral-300 hover:text-white transition shadow-sm"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Rankings (Win %)</span>
            </Link>

            {/* History Link */}
            <Link
              href="/history"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-800 bg-neutral-900/80 hover:bg-neutral-800 hover:border-sky-500/40 text-xs text-neutral-300 hover:text-white transition shadow-sm"
            >
              <History className="w-3.5 h-3.5 text-sky-400" />
              <span>History</span>
            </Link>

            {/* Refresh Catalog */}
            <button
              onClick={() => fetchCatalog()}
              disabled={isFetchingCatalog}
              title="Refresh OpenRouter live model catalog"
              className="p-2 rounded-xl border border-neutral-800 bg-neutral-900/80 hover:bg-neutral-800 text-xs text-neutral-300 hover:text-white transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetchingCatalog ? 'animate-spin' : ''}`} />
            </button>

            {/* Settings Modal Toggle */}
            <button
              onClick={() => setSettingsOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-800 bg-neutral-900/80 hover:bg-neutral-800 text-xs text-neutral-300 hover:text-white transition"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Settings</span>
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

                {/* Cancel All Button if running */}
                {(isModelsStreaming || isJudging) && (
                  <button
                    onClick={cancelAllRuns}
                    className="px-3.5 py-2.5 rounded-xl bg-red-950/60 hover:bg-red-900/80 border border-red-800/60 text-red-300 text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <StopCircle className="w-3.5 h-3.5 text-red-400" />
                    <span>Cancel Run</span>
                  </button>
                )}

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

            {/* Quick Example Presets Pill Carousel + Modal Trigger */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
              <button
                onClick={() => setPresetsModalOpen(true)}
                className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 rounded-full text-indigo-300 hover:text-white font-bold text-[11px] shrink-0 flex items-center gap-1.5 transition shadow-sm"
              >
                <Brain className="w-3.5 h-3.5 text-indigo-400" />
                <span>All Benchmark Presets ({BENCHMARK_PRESET_PROMPTS.length})</span>
              </button>

              {BENCHMARK_PRESET_PROMPTS.slice(0, 8).map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset.prompt, false)}
                  disabled={isModelsStreaming || isJudging}
                  title={`${preset.title} • [${preset.category}]`}
                  className="px-3 py-1.5 bg-neutral-950/80 hover:bg-neutral-800 border border-neutral-800/80 rounded-full text-neutral-300 hover:text-white text-[11px] whitespace-nowrap transition flex items-center gap-1.5"
                >
                  <span>{preset.title.length > 28 ? preset.title.substring(0, 28) + '...' : preset.title}</span>
                  <span className="text-[10px] text-indigo-400 font-mono">[{preset.category}]</span>
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
                  onRetry={() => prompt && streamSingleModel(config, prompt)}
                  onCancel={() => cancelSingleModel(config.id)}
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
            <span>Consensus AI • Powered by OpenRouter, Neon PostgreSQL & Perplexity Sonar Judge</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-neutral-400">
            <Link href="/rankings" className="hover:text-white transition">Model Rankings</Link>
            <Link href="/usage" className="hover:text-white transition">Usage & Tokens</Link>
            <Link href="/history" className="hover:text-white transition">Query History</Link>
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

      {/* Presets Modal */}
      <PresetsModal
        isOpen={presetsModalOpen}
        onClose={() => setPresetsModalOpen(false)}
        onSelectPrompt={(selectedText) => handleSelectPreset(selectedText, false)}
      />
    </div>
  );
}
