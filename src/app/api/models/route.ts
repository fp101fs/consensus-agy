import { NextRequest } from 'next/server';
import { LLMConfig } from '@/types/consensus';

export const runtime = 'nodejs';
export const revalidate = 3600; // Cache for 1 hour on server side

function getProviderInfo(modelId: string, name: string) {
  const lower = (modelId + ' ' + name).toLowerCase();
  if (lower.includes('openai') || lower.includes('gpt')) {
    return {
      provider: 'OpenAI',
      color: 'emerald',
      badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      borderColor: 'border-emerald-500/40',
    };
  }
  if (lower.includes('anthropic') || lower.includes('claude')) {
    return {
      provider: 'Anthropic',
      color: 'amber',
      badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      borderColor: 'border-amber-500/40',
    };
  }
  if (lower.includes('google') || lower.includes('gemini')) {
    return {
      provider: 'Google',
      color: 'sky',
      badgeBg: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
      borderColor: 'border-sky-500/40',
    };
  }
  if (lower.includes('deepseek')) {
    return {
      provider: 'DeepSeek',
      color: 'blue',
      badgeBg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      borderColor: 'border-blue-500/40',
    };
  }
  if (lower.includes('meta') || lower.includes('llama')) {
    return {
      provider: 'Meta',
      color: 'purple',
      badgeBg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      borderColor: 'border-purple-500/40',
    };
  }
  if (lower.includes('perplexity') || lower.includes('sonar')) {
    return {
      provider: 'Perplexity',
      color: 'teal',
      badgeBg: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
      borderColor: 'border-teal-500/40',
    };
  }
  if (lower.includes('mistral') || lower.includes('mixtral')) {
    return {
      provider: 'Mistral AI',
      color: 'orange',
      badgeBg: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
      borderColor: 'border-orange-500/40',
    };
  }
  if (lower.includes('qwen')) {
    return {
      provider: 'Alibaba Qwen',
      color: 'violet',
      badgeBg: 'bg-violet-500/10 text-violet-400 border-violet-500/30',
      borderColor: 'border-violet-500/40',
    };
  }
  if (lower.includes('cohere') || lower.includes('command')) {
    return {
      provider: 'Cohere',
      color: 'rose',
      badgeBg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      borderColor: 'border-rose-500/40',
    };
  }

  const slashIdx = modelId.indexOf('/');
  const rawProvider = slashIdx !== -1 ? modelId.slice(0, slashIdx) : 'AI';
  const formattedProvider = rawProvider.charAt(0).toUpperCase() + rawProvider.slice(1);

  return {
    provider: formattedProvider,
    color: 'indigo',
    badgeBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    borderColor: 'border-indigo-500/40',
  };
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    const userApiKey = authHeader?.replace(/^Bearer\s+/i, '');
    const apiKey = userApiKey || process.env.OPENROUTER_API_KEY;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    // Fetch live catalog from OpenRouter
    const res = await fetch('https://openrouter.ai/api/v1/models', {
      headers,
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      const errText = await res.text();
      return new Response(
        JSON.stringify({ error: `Failed to fetch OpenRouter models: ${errText}` }),
        { status: res.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { data } = await res.json();

    if (!Array.isArray(data)) {
      return new Response(JSON.stringify({ models: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Map and enrich models
    const models: (LLMConfig & {
      contextLength?: number;
      isFree?: boolean;
      promptPrice?: number;
      completionPrice?: number;
    })[] = data
      .filter((m: any) => {
        // Filter out audio-only or image-generation-only if modalities exist
        if (m.architecture?.modality && !m.architecture.modality.includes('text->text')) {
          return false;
        }
        return true;
      })
      .map((m: any) => {
        const providerInfo = getProviderInfo(m.id, m.name || m.id);
        const promptPrice = m.pricing?.prompt ? Number(m.pricing.prompt) : 0;
        const completionPrice = m.pricing?.completion ? Number(m.pricing.completion) : 0;
        const isFree = promptPrice === 0 && completionPrice === 0;

        let tag = providerInfo.provider;
        if (isFree) {
          tag = `${providerInfo.provider} (Free)`;
        } else if (m.context_length) {
          tag = `${providerInfo.provider} • ${(m.context_length / 1000).toFixed(0)}k ctx`;
        }

        return {
          id: m.id,
          name: m.name || m.id,
          provider: providerInfo.provider,
          tag,
          color: providerInfo.color,
          badgeBg: providerInfo.badgeBg,
          borderColor: providerInfo.borderColor,
          contextLength: m.context_length,
          isFree,
          promptPrice,
          completionPrice,
        };
      });

    return new Response(JSON.stringify({ models, total: models.length }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
