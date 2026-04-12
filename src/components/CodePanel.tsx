'use client';

import { useRef } from 'react';
import { useAppState } from '@/hooks/useAppState';
import { STAR_SVG } from '@/lib/defaults';

export function CodePanel() {
  const { state, dispatch } = useAppState();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      if (text) dispatch({ type: 'SET_SVG', svg: text });
    };
    reader.readAsText(file);
    // Reset input so same file can be re-uploaded
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed left-14 top-0 z-20 p-3" style={{ pointerEvents: 'all' }}>
      <div className="rounded-xl overflow-hidden shadow-2xl" style={{ background: '#1e1e2e', width: 310 }}>
        <div className="p-4 flex flex-col gap-3">
          <textarea
            value={state.svgString}
            onChange={(e) => dispatch({ type: 'SET_SVG', svg: e.target.value })}
            placeholder={`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">\n  <path d="..." fill="black"/>\n</svg>`}
            rows={8}
            className="w-full bg-black/40 text-white/90 placeholder-white/25 rounded-lg px-3 py-2.5 text-xs font-mono outline-none border border-white/10 focus:border-white/30 transition-colors resize-none"
            spellCheck={false}
          />
          <button
            onClick={() => dispatch({ type: 'SET_SVG', svg: STAR_SVG })}
            className="w-full py-2 text-sm text-white/60 hover:text-white/90 border border-white/10 hover:border-white/30 rounded-lg transition-colors"
          >
            Load example (star)
          </button>
          <div>
            <p className="text-white/40 text-xs mb-2">Upload an SVG file</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2 text-sm text-white/60 hover:text-white/90 border border-white/10 hover:border-white/30 rounded-lg transition-colors"
            >
              Choose File
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".svg,image/svg+xml"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
