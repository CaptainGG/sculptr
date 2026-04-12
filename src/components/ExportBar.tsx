'use client';

import { type RefObject, useState, useCallback } from 'react';
import { useAppState } from '@/hooks/useAppState';
import { type ThreeCanvasHandle } from './ThreeCanvas';

interface Props {
  canvasRef: RefObject<ThreeCanvasHandle | null>;
}

export function ExportBar({ canvasRef }: Props) {
  const { state, dispatch } = useAppState();
  const [ringKey, setRingKey] = useState(0);
  const [showRing, setShowRing] = useState(false);

  const triggerRing = useCallback(() => {
    setRingKey((k) => k + 1);
    setShowRing(true);
    setTimeout(() => setShowRing(false), 500);
  }, []);

  const handleCapture = () => {
    triggerRing();
    if (state.exportMode === 'image') {
      canvasRef.current?.captureImage();
    } else if (state.exportMode === 'video') {
      if (state.isRecording) {
        canvasRef.current?.stopRecording();
      } else {
        canvasRef.current?.startRecording();
      }
    } else {
      // Auto: record 3 seconds
      canvasRef.current?.startRecording();
      setTimeout(() => canvasRef.current?.stopRecording(), 3000);
    }
  };

  const isRecording = state.isRecording;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-3">

      {/* Capture button with shutter ring */}
      <div className="relative flex items-center justify-center">

        {/* Permanent subtle outer ring */}
        <span className="absolute w-[68px] h-[68px] rounded-full border border-white/25 pointer-events-none" />

        {/* Animated shutter ring — shown on click */}
        {showRing && (
          <span
            key={ringKey}
            className="shutter-ring absolute w-[56px] h-[56px] rounded-full border-2 border-white pointer-events-none"
          />
        )}

        <button
          onClick={handleCapture}
          className={`relative w-14 h-14 rounded-full transition-all flex items-center justify-center shadow-lg ${
            isRecording
              ? 'bg-red-500 hover:bg-red-600 scale-110 animate-pulse'
              : 'bg-white hover:bg-white/90 hover:scale-105'
          }`}
          title={
            state.exportMode === 'image' ? 'Capture image' :
            state.exportMode === 'video' ? (isRecording ? 'Stop recording' : 'Start recording') :
            'Auto capture'
          }
        >
          {isRecording && <span className="w-5 h-5 rounded-sm bg-white" />}
        </button>
      </div>

      {/* Mode tabs */}
      <div
        className="flex rounded-full overflow-hidden"
        style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        {(['image', 'video', 'auto'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => dispatch({ type: 'SET_EXPORT_MODE', mode })}
            className={`px-4 py-1.5 text-sm transition-colors capitalize ${
              state.exportMode === mode
                ? 'text-white bg-white/15 font-medium'
                : 'text-white/50 hover:text-white/80'
            }`}
          >
            {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
}
