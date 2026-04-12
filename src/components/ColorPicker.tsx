'use client';

import { useRef } from 'react';
import { PRESET_COLORS } from '@/lib/defaults';

interface Props {
  value: string;
  onChange: (hex: string) => void;
}

export function ColorPicker({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleHexInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) {
      if (v.length === 7) onChange(v);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Swatch + hex display */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => inputRef.current?.click()}
          className="w-6 h-6 rounded-full border border-white/20 flex-shrink-0 transition-transform hover:scale-110"
          style={{ background: value }}
          title="Open color picker"
        />
        <input
          type="text"
          defaultValue={value}
          key={value}
          onChange={handleHexInput}
          maxLength={7}
          className="flex-1 bg-transparent text-white/70 text-xs font-mono outline-none hover:text-white transition-colors"
        />
        <input
          ref={inputRef}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="sr-only"
        />
      </div>
      {/* Preset swatches */}
      <div className="flex gap-1.5 flex-wrap">
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            onClick={() => onChange(color)}
            className={`w-5 h-5 rounded-full border transition-transform hover:scale-110 ${
              value === color ? 'border-white/80 scale-110' : 'border-transparent'
            }`}
            style={{ background: color }}
            title={color}
          />
        ))}
      </div>
    </div>
  );
}
