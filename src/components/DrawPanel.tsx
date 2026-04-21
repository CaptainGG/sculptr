'use client';

import { useCallback, useRef, useState } from 'react';
import { useAppState } from '@/hooks/useAppState';

type DrawMode = 'draw' | 'erase';

export function DrawPanel() {
  const { state, dispatch, canUndo, canRedo } = useAppState();
  const [drawMode, setDrawMode] = useState<DrawMode>('draw');
  const isDrawingRef = useRef(false);
  const hasDrawnRef = useRef(false);
  const gridRef = useRef<HTMLDivElement>(null);

  const getCellFromPoint = useCallback((clientX: number, clientY: number) => {
    const el = gridRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const cellSize = rect.width / 24;
    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);
    if (row >= 0 && row < 24 && col >= 0 && col < 24) return { row, col };
    return null;
  }, []);

  const paintCell = useCallback((clientX: number, clientY: number) => {
    const cell = getCellFromPoint(clientX, clientY);
    if (cell) {
      dispatch({ type: 'SET_PIXEL', row: cell.row, col: cell.col, value: drawMode === 'draw' });
      hasDrawnRef.current = true;
    }
  }, [getCellFromPoint, dispatch, drawMode]);

  const commitStroke = useCallback(() => {
    isDrawingRef.current = false;
    if (hasDrawnRef.current) {
      dispatch({ type: 'COMMIT_GRID_SNAPSHOT' });
      hasDrawnRef.current = false;
    }
  }, [dispatch]);

  // Mouse handlers
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    isDrawingRef.current = true;
    hasDrawnRef.current = false;
    paintCell(e.clientX, e.clientY);
  }, [paintCell]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawingRef.current) return;
    paintCell(e.clientX, e.clientY);
  }, [paintCell]);

  // Touch handlers
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault(); // prevent scrolling while drawing
    isDrawingRef.current = true;
    hasDrawnRef.current = false;
    const touch = e.touches[0];
    if (touch) paintCell(touch.clientX, touch.clientY);
  }, [paintCell]);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!isDrawingRef.current) return;
    const touch = e.touches[0];
    if (touch) paintCell(touch.clientX, touch.clientY);
  }, [paintCell]);

  const { pixelGrid } = state;

  return (
    <div className="fixed left-14 top-0 z-20 p-3" style={{ pointerEvents: 'all' }}>
      <div className="rounded-xl overflow-hidden shadow-2xl" style={{ background: '#1e1e2e', width: 310 }}>
        {/* Toolbar */}
        <div className="flex items-center gap-2 p-3 pb-2">
          <button
            onClick={() => setDrawMode('draw')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              drawMode === 'draw' ? 'bg-accent text-white' : 'text-white/60 hover:text-white/80 hover:bg-white/5'
            }`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
              <path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/>
              <circle cx="11" cy="11" r="2"/>
            </svg>
            Draw
          </button>
          <button
            onClick={() => setDrawMode('erase')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              drawMode === 'erase' ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white/80 hover:bg-white/5'
            }`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
              <path d="M20 20H7L3 16l10-10 7 7-2.5 2.5"/>
              <path d="M6.0001 10.0001L14 18"/>
            </svg>
            Erase
          </button>

          {/* Undo/Redo */}
          <button
            onClick={() => dispatch({ type: 'UNDO' })}
            disabled={!canUndo}
            className="text-white/40 hover:text-white/70 disabled:text-white/15 disabled:cursor-not-allowed transition-colors p-1.5 rounded-lg hover:bg-white/5"
            title="Undo (Ctrl+Z)"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <polyline points="1 4 1 10 7 10"/>
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
            </svg>
          </button>
          <button
            onClick={() => dispatch({ type: 'REDO' })}
            disabled={!canRedo}
            className="text-white/40 hover:text-white/70 disabled:text-white/15 disabled:cursor-not-allowed transition-colors p-1.5 rounded-lg hover:bg-white/5"
            title="Redo (Ctrl+Shift+Z)"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <polyline points="23 4 23 10 17 10"/>
              <path d="M20.49 15a9 9 0 1 1-2.13-9.36L23 10"/>
            </svg>
          </button>

          <button
            onClick={() => dispatch({ type: 'CLEAR_GRID' })}
            className="ml-auto text-white/40 hover:text-white/70 transition-colors p-1.5 rounded-lg hover:bg-white/5"
            title="Clear"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
              <path d="M10 11v6"/><path d="M14 11v6"/>
              <path d="M9 6V4h6v2"/>
            </svg>
          </button>
        </div>

        {/* Grid */}
        <div className="p-3 pt-1">
          <div
            ref={gridRef}
            className="select-none touch-none"
            style={{
              width: 284,
              height: 284,
              display: 'grid',
              gridTemplateColumns: 'repeat(24, 1fr)',
              cursor: drawMode === 'draw' ? 'crosshair' : 'cell',
              backgroundImage: 'linear-gradient(45deg, #2a2a3e 25%, transparent 25%), linear-gradient(-45deg, #2a2a3e 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #2a2a3e 75%), linear-gradient(-45deg, transparent 75%, #2a2a3e 75%)',
              backgroundSize: '12px 12px',
              backgroundPosition: '0 0, 0 6px, 6px -6px, -6px 0px',
              borderRadius: 8,
              overflow: 'hidden',
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={commitStroke}
            onMouseLeave={commitStroke}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={commitStroke}
            onTouchCancel={commitStroke}
          >
            {pixelGrid.flat().map((filled, i) => (
              <div
                key={i}
                style={{
                  background: filled ? '#ffffff' : 'transparent',
                  outline: '0.5px solid rgba(255,255,255,0.06)',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
