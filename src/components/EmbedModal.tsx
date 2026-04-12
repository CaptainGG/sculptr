'use client';

import { useState } from 'react';
import { useAppState } from '@/hooks/useAppState';

function generateEmbedCode(state: ReturnType<typeof useAppState>['state']): string {
  const { svgString, textInput, selectedFont, activePanel,
    objectColor, depth, smoothness, animation, animationSpeed,
    backgroundColor, material } = state;

  const isText = activePanel === 'text' && textInput.trim();
  const contentProp = isText
    ? `text="${textInput}" font="${selectedFont}"`
    : `svg={mySvg}`;

  const svgVar = !isText && svgString
    ? `const mySvg = \`${svgString.substring(0, 200)}${svgString.length > 200 ? '...' : ''}\`;\n\n`
    : '';

  return `import { SVG3D } from "3dsvg";

${svgVar}<SVG3D
  ${contentProp}
  color="${objectColor}"
  depth={${depth.toFixed(1)}}
  smoothness={${smoothness.toFixed(2)}}
  zoom={${state.zoom.toFixed(1)}}
  animate="${animation}"
  animateSpeed={${animationSpeed.toFixed(1)}}
  background="${backgroundColor}"
  material="${material}"
/>`;
}

export function EmbedModal() {
  const { state, dispatch } = useAppState();
  const [copied, setCopied] = useState(false);

  if (!state.embedModalOpen) return null;

  const code = generateEmbedCode(state);

  const copyCode = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => dispatch({ type: 'CLOSE_EMBED_MODAL' })}
      />
      {/* Modal */}
      <div className="relative z-10 rounded-2xl shadow-2xl p-6 w-full max-w-lg"
        style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-semibold text-lg">Embed</h2>
          <button
            onClick={() => dispatch({ type: 'CLOSE_EMBED_MODAL' })}
            className="text-white/40 hover:text-white/80 transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Step 1 */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-5 h-5 rounded-full bg-accent text-white text-xs flex items-center justify-center font-bold">1</span>
            <span className="text-white/70 text-sm">Install the package</span>
          </div>
          <div className="rounded-lg p-3 font-mono text-sm text-green-400"
            style={{ background: 'rgba(0,0,0,0.5)' }}>
            npm install 3dsvg
          </div>
        </div>

        {/* Step 2 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-accent text-white text-xs flex items-center justify-center font-bold">2</span>
              <span className="text-white/70 text-sm">Copy and paste into your component</span>
            </div>
            <button
              onClick={copyCode}
              className="text-xs text-white/50 hover:text-white transition-colors flex items-center gap-1"
            >
              {copied ? (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5 text-green-400">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span className="text-green-400">Copied!</span>
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                  Copy
                </>
              )}
            </button>
          </div>
          <div className="rounded-lg p-3 font-mono text-xs text-white/80 overflow-auto max-h-60"
            style={{ background: 'rgba(0,0,0,0.5)' }}>
            <pre className="whitespace-pre">{code}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
