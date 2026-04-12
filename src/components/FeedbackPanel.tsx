'use client';

import { useState } from 'react';
import { useAppState } from '@/hooks/useAppState';

export function FeedbackPanel() {
  const { state, dispatch } = useAppState();
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!state.feedbackOpen) return null;

  const handleSubmit = () => {
    if (!feedback.trim()) return;
    setSubmitted(true);
    setFeedback('');
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div
      className="fixed top-16 right-4 z-50 rounded-xl shadow-2xl p-4 w-64"
      style={{ background: '#1e1e2e', border: '1px solid rgba(255,255,255,0.1)' }}
    >
      {submitted ? (
        <div className="text-center py-3">
          <div className="text-green-400 text-sm font-medium mb-1">Thank you!</div>
          <div className="text-white/40 text-xs">Your feedback was received.</div>
        </div>
      ) : (
        <>
          <h3 className="text-white/80 text-sm font-medium mb-3">{"What's your feedback?"}</h3>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Share your thoughts..."
            rows={4}
            className="w-full bg-black/30 text-white/80 placeholder-white/25 rounded-lg px-3 py-2.5 text-xs outline-none border border-white/10 focus:border-white/30 transition-colors resize-none mb-3"
          />
          <button
            onClick={handleSubmit}
            disabled={!feedback.trim()}
            className="w-full py-2 text-xs text-white bg-accent hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors font-medium"
          >
            Send Feedback
          </button>
          <button
            onClick={() => dispatch({ type: 'TOGGLE_FEEDBACK' })}
            className="w-full mt-2 py-1.5 text-xs text-white/40 hover:text-white/60 transition-colors"
          >
            Cancel
          </button>
        </>
      )}
    </div>
  );
}
