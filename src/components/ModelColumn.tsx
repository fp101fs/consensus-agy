'use client';

import React from 'react';
import { LLMConfig, ModelOutput, ModelEvaluation } from '@/types/consensus';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, CheckCircle2, AlertTriangle, Trophy, Zap, Clock, ShieldAlert } from 'lucide-react';

interface ModelColumnProps {
  config: LLMConfig;
  output?: ModelOutput;
  evaluation?: ModelEvaluation;
  isWinner?: boolean;
  onModelSelect?: (newId: string) => void;
  availableModels: LLMConfig[];
  disabled?: boolean;
}

export const ModelColumn: React.FC<ModelColumnProps> = ({
  config,
  output,
  evaluation,
  isWinner = false,
  onModelSelect,
  availableModels,
  disabled = false,
}) => {
  const isLoading = output?.status === 'loading';
  const isCompleted = output?.status === 'completed';
  const hasError = output?.status === 'error';

  return (
    <div
      className={`flex flex-col h-full rounded-2xl border transition-all duration-300 relative overflow-hidden ${
        isWinner
          ? 'border-amber-400/80 bg-gradient-to-b from-amber-950/20 via-neutral-900/90 to-neutral-950 shadow-lg shadow-amber-500/10 ring-1 ring-amber-400/50'
          : 'border-neutral-800 bg-neutral-900/70 hover:border-neutral-700'
      }`}
    >
      {/* Winner Banner if Judge picked this model */}
      {isWinner && (
        <div className="bg-gradient-to-r from-amber-500 to-yellow-400 text-neutral-950 font-bold px-3 py-1 text-xs flex items-center justify-between shadow-sm">
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

      {/* Header */}
      <div className="p-4 border-b border-neutral-800/80 bg-neutral-950/40 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${config.badgeBg} border`}>
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <select
                  aria-label={`Select AI Model for ${config.name}`}
                  value={config.id}
                  disabled={disabled}
                  onChange={(e) => onModelSelect && onModelSelect(e.target.value)}
                  className="bg-transparent text-sm font-semibold text-neutral-100 hover:text-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-neutral-500 rounded pr-2"
                >
                  {availableModels.map((m) => (
                    <option key={m.id} value={m.id} className="bg-neutral-900 text-neutral-100">
                      {m.name} ({m.provider})
                    </option>
                  ))}
                </select>
              </div>
              <span className="text-[11px] text-neutral-400 font-mono">{config.provider}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {isLoading && (
              <span className="flex items-center gap-1 text-[11px] text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20 animate-pulse">
                <Zap className="w-3 h-3 animate-spin" /> Generating...
              </span>
            )}
            {isCompleted && output?.latencyMs && (
              <span className="flex items-center gap-1 text-[10px] text-neutral-400 bg-neutral-800/80 px-2 py-0.5 rounded-md font-mono">
                <Clock className="w-3 h-3" /> {(output.latencyMs / 1000).toFixed(1)}s
              </span>
            )}
          </div>
        </div>

        {/* Mini scorecard preview if evaluated */}
        {evaluation && (
          <div className="mt-2.5 pt-2.5 border-t border-neutral-800/60 grid grid-cols-3 gap-1 text-center">
            <div className="bg-neutral-950/60 p-1 rounded border border-neutral-800">
              <div className="text-[10px] text-neutral-400">Accuracy</div>
              <div className={`text-xs font-bold ${evaluation.accuracyScore >= 85 ? 'text-emerald-400' : evaluation.accuracyScore >= 70 ? 'text-yellow-400' : 'text-red-400'}`}>
                {evaluation.accuracyScore}%
              </div>
            </div>
            <div className="bg-neutral-950/60 p-1 rounded border border-neutral-800">
              <div className="text-[10px] text-neutral-400">Complete</div>
              <div className="text-xs font-bold text-sky-400">{evaluation.completenessScore}%</div>
            </div>
            <div className="bg-neutral-950/60 p-1 rounded border border-neutral-800">
              <div className="text-[10px] text-neutral-400">Reasoning</div>
              <div className="text-xs font-bold text-purple-400">{evaluation.reasoningScore}%</div>
            </div>
          </div>
        )}
      </div>

      {/* Model Response Body */}
      <div className="flex-1 p-4 overflow-y-auto max-h-[460px] min-h-[220px] text-sm text-neutral-200 leading-relaxed font-sans space-y-3">
        {isLoading && !output?.response && (
          <div className="h-full flex flex-col items-center justify-center py-12 text-neutral-500 space-y-3">
            <div className="w-6 h-6 border-2 border-neutral-600 border-t-sky-400 rounded-full animate-spin" />
            <p className="text-xs text-neutral-400 animate-pulse">Streaming response from {config.name}...</p>
          </div>
        )}

        {hasError && (
          <div className="p-3.5 bg-red-950/30 border border-red-800/50 rounded-xl text-red-300 text-xs flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-200">Execution Error</p>
              <p className="text-red-400/90 mt-0.5">{output?.error || 'Failed to stream response'}</p>
            </div>
          </div>
        )}

        {!isLoading && !hasError && !output?.response && (
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

      {/* Evaluation Highlights Footer */}
      {evaluation && (
        <div className="p-3 border-t border-neutral-800/80 bg-neutral-950/60 text-xs space-y-2">
          {evaluation.strengths?.length > 0 && (
            <div className="text-[11px] text-emerald-400 flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-400" />
              <span>
                <strong className="text-emerald-300">Strength:</strong> {evaluation.strengths[0]}
              </span>
            </div>
          )}

          {evaluation.weaknesses?.length > 0 && (
            <div className="text-[11px] text-amber-400 flex items-start gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
              <span>
                <strong className="text-amber-300">Gap/Critique:</strong> {evaluation.weaknesses[0]}
              </span>
            </div>
          )}

          {evaluation.hallucinationsOrErrors && evaluation.hallucinationsOrErrors.length > 0 && (
            <div className="text-[11px] text-red-400 bg-red-950/30 p-1.5 rounded border border-red-900/40 flex items-start gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-400" />
              <span>
                <strong className="text-red-300">Flagged Flaw:</strong> {evaluation.hallucinationsOrErrors[0]}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
