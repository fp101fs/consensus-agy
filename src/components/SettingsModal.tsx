'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Key, Sparkles, X, Check, RefreshCw } from 'lucide-react';
import { LLMConfig } from '@/types/consensus';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userApiKey: string;
  onSaveApiKey: (key: string) => void;
  judgeModelId: string;
  onSaveJudgeModel: (modelId: string) => void;
  availableModels: LLMConfig[];
  onRefreshModels?: () => void;
  isRefreshingModels?: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  userApiKey,
  onSaveApiKey,
  judgeModelId,
  onSaveJudgeModel,
  availableModels,
  onRefreshModels,
  isRefreshingModels = false,
}) => {
  const [apiKey, setApiKey] = useState(userApiKey);
  const [judgeModel, setJudgeModel] = useState(judgeModelId);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setApiKey(userApiKey);
    setJudgeModel(judgeModelId);
  }, [userApiKey, judgeModelId]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveApiKey(apiKey.trim());
    onSaveJudgeModel(judgeModel);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
          <div className="flex items-center gap-2 font-bold text-white text-base">
            <Settings className="w-5 h-5 text-indigo-400" />
            <span>Consensus Arena Settings</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-sm text-neutral-200">
          {/* API Key */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>OpenRouter API Key</span>
              </span>
              {onRefreshModels && (
                <button
                  type="button"
                  onClick={onRefreshModels}
                  disabled={isRefreshingModels}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 hover:underline lowercase"
                >
                  <RefreshCw className={`w-3 h-3 ${isRefreshingModels ? 'animate-spin' : ''}`} />
                  <span>sync catalog</span>
                </button>
              )}
            </label>
            <input
              type="password"
              placeholder="sk-or-v1-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
            />
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              If not set here, uses <code className="bg-neutral-800 px-1 py-0.5 rounded text-neutral-300">OPENROUTER_API_KEY</code> configured in environment/Vercel.
            </p>
          </div>

          {/* Judge Model Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Judge AI Model (Real-time Arbiter)</span>
            </label>
            <select
              value={judgeModel}
              onChange={(e) => setJudgeModel(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <optgroup label="Search-Grounded & Verification Models">
                <option value="perplexity/sonar-reasoning-pro">
                  Perplexity Sonar Reasoning Pro (Deep Online Search & Verification)
                </option>
                <option value="perplexity/sonar">
                  Perplexity Sonar (Online Fact Search)
                </option>
              </optgroup>
              <optgroup label="Deep Reasoning & Foundation Models">
                <option value="openai/gpt-4o">OpenAI GPT-4o</option>
                <option value="anthropic/claude-3.5-sonnet">Anthropic Claude 3.5 Sonnet</option>
                <option value="deepseek/deepseek-r1">DeepSeek R1</option>
                <option value="google/gemini-2.0-flash-001">Google Gemini 2.0 Flash</option>
              </optgroup>
              {availableModels.length > 0 && (
                <optgroup label="All Catalog Models">
                  {availableModels.map((m) => (
                    <option key={`judge-${m.id}`} value={m.id}>
                      {m.name} ({m.provider})
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
            <p className="text-[11px] text-neutral-400">
              Perplexity Sonar provides online search grounding and live citations to verify conflicting facts.
            </p>
          </div>
        </div>

        <div className="p-4 border-t border-neutral-800 bg-neutral-950/60 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition"
          >
            {saved ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                <span>Saved!</span>
              </>
            ) : (
              <span>Save Preferences</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
