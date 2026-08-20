'use client';

import React, { useState, useEffect } from 'react';
import { LLMConfig } from '@/types/consensus';
import { JUDGE_MODEL_CONFIG } from '@/lib/models';
import { generateCodeVerifier, generateCodeChallenge } from '@/lib/pkce';
import {
  X,
  Key,
  Sparkles,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Lock,
} from 'lucide-react';

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
  const [isRedirectingOAuth, setIsRedirectingOAuth] = useState(false);

  useEffect(() => {
    setApiKey(userApiKey);
  }, [userApiKey]);

  useEffect(() => {
    setJudgeModel(judgeModelId);
  }, [judgeModelId]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveApiKey(apiKey.trim());
    onSaveJudgeModel(judgeModel);
    onClose();
  };

  const handleOpenRouterOAuth = async () => {
    setIsRedirectingOAuth(true);
    try {
      // 1. Generate PKCE code verifier and S256 challenge
      const verifier = generateCodeVerifier();
      sessionStorage.setItem('openrouter_pkce_verifier', verifier);
      const challenge = await generateCodeChallenge(verifier);

      // 2. Build OpenRouter OAuth URL
      const callbackUrl = `${window.location.origin}/auth/callback`;
      const authUrl = `https://openrouter.ai/auth?callback_url=${encodeURIComponent(
        callbackUrl
      )}&code_challenge=${encodeURIComponent(challenge)}&code_challenge_method=S256`;

      // 3. Redirect to OpenRouter login/auth
      window.location.href = authUrl;
    } catch (err) {
      console.error('Failed to initiate OpenRouter OAuth PKCE:', err);
      setIsRedirectingOAuth(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Arena Settings & OpenRouter Auth</h3>
              <p className="text-xs text-neutral-400">
                Connect your OpenRouter account or configure manual keys
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 text-sm text-neutral-200">
          {/* OpenRouter 1-Click OAuth Section */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-neutral-950 border border-indigo-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span className="font-bold text-xs text-white uppercase tracking-wider">
                  OpenRouter OAuth (PKCE)
                </span>
              </div>
              {userApiKey && (
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-3 h-3" /> Connected
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Connect your personal OpenRouter account in 1-click without copying keys. Securely authorized via OAuth PKCE with automatic key exchange.
            </p>
            <button
              type="button"
              onClick={handleOpenRouterOAuth}
              disabled={isRedirectingOAuth}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition"
            >
              {isRedirectingOAuth ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Redirecting to OpenRouter...</span>
                </>
              ) : (
                <>
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{userApiKey ? 'Reconnect OpenRouter Account' : 'Connect OpenRouter with OAuth'}</span>
                </>
              )}
            </button>
          </div>

          {/* Manual API Key */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>Or Enter API Key Manually</span>
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
              If not set here, uses <code className="bg-neutral-800 px-1 py-0.5 rounded text-neutral-300">OPENROUTER_API_KEY</code> configured in environment.
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
                <option value="anthropic/claude-sonnet-4.5">Anthropic Claude Sonnet 4.5</option>
                <option value="google/gemini-2.5-flash">Google Gemini 2.5 Flash</option>
                <option value="deepseek/deepseek-r1">DeepSeek R1</option>
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
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
