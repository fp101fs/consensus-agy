'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { DollarSign, Cpu, ArrowUpRight, Activity } from 'lucide-react';
import { UsageSummary } from '@/types/consensus';

export const UsageWidget: React.FC = () => {
  const [usage, setUsage] = useState<UsageSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUsage = async () => {
    try {
      const res = await fetch('/api/usage');
      if (res.ok) {
        const data = await res.json();
        setUsage(data);
      }
    } catch {
      // Ignore initial widget errors
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsage();
    // Poll usage every 15s to stay updated
    const interval = setInterval(fetchUsage, 15000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !usage) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-neutral-800 bg-neutral-900/60 text-neutral-400 text-xs">
        <div className="w-3 h-3 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
        <span className="text-[11px]">Loading stats...</span>
      </div>
    );
  }

  // Circular progress calculation (e.g. out of arbitrary target or budget visual)
  const totalCost = usage?.totalCostUsd || 0;
  const totalTokens = usage?.totalTokens || 0;
  const totalQueries = usage?.totalQueries || 0;

  // Visual percentage for ring (scaled for nice visual feedback up to $5.00)
  const costPercentage = Math.min(100, Math.max(5, (totalCost / 5.0) * 100));
  const strokeDashoffset = 100 - costPercentage;

  return (
    <Link
      href="/usage"
      title="View full token & cost usage analytics"
      className="group flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-neutral-800 bg-neutral-900/80 hover:bg-neutral-800/90 hover:border-indigo-500/40 text-xs text-neutral-300 transition shadow-sm"
    >
      {/* Mini Circular Gauge */}
      <div className="relative w-6 h-6 flex items-center justify-center shrink-0">
        <svg className="w-6 h-6 transform -rotate-90" viewBox="0 0 36 36">
          {/* Background Ring */}
          <path
            className="text-neutral-800"
            strokeWidth="3.5"
            stroke="currentColor"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          {/* Progress Indicator */}
          <path
            className="text-indigo-400 group-hover:text-indigo-300 transition-all duration-500"
            strokeDasharray="100, 100"
            strokeDashoffset={strokeDashoffset}
            strokeWidth="3.5"
            strokeLinecap="round"
            stroke="currentColor"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
        <Activity className="w-2.5 h-2.5 text-indigo-400 absolute" />
      </div>

      <div className="flex flex-col text-left">
        <div className="flex items-center gap-1">
          <span className="font-mono font-bold text-white text-xs group-hover:text-indigo-200">
            ${totalCost.toFixed(4)}
          </span>
          <span className="text-[10px] text-neutral-500 font-mono">
            ({totalTokens > 1000 ? `${(totalTokens / 1000).toFixed(1)}k` : totalTokens} tok)
          </span>
        </div>
        <div className="text-[9px] text-neutral-400 leading-none flex items-center gap-0.5">
          <span>{totalQueries} queries</span>
          <ArrowUpRight className="w-2.5 h-2.5 text-neutral-500 group-hover:text-indigo-400 transition" />
        </div>
      </div>
    </Link>
  );
};
