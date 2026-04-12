'use client';

import { useState, useCallback, useRef } from 'react';
import { useAppState } from '@/hooks/useAppState';

export function UploadPanel() {
  const { dispatch } = useAppState();
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadFile = useCallback((file: File) => {
    setError(null);
    if (!file.name.endsWith('.svg') && file.type !== 'image/svg+xml') {
      setError('Please upload an SVG file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const svg = e.target?.result as string;
      dispatch({ type: 'SET_SVG', svg });
      setFileName(file.name);
    };
    reader.readAsText(file);
  }, [dispatch]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) loadFile(file);
  }, [loadFile]);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadFile(file);
  };

  return (
    <div
      className="fixed left-14 top-0 h-full z-20 flex flex-col justify-center p-4"
      style={{ width: '280px' }}
    >
      <div
        className="rounded-2xl p-1"
        style={{ background: 'rgba(20,20,40,0.92)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="px-3 py-3 flex items-center justify-between">
          <span className="text-white text-sm font-medium">Upload SVG</span>
        </div>

        {/* Drop zone */}
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          className={`mx-2 mb-2 rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors select-none ${
            isDragging
              ? 'bg-white/10 border-white/40'
              : 'bg-white/5 hover:bg-white/8 border-white/10'
          }`}
          style={{ height: '200px', border: '2px dashed' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
            className={`w-10 h-10 transition-colors ${isDragging ? 'text-white' : 'text-white/40'}`}>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <div className="text-center px-4">
            <p className="text-white/60 text-sm">
              {isDragging ? 'Drop it!' : 'Drag & drop an SVG'}
            </p>
            <p className="text-white/30 text-xs mt-1">or click to browse</p>
          </div>
        </div>

        {/* Status */}
        <div className="px-3 pb-3 min-h-[36px]">
          {error && (
            <p className="text-red-400 text-xs">{error}</p>
          )}
          {fileName && !error && (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
              <p className="text-white/60 text-xs truncate">{fileName}</p>
            </div>
          )}
          {!fileName && !error && (
            <p className="text-white/25 text-xs">No file loaded</p>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept=".svg,image/svg+xml"
          className="hidden"
          onChange={onInputChange}
        />
      </div>
    </div>
  );
}
