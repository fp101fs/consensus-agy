'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sparkles, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      setStatus('error');
      setErrorMessage(error);
      return;
    }

    if (!code) {
      setStatus('error');
      setErrorMessage('No authentication code provided in callback.');
      return;
    }

    const exchangeCode = async () => {
      try {
        const codeVerifier = sessionStorage.getItem('openrouter_pkce_verifier') || undefined;

        const res = await fetch('/api/auth/openrouter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, codeVerifier }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || `HTTP ${res.status}`);
        }

        const data = await res.json();
        if (data.key) {
          localStorage.setItem('consensus_openrouter_api_key', data.key);
          sessionStorage.removeItem('openrouter_pkce_verifier');
          setStatus('success');

          // Auto-redirect to home after brief confirmation
          setTimeout(() => {
            router.push('/');
          }, 1500);
        } else {
          throw new Error('No API key returned from OpenRouter.');
        }
      } catch (err: unknown) {
        setStatus('error');
        setErrorMessage(err instanceof Error ? err.message : 'Failed to exchange key');
      }
    };

    exchangeCode();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full p-8 rounded-3xl bg-neutral-900/80 border border-neutral-800 text-center space-y-5 shadow-2xl backdrop-blur-xl">
        {status === 'loading' && (
          <>
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 mx-auto flex items-center justify-center">
              <Sparkles className="w-6 h-6 animate-spin" />
            </div>
            <h2 className="text-lg font-bold">Connecting OpenRouter Account...</h2>
            <p className="text-xs text-neutral-400">
              Exchanging secure OAuth PKCE credentials for user API session.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-emerald-300">Successfully Connected!</h2>
            <p className="text-xs text-neutral-300">
              Your OpenRouter account is now linked. Redirecting back to Consensus Arena...
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition"
            >
              <span>Go to Arena</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-400 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-red-400">Authentication Failed</h2>
            <p className="text-xs text-red-300 bg-red-950/40 p-3 rounded-xl border border-red-900/50">
              {errorMessage}
            </p>
            <Link
              href="/"
              className="inline-block px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold transition"
            >
              Return to Arena
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function OpenRouterCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">Loading...</div>}>
      <CallbackContent />
    </Suspense>
  );
}
