'use client';

import { useAppState } from '@/hooks/useAppState';

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function TextIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
      <polyline points="4 7 4 4 20 4 20 7" />
      <line x1="9" y1="20" x2="15" y2="20" />
      <line x1="12" y1="4" x2="12" y2="20" />
    </svg>
  );
}

function CodeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

const TOOLS = [
  { id: 'draw' as const, icon: PencilIcon, title: 'Draw' },
  { id: 'text' as const, icon: TextIcon, title: 'Text' },
  { id: 'code' as const, icon: CodeIcon, title: 'SVG Code' },
  { id: 'upload' as const, icon: UploadIcon, title: 'Upload SVG' },
] as const;

export function LeftToolbar() {
  const { state, dispatch } = useAppState();

  return (
    <div className="fixed left-0 top-0 h-full w-14 z-30 flex flex-col items-center pt-3 gap-1"
      style={{ background: 'rgba(20,20,40,0.85)' }}>
      {TOOLS.map(({ id, icon: Icon, title }) => (
        <button
          key={id}
          title={title}
          onClick={() => dispatch({ type: 'SET_ACTIVE_PANEL', panel: id })}
          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
            state.activePanel === id
              ? 'bg-white/15 text-white'
              : 'text-white/50 hover:text-white/80 hover:bg-white/5'
          }`}
        >
          <Icon />
        </button>
      ))}
    </div>
  );
}
