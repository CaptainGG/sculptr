'use client';

import { useAppState } from '@/hooks/useAppState';
import { AccordionSection } from './AccordionSection';
import { ColorPicker } from './ColorPicker';
import { ANIMATIONS, MATERIALS } from '@/lib/defaults';

function Slider({
  label, value, min, max, step, format, onChange,
}: {
  label: string; value: number; min: number; max: number; step: number;
  format?: (v: number) => string; onChange: (v: number) => void;
}) {
  const display = format ? format(value) : String(value);
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs text-white/50 mb-1">
        <span>{label}</span>
        <span className="text-white/70">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1 rounded-full accent-accent cursor-pointer"
        style={{ accentColor: '#4f46e5' }}
      />
    </div>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <span className="text-xs text-white/60">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`w-9 h-5 rounded-full transition-colors relative ${value ? 'bg-accent' : 'bg-white/20'}`}
      >
        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${value ? 'left-4' : 'left-0.5'}`} />
      </button>
    </div>
  );
}

export function SettingsDrawer() {
  const { state, dispatch } = useAppState();

  if (!state.settingsOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-full z-40 flex flex-col shadow-2xl"
      style={{ width: 275, background: '#1a1a2e' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
        <span className="text-white/50 text-xs font-medium tracking-widest uppercase">Settings</span>
        <button
          onClick={() => dispatch({ type: 'CLOSE_SETTINGS' })}
          className="text-white/40 hover:text-white/80 transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Object */}
        <AccordionSection title="Object" defaultOpen={true}>
          <div className="mb-4">
            <ColorPicker
              value={state.objectColor}
              onChange={(c) => dispatch({ type: 'SET_OBJECT_COLOR', color: c })}
            />
          </div>
          <Slider label="Depth" value={state.depth} min={0.1} max={5} step={0.1}
            format={(v) => v.toFixed(1)}
            onChange={(v) => dispatch({ type: 'SET_DEPTH', depth: v })} />
          <Slider label="Smoothness" value={Math.round(state.smoothness * 100)} min={0} max={100} step={1}
            format={(v) => `${v}%`}
            onChange={(v) => dispatch({ type: 'SET_SMOOTHNESS', smoothness: v / 100 })} />
          <Slider label="Zoom" value={state.zoom} min={1} max={20} step={0.1}
            format={(v) => v.toFixed(1)}
            onChange={(v) => dispatch({ type: 'SET_ZOOM', zoom: v })} />
          <button
            onClick={() => dispatch({ type: 'RESET_POSITION' })}
            className="w-full py-2 text-xs text-white/50 hover:text-white/80 border border-white/10 hover:border-white/25 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
              <polyline points="1 4 1 10 7 10"/>
              <path d="M3.51 15a9 9 0 1 0 .49-3.51"/>
            </svg>
            Reset Position
          </button>
        </AccordionSection>

        {/* Background */}
        <AccordionSection title="Background">
          <ColorPicker
            value={state.backgroundColor}
            onChange={(c) => dispatch({ type: 'SET_BG_COLOR', color: c })}
          />
        </AccordionSection>

        {/* Material */}
        <AccordionSection title="Material">
          <select
            value={state.material}
            onChange={(e) => dispatch({ type: 'SET_MATERIAL', material: e.target.value })}
            className="w-full bg-black/30 text-white rounded-lg px-3 py-2 text-xs outline-none border border-white/10 focus:border-white/30 transition-colors cursor-pointer mb-3 capitalize"
          >
            {MATERIALS.map((m) => (
              <option key={m} value={m} className="capitalize">{m.charAt(0).toUpperCase() + m.slice(1)}</option>
            ))}
          </select>
          {state.material !== 'default' && (
            <div>
              <Slider label="Metalness" value={state.metalness ?? 0.15} min={0} max={1} step={0.01}
                format={(v) => v.toFixed(2)}
                onChange={(v) => dispatch({ type: 'SET_METALNESS', metalness: v })} />
              <Slider label="Roughness" value={state.roughness ?? 0.35} min={0} max={1} step={0.01}
                format={(v) => v.toFixed(2)}
                onChange={(v) => dispatch({ type: 'SET_ROUGHNESS', roughness: v })} />
              <Slider label="Opacity" value={state.opacity ?? 1} min={0} max={1} step={0.01}
                format={(v) => v.toFixed(2)}
                onChange={(v) => dispatch({ type: 'SET_OPACITY', opacity: v })} />
              <Toggle label="Wireframe" value={state.wireframe}
                onChange={(v) => dispatch({ type: 'SET_WIREFRAME', wireframe: v })} />
            </div>
          )}
        </AccordionSection>

        {/* Texture */}
        <AccordionSection title="Texture">
          <div className="mb-3">
            <label className="text-xs text-white/50 block mb-1">Image URL</label>
            <input
              type="text"
              value={state.texture ?? ''}
              onChange={(e) => dispatch({ type: 'SET_TEXTURE', texture: e.target.value || undefined })}
              placeholder="https://..."
              className="w-full bg-black/30 text-white/80 placeholder-white/25 rounded-lg px-3 py-2 text-xs outline-none border border-white/10 focus:border-white/30 transition-colors"
            />
          </div>
          {state.texture && (
            <>
              <Slider label="Repeat" value={state.textureRepeat} min={0.1} max={10} step={0.1}
                format={(v) => v.toFixed(1)}
                onChange={(v) => dispatch({ type: 'SET_TEXTURE_REPEAT', repeat: v })} />
              <Slider label="Rotation" value={state.textureRotation} min={-Math.PI} max={Math.PI} step={0.01}
                format={(v) => `${Math.round(v * 180 / Math.PI)}°`}
                onChange={(v) => dispatch({ type: 'SET_TEXTURE_ROTATION', rotation: v })} />
            </>
          )}
        </AccordionSection>

        {/* Animation */}
        <AccordionSection title="Animation">
          <select
            value={state.animation}
            onChange={(e) => dispatch({ type: 'SET_ANIMATION', animation: e.target.value })}
            className="w-full bg-black/30 text-white rounded-lg px-3 py-2 text-xs outline-none border border-white/10 focus:border-white/30 transition-colors cursor-pointer mb-3 capitalize"
          >
            {ANIMATIONS.map((a) => (
              <option key={a} value={a}>{a.charAt(0).toUpperCase() + a.slice(1)}</option>
            ))}
          </select>
          <Slider label="Speed" value={state.animationSpeed} min={0.1} max={3} step={0.1}
            format={(v) => `${v.toFixed(1)}x`}
            onChange={(v) => dispatch({ type: 'SET_ANIMATION_SPEED', speed: v })} />
          <Toggle label="Reverse" value={state.animateReverse}
            onChange={(v) => dispatch({ type: 'SET_ANIMATE_REVERSE', reverse: v })} />
        </AccordionSection>

        {/* Interaction */}
        <AccordionSection title="Interaction">
          <Toggle label="Interactive" value={state.interactive}
            onChange={(v) => dispatch({ type: 'SET_INTERACTIVE', interactive: v })} />
          <Toggle label="Cursor Orbit" value={state.cursorOrbit}
            onChange={(v) => dispatch({ type: 'SET_CURSOR_ORBIT', cursorOrbit: v })} />
          <Slider label="Orbit Strength" value={state.orbitStrength} min={0} max={0.5} step={0.01}
            format={(v) => v.toFixed(2)}
            onChange={(v) => dispatch({ type: 'SET_ORBIT_STRENGTH', strength: v })} />
          <Toggle label="Draggable" value={state.draggable}
            onChange={(v) => dispatch({ type: 'SET_DRAGGABLE', draggable: v })} />
          <Toggle label="Scroll Zoom" value={state.scrollZoom}
            onChange={(v) => dispatch({ type: 'SET_SCROLL_ZOOM', scrollZoom: v })} />
          <Toggle label="Reset on Idle" value={state.resetOnIdle}
            onChange={(v) => dispatch({ type: 'SET_RESET_ON_IDLE', resetOnIdle: v })} />
          {state.resetOnIdle && (
            <Slider label="Reset Delay (s)" value={state.resetDelay} min={0.5} max={10} step={0.5}
              format={(v) => `${v}s`}
              onChange={(v) => dispatch({ type: 'SET_RESET_DELAY', delay: v })} />
          )}
        </AccordionSection>

        {/* Lighting */}
        <AccordionSection title="Lighting">
          <Slider label="Light Intensity" value={state.lightIntensity} min={0} max={3} step={0.1}
            format={(v) => v.toFixed(1)}
            onChange={(v) => dispatch({ type: 'SET_LIGHT_INTENSITY', intensity: v })} />
          <Slider label="Ambient" value={state.ambientIntensity} min={0} max={1} step={0.01}
            format={(v) => v.toFixed(2)}
            onChange={(v) => dispatch({ type: 'SET_AMBIENT_INTENSITY', intensity: v })} />
          <Toggle label="Shadow" value={state.shadow}
            onChange={(v) => dispatch({ type: 'SET_SHADOW', shadow: v })} />
          <div className="mt-3">
            <p className="text-xs text-white/40 mb-2">Light Position</p>
            {(['X', 'Y', 'Z'] as const).map((axis, i) => (
              <Slider
                key={axis}
                label={`${axis}`}
                value={state.lightPosition[i]}
                min={-10} max={10} step={0.5}
                format={(v) => v.toFixed(1)}
                onChange={(v) => {
                  const pos = [...state.lightPosition] as [number, number, number];
                  pos[i] = v;
                  dispatch({ type: 'SET_LIGHT_POSITION', position: pos });
                }}
              />
            ))}
          </div>
        </AccordionSection>
      </div>
    </div>
  );
}
