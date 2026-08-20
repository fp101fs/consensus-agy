import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

function formatRateLimitError(errJson: any, defaultMsg: string): string {
  if (errJson?.error?.code === 429 || errJson?.error?.message?.toLowerCase().includes('rate')) {
    const raw = errJson?.error?.metadata?.raw;
    const hint = errJson?.error?.metadata?.remedy_hint;
    if (raw) return `Rate Limited (429): ${raw}`;
    if (hint) return `Rate Limited (429): ${hint}`;
    return `Rate Limited (429): The upstream provider for this model is temporarily busy. Please retry shortly or pick an alternative model.`;
  }
  return errJson?.error?.message || defaultMsg;
}

export async function POST(req: NextRequest) {
  try {
    const { modelId, prompt, userApiKey, enforceBenchmarkProtocol = true } = await req.json();

    const apiKey = userApiKey || process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: 'No OpenRouter API key provided. Set OPENROUTER_API_KEY or enter your key in settings.',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!prompt || !modelId) {
      return new Response(
        JSON.stringify({ error: 'Missing prompt or modelId' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Benchmark Metacognitive Protocol system prompt
    const systemPrompt = `You are an elite reasoning model competing in a rigorous benchmark arbitration.
You must always structure your response clearly addressing these 4 exact dimensions:

1. **Answer**: State the direct, precise answer to the question/problem.
2. **Reasoning**: Provide a concise, step-by-step logical proof or justification.
3. **Confidence Rating (0–100%)**: State your numerical epistemic certainty in your answer (e.g. "Confidence: 95%"), accounting for any ambiguities.
4. **Uniqueness / Solvability**: State explicitly whether the given clues guarantee a **Unique Solution**, whether the problem is **Underdetermined** (multiple valid solutions exist), or whether the problem is **Impossible / Contradictory** (false premise or conflicting constraints).`;

    const requestPayload = {
      model: modelId,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      stream: true,
      provider: {
        allow_fallbacks: true,
      },
    };

    const executeStream = async (targetModel: string) => {
      return await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
          'X-Title': process.env.NEXT_PUBLIC_SITE_NAME || 'Consensus Arena',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...requestPayload,
          model: targetModel,
        }),
      });
    };

    let response = await executeStream(modelId);

    if (response.status === 429 && modelId.endsWith(':free')) {
      const baseModel = modelId.replace(/:free$/, '');
      console.warn(`429 on free tier ${modelId}, attempting fallback to ${baseModel}`);
      const retryRes = await executeStream(baseModel);
      if (retryRes.ok) {
        response = retryRes;
      }
    }

    if (!response.ok) {
      const errText = await response.text();
      let parsedErr: any = {};
      try {
        parsedErr = JSON.parse(errText);
      } catch {
        parsedErr = { error: { message: errText } };
      }

      const formatted = formatRateLimitError(parsedErr, `OpenRouter error (${response.status}): ${errText}`);

      return new Response(
        JSON.stringify({
          error: formatted,
          isRateLimit: response.status === 429,
        }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Stream SSE back to client
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const readableStream = new ReadableStream({
      async start(controller) {
        if (!response.body) {
          controller.close();
          return;
        }

        const reader = response.body.getReader();
        let buffer = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || trimmed.startsWith(':')) continue;

              if (trimmed === 'data: [DONE]') {
                controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                continue;
              }

              if (trimmed.startsWith('data: ')) {
                try {
                  const jsonStr = trimmed.slice(6);
                  const parsed = JSON.parse(jsonStr);
                  const content = parsed.choices?.[0]?.delta?.content || '';
                  if (content) {
                    controller.enqueue(
                      encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
                    );
                  }
                } catch {
                  // Pass
                }
              }
            }
          }
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : String(err);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: message })}\n\n`)
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
