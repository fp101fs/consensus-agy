'use client';

import React from 'react';
import { ConsensusJudgeReport, LLMConfig } from '@/types/consensus';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Gavel,
  CheckCircle,
  AlertCircle,
  Trophy,
  ExternalLink,
  Sparkles,
  Search,
  Scale,
  BarChart3,
  Layers,
  BrainCircuit,
  HelpCircle,
  ShieldAlert,
} from 'lucide-react';

interface JudgeVerdictProps {
  report: ConsensusJudgeReport | null;
  isLoading: boolean;
  error?: string;
  models: LLMConfig[];
}

export const JudgeVerdict: React.FC<JudgeVerdictProps> = ({
  report,
  isLoading,
  error,
  models,
}) => {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/20 via-neutral-900/80 to-purple-950/20 p-8 shadow-2xl relative overflow-hidden text-center space-y-4 my-8">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/10 to-pink-500/5 animate-pulse" />
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 mb-3 shadow-lg shadow-indigo-500/20 animate-bounce">
            <Scale className="w-6 h-6 animate-pulse" />
          </div>
          <h3 className="text-xl font-bold text-neutral-100 flex items-center gap-2">
            <span>Judge AI Testing Calibration, Uniqueness & Fact-Checking</span>
            <span className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
            </span>
          </h3>
          <p className="text-sm text-neutral-400 max-w-lg mt-1">
            Verifying solution uniqueness, evaluating confidence calibration (detecting unjustified certainty), and synthesizing consensus truth...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-800/60 bg-red-950/20 p-6 my-8 text-red-300">
        <div className="flex items-center gap-2 font-bold text-red-200">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <span>Judge Deliberation Error</span>
        </div>
        <p className="text-sm mt-1.5 text-red-300/90">{error}</p>
      </div>
    );
  }

  if (!report) return null;

  const winnerModel = models.find((m) => m.id === report.winnerModelId);

  const getAgreementBadge = (level: string) => {
    switch (level) {
      case 'High Consensus':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Moderate Divergence':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      case 'Sharp Disagreement':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default:
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    }
  };

  const getSolvabilityBadge = (solvability?: string) => {
    switch (solvability) {
      case 'Underdetermined (Multiple Solutions)':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/40';
      case 'Impossible (Contradictory/False Premise)':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/40';
      case 'Guaranteed Unique Solution':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40';
      default:
        return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/40';
    }
  };

  return (
    <div className="rounded-3xl border border-indigo-500/30 bg-neutral-900/90 shadow-2xl my-8 overflow-hidden backdrop-blur-xl">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-indigo-900/60 via-purple-900/50 to-neutral-900/80 p-6 border-b border-indigo-500/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-500/20 border border-indigo-400/30 rounded-2xl text-indigo-300 shadow-inner">
              <Gavel className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-extrabold text-white tracking-tight">
                  Supreme Judge Consensus Verdict
                </h2>
                <span className="text-[11px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
                  <Search className="w-3 h-3" /> Live Verified
                </span>
                {report.problemSolvability && (
                  <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border flex items-center gap-1 ${getSolvabilityBadge(report.problemSolvability)}`}>
                    <BrainCircuit className="w-3 h-3" />
                    <span>{report.problemSolvability}</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-300 mt-0.5">
                Evaluated against factual accuracy, step-by-step logic, epistemic calibration, and uniqueness recognition.
              </p>
            </div>
          </div>

          {/* Quick Metrics Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className={`px-3 py-1 rounded-xl text-xs font-semibold border flex items-center gap-1.5 ${getAgreementBadge(report.agreementLevel)}`}>
              <Layers className="w-3.5 h-3.5" />
              <span>{report.agreementLevel} ({report.agreementScore}%)</span>
            </div>

            <div className="px-3 py-1 rounded-xl text-xs font-semibold border bg-purple-500/10 text-purple-300 border-purple-500/30 flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Judge Confidence: {report.confidenceRating}%</span>
            </div>
          </div>
        </div>

        {/* Executive summary quote */}
        <div className="mt-4 p-3.5 bg-neutral-950/50 rounded-xl border border-indigo-500/20 text-sm text-neutral-200">
          <span className="font-semibold text-indigo-300 mr-2">Executive Verdict:</span>
          {report.verdictSummary}
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-8">
        {/* Unified Consensus Synthesis */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-neutral-100 uppercase tracking-wider text-xs">
              Unified Ground-Truth Synthesis (Best Combined Solution)
            </h3>
          </div>
          <div className="p-5 rounded-2xl bg-neutral-950/70 border border-neutral-800 text-neutral-200 leading-relaxed prose prose-invert prose-indigo max-w-none shadow-inner">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {report.synthesis}
            </ReactMarkdown>
          </div>
        </div>

        {/* Winner Callout Card */}
        {report.winnerModelId && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-yellow-950/20 to-neutral-900 border border-amber-500/40 flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300">
              <Trophy className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Winning Model
                </span>
                <span className="font-bold text-white text-base">
                  {winnerModel?.name || report.winnerModelId}
                </span>
              </div>
              <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                {report.winnerReason}
              </p>
            </div>
          </div>
        )}

        {/* Metacognitive Calibration & Uniqueness Cards */}
        {report.evaluations?.some((e) => e.metaCognition) && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-indigo-400" />
              <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                Epistemic Calibration & Problem Uniqueness Audit
              </h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {report.evaluations.map((ev) => {
                const meta = ev.metaCognition;
                if (!meta) return null;
                const isOverconfident = meta.confidenceAppropriateness === 'Overconfident';
                return (
                  <div
                    key={`meta-${ev.modelId}`}
                    className="p-3.5 rounded-2xl bg-neutral-950/60 border border-neutral-800 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{ev.modelName || ev.modelId}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        isOverconfident
                          ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {meta.confidenceAppropriateness || 'Calibrated'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1 text-[11px] font-mono text-neutral-400">
                      <div>Claimed Conf: <strong className="text-white">{meta.claimedConfidence ?? 'N/A'}%</strong></div>
                      <div className="truncate text-right">{meta.uniquenessRecognition || 'Evaluated'}</div>
                    </div>

                    {meta.epistemicVerdict && (
                      <p className="text-[11px] text-neutral-400 leading-snug border-t border-neutral-800/80 pt-1.5">
                        {meta.epistemicVerdict}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 2-Column Consensus vs Discrepancies */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Key Agreements */}
          <div className="p-5 rounded-2xl bg-emerald-950/10 border border-emerald-500/20 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
              <CheckCircle className="w-4 h-4" />
              <span>Core Agreement Points (Consensus)</span>
            </div>
            <ul className="space-y-2">
              {report.keyConsensusPoints?.map((pt, i) => (
                <li key={i} className="text-xs text-neutral-300 flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Disagreements / Gaps */}
          <div className="p-5 rounded-2xl bg-rose-950/10 border border-rose-500/20 space-y-3">
            <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>Identified Discrepancies & Flaws</span>
            </div>
            <ul className="space-y-2">
              {report.disagreementsOrOutliers?.map((dis, i) => (
                <li key={i} className="text-xs text-neutral-300 flex items-start gap-2">
                  <span className="text-rose-500 font-bold">•</span>
                  <span>{dis}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Cited References / Realtime Verification */}
        {report.citedReferences && report.citedReferences.length > 0 && (
          <div className="p-5 rounded-2xl bg-neutral-950/50 border border-neutral-800 space-y-3">
            <div className="flex items-center gap-2 text-sky-400 font-semibold text-sm">
              <Search className="w-4 h-4" />
              <span>Fact-Checking & Cited References</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {report.citedReferences.map((ref, i) => (
                <div key={i} className="p-3 bg-neutral-900/80 rounded-xl border border-neutral-800/80 text-xs">
                  <div className="flex items-center justify-between text-neutral-200 font-semibold mb-1">
                    <span>{ref.title}</span>
                    {ref.url && (
                      <a
                        href={ref.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sky-400 hover:text-sky-300 flex items-center gap-0.5"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <p className="text-neutral-400 text-[11px] italic mb-1.5">"{ref.snippet}"</p>
                  <div className="text-[11px] text-emerald-400/90 font-medium">
                    ✓ Verified Fact: {ref.verifiedFact}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quantified Multi-Model Scorecard Table */}
        {report.evaluations && report.evaluations.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-4 h-4 text-neutral-400" />
              <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                Comprehensive Model Scorecard & Calibration
              </h4>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-neutral-800 bg-neutral-950/60">
              <table className="w-full text-left text-xs text-neutral-300">
                <thead className="bg-neutral-900/80 border-b border-neutral-800 text-[11px] text-neutral-400 uppercase">
                  <tr>
                    <th className="p-3">Model</th>
                    <th className="p-3">Accuracy</th>
                    <th className="p-3">Completeness</th>
                    <th className="p-3">Reasoning</th>
                    <th className="p-3">Calibration</th>
                    <th className="p-3">Overall</th>
                    <th className="p-3">Key Differentiator</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60">
                  {report.evaluations.map((ev) => {
                    const isWin = ev.modelId === report.winnerModelId;
                    return (
                      <tr key={ev.modelId} className={isWin ? 'bg-amber-500/5 font-medium' : ''}>
                        <td className="p-3 flex items-center gap-1.5">
                          {isWin && <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                          <span className="font-bold text-white">{ev.modelName || ev.modelId}</span>
                        </td>
                        <td className="p-3 font-mono">
                          <span className={`px-2 py-0.5 rounded ${ev.accuracyScore >= 85 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                            {ev.accuracyScore}%
                          </span>
                        </td>
                        <td className="p-3 font-mono text-sky-300">{ev.completenessScore}%</td>
                        <td className="p-3 font-mono text-purple-300">{ev.reasoningScore}%</td>
                        <td className="p-3 font-mono text-[11px]">
                          {ev.metaCognition?.confidenceAppropriateness ? (
                            <span className={ev.metaCognition.confidenceAppropriateness === 'Overconfident' ? 'text-rose-400' : 'text-emerald-400'}>
                              {ev.metaCognition.confidenceAppropriateness}
                            </span>
                          ) : (
                            <span className="text-neutral-500">N/A</span>
                          )}
                        </td>
                        <td className="p-3 font-mono font-bold text-amber-300 text-sm">
                          {ev.overallScore}/100
                        </td>
                        <td className="p-3 text-neutral-400 text-[11px] max-w-xs">
                          {ev.distinctiveAngle || ev.strengths?.[0] || 'Standard response'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
