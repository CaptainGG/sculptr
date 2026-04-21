'use client';

import { type RefObject } from 'react';
import { useAppState } from '@/hooks/useAppState';
import { type ThreeCanvasHandle } from './ThreeCanvas';

interface Props {
  canvasRef: RefObject<ThreeCanvasHandle | null>;
}

export function TopButtons({ canvasRef }: Props) {
  const { state, dispatch } = useAppState();

  return (
    <div className="fixed top-4 right-4 z-50 flex gap-2">
      {/* Feedback */}
      <button
        onClick={() => dispatch({ type: 'TOGGLE_FEEDBACK' })}
        title="Feedback"
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
          state.feedbackOpen ? 'bg-white/20 text-white' : 'bg-panel text-white/60 hover:text-white'
        }`}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      </button>

      {/* Download */}
      <button
        onClick={() => canvasRef.current?.captureImage()}
        title="Download image"
        className="w-10 h-10 rounded-full bg-panel flex items-center justify-center text-white/60 hover:text-white transition-colors"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
      </button>

      {/* Embed code */}
      <button
        onClick={() => dispatch({ type: 'TOGGLE_EMBED_MODAL' })}
        title="Embed code"
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
          state.embedModalOpen ? 'bg-white/20 text-white' : 'bg-panel text-white/60 hover:text-white'
        }`}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
          <polyline points="16 18 22 12 16 6"/>
          <polyline points="8 6 2 12 8 18"/>
        </svg>
      </button>

      {/* Settings */}
      <button
        onClick={() => dispatch({ type: 'TOGGLE_SETTINGS' })}
        title="Settings"
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
          state.settingsOpen ? 'bg-white/20 text-white' : 'bg-panel text-white/60 hover:text-white'
        }`}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
          <line x1="4" y1="6" x2="20" y2="6"/>
          <line x1="8" y1="12" x2="20" y2="12"/>
          <line x1="4" y1="18" x2="16" y2="18"/>
          <circle cx="4" cy="6" r="2" fill="currentColor" stroke="none"/>
          <circle cx="20" cy="12" r="2" fill="currentColor" stroke="none"/>
          <circle cx="16" cy="18" r="2" fill="currentColor" stroke="none"/>
        </svg>
      </button>
    </div>
  );
}
