'use client';

import { useAppState } from '@/hooks/useAppState';
import { FONTS } from '@/lib/defaults';

export function TextPanel() {
  const { state, dispatch } = useAppState();

  return (
    <div className="fixed left-14 top-0 z-20 p-3" style={{ pointerEvents: 'all' }}>
      <div className="rounded-xl overflow-hidden shadow-2xl" style={{ background: '#1e1e2e', width: 310 }}>
        <div className="p-4 flex flex-col gap-3">
          <input
            type="text"
            value={state.textInput}
            onChange={(e) => dispatch({ type: 'SET_TEXT_INPUT', text: e.target.value })}
            placeholder="Type something..."
            className="w-full bg-black/30 text-white placeholder-white/30 rounded-lg px-3 py-2.5 text-sm outline-none border border-white/10 focus:border-white/30 transition-colors"
          />
          <select
            value={state.selectedFont}
            onChange={(e) => dispatch({ type: 'SET_FONT', font: e.target.value })}
            className="w-full bg-black/30 text-white rounded-lg px-3 py-2.5 text-sm outline-none border border-white/10 focus:border-white/30 transition-colors cursor-pointer"
          >
            {FONTS.map((font) => (
              <option key={font} value={font} style={{ fontFamily: font }}>
                {font}
              </option>
            ))}
          </select>
          {!state.textInput.trim() && (
            <p className="text-white/30 text-xs text-center">Enter text above to see it in 3D</p>
          )}
        </div>
      </div>
    </div>
  );
}
