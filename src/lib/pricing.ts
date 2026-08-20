// Token estimator & cost calculator based on standard pricing / OpenRouter rates
export function estimateTokens(text: string): number {
  if (!text) return 0;
  // Standard rule of thumb: ~4 characters per token in English
  return Math.max(1, Math.ceil(text.length / 3.8));
}

// Fallback pricing per 1M tokens ($)
const DEFAULT_PRICING_PER_1M: Record<string, { prompt: number; completion: number }> = {
  'openai/gpt-4o': { prompt: 2.5, completion: 10.0 },
  'openai/gpt-4o-mini': { prompt: 0.15, completion: 0.6 },
  'anthropic/claude-sonnet-4.5': { prompt: 3.0, completion: 15.0 },
  'anthropic/claude-3.5-sonnet': { prompt: 3.0, completion: 15.0 },
  'google/gemini-2.5-flash': { prompt: 0.075, completion: 0.3 },
  'google/gemini-2.0-flash-001': { prompt: 0.1, completion: 0.4 },
  'deepseek/deepseek-r1': { prompt: 0.55, completion: 2.19 },
  'meta-llama/llama-3.3-70b-instruct': { prompt: 0.12, completion: 0.3 },
  'perplexity/sonar-reasoning-pro': { prompt: 2.0, completion: 8.0 },
};

export function calculateCost(
  modelId: string,
  promptTokens: number,
  completionTokens: number,
  customPromptPrice?: number,
  customCompletionPrice?: number
): number {
  if (modelId.endsWith(':free')) return 0;

  let pPrice = customPromptPrice;
  let cPrice = customCompletionPrice;

  if (pPrice === undefined || cPrice === undefined) {
    const rate = DEFAULT_PRICING_PER_1M[modelId] || { prompt: 1.0, completion: 3.0 };
    pPrice = rate.prompt / 1_000_000;
    cPrice = rate.completion / 1_000_000;
  }

  const cost = promptTokens * pPrice + completionTokens * cPrice;
  return Number(cost.toFixed(6));
}
