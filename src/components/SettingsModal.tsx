'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Key, Sparkles, X, Check } from 'lucide-react';
import { LLMConfig } from '@/types/consensus';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userApiKey: string;
  onSaveApiKey: (key: string) => void;
  judgeModelId: string;
  onSaveJudgeModel: (modelId: string) => void;
  availableModels: LLMConfig[];
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  userApiKey,
  onSaveApiKey,
  judgeModelId,
  onSaveJudgeModel,
  availableModels,
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
    }, 800);
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
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>OpenRouter API Key (Optional client override)</span>
            </label>
            <input
              type="password"
              placeholder="sk-or-v1-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
            />
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              If not provided, the app will use the <code className="bg-neutral-800 px-1 py-0.5 rounded text-neutral-300">OPENROUTER_API_KEY</code> configured in your environment / Vercel deployment.
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
              <option value="perplexity/sonar-reasoning-pro">
                Perplexity Sonar Reasoning Pro (Live Web Search + Verification)
              </option>
              <option value="perplexity/sonar">
                Perplexity Sonar (Fast Web Grounded)
              </option>
              <option value="openai/gpt-4o">
                OpenAI GPT-4o (Deep Multimodal Reasoning)
              </option>
              <option value="anthropic/claude-3.5-sonnet">
                Anthropic Claude 3.5 Sonnet (Nuanced Analytical Judge)
              </option>
              <option value="deepseek/deepseek-r1">
                DeepSeek R1 (Exhaustive Chain-of-Thought Judge)
              </option>
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
