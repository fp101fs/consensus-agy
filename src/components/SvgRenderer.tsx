'use client';

import React, { useState, useMemo } from 'react';
import { Code, Eye, Copy, Check, Download, ZoomIn, ZoomOut, AlertCircle } from 'lucide-react';

interface SvgRendererProps {
  content: string;
  className?: string;
  title?: string;
}

export function extractSvg(raw: string): string | null {
  if (!raw) return null;

  // 1. Check for standard <svg ... </svg>
  const match = raw.match(/<svg[\s\S]*?<\/svg>/i);
  if (match) {
    return match[0].trim();
  }

  // 2. Check if wrapped in markdown code fence ```xml or ```svg
  const fenceMatch = raw.match(/```(?:xml|svg|html)?\s*(<svg[\s\S]*?<\/svg>)\s*```/i);
  if (fenceMatch) {
    return fenceMatch[1].trim();
  }

  return null;
}

export const SvgRenderer: React.FC<SvgRendererProps> = ({ content, className = '', title = 'SVG Artwork' }) => {
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
  const [copied, setCopied] = useState(false);
  const [zoom, setZoom] = useState<number>(100);

  const svgCode = useMemo(() => extractSvg(content), [content]);

  const handleCopy = () => {
    if (!svgCode) return;
    navigator.clipboard.writeText(svgCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDownload = () => {
    if (!svgCode) return;
    const blob = new Blob([svgCode], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!svgCode) {
    return null;
  }

  // Convert SVG code into a clean data URI or blob URL for sandboxed rendering
  const svgDataUrl = useMemo(() => {
    if (!svgCode) return null;
    try {
      return `data:image/svg+xml;utf8,${encodeURIComponent(svgCode)}`;
    } catch {
      return null;
    }
  }, [svgCode]);

  return (
    <div className={`rounded-2xl border border-neutral-800 bg-neutral-950/80 overflow-hidden flex flex-col ${className}`}>
      {/* Header bar */}
      <div className="px-3 py-2 border-b border-neutral-800/80 bg-neutral-900/60 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 p-0.5 rounded-lg bg-neutral-950 border border-neutral-800">
          <button
            type="button"
            onClick={() => setViewMode('preview')}
            className={`px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition ${
              viewMode === 'preview'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>Visual Preview</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('code')}
            className={`px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition ${
              viewMode === 'code'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Code className="w-3 h-3" />
            <span>Raw Markup</span>
          </button>
        </div>

        <div className="flex items-center gap-1">
          {viewMode === 'preview' && (
            <div className="flex items-center gap-0.5 mr-1 bg-neutral-950 px-1 py-0.5 rounded border border-neutral-800">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(50, z - 25))}
                title="Zoom out"
                className="p-1 text-neutral-400 hover:text-white transition"
              >
                <ZoomOut className="w-3 h-3" />
              </button>
              <span className="text-[10px] font-mono text-neutral-400 w-8 text-center">{zoom}%</span>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(200, z + 25))}
                title="Zoom in"
                className="p-1 text-neutral-400 hover:text-white transition"
              >
                <ZoomIn className="w-3 h-3" />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleCopy}
            title="Copy raw SVG markup"
            className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={handleDownload}
            title="Download .svg file"
            className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
          </button>
        </div>
      </div>

      {/* Body View */}
      <div className="p-4 flex-1 flex items-center justify-center min-h-[320px] max-h-[500px] overflow-auto bg-neutral-950/60 relative">
        {viewMode === 'preview' ? (
          <div
            className="w-full h-full flex items-center justify-center transition-transform [&>svg]:max-h-[400px] [&>svg]:max-w-full [&>svg]:w-auto [&>svg]:h-auto [&>svg]:mx-auto"
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center center' }}
            dangerouslySetInnerHTML={{ __html: svgCode }}
          />
        ) : (
          <pre className="text-[11px] font-mono text-neutral-300 w-full h-full overflow-auto p-2 bg-neutral-950 rounded-xl border border-neutral-800/80 select-all leading-relaxed">
            <code>{svgCode}</code>
          </pre>
        )}
      </div>
    </div>
  );
};
