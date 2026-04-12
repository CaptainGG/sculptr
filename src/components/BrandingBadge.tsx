'use client';

export function BrandingBadge() {
  return (
    <a
      href="#"
      className="fixed bottom-4 right-4 z-40 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-white/50 hover:text-white/80 transition-colors text-xs font-medium"
      style={{ background: 'rgba(0,0,0,0.3)' }}
    >
      <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
        <path d="M8 1.5C6.2 1.5 4 3 4 5.5c0 1.5.7 2.8 2 3.8L8 14.5l2-5.2C11.3 8.3 12 7 12 5.5c0-2.5-2.2-4-4-4z"/>
      </svg>
      sculptr
    </a>
  );
}
