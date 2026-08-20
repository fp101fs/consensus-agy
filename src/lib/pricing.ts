// Token estimation & Pricing utilities

export function estimateTokens(text: string): number {
  if (!text) return 0;
  // Standard heuristic: ~4 characters per token
  return Math.ceil(text.length / 4);
}

// Fallback pricing per 1M tokens (USD)
export const MODEL_PRICING: Record<string, { prompt: number; completion: number }> = {
  'openai/gpt-4o': { prompt: 2.5, completion: 10 },
  'openai/gpt-4o-mini': { prompt: 0.15, completion: 0.6 },
  'anthropic/claude-sonnet-4.5': { prompt: 3, completion: 15 },
  'anthropic/claude-3.5-sonnet': { prompt: 3, completion: 15 },
  'google/gemini-2.5-flash': { prompt: 0.1, completion: 0.4 },
  'google/gemini-2.0-flash-001': { prompt: 0.1, completion: 0.4 },
  'deepseek/deepseek-r1': { prompt: 0.55, completion: 2.19 },
  'meta-llama/llama-3.3-70b-instruct': { prompt: 0.12, completion: 0.3 },
  'perplexity/sonar-reasoning-pro': { prompt: 2.0, completion: 8.0 },
  'perplexity/sonar': { prompt: 1.0, completion: 1.0 },
};

export function calculateCost(
  modelId: string,
  promptTokens: number,
  completionTokens: number,
  customPromptPrice?: number,
  customCompletionPrice?: number
): number {
  if (modelId.endsWith(':free')) return 0;

  const promptPricePerM = customPromptPrice !== undefined
    ? customPromptPrice * 1000000
    : MODEL_PRICING[modelId]?.prompt || 0.5;

  const completionPricePerM = customCompletionPrice !== undefined
    ? customCompletionPrice * 1000000
    : MODEL_PRICING[modelId]?.completion || 1.5;

  const promptCost = (promptTokens / 1_000_000) * promptPricePerM;
  const completionCost = (completionTokens / 1_000_000) * completionPricePerM;

  return promptCost + completionCost;
}

/**
 * Calculates a realistic, sanitized generation speed (tokens/sec).
 * Guards against:
 * 1. Broken upstream reported usage tokens (e.g. reporting max context window 10k instead of actual tokens).
 * 2. Instant server-cached or sub-second network bursts.
 */
export function calculateSanitizedSpeed(
  responseText: string,
  reportedCompletionTokens: number | undefined,
  latencyMs: number
): { tokens: number; tokensPerSec: number } {
  const estimated = estimateTokens(responseText);
  
  // If reported tokens is wildly disconnected from the actual text (e.g. reported 10,000 but text is 400 chars = 100 tokens),
  // fallback to estimated tokens.
  let tokens = reportedCompletionTokens && reportedCompletionTokens > 0 ? reportedCompletionTokens : estimated;
  if (responseText.length > 0 && tokens > (responseText.length / 2)) {
    tokens = estimated;
  }

  const durationSec = Math.max(0.5, latencyMs / 1000);
  let speed = tokens / durationSec;

  // Natural physical ceiling for consumer/cloud model generation
  if (speed > 350) {
    speed = Math.min(speed, 350);
  }

  return {
    tokens,
    tokensPerSec: Number(speed.toFixed(1)),
  };
}
