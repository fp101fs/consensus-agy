import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { code, codeVerifier } = await req.json();

    if (!code) {
      return new Response(
        JSON.stringify({ error: 'Missing auth code' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Exchange auth code and code_verifier for user API key
    // POST https://openrouter.ai/api/v1/auth/keys
    const res = await fetch('https://openrouter.ai/api/v1/auth/keys', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        code_verifier: codeVerifier || undefined,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return new Response(
        JSON.stringify({ error: `OpenRouter key exchange failed (${res.status}): ${errText}` }),
        { status: res.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await res.json();
    // data.key contains the generated user API key
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal OAuth Error';
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
