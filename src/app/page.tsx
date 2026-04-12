'use client';

import { useRef } from 'react';
import { AppStateProvider, useAppState } from '@/hooks/useAppState';
import { ThreeCanvas, type ThreeCanvasHandle } from '@/components/ThreeCanvas';
import { LeftToolbar } from '@/components/LeftToolbar';
import { DrawPanel } from '@/components/DrawPanel';
import { TextPanel } from '@/components/TextPanel';
import { CodePanel } from '@/components/CodePanel';
import { SettingsDrawer } from '@/components/SettingsDrawer';
import { TopButtons } from '@/components/TopButtons';
import { ExportBar } from '@/components/ExportBar';
import { EmbedModal } from '@/components/EmbedModal';
import { FeedbackPanel } from '@/components/FeedbackPanel';
import { BrandingBadge } from '@/components/BrandingBadge';

function ActivePanel() {
  const { state } = useAppState();
  if (state.activePanel === 'draw') return <DrawPanel />;
  if (state.activePanel === 'text') return <TextPanel />;
  if (state.activePanel === 'code') return <CodePanel />;
  return null;
}

function LoadingOverlay() {
  const { state } = useAppState();
  if (!state.isLoading) return null;
  return (
    <div className="fixed inset-0 z-30 pointer-events-none flex items-end pb-24 justify-center">
      <div className="bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 text-white/70 text-xs">
        Processing... {Math.round(state.loadingProgress)}%
      </div>
    </div>
  );
}

function AppContent() {
  const canvasRef = useRef<ThreeCanvasHandle | null>(null);

  return (
    <main className="relative w-screen h-screen overflow-hidden">
      {/* Full-screen 3D canvas */}
      <ThreeCanvas ref={canvasRef} />

      {/* Loading indicator */}
      <LoadingOverlay />

      {/* Left toolbar + active panel */}
      <LeftToolbar />
      <ActivePanel />

      {/* Top-right controls */}
      <TopButtons canvasRef={canvasRef} />
      <FeedbackPanel />

      {/* Settings drawer */}
      <SettingsDrawer />

      {/* Bottom export bar */}
      <ExportBar canvasRef={canvasRef} />

      {/* Modals */}
      <EmbedModal />

      {/* Branding */}
      <BrandingBadge />
    </main>
  );
}

export default function Home() {
  return (
    <AppStateProvider>
      <AppContent />
    </AppStateProvider>
  );
}
