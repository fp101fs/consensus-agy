'use client';

import React, { useState } from 'react';
import { LLMConfig, ModelOutput, ModelEvaluation } from '@/types/consensus';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Bot,
  CheckCircle2,
  AlertTriangle,
  Trophy,
  Zap,
  Clock,
  ShieldAlert,
  Search,
  RotateCcw,
  StopCircle,
  Coins,
  Gauge,
  Check,
} from 'lucide-react';

interface ModelColumnProps {
  config: LLMConfig;
  output?: ModelOutput;
  evaluation?: ModelEvaluation;
  isWinner?: boolean;
  onModelSelect?: (newId: string) => void;
  onRetry?: () => void;
  onCancel?: () => void;
  availableModels: LLMConfig[];
  disabled?: boolean;
}

export const ModelColumn: React.FC<ModelColumnProps> = ({
  config,
  output,
  evaluation,
  isWinner = false,
  onModelSelect,
  onRetry,
  onCancel,
  availableModels,
  disabled = false,
}) => {
  const [filterText, setFilterText] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const isLoading = output?.status === 'loading';
  const isCompleted = output?.status === 'completed';
  const hasError = output?.status === 'error';
  const isCancelled = output?.status === 'cancelled';
  const isRateLimit =
    output?.error?.toLowerCase().includes('rate limited') ||
    output?.error?.includes('429');

  const filteredModels = availableModels.filter(
    (m) =>
      m.name.toLowerCase().includes(filterText.toLowerCase()) ||
      m.id.toLowerCase().includes(filterText.toLowerCase()) ||
      m.provider.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div
      className={`flex flex-col h-full rounded-2xl border transition-all duration-300 relative overflow-visible ${
        isWinner
          ? 'border-amber-400/80 bg-gradient-to-b from-amber-950/20 via-neutral-900/90 to-neutral-950 shadow-lg shadow-amber-500/10 ring-1 ring-amber-400/50'
          : 'border-neutral-800 bg-neutral-900/70 hover:border-neutral-700'
      }`}
    >
      {/* Winner Banner if Judge picked this model */}
      {isWinner && (
        <div className="bg-gradient-to-r from-amber-500 to-yellow-400 text-neutral-950 font-bold px-3 py-1 text-xs flex items-center justify-between shadow-sm rounded-t-2xl">
          <div className="flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-neutral-950 fill-neutral-950" />
            <span>JUDGE VERDICT WINNER</span>
          </div>
          {evaluation && (
            <span className="bg-neutral-950/20 px-1.5 py-0.5 rounded text-[10px] tracking-wide font-black">
              Score: {evaluation.overallScore}/100
            </span>
          )}
        </div>
      )}

      {/* Header with Searchable Model Selection Dropdown */}
      <div className="p-4 border-b border-neutral-800/80 bg-neutral-950/40 backdrop-blur-sm relative z-30">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className={`p-1.5 rounded-lg ${config.badgeBg} border shrink-0`}>
              <Bot className="w-4 h-4" />
            </div>

            {/* Custom Interactive / Searchable Dropdown */}
            <div className="relative flex-1 min-w-0">
              <button
                type="button"
                disabled={disabled}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="text-left w-full truncate text-sm font-semibold text-neutral-100 hover:text-white flex items-center justify-between gap-1 group py-0.5 px-1 rounded hover:bg-neutral-800/60 transition"
              >
                <span className="truncate">{config.name}</span>
                <span className="text-[10px] text-neutral-500 font-mono group-hover:text-neutral-300">
                  ▼
                </span>
              </button>

              <div className="text-[11px] text-neutral-400 font-mono truncate px-1">
                {config.tag || config.provider}
              </div>

              {/* Popup Search Menu */}
              {isDropdownOpen && !disabled && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsDropdownOpen(false)}
                  />
                  <div className="absolute top-full left-0 mt-1.5 w-72 max-h-80 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden">
                    <div className="p-2 border-b border-neutral-800 bg-neutral-950 flex items-center gap-1.5">
                      <Search className="w-3.5 h-3.5 text-neutral-400" />
                      <input
                        type="text"
                        autoFocus
                        placeholder="Search OpenRouter models..."
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                        className="w-full bg-transparent text-xs text-white focus:outline-none placeholder-neutral-500"
                      />
                    </div>
                    <div className="overflow-y-auto max-h-60 p-1 divide-y divide-neutral-800/40">
                      {filteredModels.length === 0 ? (
                        <div className="p-3 text-center text-xs text-neutral-500">
                          No matching models found
                        </div>
                      ) : (
                        filteredModels.map((m) => (
                          <button
                            key={m.id}
                            onClick={() => {
                              if (onModelSelect) onModelSelect(m.id);
                              setIsDropdownOpen(false);
                              setFilterText('');
                            }}
                            className={`w-full text-left p-2 rounded-lg text-xs hover:bg-neutral-800 transition flex flex-col ${
                              m.id === config.id
                                ? 'bg-indigo-600/20 text-indigo-300 font-bold'
                                : 'text-neutral-200'
                            }`}
                          >
                            <span className="font-medium">{m.name}</span>
                            <span className="text-[10px] text-neutral-400 font-mono truncate">
                              {m.id}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Column Action / Status indicators */}
          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            {isLoading && (
              <div className="flex items-center gap-1.5">
                <span className="flex items-center gap-1 text-[11px] text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20 animate-pulse font-medium">
                  <div className="w-2 h-2 rounded-full bg-sky-400 animate-ping mr-0.5" />
                  Running...
                </span>
                {onCancel && (
                  <button
                    onClick={onCancel}
                    title="Cancel this LLM"
                    className="p-1 rounded-md bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-800/40 transition"
                  >
                    <StopCircle className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {isCompleted && (
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md font-medium">
                <Check className="w-3 h-3 text-emerald-400" /> Done
              </span>
            )}

            {isCancelled && (
              <span className="flex items-center gap-1 text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                Stopped
              </span>
            )}
          </div>
        </div>

        {/* Mini scorecard preview if evaluated */}
        {evaluation && (
          <div className="mt-2.5 pt-2.5 border-t border-neutral-800/60 grid grid-cols-3 gap-1 text-center">
            <div className="bg-neutral-950/60 p-1 rounded border border-neutral-800">
              <div className="text-[10px] text-neutral-400">Accuracy</div>
              <div
                className={`text-xs font-bold ${
                  evaluation.accuracyScore >= 85
                    ? 'text-emerald-400'
                    : evaluation.accuracyScore >= 70
                    ? 'text-yellow-400'
                    : 'text-red-400'
                }`}
              >
                {evaluation.accuracyScore}%
              </div>
            </div>
            <div className="bg-neutral-950/60 p-1 rounded border border-neutral-800">
              <div className="text-[10px] text-neutral-400">Complete</div>
              <div className="text-xs font-bold text-sky-400">
                {evaluation.completenessScore}%
              </div>
            </div>
            <div className="bg-neutral-950/60 p-1 rounded border border-neutral-800">
              <div className="text-[10px] text-neutral-400">Reasoning</div>
              <div className="text-xs font-bold text-purple-400">
                {evaluation.reasoningScore}%
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Model Response Body */}
      <div className="flex-1 p-4 overflow-y-auto max-h-[460px] min-h-[220px] text-sm text-neutral-200 leading-relaxed font-sans space-y-3 relative">
        {/* Animated spinner while generating */}
        {isLoading && !output?.response && (
          <div className="h-full flex flex-col items-center justify-center py-16 text-neutral-400 space-y-3">
            <div className="relative flex items-center justify-center">
              <div className="w-10 h-10 border-2 border-neutral-700 border-t-indigo-400 rounded-full animate-spin" />
              <Bot className="w-4 h-4 text-indigo-400 absolute" />
            </div>
            <p className="text-xs text-neutral-300 font-medium animate-pulse">
              Running {config.name}...
            </p>
          </div>
        )}

        {hasError && (
          <div
            className={`p-4 rounded-xl border text-xs space-y-2.5 ${
              isRateLimit
                ? 'bg-amber-950/20 border-amber-800/40 text-amber-200'
                : 'bg-red-950/30 border-red-800/50 text-red-300'
            }`}
          >
            <div className="flex items-start gap-2">
              <ShieldAlert
                className={`w-4 h-4 shrink-0 mt-0.5 ${
                  isRateLimit ? 'text-amber-400' : 'text-red-400'
                }`}
              />
              <div className="flex-1">
                <p className="font-semibold">
                  {isRateLimit ? 'Upstream Rate Limit (429)' : 'Execution Error'}
                </p>
                <p className="opacity-90 mt-1 leading-relaxed">
                  {output?.error || 'Failed to stream response'}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
              <span className="text-[11px] text-neutral-400">
                {isRateLimit
                  ? 'Switch to another model or retry'
                  : 'Try selecting another model'}
              </span>
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  disabled={disabled}
                  className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-medium text-[11px] flex items-center gap-1 transition"
                >
                  <RotateCcw className="w-3 h-3" /> Retry
                </button>
              )}
            </div>
          </div>
        )}

        {/* Empty response fallback after execution completed */}
        {isCompleted && !output?.response && (
          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/40 text-xs text-amber-200 space-y-2">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Empty / Non-Text Output Returned</span>
            </div>
            <p className="text-neutral-300 text-[11px] leading-relaxed">
              The model completed execution but stream tokens were empty or suppressed by the upstream provider.
            </p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-[11px] font-medium transition"
              >
                Retry Model
              </button>
            )}
          </div>
        )}

        {/* Idle initial state */}
        {!isLoading && !hasError && !isCompleted && !output?.response && (
          <div className="h-full flex flex-col items-center justify-center py-12 text-neutral-600 text-xs italic">
            Waiting for prompt execution...
          </div>
        )}

        {output?.response && (
          <div className="prose prose-invert prose-sm max-w-none text-neutral-200 prose-pre:bg-neutral-950 prose-pre:border prose-pre:border-neutral-800 prose-headings:text-neutral-100">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {output.response}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {/* Live Metrics Footer (Cost, Tokens In/Out, Latency, Tokens/Sec) */}
      {(output?.status === 'completed' || (output?.response && !isLoading)) && (
        <div className="px-3 py-2 border-t border-neutral-800/80 bg-neutral-950/70 grid grid-cols-4 gap-1 text-[10px] font-mono text-neutral-300">
          <div className="bg-neutral-900/60 p-1.5 rounded border border-neutral-800/70 flex flex-col items-center">
            <span className="text-neutral-500 text-[9px] flex items-center gap-0.5">
              <Coins className="w-2.5 h-2.5 text-amber-400" /> Cost
            </span>
            <span className="font-bold text-amber-300">
              ${(output.costUsd || 0).toFixed(5)}
            </span>
          </div>

          <div className="bg-neutral-900/60 p-1.5 rounded border border-neutral-800/70 flex flex-col items-center">
            <span className="text-neutral-500 text-[9px]">In / Out</span>
            <span className="font-semibold text-neutral-200">
              {output.promptTokens || 0} / {output.completionTokens || 0}
            </span>
          </div>

          <div className="bg-neutral-900/60 p-1.5 rounded border border-neutral-800/70 flex flex-col items-center">
            <span className="text-neutral-500 text-[9px] flex items-center gap-0.5">
              <Clock className="w-2.5 h-2.5 text-sky-400" /> Time
            </span>
            <span className="font-semibold text-sky-300">
              {((output.latencyMs || 0) / 1000).toFixed(1)}s
            </span>
          </div>

          <div className="bg-neutral-900/60 p-1.5 rounded border border-neutral-800/70 flex flex-col items-center">
            <span className="text-neutral-500 text-[9px] flex items-center gap-0.5">
              <Gauge className="w-2.5 h-2.5 text-emerald-400" /> Speed
            </span>
            <span className="font-bold text-emerald-300">
              {(output.tokensPerSec || 0).toFixed(0)} tok/s
            </span>
          </div>
        </div>
      )}

      {/* Evaluation Highlights Footer */}
      {evaluation && (
        <div className="p-3 border-t border-neutral-800/80 bg-neutral-950/60 text-xs space-y-2 rounded-b-2xl">
          {evaluation.strengths?.length > 0 && (
            <div className="text-[11px] text-emerald-400 flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-400" />
              <span>
                <strong className="text-emerald-300">Strength:</strong>{' '}
                {evaluation.strengths[0]}
              </span>
            </div>
          )}

          {evaluation.weaknesses?.length > 0 && (
            <div className="text-[11px] text-amber-400 flex items-start gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
              <span>
                <strong className="text-amber-300">Gap/Critique:</strong>{' '}
                {evaluation.weaknesses[0]}
              </span>
            </div>
          )}

          {evaluation.hallucinationsOrErrors &&
            evaluation.hallucinationsOrErrors.length > 0 && (
              <div className="text-[11px] text-red-400 bg-red-950/30 p-1.5 rounded border border-red-900/40 flex items-start gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-400" />
                <span>
                  <strong className="text-red-300">Flagged Flaw:</strong>{' '}
                  {evaluation.hallucinationsOrErrors[0]}
                </span>
              </div>
            )}
        </div>
      )}
    </div>
  );
};
