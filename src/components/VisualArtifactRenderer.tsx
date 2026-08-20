'use client';

import React, { useState, useMemo } from 'react';
import { SvgRenderer, extractSvg } from './SvgRenderer';
import { Eye, Code, Play, RefreshCw, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface VisualArtifactRendererProps {
  content: string;
  title?: string;
  className?: string;
}

export function extractHtmlOrJs(raw: string): { html: string | null; type: 'html' | 'p5' | 'canvas' | 'd3' | 'other' } {
  if (!raw) return { html: null, type: 'other' };

  // 1. Check for complete <html> or <!DOCTYPE html> document
  const htmlDocMatch = raw.match(/<!DOCTYPE html[\s\S]*?<\/html>/i) || raw.match(/<html[\s\S]*?<\/html>/i);
  if (htmlDocMatch) {
    return { html: htmlDocMatch[0].trim(), type: 'html' };
  }

  // 2. Check for fenced code blocks with html
  const fencedHtml = raw.match(/```(?:html)\s*([\s\S]*?)```/i);
  if (fencedHtml) {
    const code = fencedHtml[1].trim();
    if (code.includes('<html') || code.includes('<canvas') || code.includes('<script') || code.includes('<div')) {
      return { html: code, type: 'html' };
    }
  }

  // 3. Check for p5.js script (setup & draw)
  const fencedJs = raw.match(/```(?:javascript|js)?\s*([\s\S]*?)```/i);
  const jsCode = fencedJs ? fencedJs[1].trim() : raw;

  if (jsCode.includes('function setup()') || jsCode.includes('setup = function') || jsCode.includes('createCanvas(')) {
    // Construct runnable p5.js sandbox
    const p5Html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js"></script>
  <style>
    body { margin: 0; padding: 0; overflow: hidden; background: #000; display: flex; align-items: center; justify-content: center; height: 100vh; }
    canvas { max-width: 100%; max-height: 100%; object-fit: contain; }
  </style>
</head>
<body>
  <script>
    try {
      ${jsCode}
    } catch(e) {
      document.body.innerHTML = '<div style="color:#ef4444;font-family:sans-serif;font-size:12px;padding:12px;">Error executing sketch: ' + e.message + '</div>';
    }
  </script>
</body>
</html>`;
    return { html: p5Html, type: 'p5' };
  }

  // 4. Check for Canvas 2D script
  if (jsCode.includes('getContext(\'2d\')') || jsCode.includes('getContext("2d")') || jsCode.includes('requestAnimationFrame(')) {
    const canvasHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { margin: 0; padding: 0; overflow: hidden; background: #050505; display: flex; align-items: center; justify-content: center; height: 100vh; }
    canvas { max-width: 100%; max-height: 100%; object-fit: contain; background: #0a0a0a; border-radius: 8px; }
  </style>
</head>
<body>
  <canvas id="canvas"></canvas>
  <script>
    try {
      ${jsCode}
    } catch(e) {
      document.body.innerHTML = '<div style="color:#ef4444;font-family:sans-serif;font-size:12px;padding:12px;">Simulation Error: ' + e.message + '</div>';
    }
  </script>
</body>
</html>`;
    return { html: canvasHtml, type: 'canvas' };
  }

  // 5. Check for D3.js script
  if (jsCode.includes('d3.') || jsCode.includes('d3.select')) {
    const d3Html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js"></script>
  <style>
    body { margin: 0; padding: 12px; font-family: sans-serif; background: #09090b; color: #fff; display: flex; align-items: center; justify-content: center; min-height: 100vh; box-sizing: border-box; }
    svg { max-width: 100%; max-height: 100%; }
    .tooltip { position: absolute; padding: 6px 10px; background: rgba(0,0,0,0.8); border: 1px solid #333; border-radius: 6px; font-size: 11px; pointer-events: none; }
  </style>
</head>
<body>
  <div id="chart"></div>
  <script>
    try {
      ${jsCode}
    } catch(e) {
      document.body.innerHTML = '<div style="color:#ef4444;font-family:sans-serif;font-size:12px;padding:12px;">D3 Error: ' + e.message + '</div>';
    }
  </script>
</body>
</html>`;
    return { html: d3Html, type: 'd3' };
  }

  return { html: null, type: 'other' };
}

export const VisualArtifactRenderer: React.FC<VisualArtifactRendererProps> = ({
  content,
  title = 'Visual Art',
  className = '',
}) => {
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
  const [copied, setCopied] = useState(false);
  const [key, setKey] = useState(0);

  // Check for SVG first
  const svgCode = useMemo(() => extractSvg(content), [content]);
  // Check for Runnable HTML / p5 / Canvas / D3 sandbox
  const { html: sandboxHtml, type: sandboxType } = useMemo(() => extractHtmlOrJs(content), [content]);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // If pure SVG vector is detected, use the dedicated high-res SvgRenderer
  if (svgCode) {
    return <SvgRenderer content={content} title={title} className={className} />;
  }

  // If runnable code (HTML document, p5.js, Canvas, D3) is detected, render in interactive sandbox iframe
  if (sandboxHtml) {
    return (
      <div className={`rounded-2xl border border-neutral-800 bg-neutral-950/80 overflow-hidden flex flex-col ${className}`}>
        {/* Header bar */}
        <div className="px-3 py-2 border-b border-neutral-800/80 bg-neutral-900/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 p-0.5 rounded-lg bg-neutral-950 border border-neutral-800">
            <button
              type="button"
              onClick={() => setViewMode('preview')}
              className={`px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition ${
                viewMode === 'preview' ? 'bg-purple-600 text-white shadow-xs' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Play className="w-3 h-3" />
              <span>Interactive App ({sandboxType.toUpperCase()})</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('code')}
              className={`px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition ${
                viewMode === 'code' ? 'bg-purple-600 text-white shadow-xs' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Code className="w-3 h-3" />
              <span>Source Code</span>
            </button>
          </div>

          <div className="flex items-center gap-1">
            {viewMode === 'preview' && (
              <button
                type="button"
                onClick={() => setKey((k) => k + 1)}
                title="Restart simulation"
                className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={handleCopy}
              title="Copy code"
              className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Sandbox View */}
        <div className="p-2 flex-1 min-h-[360px] max-h-[500px] flex items-center justify-center bg-neutral-950/90 relative overflow-hidden">
          {viewMode === 'preview' ? (
            <iframe
              key={key}
              srcDoc={sandboxHtml}
              sandbox="allow-scripts"
              title={title}
              className="w-full h-[360px] border-0 rounded-xl bg-black"
            />
          ) : (
            <div className="text-[11px] font-mono text-neutral-300 w-full h-[360px] overflow-auto p-3 bg-neutral-950 rounded-xl border border-neutral-800/80 leading-relaxed">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Fallback to formatted markdown text
  return (
    <div className="text-xs text-neutral-300 font-mono overflow-auto max-h-[360px] p-3 rounded-xl bg-neutral-950 border border-neutral-800/80 leading-relaxed">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content || '[No response]'}</ReactMarkdown>
    </div>
  );
};
