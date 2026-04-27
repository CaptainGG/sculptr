'use client';

import { useCallback, useRef, useState } from 'react';
import { useAppState } from '@/hooks/useAppState';

const ACCEPTED_MODEL_TYPES = new Set([
  'model/gltf-binary',
  'model/gltf+json',
  'application/octet-stream',
]);

function getModelFormat(file: File) {
  const name = file.name.toLowerCase();
  if (name.endsWith('.glb')) return 'glb' as const;
  if (name.endsWith('.gltf')) return 'gltf' as const;
  if (name.endsWith('.obj')) return 'obj' as const;
  return null;
}

function isModelFile(file: File) {
  return getModelFormat(file) !== null || ACCEPTED_MODEL_TYPES.has(file.type);
}

export function ModelPanel() {
  const { state, dispatch } = useAppState();
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadFile = useCallback((file: File) => {
    setError(null);
    const format = getModelFormat(file);
    if (!isModelFile(file) || !format) {
      setError('Please upload a .glb, single-file .gltf, or .obj model.');
      return;
    }

    if (state.modelUrl) URL.revokeObjectURL(state.modelUrl);
    const url = URL.createObjectURL(file);
    dispatch({ type: 'SET_MODEL', url, fileName: file.name, format });
  }, [dispatch, state.modelUrl]);

  const clearModel = useCallback(() => {
    if (state.modelUrl) URL.revokeObjectURL(state.modelUrl);
    dispatch({ type: 'CLEAR_MODEL' });
    if (inputRef.current) inputRef.current.value = '';
    setError(null);
  }, [dispatch, state.modelUrl]);

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
      style={{ width: '300px' }}
    >
      <div
        className="rounded-lg p-1"
        style={{ background: 'rgba(20,20,40,0.92)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="px-3 py-3 flex items-center justify-between">
          <span className="text-white text-sm font-medium">3D Asset</span>
          {state.modelUrl && (
            <button
              onClick={clearModel}
              className="text-xs text-white/45 hover:text-white/80 transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          className={`mx-2 mb-2 rounded-lg flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors select-none ${
            isDragging
              ? 'bg-white/10 border-white/40'
              : 'bg-white/5 hover:bg-white/8 border-white/10'
          }`}
          style={{ height: '200px', border: '2px dashed' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
            className={`w-10 h-10 transition-colors ${isDragging ? 'text-white' : 'text-white/40'}`}>
            <path d="M12 2 3 7l9 5 9-5-9-5Z" />
            <path d="M3 7v10l9 5 9-5V7" />
            <path d="M12 12v10" />
          </svg>
          <div className="text-center px-4">
            <p className="text-white/60 text-sm">
              {isDragging ? 'Drop it here' : 'Drag & drop a model'}
            </p>
            <p className="text-white/30 text-xs mt-1">.glb or single-file .gltf</p>
            <p className="text-white/25 text-xs mt-1">.obj works without paired .mtl files</p>
          </div>
        </div>

        <div className="px-3 pb-3 min-h-[72px]">
          {error && <p className="text-red-400 text-xs">{error}</p>}
          {state.modelFileName && !error && (
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
              <p className="text-white/60 text-xs truncate">{state.modelFileName}</p>
            </div>
          )}
          {!state.modelFileName && !error && (
            <p className="text-white/25 text-xs mb-3">No model loaded</p>
          )}

          <label className="flex items-center justify-between text-xs text-white/60">
            <span>Original materials</span>
            <button
              onClick={() => dispatch({
                type: 'SET_USE_ORIGINAL_MODEL_MATERIALS',
                useOriginal: !state.useOriginalModelMaterials,
              })}
              className={`w-9 h-5 rounded-full transition-colors relative ${state.useOriginalModelMaterials ? 'bg-accent' : 'bg-white/20'}`}
              title="Preserve GLB/PBR materials"
            >
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${state.useOriginalModelMaterials ? 'left-4' : 'left-0.5'}`} />
            </button>
          </label>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept=".glb,.gltf,.obj,model/gltf-binary,model/gltf+json"
          className="hidden"
          onChange={onInputChange}
        />
      </div>
    </div>
  );
}
