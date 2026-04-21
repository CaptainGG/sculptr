'use client';

import { useAppState } from '@/hooks/useAppState';

const REPO_URL = 'https://github.com/CaptainGG/sculptr';

export function FeedbackPanel() {
  const { state, dispatch } = useAppState();

  if (!state.feedbackOpen) return null;

  return (
    <div
      className="fixed top-16 right-4 z-50 rounded-xl shadow-2xl p-4 w-64"
      style={{ background: '#1e1e2e', border: '1px solid rgba(255,255,255,0.1)' }}
    >
      <h3 className="text-white/80 text-sm font-medium mb-2">Feedback & Ideas</h3>
      <p className="text-white/50 text-xs mb-3">
        Found a bug or have a feature request? Open an issue on GitHub — we read every one.
      </p>
      <a
        href={`${REPO_URL}/issues/new`}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full py-2 text-xs text-white text-center bg-accent hover:bg-accent/90 rounded-lg transition-colors font-medium"
      >
        Open an Issue
      </a>
      <a
        href={`${REPO_URL}/discussions`}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full mt-2 py-1.5 text-xs text-white/50 hover:text-white/70 text-center transition-colors"
      >
        Join Discussions
      </a>
      <button
        onClick={() => dispatch({ type: 'TOGGLE_FEEDBACK' })}
        className="w-full mt-2 py-1.5 text-xs text-white/30 hover:text-white/50 transition-colors"
      >
        Close
      </button>
    </div>
  );
}
